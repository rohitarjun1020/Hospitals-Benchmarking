// Builds the "6. Diagnostic" section (plus one summary bullet) as a standalone .docx fragment.
// scripts/merge_diagnostic.py then inserts it into the edited report.
// Every figure is calculated here from the inputs in Tables 3-5 of the report.
// Usage: node scripts/diagnostic_section.js <out.docx>
const fs = require("fs");
const { Document, Packer, Paragraph, TextRun } = require("docx");
const L = require("./build_report.js");
const { P, H1, H2, Caption, Note, table, S, W_LANDSCAPE } = L;

// Inputs exactly as shown in Tables 3-5: ARPOB (₹/day), occupancy (%), EBITDA margin (%)
const ROWS = [
  { name: "Max Healthcare", g: "A", arpob: 77800, occ: 76, m: 26.2, src: [5], basis: "ARPOB on gross revenue; margin on net network revenue; operational beds" },
  { name: "Fortis", g: "A", arpob: 68767, occ: 68, m: 22.2, src: [6, 7, 8], basis: "ARPOB converted from ₹2.51 Cr a year (d); ~6,100 beds incl. O&M", arpobTxt: "68,767 (d)" },
  { name: "Medanta", g: "A", arpob: 66550, occ: 62, m: 24.2, src: [9, 10], basis: "Occupancy approximate, on capacity beds", occTxt: "~62%" },
  { name: "Narayana Health", g: "A", arpob: 49041, occ: null, m: 23.1, src: [12, 13], basis: "ARPOB converted from ₹17.9 Mn a year (d); occupancy not disclosed", arpobTxt: "49,041 (d)" },
  { name: "Aster DM", g: "B", arpob: 51800, occ: 61, m: 20.4, src: [14, 15], basis: "Aster DM standalone, pre-merger; occupancy on capacity beds" },
  { name: "KIMS", g: "B", arpob: 44644, occ: 50.5, m: 21.1, src: [16, 17], basis: "Occupancy on operational beds" },
  { name: "Park Medi World", g: "B", arpob: 28005, occ: 64.1, m: 26.5, src: [19, 20], basis: "Occupancy on capacity beds" },
  { name: "Jupiter Life Line", g: "B", arpob: 67700, occ: 61.2, m: 22.9, src: [21], basis: "Occupancy on operational beds" },
  { name: "Yatharth", g: "B", arpob: 33124, occ: 68, m: 24.2, src: [22], basis: "Occupancy on capacity beds" },
  { name: "Artemis", g: "B", arpob: 82435, occ: 63.0, m: 20.2, src: [25], basis: "Margin consolidated", occTxt: "63.0%" },
  { name: "Rainbow Children's", g: "C", arpob: 60141, occ: 46.3, m: 32.0, src: [27], basis: "Paediatrics and maternity" },
  { name: "HCG", g: "C", arpob: 47242, occ: 68.9, m: 18.5, src: [28, 29], basis: "ARPOB and occupancy 9M FY26 (ICRA); margin full-year, adjusted", arpobTxt: "47,242 (9M)", occTxt: "68.9% (9M)", mTxt: "18.5% (adj.)" },
  { name: "Shalby", g: "C", arpob: 42689, occ: 48, m: 12.7, src: [34, 35], basis: "All three inputs Q4 FY26; margin consolidated", arpobTxt: "42,689 (Q4)", occTxt: "48% (Q4)", mTxt: "12.7% (Q4)" },
];
const inr = v => Math.round(v).toLocaleString("en-IN");
ROWS.forEach(r => {
  r.cost = r.arpob * (1 - r.m / 100);            // revenue less EBITDA, per occupied bed-day
  r.epob = r.arpob * r.m / 100;                   // EBITDA per occupied bed-day
  r.epab = r.occ == null ? null : r.arpob * (r.occ / 100) * (r.m / 100); // EBITDA per available bed-day
});
const by = Object.fromEntries(ROWS.map(r => [r.name, r]));

// Sanity checks: cost + EBITDA = ARPOB after rounding, and the decomposition multiplies out
ROWS.forEach(r => { if (Math.abs(Math.round(r.cost) + Math.round(r.epob) - r.arpob) > 1) throw new Error("rounding " + r.name); });

// ---- Leader comparison within Groups A and B ----
function lead(g) {
  const rs = ROWS.filter(r => r.g === g && r.epab != null);
  const L = rs.reduce((a, b) => (b.epab > a.epab ? b : a));
  return rs.sort((a, b) => b.epab - a.epab).map(r => {
    const price = r.arpob / L.arpob, occ = r.occ / L.occ, mar = r.m / L.m, tot = r.epab / L.epab;
    if (Math.abs(price * occ * mar - tot) > 1e-9) throw new Error("decomposition " + r.name);
    return { r, L, price, occ, mar, tot };
  });
}
const f2 = x => x.toFixed(2);
function shortfall(x) {
  if (x.tot === 1) return "Group leader";
  const parts = [["price", x.price], ["occupancy", x.occ], ["margin", x.mar]].filter(p => p[1] < 1).sort((a, b) => a[1] - b[1]);
  const spread = parts.length === 3 && parts[2][1] - parts[0][1] < 0.05;
  if (spread) return "Spread across all three";
  const t = parts.map(p => p[0]).join(", then ");
  return t[0].toUpperCase() + t.slice(1);
}

// ---- Content ----
const ex = [];
const A = lead("A"), Bg = lead("B");
const park = by["Park Medi World"], art = by["Artemis"], kims = by["KIMS"], rain = by["Rainbow Children's"], max = by["Max Healthcare"], shal = by["Shalby"];
const pct = x => Math.round(x * 100) + "%";

// Check every claim in the prose against the data before writing it
const groupB = ROWS.filter(r => r.g === "B");
const assert = (c, msg) => { if (!c) throw new Error("claim failed: " + msg); };
assert(groupB.every(r => r.epob >= park.epob), "Park lowest EBITDA/OBD in B");
assert(groupB.every(r => r.epob <= art.epob), "Artemis highest EBITDA/OBD in B");
assert(groupB.every(r => r.m <= park.m) && groupB.every(r => r.m >= art.m), "Park highest / Artemis lowest margin in B");
const ranked = [...ROWS].sort((a, b) => b.epob - a.epob);
assert(ranked[0] === max && ranked[1] === rain, "Rainbow second to Max on EBITDA/OBD");
assert(ROWS.filter(r => r.occ != null).every(r => r.occ >= rain.occ), "Rainbow lowest occupancy");
assert(Math.round(kims.epab) === Math.round(park.epab), "KIMS = Park EBITDA/avail");
assert(ROWS.filter(r => r.epab != null).every(r => r.epab >= shal.epab), "Shalby lowest EBITDA/avail");

assert(A[0].r === max && A[1].r.name === "Fortis" && A[2].r.name === "Medanta", "Group A order");
assert(Bg[0].r === art && Bg[1].r.name === "Jupiter Life Line", "Group B order");
assert(Bg.slice(1).every(x => x.price < x.occ && x.price < x.mar), "price is main shortfall in B");
assert(groupB.every(r => r.occ >= kims.occ), "KIMS lowest occupancy in B");
assert(A[2].occ < A[2].price && A[2].occ < A[2].mar, "Medanta occupancy largest shortfall");
const bullet = new Paragraph({ children: L.runs(`Margin and profit per bed can rank hospitals differently. Artemis has the lowest margin in Group B (20.2%) but earns ${(art.epob / park.epob).toFixed(1)} times Park Medi World's EBITDA per occupied bed-day (Section 6).{19,25}`) });

const section = [
  H1("6. Diagnostic: what drives each hospital's margin"),
  P("Sections 4 and 5 show where each hospital stands. This section estimates why, using three measures built from figures already in Tables 3 to 5. None of the companies report these measures, so all of them are derived (d)."),
  P("**Cost per occupied bed-day** = ARPOB × (1 − EBITDA margin). This is revenue less EBITDA for each occupied bed-day: operating cost before depreciation, interest and tax."),
  P("**EBITDA per occupied bed-day** = ARPOB × EBITDA margin. The operating profit each patient-day earns."),
  P("**EBITDA per available bed-day** = ARPOB × occupancy × EBITDA margin. The operating profit each bed earns per day, full or empty. Because it is a product of price, occupancy and margin, any gap between two hospitals splits exactly into those three parts."),

  H2("6.1 Cost and profit per bed-day"),
  Caption("Table 12. Cost and profit per bed-day, FY26 (all derived)"),
  table([
    { h: "Hospital", w: 1.55 }, { h: "Group", w: .55 }, { h: "ARPOB (₹/day)", w: 1, num: true }, { h: "EBITDA margin", w: .95, num: true },
    { h: "Cost per occupied bed-day (₹)", w: 1.1, num: true }, { h: "EBITDA per occupied bed-day (₹)", w: 1.1, num: true },
    { h: "Occupancy", w: .9, num: true }, { h: "EBITDA per available bed-day (₹)", w: 1.1, num: true },
    { h: "Basis and caveats", w: 2.2 }, { h: "Sources (click to open)", w: 2.5 },
  ], ROWS.map(r => [
    r.name, r.g, r.arpobTxt || inr(r.arpob), r.mTxt || r.m.toFixed(1) + "%", inr(r.cost), inr(r.epob),
    r.occ == null ? "Not disclosed" : (r.occTxt || (Number.isInteger(r.occ) ? r.occ : r.occ.toFixed(1)) + "%"),
    r.epab == null ? "n.a." : inr(r.epab), r.basis, S(...r.src),
  ]), W_LANDSCAPE),
  Note("Inputs are the rounded figures in Tables 3 to 5, so read the results to the nearest few hundred rupees. Apollo is excluded because it no longer reports ARPOB. Dr Agarwal's is excluded because it is a day-care business without a meaningful ARPOB, and its EBITDA includes other income."),

  H2("6.2 Margin and profit per bed are different measures"),
  P(`Margin is the share of revenue a hospital keeps. EBITDA per occupied bed-day is the rupees it keeps from each patient-day. The two can rank hospitals in opposite order. Park Medi World has the highest margin in Group B (26.5%) and the lowest EBITDA per occupied bed-day in the group (₹${inr(park.epob)}). Artemis has the lowest margin in Group B (20.2%) and the highest EBITDA per occupied bed-day (₹${inr(art.epob)}), ${(art.epob / park.epob).toFixed(1)} times Park's.{19,25}`),
  P(`Rainbow earns ₹${inr(rain.epob)} per occupied bed-day, second only to Max (₹${inr(max.epob)}) among the 13 hospitals measured, even though it has the lowest occupancy in the set (46.3%).{5,27}`),

  H2("6.3 Cost per bed-day explains the margin"),
  P(`Section 5.1 noted that cost per occupied bed-day isn't disclosed. Table 12 estimates it. Margin equals 1 minus cost per occupied bed-day divided by ARPOB, so a hospital keeps a higher share of revenue when its costs are lower relative to its prices. Park's cost per occupied bed-day (₹${inr(park.cost)}) is ${pct(park.cost / art.cost)} of Artemis's (₹${inr(art.cost)}), while its ARPOB is ${pct(park.arpob / art.arpob)} of Artemis's. Park's costs are lower by a larger proportion than its prices, which is why its margin is higher.{19,25}`),

  H2("6.4 Same profit per bed, opposite routes"),
  P(`KIMS and Park Medi World both earn ₹${inr(kims.epab)} of EBITDA per available bed-day. KIMS charges ${pct(kims.arpob / park.arpob - 1)} more per occupied bed-day (₹44,644 against ₹28,005) and keeps a smaller margin (21.1% against 26.5%). It also fills fewer beds: 50.5% of operational beds against Park's 64.1% of capacity beds. Those bed bases differ, which would, if anything, widen KIMS's occupancy gap on a like-for-like basis.{16,17,19}`),
  P("KIMS has the lowest occupancy in Group B. That is consistent with Section 5.2: new units reduced its FY26 EBITDA by ₹128 Cr, while its mature units earned a 29.5% margin.{16,18}"),

  H2("6.5 What separates each hospital from its group leader"),
  P("Table 13 compares each hospital with the one that earns the most EBITDA per available bed-day in its group. Each driver is shown as a ratio to the leader, where 1.00 matches the leader. The three ratios multiply to the overall ratio: for Fortis, 0.88 × 0.89 × 0.85 = 0.67."),
  Caption("Table 13. Drivers of the gap to the group leader, FY26 (derived; leader = 1.00)"),
  table([
    { h: "Hospital", w: 1.7 }, { h: "Group", w: .55 }, { h: "EBITDA per available bed-day (₹)", w: 1.2, num: true }, { h: "Overall vs leader", w: .95, num: true },
    { h: "Price (ARPOB)", w: .9, num: true }, { h: "Occupancy", w: .9, num: true }, { h: "Margin", w: .85, num: true },
    { h: "Largest shortfall", w: 1.7 }, { h: "Sources (click to open)", w: 2.5 },
  ], [...A, ...Bg].map(x => [
    x.r.name + (x.tot === 1 ? " (leader)" : ""), x.r.g, inr(x.r.epab), f2(x.tot), f2(x.price), f2(x.occ), f2(x.mar), shortfall(x), S(...x.r.src),
  ]), W_LANDSCAPE),
  Note("Ratios are calculated from unrounded values, then rounded to two decimals, so a product of the rounded ratios can differ from the overall figure in the last digit. Narayana is excluded because it does not disclose occupancy. Group C is not compared with a leader because Rainbow, HCG and Shalby run different specialties, and Section 5.3 shows that occupancy norms differ by specialty."),
  P(`**Group A.** Max leads on all three drivers. Fortis's gap is spread evenly: ${f2(A[1].price)} of Max's price, ${f2(A[1].occ)} of its occupancy and ${f2(A[1].mar)} of its margin. Medanta's largest shortfall is occupancy (${f2(A[2].occ)}). That is consistent with its Noida hospital, which made an EBITDA loss of ₹78 Cr in FY26.{5,6,9,11}`),
  P(`**Group B.** Artemis leads, and price is the main shortfall for every other hospital in the group. Jupiter comes closest (${f2(Bg[1].tot)}): its ARPOB is ${f2(Bg[1].price)} of Artemis's, but its margin is higher (${f2(Bg[1].mar)}). Park and Yatharth have the lowest prices relative to Artemis (${f2(lead("B").find(x => x.r === park).price)} and ${f2(lead("B").find(x => x.r === by["Yatharth"]).price)}). They recover part of the gap through higher margins (${f2(lead("B").find(x => x.r === park).mar)} and ${f2(lead("B").find(x => x.r === by["Yatharth"]).mar)}) and similar or higher occupancy.{19,21,22,25}`),
  P(`**Group C.** Shalby has the lowest EBITDA per available bed-day of the 12 hospitals that can be measured (₹${inr(shal.epab)}, Q4 FY26 only), mainly because of its 12.7% margin.{34,35}`),

  H2("6.6 How to read these estimates"),
  P("These are estimates, and three things limit their precision."),
  P("**Revenue bases differ.** ARPOB and EBITDA margin are not always calculated on the same revenue. Max reports ARPOB on gross revenue and margin on net network revenue. HCG's ARPOB is for nine months, while its margin is for the full year and adjusted. Where the bases differ, cost and profit per bed-day are approximations."),
  P("**Bed bases differ.** Occupancy is measured on operational, census or capacity beds depending on the company, which affects EBITDA per available bed-day (Section 5.5)."),
  P("**Inputs are rounded.** Small differences between hospitals in Tables 12 and 13 should not be read as meaningful."),
  P("Even so, the estimates show what the published figures alone don't: whether a hospital's margin comes from price, from filling its beds, or from controlling cost. For a hospital using this benchmark, the same three calculations on its own figures show which lever matters most."),
];


const doc = new Document({
  styles: { default: { document: { run: { font: L.FONT, size: 20, color: "1A2B2A" } } } },
  sections: [{ children: [bullet, new Paragraph({ children: [new TextRun("@@SPLIT@@")] }), ...section] }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(process.argv[2], b); console.log("fragment written"); });
