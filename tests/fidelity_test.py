import zipfile
import xml.etree.ElementTree as ET

namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

def inspect_doc(docx_path):
    with zipfile.ZipFile(docx_path) as z:
        root = ET.fromstring(z.read('word/document.xml'))
    body = root.find('w:body', namespaces)

    paragraphs = body.findall('w:p', namespaces)
    tables = body.findall('w:tbl', namespaces)
    page_breaks = root.findall('.//w:br[@w:type="page"]', namespaces)
    sections = body.findall('w:sectPr', namespaces)

    tbl_structure = []
    for tbl in tables:
        rows = tbl.findall('w:tr', namespaces)
        row_cells = [len(r.findall('w:tc', namespaces)) for r in rows]
        tbl_structure.append({'rows': len(rows), 'cells_per_row': row_cells})

    all_text = ''.join([t.text or '' for t in root.findall('.//w:t', namespaces)])

    return {
        'total_paragraphs': len(paragraphs),
        'total_tables': len(tables),
        'table_structure': tbl_structure,
        'page_breaks': len(page_breaks),
        'sections': len(sections),
        'text_length': len(all_text),
        'all_text': all_text
    }

master_info = inspect_doc('template/arrest-form-master.docx')
test_info = inspect_doc('browser_generated_output.docx')

with open('fidelity_report.txt', 'w', encoding='utf-8') as out:
    out.write("FIDELITY TEST RESULTS:\n")
    out.write("======================\n")
    out.write(f"Master page breaks: {master_info['page_breaks']} | Generated page breaks: {test_info['page_breaks']}\n")
    out.write(f"Master tables: {master_info['total_tables']} | Generated tables: {test_info['total_tables']}\n")
    out.write(f"Master table structure: {master_info['table_structure']}\n")
    out.write(f"Generated table structure: {test_info['table_structure']}\n")
    out.write(f"Master sections: {master_info['sections']} | Generated sections: {test_info['sections']}\n\n")

    checks = [
        "Form : III",
        "ARREST / COURT SURRENDER",
        "अटकेचा पंचनामा",
        "1. State",
        "Alphanumeric Code of the Accused",
        "2. Date, Time & Place of",
        "3. Name of the Court",
        "4. Acts and Sections",
        "6. Particulars of the Accused",
        "7. Injuries, cause of injuries",
        "8. The accused, after being informed",
        "9. Physical features, deformities",
        "10. Whether finger-print taken or not",
        "11. Socio-economic profile",
        "12. Whether the accused person",
        "13. पंचाची नावे",
        "14. Signature and Thumb Impression"
    ]

    all_passed = True
    for c in checks:
        in_master = c in master_info['all_text']
        in_gen = c in test_info['all_text']
        status = "OK" if (in_master and in_gen) else "FAIL"
        if status == "FAIL": all_passed = False
        out.write(f"Check '{c}': {status}\n")

    out.write("\nUSER DATA INJECTION CHECKS:\n")
    user_checks = [
        "Ramesh Kumar Suresh Patel",
        "Suresh Patel",
        "Cyber Police Station",
        "Vikas Manohar Rao",
        "Vikram S. Gaikwad"
    ]
    for uc in user_checks:
        in_gen = uc in test_info['all_text']
        out.write(f"User data check '{uc}': {'FOUND' if in_gen else 'MISSING'}\n")
        if not in_gen: all_passed = False

    if all_passed:
        out.write("\nALL FIDELITY CHECKS PASSED PERFECTLY!\n")
    else:
        out.write("\nSOME CHECKS FAILED!\n")

print("fidelity_report.txt written.")
