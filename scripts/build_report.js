// Builds docs/Hospital_Benchmarking_FY26_revised.docx from the figures in this script and the
// source list in data.js. Usage: node scripts/build_report.js
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ExternalHyperlink, Table, TableRow, TableCell,
  WidthType, AlignmentType, ShadingType, BorderStyle, PageOrientation, Header, Footer,
  PageNumber, LevelFormat, HeadingLevel, TableLayoutType, VerticalAlign,
} = require("docx");

const window = {};
eval(fs.readFileSync(path.join(__dirname, "..", "data.js"), "utf8"));
const SRC = window.BENCH.sources;

// Short labels used in the Sources columns
const LABEL = {
  1: "Apollo Q4 FY26 results release", 2: "Quartr: Apollo Q4 FY26", 3: "Multibagg: Apollo Q4 FY26",
  4: "Alpha Spread: Apollo Q2 FY26 call", 5: "Max Healthcare FY26 release (NSE)", 6: "ANI: Fortis FY26 results",
  7: "Fortis Q4 FY26 call transcript", 8: "Fortis Q4 FY26 press release", 9: "Medical Buyer: FY26 sector roundup",
  10: "Whalesbook: Medanta Q4 FY26", 11: "Indian Pharma Post: Medanta FY26", 12: "Narayana Q4 FY26 presentation (NSE)",
  13: "ScanX: Narayana FY26 annual report", 14: "ScanX: Aster DM FY26 presentation", 15: "Quartr: Aster DM presentation",
  16: "Yahoo Finance: KIMS Q4 FY26 call", 17: "ScanX: KIMS FY26 annual report", 18: "ScanX: KIMS Q4 FY26 results",
  19: "Outlook Business: Park Medi World FY26", 20: "IndiaIPO: Park Medi World FY26", 21: "ScanX: Jupiter Q4 & FY26",
  22: "Multibagg: Yatharth Q4 FY26", 23: "ScanX: Yatharth FY26", 24: "MoneyMuscle: Yatharth FY26",
  25: "ScanX: Artemis FY26 annual report", 26: "ScanX: Artemis Q2 FY26", 27: "Multibagg: Rainbow Q4 FY26",
  28: "Multibagg: HCG FY26", 29: "ICRA: HCG rating rationale", 30: "Multibagg: Q4 FY26 sector synthesis",
  31: "ScanX: Dr Agarwal's FY26 results", 32: "Dr Agarwal's Q4 FY26 presentation", 33: "Yahoo Finance: Dr Agarwal's FY26 call",
  34: "Multibagg: Shalby Q4 FY26", 35: "Yahoo Finance: Shalby Q4 FY26 call", 36: "ICRA: hospital sector FY26 research",
};
const KIND = n => {
  const p = SRC[n].pub;
  if (/ICRA/.test(p)) return "Rating agency";
  return SRC[n].kind === "primary" ? "Company filing" : "News / aggregator";
};

// ---------- Look ----------
const FONT = "Arial";
const INK = "1A2B2A", TEAL = "1F4E5F", MUTED = "5F6B68", LINK = "0B5CAD", BAND = "F3F6F5", RULE = "C9D2CF", HEAD_FILL = "1F4E5F";
const A4 = { width: 11906, height: 16838 }, MARGIN = 1080;
const W_PORTRAIT = A4.width - 2 * MARGIN;   // 9746
const W_LANDSCAPE = A4.height - 2 * MARGIN; // 14678

// ---------- Inline markup: **bold**, {5,19} linked superscript citations ----------
function runs(text, base = {}) {
  const out = [];
  text.split(/(\*\*[^*]+\*\*|\{[\d,\s]+\})/).forEach(part => {
    if (!part) return;
    if (part.startsWith("**")) out.push(new TextRun({ ...base, text: part.slice(2, -2), bold: true }));
    else if (part.startsWith("{")) {
      const nums = part.slice(1, -1).split(",").map(s => +s.trim());
      nums.forEach((n, i) => {
        out.push(new ExternalHyperlink({ link: SRC[n].url, children: [new TextRun({ text: String(n), superScript: true, color: LINK, underline: {}, ...base })] }));
        if (i < nums.length - 1) out.push(new TextRun({ text: ",", superScript: true, ...base }));
      });
    } else out.push(new TextRun({ text: part, ...base }));
  });
  return out;
}
const P = (text, opts = {}) => new Paragraph({ children: runs(text, opts.run), spacing: { after: 140, line: 288 }, ...opts.p });
const H1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const Caption = t => new Paragraph({ children: [new TextRun({ text: t, bold: true, color: TEAL, size: 19 })], spacing: { before: 160, after: 80 }, keepNext: true });
const Note = t => new Paragraph({ children: runs(t, { size: 17, color: MUTED }), spacing: { before: 60, after: 80, line: 264 } });
const Bullet = (t, ref = "bullets") => new Paragraph({ numbering: { reference: ref, level: 0 }, children: runs(t), spacing: { after: 90, line: 284 } });

// ---------- Tables ----------
const border = { style: BorderStyle.SINGLE, size: 4, color: RULE };
const borders = { top: border, bottom: border, left: border, right: border };
function srcParas(nums, size = 16) {
  return nums.map(n => new Paragraph({
    spacing: { after: 30 },
    children: [new ExternalHyperlink({ link: SRC[n].url, children: [new TextRun({ text: `[${n}] ${LABEL[n]}`, color: LINK, underline: {}, size, font: FONT })] })],
  }));
}
function cell(content, w, { header = false, align = AlignmentType.LEFT, fill, size = 17 } = {}) {
  let children;
  if (Array.isArray(content) && content.length && content[0] instanceof Paragraph) children = content;
  else if (content && content.src) children = srcParas(content.src, size - 1);
  else children = [new Paragraph({ alignment: align, children: runs(String(content ?? ""), { size, bold: header || undefined, color: header ? "FFFFFF" : INK }) })];
  return new TableCell({
    width: { size: w, type: WidthType.DXA }, borders, verticalAlign: header ? VerticalAlign.BOTTOM : VerticalAlign.TOP,
    shading: header ? { fill: HEAD_FILL, type: ShadingType.CLEAR, color: "auto" } : fill ? { fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
    margins: { top: 70, bottom: 70, left: 100, right: 100 }, children,
  });
}
// cols: [{ h: "Header", w: weight, num: true }]; widths are scaled to the page width
function table(cols, rows, totalW, size = 17) {
  const sum = cols.reduce((a, c) => a + c.w, 0);
  const widths = cols.map(c => Math.floor(c.w / sum * totalW));
  widths[widths.length - 1] += totalW - widths.reduce((a, b) => a + b, 0);
  const R = AlignmentType.RIGHT;
  return new Table({
    width: { size: totalW, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: cols.map((c, i) => cell(c.h, widths[i], { header: true, align: c.num ? R : undefined, size })) }),
      ...rows.map((r, ri) => new TableRow({ cantSplit: true, children: r.map((v, i) => cell(v, widths[i], { align: cols[i].num ? R : undefined, fill: ri % 2 ? BAND : undefined, size })) })),
    ],
  });
}
const S = (...n) => ({ src: n });
const gap = () => new Paragraph({ spacing: { after: 60 }, children: [] });

// ---------- Content ----------
const title = [
  new Paragraph({ children: [new TextRun({ text: "Hospital Benchmarking", bold: true, size: 44, color: TEAL })], spacing: { after: 40 } }),
  new Paragraph({ children: [new TextRun({ text: "15 listed Indian hospital operators, FY2025-26", size: 28, color: INK })], spacing: { after: 120 } }),
  new Paragraph({
    children: [new TextRun({ text: "Year ended 31 March 2026  |  Prepared September 2026  |  ₹ crore unless stated", size: 18, color: MUTED })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: TEAL, space: 8 } }, spacing: { after: 280 },
  }),
];

const summary = [
  H1("Summary"),
  Bullet("EBITDA margins run from 12.7% (Shalby, Q4 only) to 32.0% (Rainbow). Most of the 15 sit between 20% and 27%.{34,27}"),
  Bullet("A high price per bed-day doesn't guarantee a high margin. Park Medi World has the lowest ARPOB in the set (₹28,005) and a 26.5% margin. Artemis has the highest (₹82,435) and a 20.2% margin.{19,25}"),
  Bullet("Group margins understate what established hospitals earn. Where companies report them separately, mature units run about 1 to 8 points higher.{14,16,18}"),
  Bullet("Occupancy can't be compared across companies at face value. Each counts beds differently, and specialty mix changes what a full hospital looks like.{17,22,27}"),
  Bullet("Government-scheme revenue ranges from about 1% (Jupiter) to about 35% (Yatharth), and the effect shows up in debtor days and cash conversion.{21,24}"),
  Note("Superscript numbers in the text and the entries in each table's Sources column are links. Click them to open the original document."),
];

const purpose = [
  H1("1. Purpose and scope"),
  P("This report benchmarks 15 listed Indian hospital operators on their FY26 results. It is meant for a hospital management team that wants to set occupancy and pricing targets, decide where to add beds, and understand why its margin is where it is."),
  P("We group the hospitals by how they make money rather than by how they describe themselves, because the same metric means different things for a metro tertiary chain and a single-specialty one. Each group has only 4 to 6 companies, which is too few for medians or percentiles, so we report ranges and say how many companies each range covers."),
  P("Every figure comes from an FY26 results release, investor presentation, earnings call or annual report, or from a published summary of one. The Sources column in each table links to it. Figures marked (d) are our own calculations from disclosed numbers, and the formula is given with them."),
];

const peers = [
  H1("2. Peer groups"),
  P("A metro tertiary chain earns mainly through price and case mix. A regional chain earns through patient volume and cost control. A single-specialty chain runs one clinical service, with its own norms for occupancy and length of stay. We compare each hospital only with its own group."),
  Caption("Table 1. Peer groups"),
  table([{ h: "Group", w: 2.1 }, { h: "Hospitals", w: 2.4 }, { h: "How they make money", w: 3 }, { h: "Metrics that explain performance", w: 2.4 }], [
    ["**A. National and metro tertiary chains** (5)", "Apollo, Max, Fortis, Medanta, Narayana Health", "Large multi-city networks with complex, high-acuity cases and international patients", "ARPOB, case mix, ROCE, losses at new units"],
    ["**B. Regional multi-specialty chains** (6)", "Aster DM, KIMS, Park Medi World, Jupiter, Yatharth, Artemis", "Networks concentrated in one region, or a single flagship hospital, across a wider range of price points", "Occupancy, cost per bed-day, payer mix, debtor days"],
    ["**C. Single-specialty chains** (4)", "Rainbow (paediatrics and maternity), HCG (oncology), Dr Agarwal's (eye care), Shalby (orthopaedics-led)", "One clinical service; some are mostly day-care or short-stay", "Specialty throughput, margin, payer mix; occupancy only against the same model"],
  ], W_PORTRAIT),
];

const defs = [
  H1("3. How the metrics are defined"),
  P("These definitions follow what the companies report. Where a company uses a different basis, the tables say so."),
  Caption("Table 2. Metric definitions"),
  table([{ h: "Metric", w: 2 }, { h: "How it is measured", w: 4.2 }, { h: "What a gap usually points to", w: 3.2 }], [
    ["**Occupancy**", "Occupied bed-days ÷ available bed-days, on each company's own bed basis (operational, census or capacity)", "Not enough patients from the catchment, or new beds still filling up"],
    ["**ARPOB** (₹ per day)", "Revenue ÷ occupied bed-days, as reported. Fortis and Narayana report it per year; we divided by 365 (d)", "Prices, case mix, payer mix or length of stay"],
    ["**Revenue per available bed-day** (d)", "ARPOB × occupancy. One figure that combines price and utilisation", "Whether the bed base is earning enough, whichever lever is weak"],
    ["**EBITDA margin**", "Operating EBITDA ÷ revenue, as reported (after Ind AS 116 unless noted)", "Cost structure and operating leverage"],
    ["**ALOS**", "Average length of stay in days, as reported", "Clinical efficiency and how quickly beds turn over"],
  ], W_PORTRAIT),
];

const BCOLS = [
  { h: "Hospital", w: 2.3 }, { h: "Revenue", w: 1.35, num: true }, { h: "EBITDA margin", w: 1.05, num: true },
  { h: "Beds (basis)", w: 1.55, num: true }, { h: "Occupancy", w: 1.1, num: true }, { h: "ARPOB (₹/day)", w: 1.15, num: true },
  { h: "Revenue per available bed-day (d)", w: 1.35, num: true }, { h: "ALOS (days)", w: .8, num: true }, { h: "Sources (click to open)", w: 3.2 },
];
const benchmarks = [
  H1("4. Benchmark tables"),
  P("n.r. = not reported by the company. n.a. = cannot be calculated or does not apply. (d) = derived by us."),
  H2("4.1 Group A: national and metro tertiary chains"),
  Caption("Table 3. Group A benchmarks, FY26"),
  table(BCOLS, [
    ["Apollo (healthcare services)", "12,555", "24.4%", "8,131 (operating)", "68% (Q4)", "Not reported (note 1)", "n.a.", "n.r.", S(1, 2, 3)],
    ["Max Healthcare (network)", "10,065 (net)", "26.2%", "4,966 (operational)", "76%", "77,800", "59,128", "4.1", S(5)],
    ["Fortis (hospital business)", "7,773", "22.2%", "~6,100 (incl. O&M)", "68%", "68,767 (d)", "46,762", "n.r.", S(6, 7, 8)],
    ["Medanta (Global Health)", "4,509 (total income)", "24.2%", "3,665 (capacity)", "~62%", "66,550", "41,261", "n.r.", S(9, 10)],
    ["Narayana Health (India)", "4,740", "23.1%", "5,451 (operational)", "Not disclosed", "49,041 (d)", "n.a.", "4.3", S(12, 13)],
  ], W_LANDSCAPE),
  Note("Note 1. Apollo stopped reporting ARPOB in FY26. It now reports average revenue per patient (₹1,87,208 in Q4 FY26), on the grounds that ARPOB mixes price, length of stay and occupancy.{3,4} Fortis and Narayana report ARPOB per year, so we divided by 365: Fortis ₹2.51 Cr and Narayana ₹17.9 Mn per year.{7,12} Max revenue is on a network basis, which includes partner hospitals that Max does not consolidate.{5}"),

  H2("4.2 Group B: regional multi-specialty chains"),
  Caption("Table 4. Group B benchmarks, FY26"),
  table(BCOLS, [
    ["Aster DM (India, pre-merger)", "4,643", "20.4%", "5,449 (capacity)", "61%", "51,800", "31,598", "3.1", S(14, 15)],
    ["KIMS", "3,931", "21.1%", "4,852 (operational)", "50.5%", "44,644", "22,545", "n.r.", S(16, 17)],
    ["Park Medi World", "1,679", "26.5%", "3,610 (capacity)", "64.1%", "28,005", "17,951", "n.r.", S(19, 20)],
    ["Jupiter Life Line", "1,436", "22.9%", "1,248 (operational)", "61.2%", "67,700", "41,432", "3.87", S(21)],
    ["Yatharth", "1,207", "24.2%", "~2,555 (capacity)", "68%", "33,124", "22,524", "n.r.", S(22)],
    ["Artemis (Gurugram)", "1,081", "20.2%", "~700 (capacity)", "63.0%", "82,435", "51,934", "n.r.", S(25)],
  ], W_LANDSCAPE),
  Note("Aster figures are for Aster DM on its own. Its merger with Quality Care India (about 10,623 beds and ₹9,273 Cr proforma revenue combined) was expected to close in Q1 FY27.{14} The Artemis margin is consolidated: ₹218 Cr EBITDA on ₹1,081 Cr revenue.{25}"),

  H2("4.3 Group C: single-specialty chains"),
  Caption("Table 5. Group C benchmarks, FY26"),
  table([
    { h: "Hospital", w: 1.7 }, { h: "Specialty", w: 1.5 }, { h: "Revenue", w: 1.0, num: true }, { h: "EBITDA margin", w: 1.35, num: true },
    { h: "Beds or facilities", w: 1.55, num: true }, { h: "Occupancy", w: 1.05, num: true }, { h: "ARPOB (₹/day)", w: 1.15, num: true },
    { h: "Revenue per available bed-day (d)", w: 1.35, num: true }, { h: "Sources (click to open)", w: 3.2 },
  ], [
    ["Rainbow Children's", "Paediatrics, maternity", "1,703", "32.0%", "2,435 beds", "46.3%", "60,141", "27,845", S(27)],
    ["HCG", "Oncology", "2,545", "18.5% (adjusted)", "2,605 beds", "68.9% (9M)", "47,242 (9M)", "32,550", S(28, 29, 30)],
    ["Dr Agarwal's", "Eye care", "2,080", "28.9% (note 2)", "288 facilities", "n.a.", "n.a.", "n.a.", S(31, 32)],
    ["Shalby", "Orthopaedics-led", "1,168", "12.7% (Q4, note 3)", "~1,352 operational beds (d)", "48% (Q4)", "42,689 (Q4)", "20,491", S(34, 35)],
  ], W_LANDSCAPE),
  Note("Note 2. Dr Agarwal's EBITDA includes other income and is stated on total income of ₹2,125 Cr.{31,32} It is a day-care business, so bed counts and ARPOB don't apply. The useful unit measure is revenue per surgery: surgeries are 66.7% of revenue across 3,23,245 procedures, or about ₹42,900 per surgery (d)."),
  Note("Note 3. We could not find Shalby's full-year EBITDA in a form we could verify, so the table shows its Q4 FY26 consolidated margin. Its standalone hospital margin was 16.1%. Beds are derived as 649 occupied beds ÷ 48% occupancy.{34,35}"),
  Note("HCG ARPOB and occupancy are for the nine months to December 2025, from ICRA. HCG says its own measure, 'centre utilisation', is not bed occupancy.{28,29}"),

  H2("4.4 Ranges by group"),
  P("With 4 to 6 companies per group, we show the range and the number of companies it covers (n) rather than a median. For context, ICRA's FY26 sample of listed hospital chains averaged 63.5% occupancy, a 24.1% operating margin and 9.2% ARPOB growth.{36}"),
  Caption("Table 6. Ranges by group, FY26"),
  table([{ h: "Metric", w: 2.6 }, { h: "Group A", w: 2.2 }, { h: "Group B", w: 2.2 }, { h: "Group C", w: 2.2 }, { h: "ICRA sector sample", w: 2 }, { h: "Sources (click to open)", w: 3.2 }], [
    ["EBITDA margin", "22.2% – 26.2% (n=5)", "20.2% – 26.5% (n=6)", "12.7% – 32.0% (n=4)", "24.1% (operating margin)", S(36)],
    ["Occupancy", "62% – 76% (n=4)", "50.5% – 68% (n=6)", "46.3% – 68.9% (n=3)", "63.5%", S(36)],
    ["ARPOB (₹/day)", "49,041 – 77,800 (n=4)", "28,005 – 82,435 (n=6)", "42,689 – 60,141 (n=3)", "+9.2% growth", S(36)],
    ["Revenue per available bed-day (d)", "41,261 – 59,128 (n=3)", "17,951 – 51,934 (n=6)", "20,491 – 32,550 (n=3)", "–", "Calculated from Tables 3–5"],
  ], W_LANDSCAPE),
];

const findings = [
  H1("5. What the benchmark shows"),

  H2("5.1 Price and volume can lead to the same margin"),
  P("ARPOB on its own doesn't predict profitability. Park Medi World has the lowest ARPOB in the set, ₹28,005, and still earns a 26.5% margin. Max earns almost the same margin, 26.2%, at ₹77,800. Artemis has the highest ARPOB, ₹82,435, and earns 20.2%. It is a single hospital in Gurugram, and international patients bring in about a third of its revenue.{5,19,25,26}"),
  Caption("Table 7. Same margin, different prices"),
  table([{ h: "Hospital", w: 2 }, { h: "ARPOB (₹/day)", w: 1.4, num: true }, { h: "EBITDA margin", w: 1.3, num: true }, { h: "Context", w: 2.8 }, { h: "Sources (click to open)", w: 2.6 }], [
    ["Park Medi World", "28,005", "26.5%", "Lowest ARPOB in the set", S(19)],
    ["Max Healthcare", "77,800", "26.2%", "Network basis; ARPOB on gross revenue", S(5)],
    ["Artemis", "82,435", "20.2%", "Single hospital; about a third of revenue from international patients", S(25, 26)],
  ], W_PORTRAIT),
  gap(),
  P("The difference between them is cost per occupied bed-day, which none of these companies discloses. So the first question for a hospital isn't whether its ARPOB is low. It is which model it runs, high price or high volume, and whether its costs suit that model."),

  H2("5.2 Group margins hide what mature hospitals earn"),
  P("Most of these companies are adding beds quickly, so their group margins mix established hospitals with new ones that are still filling up. Where a company reports the two separately, the difference is large."),
  Caption("Table 8. Group margin against established units"),
  table([{ h: "Company", w: 1.6 }, { h: "Group figure", w: 2 }, { h: "Established or mature units", w: 3.6 }, { h: "Sources (click to open)", w: 2.6 }], [
    ["KIMS", "21.1% EBITDA margin", "29.5% at mature units. New units reduced EBITDA by ₹128 Cr", S(16, 18)],
    ["Aster DM", "20.4% EBITDA margin", "25.4% at hospitals 7 or more years old", S(14)],
    ["Apollo", "24.4% (FY26, healthcare services)", "25.5% at established hospitals (Q4)", S(2, 3)],
    ["Medanta", "24.2% EBITDA margin", "31.5% at developing units excluding Noida. Noida made an EBITDA loss of ₹78 Cr", S(9, 11)],
    ["Max", "21.8% ROCE", "About 31% ROCE excluding units under 4 years old and capital work in progress", S(5)],
    ["Dr Agarwal's", "28.9% EBITDA margin", "Greenfield centres opened in FY26 lost about ₹30 Cr", S(33)],
  ], W_PORTRAIT),
  gap(),
  P("If you compare a hospital's blended margin with these group figures, you will understate what a mature unit should earn. The gap is roughly 1 to 8 points, depending on how much new capacity the group carries; KIMS has the widest gap at 8.4 points. Compare mature units with mature units, and track new units separately on occupancy and margin by months since opening."),

  H2("5.3 Occupancy only compares well within the same model"),
  P("Rainbow has the lowest occupancy in the set, 46.3%, and the highest margin, 32.0%. Children's illness is seasonal and stays are short, so a paediatric hospital can't run as full as a general one.{27} Bed definitions also differ. KIMS reports occupancy on operational beds, while Yatharth and Medanta use capacity-type bases.{9,17,22}"),
  Caption("Table 9. Occupancy depends on specialty and bed basis"),
  table([{ h: "Hospital", w: 2 }, { h: "Occupancy", w: 1.3, num: true }, { h: "Bed basis", w: 1.6 }, { h: "EBITDA margin", w: 1.3, num: true }, { h: "Sources (click to open)", w: 2.8 }], [
    ["Rainbow Children's", "46.3%", "Not stated", "32.0%", S(27)],
    ["KIMS", "50.5%", "Operational", "21.1%", S(17)],
    ["Medanta", "~62%", "Capacity", "24.2%", S(9, 10)],
    ["Yatharth", "68%", "Capacity", "24.2%", S(22)],
  ], W_PORTRAIT),
  gap(),
  P("Set occupancy targets against hospitals with a similar specialty mix that count beds the same way. Or use revenue per available bed-day, which depends less on how beds are counted."),

  H2("5.4 Payer mix affects cash as much as margin"),
  P("The share of revenue from government schemes varies widely. It is about 35% at Yatharth, 33% at HCG and 18% at Narayana, against about 1% at Jupiter, where insurance makes up 55.4%.{12,21,24,28} The cost shows up in receivables. Park's debtor days were 129 at March 2026, down from 161, while Max's were 87.{5,20}"),
  Caption("Table 10. Payer mix, receivables and cash conversion"),
  table([{ h: "Hospital", w: 1.8 }, { h: "Government schemes, % of revenue", w: 1.9, num: true }, { h: "Debtor days, March 2026", w: 1.6, num: true }, { h: "Operating cash flow ÷ EBITDA", w: 1.6, num: true }, { h: "Sources (click to open)", w: 2.8 }], [
    ["Yatharth", "~35%", "–", "98%", S(23, 24)],
    ["HCG", "33%", "–", "75%", S(28)],
    ["Narayana Health", "18%", "–", "–", S(12)],
    ["Jupiter Life Line", "~1% (insurance 55.4%)", "–", "–", S(21)],
    ["Park Medi World", "–", "129 (down from 161)", "–", S(20)],
    ["Max Healthcare", "–", "87", "–", S(5)],
  ], W_PORTRAIT),
  Note("– = not covered in this report."),
  P("A hospital that benchmarks its margin should report debtor days and operating cash flow as a share of EBITDA alongside it."),

  H2("5.5 Companies define the same metrics differently"),
  Caption("Table 11. Reporting differences that affect comparison"),
  table([{ h: "Company", w: 1.8 }, { h: "Difference", w: 5 }, { h: "Sources (click to open)", w: 2.8 }], [
    ["Apollo", "No longer reports ARPOB. Reports average revenue per patient instead", S(4)],
    ["Fortis, Narayana", "Report ARPOB per year rather than per day", S(7, 12)],
    ["Max", "Calculates ARPOB on gross revenue. Reported numbers include partner hospitals it doesn't own", S(5)],
    ["HCG", "Occupancy and ARPOB are 9M figures from ICRA. HCG's own 'centre utilisation' is not bed occupancy", S(29)],
    ["All", "Bed counts are a mix of operational, census and capacity figures", "See Tables 3–5"],
  ], W_PORTRAIT),
  gap(),
  P("These are presentation choices, not errors. But they mean the tables in this report support ranges and direction, not an exact ranking."),
];

const using = [
  H1("6. How to use this benchmark"),
  new Paragraph({ numbering: { reference: "steps", level: 0 }, children: runs("**Pick the right peer group.** Compare yourself only with the group whose business model matches yours: high-price tertiary, high-volume regional, or single specialty."), spacing: { after: 90, line: 284 } }),
  new Paragraph({ numbering: { reference: "steps", level: 0 }, children: runs("**Split the margin gap into its parts:** ARPOB (price and case mix), occupancy (volume) and cost per occupied bed-day. Each points to a different fix."), spacing: { after: 90, line: 284 } }),
  new Paragraph({ numbering: { reference: "steps", level: 0 }, children: runs("**Separate mature hospitals from new ones.** Compare mature units with the 25–30% mature-unit margins in Section 5.2, and track new units by months since opening."), spacing: { after: 90, line: 284 } }),
  new Paragraph({ numbering: { reference: "steps", level: 0 }, children: runs("**Report payer mix, debtor days and cash conversion with the margin.** A margin that doesn't turn into cash isn't comparable with one that does."), spacing: { after: 90, line: 284 } }),
  new Paragraph({ numbering: { reference: "steps", level: 0 }, children: runs("**State your own definitions.** Give your bed basis and how you calculate ARPOB, so others can check the comparison."), spacing: { after: 200, line: 284 } }),
  H2("Limitations"),
  Bullet("Sources are company disclosures and published summaries of them. Where we couldn't open a primary filing, we used the closest secondary report that quotes it, and cite that report."),
  Bullet("All figures are full-year FY26 except Apollo occupancy (Q4), HCG ARPOB and occupancy (9M), and Shalby margin, occupancy and ARPOB (Q4)."),
  Bullet("Revenue bases differ: net or gross, network or consolidated, segment or group. We haven't adjusted for Ind AS 116 or other income beyond what companies disclose."),
  Bullet("Listed chains are larger and better funded than most private hospitals. A standalone hospital should treat these figures as direction, not targets."),
];

const sources = [
  H1("7. Sources"),
  P("Company filing = results release, investor presentation, transcript or stock-exchange filing from the company. Rating agency = ICRA. News / aggregator = a published summary of the company's disclosure; check it against the filing where you can. All links were current when the report was prepared."),
  Caption("Table 12. Source list"),
  table([{ h: "#", w: .45, num: true }, { h: "Source", w: 4.6 }, { h: "Type", w: 1.4 }, { h: "Link (click to open)", w: 2.6 }],
    Object.keys(SRC).map(Number).map(n => {
      const host = new URL(SRC[n].url).hostname.replace(/^www\./, "");
      return [String(n), `**${SRC[n].pub}.** ${SRC[n].t}`, KIND(n),
        [new Paragraph({ children: [new ExternalHyperlink({ link: SRC[n].url, children: [new TextRun({ text: host, color: LINK, underline: {}, size: 16, font: FONT })] })] })]];
    }), W_PORTRAIT),
  gap(),
  Note("Method: based on our internal benchmarking series, parts 1–4 (How to Benchmark a Business; The Metrics That Actually Carry a Diagnosis; When Revenue Multiples Apply; MCA Data Is a Good Starting Point)."),
];

// ---------- Document ----------
const header = new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Hospital Benchmarking FY26", size: 16, color: MUTED })] })] });
const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Page ", size: 16, color: MUTED }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MUTED }), new TextRun({ text: " of ", size: 16, color: MUTED }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: MUTED })] })] });
const portrait = { page: { size: A4, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } };
const landscape = { page: { size: { ...A4, orientation: PageOrientation.LANDSCAPE }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } };

const doc = new Document({
  creator: "Hospital Benchmarking", title: "Hospital Benchmarking: 15 Listed Indian Hospital Operators, FY26",
  styles: {
    default: { document: { run: { font: FONT, size: 20, color: INK } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 28, bold: true, color: TEAL, font: FONT }, paragraph: { spacing: { before: 320, after: 140 }, outlineLevel: 0, keepNext: true } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 23, bold: true, color: INK, font: FONT }, paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 1, keepNext: true } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } } } }] },
      { reference: "steps", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 300 } } } }] },
    ],
  },
  sections: [
    { properties: portrait, headers: { default: header }, footers: { default: footer }, children: [...title, ...summary, ...purpose, ...peers, ...defs] },
    { properties: landscape, headers: { default: header }, footers: { default: footer }, children: benchmarks },
    { properties: portrait, headers: { default: header }, footers: { default: footer }, children: [...findings, ...using, ...sources] },
  ],
});

module.exports = { runs, P, H1, H2, Caption, Note, Bullet, table, S, gap, SRC, W_PORTRAIT, W_LANDSCAPE, A4, MARGIN, FONT };

if (require.main === module) {
  const out = path.join(__dirname, "..", "docs", "Hospital_Benchmarking_FY26_revised.docx");
  Packer.toBuffer(doc).then(buf => { fs.writeFileSync(out, buf); console.log("Wrote " + out); });
}
