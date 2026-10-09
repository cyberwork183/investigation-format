import base64
import zipfile
import xml.etree.ElementTree as ET

# 1x1 transparent PNG
SAMPLE_PNG = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")

with zipfile.ZipFile('test_generated.docx', 'r') as z_in:
    content_map = {}
    for name in z_in.namelist():
        content_map[name] = z_in.read(name)

# 1. Add media file
content_map['word/media/image1.png'] = SAMPLE_PNG

# 2. Update [Content_Types].xml
ct_root = ET.fromstring(content_map['[Content_Types].xml'])
ct_ns = 'http://schemas.openxmlformats.org/package/2006/content-types'
has_png = False
for elem in ct_root.findall(f'{{{ct_ns}}}Default'):
    if elem.attrib.get('Extension', '').lower() == 'png':
        has_png = True
        break
if not has_png:
    new_default = ET.SubElement(ct_root, f'{{{ct_ns}}}Default')
    new_default.attrib['Extension'] = 'png'
    new_default.attrib['ContentType'] = 'image/png'
content_map['[Content_Types].xml'] = ET.tostring(ct_root, encoding='utf-8', xml_declaration=True)

# 3. Update word/_rels/document.xml.rels
rels_root = ET.fromstring(content_map['word/_rels/document.xml.rels'])
rels_ns = 'http://schemas.openxmlformats.org/package/2006/relationships'
new_rel = ET.SubElement(rels_root, f'{{{rels_ns}}}Relationship')
new_rel.attrib['Id'] = 'rIdPhoto'
new_rel.attrib['Type'] = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image'
new_rel.attrib['Target'] = 'media/image1.png'
content_map['word/_rels/document.xml.rels'] = ET.tostring(rels_root, encoding='utf-8', xml_declaration=True)

# 4. In document.xml, add drawing in Element 101
doc_root = ET.fromstring(content_map['word/document.xml'])
W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
WP_NS = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'
A_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main'
PIC_NS = 'http://schemas.openxmlformats.org/drawingml/2006/picture'
R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'

# Find element 101 (or element containing आरोपीचा फोटो)
body = doc_root.find(f'{{{W_NS}}}body')
target_p = None
for p in body.findall(f'{{{W_NS}}}p'):
    text = ''.join([t.text or '' for t in p.findall(f'.//{{{W_NS}}}t')])
    if 'आरोपीचा फोटो' in text:
        target_p = p
        break

if target_p is not None:
    # create drawing run
    r = ET.Element(f'{{{W_NS}}}r')
    drawing = ET.SubElement(r, f'{{{W_NS}}}drawing')
    inline = ET.SubElement(drawing, f'{{{WP_NS}}}inline', {
        'distT': '0', 'distB': '0', 'distL': '0', 'distR': '0'
    })
    extent = ET.SubElement(inline, f'{{{WP_NS}}}extent', {'cx': '1097280', 'cy': '1371600'})
    effectExtent = ET.SubElement(inline, f'{{{WP_NS}}}effectExtent', {'l': '0', 't': '0', 'r': '0', 'b': '0'})
    docPr = ET.SubElement(inline, f'{{{WP_NS}}}docPr', {'id': '101', 'name': 'AccusedPhoto'})
    cNvGraphicFramePr = ET.SubElement(inline, f'{{{WP_NS}}}cNvGraphicFramePr')
    a_graphic = ET.SubElement(inline, f'{{{A_NS}}}graphic')
    graphicData = ET.SubElement(a_graphic, f'{{{A_NS}}}graphicData', {'uri': 'http://schemas.openxmlformats.org/drawingml/2006/picture'})
    pic = ET.SubElement(graphicData, f'{{{PIC_NS}}}pic')
    nvPicPr = ET.SubElement(pic, f'{{{PIC_NS}}}nvPicPr')
    cNvPr = ET.SubElement(nvPicPr, f'{{{PIC_NS}}}cNvPr', {'id': '101', 'name': 'Photo.png'})
    cNvPicPr = ET.SubElement(nvPicPr, f'{{{PIC_NS}}}cNvPicPr')
    blipFill = ET.SubElement(pic, f'{{{PIC_NS}}}blipFill')
    blip = ET.SubElement(blipFill, f'{{{A_NS}}}blip', {f'{{{R_NS}}}embed': 'rIdPhoto'})
    stretch = ET.SubElement(blipFill, f'{{{A_NS}}}stretch')
    fillRect = ET.SubElement(stretch, f'{{{A_NS}}}fillRect')
    spPr = ET.SubElement(pic, f'{{{PIC_NS}}}spPr')
    xfrm = ET.SubElement(spPr, f'{{{A_NS}}}xfrm')
    off = ET.SubElement(xfrm, f'{{{A_NS}}}off', {'x': '0', 'y': '0'})
    ext = ET.SubElement(xfrm, f'{{{A_NS}}}ext', {'cx': '1097280', 'cy': '1371600'})
    prstGeom = ET.SubElement(spPr, f'{{{A_NS}}}prstGeom', {'prst': 'rect'})
    avLst = ET.SubElement(prstGeom, f'{{{A_NS}}}avLst')
    
    # insert run after text
    target_p.insert(2, r)

content_map['word/document.xml'] = ET.tostring(doc_root, encoding='utf-8', xml_declaration=True)

with zipfile.ZipFile('test_generated_with_photo.docx', 'w', zipfile.ZIP_DEFLATED) as z_out:
    for name, data_bytes in content_map.items():
        z_out.writestr(name, data_bytes)

print("test_generated_with_photo.docx successfully created!")
