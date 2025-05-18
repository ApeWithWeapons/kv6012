import xml.etree.ElementTree as ET

# 1. Load the XML
tree = ET.parse('r"C:\Users\almes\Documents\Projects_Database (1).xml"')
root = tree.getroot()

# 2. Define a sanitizer for tag names
def sanitize_tag(tag: str) -> str:
    # Lowercase + replace non-alphanumeric (and spaces) with underscores
    return ''.join(c.lower() if c.isalnum() else '_' for c in tag)

# 3. Recursively rename tags
def recurse_sanitize(elem):
    elem.tag = sanitize_tag(elem.tag)
    for child in elem:
        recurse_sanitize(child)

recurse_sanitize(root)

# 4. Write out the cleaned XML
tree.write('r"C:\Users\almes\Documents\Projects_Database (1).xml"', encoding='utf-8', xml_declaration=True)
print("Sanitised XML saved to src/data/projects_clean.xml")
