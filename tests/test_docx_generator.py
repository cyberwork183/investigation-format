import zipfile
import xml.etree.ElementTree as ET
import os

namespaces = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
}
for prefix, uri in namespaces.items():
    ET.register_namespace(prefix, uri)

W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

def qn(tag):
    return f"{{{W_NS}}}{tag}"

def create_run(text, bold=True, font_size="22"):
    r = ET.Element(qn('r'))
    rPr = ET.SubElement(r, qn('rPr'))
    if bold:
        ET.SubElement(rPr, qn('b'))
        ET.SubElement(rPr, qn('bCs'))
    sz = ET.SubElement(rPr, qn('sz'))
    sz.set(qn('val'), str(font_size))
    szCs = ET.SubElement(rPr, qn('szCs'))
    szCs.set(qn('val'), str(font_size))
    t = ET.SubElement(r, qn('t'))
    t.text = text
    t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    return r

def set_run_text(r, text):
    t = r.find(qn('t'))
    if t is None:
        t = ET.SubElement(r, qn('t'))
        t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    t.text = text

def set_cell_text(cell, text, bold=False, font_size="20"):
    p = cell.find(qn('p'))
    if p is None:
        p = ET.SubElement(cell, qn('p'))
    for r in list(p.findall(qn('r'))):
        p.remove(r)
    if text:
        r = create_run(text, bold=bold, font_size=font_size)
        p.append(r)

def generate_test_doc(data, output_path):
    with zipfile.ZipFile('template/arrest-form-master.docx', 'r') as z_in:
        content_map = {}
        for name in z_in.namelist():
            content_map[name] = z_in.read(name)

    root = ET.fromstring(content_map['word/document.xml'])
    body = root.find(qn('body'))
    elements = list(body)

    # 1. State, Dist, P.S., FIR, Year, Date (Element 5)
    p5 = elements[5]
    runs_p5 = p5.findall(qn('r'))
    if len(runs_p5) >= 21:
        if data.get('state'):
            set_run_text(runs_p5[1], data['state'])
        if data.get('district'):
            set_run_text(runs_p5[5], data['district'])
        if data.get('policeStation'):
            set_run_text(runs_p5[8], data['policeStation'])
        if data.get('firNo'):
            set_run_text(runs_p5[14], ' ' + data['firNo'] + ' ')
        if data.get('year'):
            set_run_text(runs_p5[20], ' ' + data['year'] + ' ')
        if data.get('date'):
            p5.append(create_run(' Date: ' + data['date'], bold=True))

    # Accused Code (Element 7)
    if data.get('accusedCode'):
        elements[7].append(create_run(f" : {data['accusedCode']}", bold=True))

    # Element 9: Date, Time, G.D.No
    p9 = elements[9]
    if data.get('arrestDate'):
        p9.insert(5, create_run(' ' + data['arrestDate'] + ' ', bold=True))
    if data.get('arrestTime'):
        p9.insert(8, create_run(' ' + data['arrestTime'] + ' ', bold=True))
    if data.get('gdNo'):
        p9.append(create_run(' ' + data['gdNo'], bold=True))

    # Element 11: Place of Arrest
    p11 = elements[11]
    runs_p11 = p11.findall(qn('r'))
    for r in runs_p11:
        t = r.find(qn('t'))
        if t is not None and t.text and '    ' in t.text and data.get('arrestPS'):
            t.text = ' ' + data['arrestPS'] + ' '
    if data.get('arrestDist'):
        p11.insert(8, create_run(' ' + data['arrestDist'] + ' ', bold=True))
    if data.get('arrestState'):
        p11.append(create_run(' ' + data['arrestState'], bold=True))

    # Element 13: Court name
    if data.get('courtName'):
        p13 = elements[13]
        for r in p13.findall(qn('r')):
            t = r.find(qn('t'))
            if t is not None and '---' in (t.text or ''):
                t.text = ' ' + data['courtName'] + ' '

    # Element 15: Acts and Sections
    if data.get('actsSections'):
        elements[15].append(create_run(' ' + data['actsSections'], bold=True))

    # Element 17/18 & 19: Arrest status tick
    status_choice = data.get('arrestStatus')
    options_en = [
        'Arrested and forward',
        'Arrested and released on bail or PR bound',
        'released on anticipatory bail',
        'Arrested and remanded to Police Custody',
        'Surrendered in court and bailed out',
        'Surrendered in court and sent to judicial Custody',
        'Surrendered in court and remanded to Police Custody'
    ]
    options_mr = [
        'अटक केली व न्यायालयात पाठविले',
        'अटक केली व जामीनावर सोडले किंवा वौयक्तीक जात मुचलक्यावर +डले',
        'अटक केली व अटकपुर्व जामीनावर सोडले',
        'अटक केले व पालीस कोठडित पाठविले',
        'न्यायालयाचे स्वाधिन व जामीनावर',
        'न्यायालयाचे स्वाधिन व न्यायालयीन कोठडित पाठविले',
        'न्यायालयाचे स्वाधिन व पोलीस कोठडित पाठविले'
    ]
    if status_choice is not None and 0 <= status_choice < len(options_en):
        target_en = options_en[status_choice]
        for p_elem in [elements[17], elements[18]]:
            for r in p_elem.findall(qn('r')):
                t = r.find(qn('t'))
                if t is not None and target_en in (t.text or ''):
                    t.text = t.text.replace(target_en, f"{target_en} [√]")
        target_mr = options_mr[status_choice]
        for r in elements[19].findall(qn('r')):
            t = r.find(qn('t'))
            if t is not None and target_mr in (t.text or ''):
                t.text = t.text.replace(target_mr, f"{target_mr} [√]")

    # Element 21: Name
    if data.get('accusedName'):
        elements[21].append(create_run(' ' + data['accusedName'], bold=True))

    # Element 22: Father's / Guardian's Name
    if data.get('fatherName'):
        elements[22].append(create_run(' ' + data['fatherName'], bold=True))

    # Element 23: First Alias
    if data.get('firstAlias'):
        for r in elements[23].findall(qn('r')):
            t = r.find(qn('t'))
            if t is not None and '---' in (t.text or ''):
                t.text = ' ' + data['firstAlias'] + ' '

    # Element 24: Second Alias
    if data.get('secondAlias'):
        for r in elements[24].findall(qn('r')):
            t = r.find(qn('t'))
            if t is not None and '---' in (t.text or ''):
                t.text = ' ' + data['secondAlias'] + ' '

    # Element 25: Nationality
    if data.get('nationality'):
        runs_p25 = elements[25].findall(qn('r'))
        if len(runs_p25) >= 2:
            set_run_text(runs_p25[1], ' ' + data['nationality'])

    # Element 26: Voter ID, Passport
    runs_p26 = elements[26].findall(qn('r'))
    if data.get('voterId') and len(runs_p26) >= 2:
        set_run_text(runs_p26[1], ' ' + data['voterId'] + ' ')
    if data.get('passportNo') and len(runs_p26) >= 4:
        set_run_text(runs_p26[3], ' ' + data['passportNo'] + ' ')

    # Element 28: Date of Issue, Place of Issue
    runs_p28 = elements[28].findall(qn('r'))
    if data.get('passportIssueDate') and len(runs_p28) >= 2:
        set_run_text(runs_p28[1], ' ' + data['passportIssueDate'] + ' ')
    if data.get('passportIssuePlace') and len(runs_p28) >= 4:
        set_run_text(runs_p28[3], ' ' + data['passportIssuePlace'] + ' ')

    # Element 29: Religion, Caste
    p29 = elements[29]
    if data.get('religion'):
        p29.insert(1, create_run(' ' + data['religion'] + ' ', bold=True))
    if data.get('caste'):
        p29.append(create_run(' ' + data['caste'], bold=True))

    # Element 30: SC/ST/OBC, Occupation
    runs_p30 = elements[30].findall(qn('r'))
    if data.get('category') and len(runs_p30) >= 2:
        set_run_text(runs_p30[1], ' ' + data['category'] + ' ')
    if data.get('occupation'):
        elements[30].append(create_run(' ' + data['occupation'], bold=True))

    # Element 32: Permanent Address
    if data.get('permanentAddress'):
        elements[32].append(create_run(' ' + data['permanentAddress'], bold=True))

    # Element 35: Permanent State, Dist, P.S.
    p35 = elements[35]
    if data.get('permState'):
        p35.insert(1, create_run(' ' + data['permState'] + ' ', bold=True))
    if data.get('permDist'):
        p35.insert(3, create_run(' ' + data['permDist'] + ' ', bold=True))
    if data.get('permPS'):
        p35.append(create_run(' ' + data['permPS'], bold=True))

    # Element 37: Present Address
    if data.get('presentAddress'):
        elements[37].append(create_run(' ' + data['presentAddress'], bold=True))

    # Element 38: Present State, Dist, P.S.
    p38 = elements[38]
    runs_p38 = p38.findall(qn('r'))
    if data.get('presState') and len(runs_p38) >= 2:
        set_run_text(runs_p38[1], ' ' + data['presState'] + ' ')
    if data.get('presDist') and len(runs_p38) >= 4:
        set_run_text(runs_p38[3], ' ' + data['presDist'] + ' ')
    if data.get('presPS') and len(runs_p38) >= 6:
        set_run_text(runs_p38[5], ' ' + data['presPS'] + ' ')

    # Element 39 & 40: Injuries
    if data.get('injuriesDetails'):
        for r in elements[39].findall(qn('r')):
            t = r.find(qn('t'))
            if t is not None and '---' in (t.text or ''):
                t.text = ' ' + data['injuriesDetails'] + ' '

    # Element 41: Custody Date, Time, Place
    p41 = elements[41]
    if data.get('custodyDate') or data.get('custodyTime') or data.get('custodyPlace'):
        for r in p41.findall(qn('r')):
            t = r.find(qn('t'))
            if t is not None and 'custody on---' in (t.text or ''):
                t.text = f"8. The accused, after being informed of the grounds of arrest and his legal rights, was duly taken, into custody on {data.get('custodyDate', '-----------')} (date) at {data.get('custodyTime', '-----------')} (hours) at {data.get('custodyPlace', '-----------')} (place)."

    # Element 45, 46, 47: Articles
    articles = data.get('articles', [])
    for idx_art, art_val in enumerate(articles[:6]):
        pair_idx = idx_art // 2
        pos = idx_art % 2
        p_elem = elements[45 + pair_idx]
        runs = p_elem.findall(qn('r'))
        if pos == 0 and len(runs) >= 1:
            t = runs[0].find(qn('t'))
            if t is not None and '---' in t.text:
                t.text = f"{idx_art+1}. {art_val}  "
        elif pos == 1 and len(runs) >= 2:
            t = runs[1].find(qn('t'))
            if t is not None and '---' in t.text:
                t.text = f"{idx_art+1}. {art_val}"

    # Element 52 & 53: Intimation
    if data.get('intimationName') or data.get('intimationRelation'):
        elements[52].append(create_run(f" - {data.get('intimationName', '')} ({data.get('intimationRelation', '')})", bold=True))
    if data.get('intimationAddress'):
        elements[53].append(create_run(f" पत्ता: {data['intimationAddress']}", bold=True))

    # TBL 58: Physical features table
    tbl = elements[58]
    tr_list = tbl.findall(qn('tr'))
    pf = data.get('physicalFeatures', {})
    row2_keys = ['srNo', 'sex', 'dob', 'build', 'height', 'complexion', 'idMark', 'deformities', 'teeth', 'hair']
    row5_keys = ['eye', 'habits', 'dressHabits', 'languages', 'burnMark', 'leucoderma', 'mole', 'scar', 'tattoo', 'forehead']
    row8_keys = ['ear', 'nose', 'moustaches', 'speech', 'face', 'lips']

    cells_r2 = tr_list[2].findall(qn('tc'))
    for k_i, k in enumerate(row2_keys):
        if k_i < len(cells_r2):
            val = pf.get(k, '1' if k == 'srNo' else '')
            if val:
                set_cell_text(cells_r2[k_i], val)

    cells_r5 = tr_list[5].findall(qn('tc'))
    for k_i, k in enumerate(row5_keys):
        if k_i < len(cells_r5):
            val = pf.get(k, '')
            if val:
                set_cell_text(cells_r5[k_i], val)

    cells_r8 = tr_list[8].findall(qn('tc'))
    for k_i, k in enumerate(row8_keys):
        if k_i < len(cells_r8):
            val = pf.get(k, '')
            if val:
                set_cell_text(cells_r8[k_i], val)

    # Element 59: Other features
    if data.get('otherFeatures'):
        elements[59].append(create_run(f" {data['otherFeatures']}", bold=True))

    # Element 62: Fingerprint
    if data.get('fingerprintTaken'):
        val_fp = "Yes" if data['fingerprintTaken'] == 'yes' else "No"
        if data.get('fingerprintDetail'):
            val_fp += f" ({data['fingerprintDetail']})"
        elements[62].append(create_run(f" {val_fp}", bold=True))

    # Element 65-67: Living status
    if data.get('livingStatus'):
        ls = data['livingStatus']
        for p_elem in [elements[65], elements[66]]:
            for r in p_elem.findall(qn('r')):
                t = r.find(qn('t'))
                if t is not None and ls in (t.text or ''):
                    t.text = t.text.replace(ls, f"{ls} [√]")

    # Element 68: Education, Occupation
    if data.get('education'):
        elements[68].insert(1, create_run(' ' + data['education'] + ' ', bold=True))
    if data.get('socioOccupation'):
        elements[68].append(create_run(' ' + data['socioOccupation'], bold=True))

    # Income group: 70 to 75
    if data.get('incomeGroup') is not None:
        ig_idx = data['incomeGroup']
        if 0 <= ig_idx < 6:
            target_p = elements[70 + ig_idx]
            target_p.insert(0, create_run('[√] ', bold=True))

    # Police records: 78 to 86
    police_keys = ['isDangerous', 'escapedBail', 'isArmed', 'operatesAccomplices', 'pastRecords', 'isRecidivist', 'likelyEscapeBail', 'likelyCommitCrime', 'wantedOtherCase']
    for p_i, p_key in enumerate(police_keys):
        ans = data.get(p_key)
        elem = elements[78 + p_i]
        for r in elem.findall(qn('r')):
            t = r.find(qn('t'))
            if t is not None and 'Yes/ No' in (t.text or ''):
                if ans == 'yes':
                    t.text = t.text.replace('Yes/ No', 'Yes [√] / No')
                elif ans == 'no':
                    t.text = t.text.replace('Yes/ No', 'Yes / No [√]')

    if data.get('otherCaseDetail'):
        elements[87].append(create_run(f" : {data['otherCaseDetail']}", bold=True))

    # Witnesses: 91-96
    if data.get('witness1Name'):
        for r in elements[91].findall(qn('r')):
            t = r.find(qn('t'))
            if t is not None and '---' in (t.text or ''):
                t.text = f"(1) {data['witness1Name']}   -----------------------------------"
    if data.get('witness1Address'):
        for r in elements[92].findall(qn('r')):
            t = r.find(qn('t'))
            if t is not None and '---' in (t.text or ''):
                t.text = f"    Address: {data['witness1Address']}"

    if data.get('witness2Name'):
        for r in elements[94].findall(qn('r')):
            t = r.find(qn('t'))
            if t is not None and '---' in (t.text or ''):
                t.text = f"(2) {data['witness2Name']}   -----------------------------------"
    if data.get('witness2Address'):
        for r in elements[95].findall(qn('r')):
            t = r.find(qn('t'))
            if t is not None and '---' in (t.text or ''):
                t.text = f"    Address: {data['witness2Address']}"

    # Section 14: Officer Details: 100, 102, 104, 106
    if data.get('officerName'):
        elements[100].append(create_run(f" {data['officerName']}", bold=True))
    if data.get('officerRank'):
        for r in elements[102].findall(qn('r')):
            t = r.find(qn('t'))
            if t is not None and 'Rank' in (t.text or ''):
                t.text = f"Rank: {data['officerRank']} "
    if data.get('officerNo'):
        for r in elements[102].findall(qn('r')):
            t = r.find(qn('t'))
            if t is not None and 'No.---' in (t.text or ''):
                t.text = f"No: {data['officerNo']}"
    if data.get('place'):
        runs_p104 = elements[104].findall(qn('r'))
        if len(runs_p104) >= 3:
            set_run_text(runs_p104[2], f" {data['place']}")
    if data.get('finalDate'):
        elements[105].append(create_run(f" {data['finalDate']}", bold=True))

    content_map['word/document.xml'] = ET.tostring(root, encoding='utf-8', xml_declaration=True)

    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as z_out:
        for name, data_bytes in content_map.items():
            z_out.writestr(name, data_bytes)

    print(f"Generated test DOCX: {output_path}, size: {os.path.getsize(output_path)}")

sample_test_data = {
    'state': 'Maharashtra',
    'district': 'Nagpur City',
    'policeStation': 'Cyber Police Station',
    'firNo': '57/2026',
    'year': '2026',
    'date': '08/10/2026',
    'accusedCode': 'A1',
    'arrestDate': '08/10/2026',
    'arrestTime': '14:30 hrs',
    'gdNo': '45',
    'arrestPS': 'Cyber PS',
    'arrestDist': 'Nagpur',
    'arrestState': 'Maharashtra',
    'actsSections': 'BNS 318(2), 318(4), IT Act 66(C), 66(D)',
    'arrestStatus': 0,
    'accusedName': 'John Doe S/O Richard Doe',
    'fatherName': 'Richard Doe',
    'nationality': 'Indian',
    'voterId': 'ABC1234567',
    'religion': 'Hindu',
    'caste': 'General',
    'permanentAddress': 'Plot 42, Civil Lines, Nagpur, Maharashtra 440001',
    'permState': 'Maharashtra',
    'permDist': 'Nagpur',
    'permPS': 'Civil Lines',
    'presentAddress': 'Flat 101, Palm Court, Nagpur 440010',
    'presState': 'Maharashtra',
    'presDist': 'Nagpur',
    'presPS': 'Cyber PS',
    'injuriesDetails': 'No external injuries observed during arrest.',
    'custodyDate': '08/10/2026',
    'custodyTime': '14:30 hrs',
    'custodyPlace': 'Cyber Police Station, Nagpur',
    'articles': ['One Mobile Phone (Samsung)', 'Wallet containing Rs. 500/-', 'NIL', 'NIL', 'NIL', 'NIL'],
    'intimationName': 'Jane Doe',
    'intimationRelation': 'Wife',
    'intimationAddress': 'Plot 42, Civil Lines, Nagpur',
    'physicalFeatures': {
        'sex': 'Male',
        'dob': '1990',
        'build': 'Medium',
        'height': '172 cm',
        'complexion': 'Fair',
        'idMark': 'Mole on right cheek',
        'deformities': 'None',
        'teeth': 'Normal',
        'hair': 'Black',
        'eye': 'Brown',
        'habits': 'None',
        'dressHabits': 'Shirt & Trouser',
        'languages': 'Marathi, Hindi, English',
        'burnMark': 'Nil',
        'leucoderma': 'Nil',
        'mole': 'Right cheek',
        'scar': 'Nil',
        'tattoo': 'Nil',
        'forehead': 'Broad',
        'ear': 'Normal',
        'nose': 'Straight',
        'moustaches': 'Trimmed',
        'speech': 'Normal',
        'face': 'Oval',
        'lips': 'Normal'
    },
    'otherFeatures': 'Nil',
    'fingerprintTaken': 'yes',
    'fingerprintDetail': 'FP No. 102/2026',
    'livingStatus': 'Living with Family',
    'education': 'Graduate',
    'socioOccupation': 'Private Service',
    'incomeGroup': 2,
    'isDangerous': 'no',
    'escapedBail': 'no',
    'isArmed': 'no',
    'operatesAccomplices': 'yes',
    'pastRecords': 'no',
    'isRecidivist': 'no',
    'likelyEscapeBail': 'no',
    'likelyCommitCrime': 'no',
    'wantedOtherCase': 'no',
    'witness1Name': 'Ramesh Sharma',
    'witness1Address': 'Sadashiv Peth, Nagpur',
    'witness2Name': 'Suresh Patel',
    'witness2Address': 'Dharampeth, Nagpur',
    'officerName': 'P. I. Patil',
    'officerRank': 'Police Inspector',
    'officerNo': 'PI-9876',
    'place': 'Nagpur',
    'finalDate': '08/10/2026'
}

generate_test_doc(sample_test_data, 'test_generated.docx')
