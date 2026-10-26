"""Insert the diagnostic section (from diagnostic_section.js) into the edited report.

Usage: python3 scripts/merge_diagnostic.py <edited.docx> <fragment.docx> <out.docx>

- Adds one summary bullet after the last existing summary bullet.
- Inserts Section 6 on its own landscape pages, just before "How to use this benchmark".
- Renumbers the later sections (6 -> 7, 7 -> 8) and the source-list table (12 -> 14).
Everything else in the edited file is left as it is.
"""
import re, sys, zipfile

src, frag, out = sys.argv[1:4]
zs, zf = zipfile.ZipFile(src), zipfile.ZipFile(frag)
doc = zs.read("word/document.xml").decode("utf8")
rels = zs.read("word/_rels/document.xml.rels").decode("utf8")
fdoc = zf.read("word/document.xml").decode("utf8")
frels = zf.read("word/_rels/document.xml.rels").decode("utf8")

# Fragment hyperlinks get fresh relationship ids
used = {int(n) for n in re.findall(r'Id="rId(\d+)"', rels)}
nxt = max(used) + 1
new_rels, idmap = [], {}
for tag in re.findall(r"<Relationship [^>]*/>", frels):
    if "/hyperlink" not in tag: continue
    rid = re.search(r'Id="([^"]+)"', tag).group(1); target = re.search(r'Target="([^"]+)"', tag).group(1)
    nid = f"rId{nxt}"; nxt += 1
    idmap[rid] = nid
    new_rels.append(f'<Relationship Id="{nid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="{target}" TargetMode="External"/>')
fbody = re.search(r"<w:body>(.*)<w:sectPr", fdoc, re.S).group(1)
fbody = re.sub(r'r:id="([^"]+)"', lambda m: f'r:id="{idmap[m.group(1)]}"', fbody)  # KeyError = unmapped id

paras = re.findall(r"<w:p[ >].*?</w:p>", fbody, re.S)
split = next(i for i, p in enumerate(paras) if "@@SPLIT@@" in p)
bullet_runs = re.sub(r"^<w:p[ >].*?(?:<w:pPr>.*?</w:pPr>)?", "", paras[0], count=1, flags=re.S)
bullet_runs = re.sub(r"</w:p>$", "", bullet_runs)
section_xml = fbody[fbody.index(paras[split]) + len(paras[split]):]

TNR = '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>'
JC = '<w:jc w:val="both"/>'

def match_user_format(xml):
    """Mirror the edited file: Times New Roman everywhere, no explicit run sizes
    (headings 10pt), every paragraph justified."""
    xml = re.sub(r'<w:sz w:val="\d+"/>|<w:szCs w:val="\d+"/>|<w:rFonts [^>]*/>|<w:jc w:val="[^"]*"/>', "", xml)
    xml = re.sub(r"(<w:r(?: [^>]*)?>)(<w:rPr>)?",
                 lambda m: m.group(1) + "<w:rPr>" + TNR + ("" if m.group(2) else "</w:rPr>"), xml)
    xml = re.sub(r"<w:rPr>" + re.escape(TNR) + r"(<w:rStyle [^>]*/>)", r"<w:rPr>\1" + TNR, xml)
    xml = xml.replace("<w:rPr>" + TNR + "</w:rPr></w:rPr>", "<w:rPr>" + TNR + "</w:rPr>")
    def fix_p(m):
        p = m.group(0)
        if "<w:pPr>" in p:
            ppr = re.search(r"<w:pPr>.*?</w:pPr>", p, re.S).group(0)
            inner = ppr[7:-8]
            inner = inner.replace("<w:rPr>", JC + "<w:rPr>", 1) if "<w:rPr>" in inner else inner + JC
            p = p.replace(ppr, "<w:pPr>" + inner + "</w:pPr>", 1)
        else:
            p = re.sub(r"^(<w:p(?: [^>]*)?>)", r"\1<w:pPr>" + JC + "</w:pPr>", p, count=1)
        if re.search(r'<w:pStyle w:val="Heading[12]"/>', p):
            p = p.replace("<w:rPr>" + TNR, "<w:rPr>" + TNR + '<w:sz w:val="20"/><w:szCs w:val="20"/>')
        return p
    return re.sub(r"<w:p(?: [^>]*)?>.*?</w:p>", fix_p, xml, flags=re.S)

def para_bounds(text_marker):
    i = doc.index(text_marker)
    start = max(doc.rfind("<w:p ", 0, i), doc.rfind("<w:p>", 0, i))
    end = doc.index("</w:p>", i) + len("</w:p>")
    return start, end

# 1. Summary bullet: reuse the formatting of the last summary bullet
s, e = para_bounds("debtor days and cash conversion")
ppr = re.search(r"<w:pPr>.*?</w:pPr>", doc[s:e], re.S).group(0)
doc = doc[:e] + "<w:p>" + ppr + re.sub(r"^<w:p><w:pPr>.*?</w:pPr>|</w:p>$", "", match_user_format("<w:p>" + bullet_runs + "</w:p>")) + "</w:p>" + doc[e:]

# 2. Section 6 on landscape pages, before "How to use this benchmark"
sects = re.findall(r"<w:sectPr[ >].*?</w:sectPr>", doc, re.S)
portrait, landscape = sects[0], sects[1]
assert 'w:orient="landscape"' in landscape and "landscape" not in portrait
s, _ = para_bounds("6. How to use this benchmark")
close_portrait = f"<w:p><w:pPr>{portrait}</w:pPr></w:p>"
close_landscape = f"<w:p><w:pPr>{landscape}</w:pPr></w:p>"
doc = doc[:s] + close_portrait + match_user_format(section_xml) + close_landscape + doc[s:]

# 3. Renumber later sections and the source-list table
for old, new in [("6. How to use this benchmark", "7. How to use this benchmark"), (">7. Sources<", ">8. Sources<"), ("Table 12. Source list", "Table 14. Source list")]:
    assert doc.count(old) == 1, old
    doc = doc.replace(old, new)

rels = rels.replace("</Relationships>", "".join(new_rels) + "</Relationships>")
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zo:
    for item in zs.infolist():
        data = zs.read(item.filename)
        if item.filename == "word/document.xml": data = doc.encode("utf8")
        elif item.filename == "word/_rels/document.xml.rels": data = rels.encode("utf8")
        zo.writestr(item, data)
print(f"Wrote {out}: {len(new_rels)} new links")
