/*
 * Hospital Benchmarking FY26 — dataset behind the dashboard.
 * Every figure is transcribed from docs/Hospital_Benchmarking_FY26.docx.
 * `src` arrays hold source numbers from that document's Section 7 (see SOURCES below).
 * Flags: d = derived by us from disclosed numbers, approx = "~", period = "Q4" | "9M".
 * Run `node scripts/validate_data.js` after editing to re-check derived figures and ranges.
 */
window.BENCH = {
  meta: {
    title: "Hospital Benchmarking: 15 Listed Indian Hospital Operators",
    period: "FY2025-26 (year ended 31 March 2026)",
    prepared: "September 2026",
    units: "Figures in ₹ crore unless stated",
  },

  segments: {
    A: {
      name: "National / metro tertiary chains",
      short: "National tertiary",
      model: "Large multi-city networks; high-acuity, quaternary case mix; international patients.",
      engine: "Earns through price and case mix.",
      diagnostic: ["ARPOB", "Case mix", "ROCE", "New-unit drag"],
    },
    B: {
      name: "Regional multi-specialty chains",
      short: "Regional multi-specialty",
      model: "Cluster-concentrated networks or flagship hospitals; wider range of price points.",
      engine: "Earns through volume and cost.",
      diagnostic: ["Occupancy", "Cost per bed-day", "Payer mix", "Receivable days"],
    },
    C: {
      name: "Single-specialty chains",
      short: "Single-specialty",
      model: "One clinical engine; day-care or short-stay heavy in some cases.",
      engine: "Earns through a narrow clinical engine with its own occupancy norms.",
      diagnostic: ["Specialty throughput", "Margin", "Payer mix", "Occupancy only within model"],
    },
  },

  // ICRA's FY26 sample of listed hospital chains (source 36)
  sector: { occ: 63.5, arpobGrowth: 9.2, margin: 24.1, src: [36] },

  hospitals: [
    // ---------- Segment A ----------
    {
      id: "apollo", name: "Apollo Hospitals", scope: "Healthcare services", seg: "A", src: [1, 2, 3],
      rev: { v: 12555, note: "Healthcare services segment revenue" },
      margin: { v: 24.4 },
      beds: { v: 8131, basis: "operating" },
      occ: { v: 68, period: "Q4" },
      arpob: { v: null, why: "Not reported. Apollo stopped reporting ARPOB in FY26 and now reports average revenue per patient (₹1,87,208 in Q4 FY26), arguing ARPOB blends price, stay length and occupancy.", src: [3, 4] },
      rpab: { v: null, why: "Cannot be derived without ARPOB." },
      alos: { v: null, why: "Not reported." },
      notes: [
        { t: "Stopped reporting ARPOB in FY26; reports average revenue per patient instead (₹1,87,208 in Q4 FY26).", src: [3, 4] },
        { t: "Established hospitals earned a 25.5% EBITDA margin in Q4, against 24.4% for FY26 healthcare services overall.", src: [2, 3] },
      ],
    },
    {
      id: "max", name: "Max Healthcare", scope: "Network", seg: "A", src: [5],
      rev: { v: 10065, note: "Net revenue, network basis. Includes partner facilities that Max does not consolidate." },
      margin: { v: 26.2 },
      beds: { v: 4966, basis: "operational" },
      occ: { v: 76 },
      arpob: { v: 77800, note: "Calculated by Max on gross revenue." },
      rpab: { v: 59128, d: true },
      alos: { v: 4.1 },
      notes: [
        { t: "Revenue is on a network basis, which includes partner facilities Max does not consolidate. ARPOB uses gross revenue.", src: [5] },
        { t: "ROCE 21.8%; about 31% excluding units under 4 years old and capital work in progress.", src: [5] },
        { t: "Debtor days 87 at March 2026.", src: [5] },
      ],
    },
    {
      id: "fortis", name: "Fortis Healthcare", scope: "Hospital business", seg: "A", src: [6, 7, 8],
      rev: { v: 7773, note: "Hospital business revenue" },
      margin: { v: 22.2 },
      beds: { v: 6100, approx: true, basis: "incl. O&M" },
      occ: { v: 68 },
      arpob: { v: 68767, d: true, note: "Fortis reports ARPOB per year: ₹2.51 Cr p.a. ÷ 365.", src: [7] },
      rpab: { v: 46762, d: true },
      alos: { v: null, why: "Not reported." },
      notes: [
        { t: "ARPOB is reported per annum (₹2.51 Cr); converted to per day by dividing by 365.", src: [7] },
      ],
    },
    {
      id: "medanta", name: "Medanta (Global Health)", scope: "Total income", seg: "A", src: [9, 10],
      rev: { v: 4509, note: "Total income" },
      margin: { v: 24.2 },
      beds: { v: 3665, basis: "capacity" },
      occ: { v: 62, approx: true },
      arpob: { v: 66550 },
      rpab: { v: 41261, d: true },
      alos: { v: null, why: "Not reported." },
      notes: [
        { t: "Developing units excluding Noida earned 31.5%; the Noida hospital made an EBITDA loss of ₹78 Cr.", src: [9, 11] },
      ],
    },
    {
      id: "narayana", name: "Narayana Health", scope: "India", seg: "A", src: [12, 13],
      rev: { v: 4740, note: "India hospital revenue" },
      margin: { v: 23.1 },
      beds: { v: 5451, basis: "operational" },
      occ: { v: null, why: "Not disclosed." },
      arpob: { v: 49041, d: true, note: "Narayana reports ARPOB per year: ₹17.9 Mn p.a. ÷ 365.", src: [12] },
      rpab: { v: null, why: "Cannot be derived without occupancy." },
      alos: { v: 4.3 },
      notes: [
        { t: "ARPOB is reported per annum (₹17.9 Mn); converted to per day by dividing by 365.", src: [12] },
        { t: "Government schemes are about 18% of revenue.", src: [12] },
      ],
    },

    // ---------- Segment B ----------
    {
      id: "aster", name: "Aster DM Healthcare", scope: "India, pre-merger", seg: "B", src: [14, 15],
      rev: { v: 4643 },
      margin: { v: 20.4 },
      beds: { v: 5449, basis: "capacity" },
      occ: { v: 61 },
      arpob: { v: 51800 },
      rpab: { v: 31598, d: true },
      alos: { v: 3.1, src: [15] },
      notes: [
        { t: "Merger with Quality Care India (combined ~10,623 beds, ₹9,273 Cr proforma revenue) was expected to close in Q1 FY27. Figures here are Aster standalone.", src: [14] },
        { t: "Hospitals 7+ years old earned a 25.4% EBITDA margin, against 20.4% overall.", src: [14] },
      ],
    },
    {
      id: "kims", name: "KIMS", scope: "Consolidated", seg: "B", src: [16, 17],
      rev: { v: 3931 },
      margin: { v: 21.1 },
      beds: { v: 4852, basis: "operational" },
      occ: { v: 50.5, src: [17] },
      arpob: { v: 44644, src: [17] },
      rpab: { v: 22545, d: true },
      alos: { v: null, why: "Not reported." },
      notes: [
        { t: "Mature units earned a 29.5% EBITDA margin; new units eroded ₹128 Cr of EBITDA.", src: [16, 18] },
        { t: "Occupancy is reported on operational beds, which makes it look lower than peers on capacity bases.", src: [17] },
      ],
    },
    {
      id: "park", name: "Park Medi World", scope: "Consolidated", seg: "B", src: [19, 20],
      rev: { v: 1679 },
      margin: { v: 26.5 },
      beds: { v: 3610, basis: "capacity" },
      occ: { v: 64.1 },
      arpob: { v: 28005 },
      rpab: { v: 17951, d: true },
      alos: { v: null, why: "Not reported." },
      notes: [
        { t: "Lowest ARPOB in the set yet the highest margin in Segment B.", src: [19] },
        { t: "Debtor days 129 at March 2026, down from 161.", src: [20] },
      ],
    },
    {
      id: "jupiter", name: "Jupiter Life Line", scope: "Consolidated", seg: "B", src: [21],
      rev: { v: 1436 },
      margin: { v: 22.9 },
      beds: { v: 1248, basis: "operational" },
      occ: { v: 61.2 },
      arpob: { v: 67700 },
      rpab: { v: 41432, d: true },
      alos: { v: 3.87 },
      notes: [
        { t: "Government schemes are about 1% of revenue; insurance is 55.4%.", src: [21] },
      ],
    },
    {
      id: "yatharth", name: "Yatharth Hospitals", scope: "Consolidated", seg: "B", src: [22],
      rev: { v: 1207 },
      margin: { v: 24.2 },
      beds: { v: 2555, approx: true, basis: "capacity" },
      occ: { v: 68 },
      arpob: { v: 33124 },
      rpab: { v: 22524, d: true },
      alos: { v: null, why: "Not reported." },
      notes: [
        { t: "Government schemes are around 35% of revenue.", src: [24] },
        { t: "Converted 98% of EBITDA to operating cash flow in FY26.", src: [23] },
      ],
    },
    {
      id: "artemis", name: "Artemis Hospitals", scope: "Gurugram", seg: "B", src: [25],
      rev: { v: 1081 },
      margin: { v: 20.2, note: "Consolidated: ₹218 Cr EBITDA on ₹1,081 Cr revenue." },
      beds: { v: 700, approx: true, basis: "capacity" },
      occ: { v: 63.0 },
      arpob: { v: 82435 },
      rpab: { v: 51934, d: true },
      alos: { v: null, why: "Not reported." },
      notes: [
        { t: "A single Gurugram hospital where international patients bring in roughly a third of revenue.", src: [26] },
      ],
    },

    // ---------- Segment C ----------
    {
      id: "rainbow", name: "Rainbow Children's Medicare", scope: "Paediatrics, maternity", seg: "C", specialty: "Paediatrics, maternity", src: [27],
      rev: { v: 1703 },
      margin: { v: 32.0 },
      beds: { v: 2435, basis: "beds" },
      occ: { v: 46.3 },
      arpob: { v: 60141 },
      rpab: { v: 27845, d: true },
      alos: { v: null, why: "Not reported." },
      notes: [
        { t: "Lowest occupancy in the set but the highest margin, because paediatric demand is seasonal and stays are short.", src: [27] },
      ],
    },
    {
      id: "hcg", name: "HCG", scope: "Oncology", seg: "C", specialty: "Oncology", src: [28, 29, 30],
      rev: { v: 2545, src: [28] },
      margin: { v: 18.5, adj: true, note: "Adjusted EBITDA margin.", src: [28] },
      beds: { v: 2605, basis: "beds", src: [30] },
      occ: { v: 68.9, period: "9M", note: "9M FY26, from ICRA. HCG says its own 'centre utilisation' is not bed occupancy.", src: [29] },
      arpob: { v: 47242, period: "9M", note: "9M FY26, from ICRA.", src: [29] },
      rpab: { v: 32550, d: true, period: "9M" },
      alos: { v: null, why: "Not reported." },
      notes: [
        { t: "ARPOB and occupancy are 9M FY26 figures from ICRA. HCG says its own 'centre utilisation' is not bed occupancy.", src: [28, 29] },
        { t: "Government schemes are about 33% of revenue. Converted 75% of EBITDA to operating cash flow.", src: [28] },
      ],
    },
    {
      id: "agarwal", name: "Dr Agarwal's Health Care", scope: "Eye care", seg: "C", specialty: "Eye care", src: [31, 32],
      rev: { v: 2080 },
      margin: { v: 28.9, note: "Includes other income and is stated on total income of ₹2,125 Cr.", src: [31, 32] },
      beds: { v: 288, basis: "facilities", unit: "facilities" },
      occ: { v: null, why: "Day-care model: beds and occupancy do not apply." },
      arpob: { v: null, why: "Day-care model: ARPOB does not apply. Revenue per surgery is ≈ ₹42,900 (d)." },
      rpab: { v: null, why: "Day-care model: does not apply." },
      alos: { v: null, why: "Day-care model: does not apply." },
      extra: { label: "Revenue per surgery (d)", v: 42900, formula: "66.7% of revenue from surgeries ÷ 3,23,245 procedures" },
      notes: [
        { t: "Day-care model, so beds and ARPOB do not apply. The unit metric is revenue per surgery: surgeries are 66.7% of revenue over 3,23,245 procedures ≈ ₹42,900 per surgery (d).", src: [31, 32] },
        { t: "Greenfield centres opened in FY26 lost about ₹30 Cr.", src: [33] },
      ],
    },
    {
      id: "shalby", name: "Shalby", scope: "Orthopaedics-led", seg: "C", specialty: "Orthopaedics-led", src: [34, 35],
      rev: { v: 1168 },
      margin: { v: 12.7, period: "Q4", note: "Full-year EBITDA was not available in a verifiable form. Q4 FY26 consolidated margin shown; standalone hospital margin was 16.1%." },
      beds: { v: 1352, approx: true, d: true, basis: "operational", note: "Derived: 649 occupied beds ÷ 48% occupancy." },
      occ: { v: 48, period: "Q4" },
      arpob: { v: 42689, period: "Q4" },
      rpab: { v: 20491, d: true, period: "Q4" },
      alos: { v: null, why: "Not reported." },
      notes: [
        { t: "Full-year EBITDA was not available in a verifiable form; the Q4 FY26 consolidated margin is shown (standalone hospital margin 16.1%).", src: [34, 35] },
        { t: "Beds derived as 649 occupied beds ÷ 48% occupancy.", src: [34, 35] },
      ],
    },
  ],

  metrics: {
    margin: {
      label: "EBITDA margin", unit: "%", short: "EBITDA margin",
      definition: "Operating EBITDA ÷ revenue, as reported by the company (post Ind AS 116 unless noted).",
      gap: "Cost structure and operating leverage.",
      why: "Margin is where price, volume and cost come together, so it is the headline of any benchmark. It is an outcome, not a diagnosis. Two hospitals can reach the same margin by opposite routes (see insight 5.1), and a group margin blends mature hospitals with new ones that are still ramping up (5.2).",
      watch: [
        { t: "Group margins include new units that are still ramping. Mature units run about 1–8 points higher.", ref: "5.2" },
        { t: "Dr Agarwal's margin includes other income. HCG's is adjusted. Shalby's is Q4 only.", src: [28, 31, 32, 34] },
        { t: "No normalisation for Ind AS 116 or other income beyond what companies disclose." },
      ],
    },
    occ: {
      label: "Occupancy", unit: "%", short: "Occupancy",
      definition: "Occupied bed-days ÷ available bed-days, on each company's own bed basis (operational, census or capacity).",
      gap: "Volume or catchment problem, or new capacity still ramping.",
      why: "Occupancy tells you whether the beds you have built and staffed are being used. A bed costs money whether it is full or not, so utilisation drives operating leverage. The target depends on the model. A paediatric chain with seasonal demand makes the highest margin in the set at 46% (5.3).",
      watch: [
        { t: "Bed counts mix operational, census and capacity bases. The same hospital looks less full on a capacity basis.", ref: "5.3" },
        { t: "Apollo is Q4, HCG is 9M, Shalby is Q4. Narayana does not disclose occupancy." },
      ],
    },
    arpob: {
      label: "ARPOB", unit: "₹/day", short: "ARPOB (₹/day)",
      definition: "Revenue ÷ occupied bed-days, as reported. Fortis and Narayana report per annum; converted ÷ 365 (d).",
      gap: "Pricing, case mix, payer mix, length of stay.",
      why: "Average revenue per occupied bed per day captures price, case mix, payer mix and length of stay in one figure. That makes it useful for tertiary chains that earn on acuity. It also makes it ambiguous. A lower ARPOB can mean lower prices or just shorter stays, and on its own it does not predict margin (5.1).",
      watch: [
        { t: "Apollo withdrew ARPOB in FY26.", src: [4] },
        { t: "Fortis and Narayana report per year, not per day. Converted ÷ 365.", src: [7, 12] },
        { t: "Max's ARPOB uses gross revenue.", src: [5] },
      ],
    },
    rpab: {
      label: "Revenue per available bed-day", unit: "₹/day", short: "Rev / available bed-day",
      definition: "ARPOB × occupancy (derived). Combines price and utilisation in one yield number.",
      gap: "Whether the bed base is earning, regardless of which lever is weak.",
      why: "This is the hospital equivalent of revenue per available room in hotels. It shows how much each bed you have earns per day, full or empty. It combines the price and volume levers, so a price-led chain and a volume-led chain can be compared on one yield figure. It is also less sensitive to how beds are counted than occupancy is (5.3).",
      watch: [
        { t: "Derived by us, so it carries every definitional difference in ARPOB and occupancy." },
        { t: "HCG is 9M and Shalby is Q4 because their inputs are." },
      ],
    },
    rev: {
      label: "Revenue", unit: "₹ Cr", short: "Revenue (₹ Cr)",
      definition: "FY26 revenue in ₹ crore on the basis each company reports: net or gross, network or consolidated, segment or group.",
      gap: "Scale, not performance.",
      why: "Revenue sets scale and context. It helps explain why a large network can absorb new-unit losses that would sink a single hospital. It is not a performance benchmark on its own, and the bases here differ.",
      watch: [
        { t: "Max is on a network basis (includes partner facilities). Medanta is total income. Apollo, Fortis and Narayana are segment figures.", src: [5] },
      ],
    },
    alos: {
      label: "ALOS", unit: "days", short: "ALOS (days)",
      definition: "Average length of stay in days, as reported.",
      gap: "Clinical efficiency and bed turnover.",
      why: "Shorter stays free beds for the next patient, so the same bed base can treat more people. Shorter stays also push ARPOB up, because the expensive days (surgery, ICU) are spread over fewer bed-days. Read ALOS next to ARPOB before calling a price gap a pricing problem.",
      watch: [
        { t: "Only 4 of the 15 companies disclose ALOS, so no segment range is given." },
      ],
    },
  },

  // Section 5.2 — blended vs mature-unit margins
  mature: [
    { id: "kims", name: "KIMS", blended: 21.1, mature: 29.5, label: "Mature units", extra: "New units eroded ₹128 Cr EBITDA", src: [16, 18] },
    { id: "medanta", name: "Medanta", blended: 24.2, mature: 31.5, label: "Developing units ex-Noida", extra: "Noida EBITDA loss ₹78 Cr", src: [9, 11] },
    { id: "aster", name: "Aster DM", blended: 20.4, mature: 25.4, label: "Hospitals 7+ years old", src: [14] },
    { id: "apollo", name: "Apollo", blended: 24.4, mature: 25.5, label: "Established hospitals, Q4", src: [2, 3] },
  ],
  matureOther: [
    { name: "Max", t: "ROCE 21.8% overall; about 31% excluding units under 4 years and capital work in progress.", src: [5] },
    { name: "Dr Agarwal's", t: "28.9% EBITDA margin; greenfield centres opened in FY26 lost about ₹30 Cr.", src: [33] },
  ],

  // Section 5.4 — payer mix and cash
  govtShare: [
    { id: "yatharth", name: "Yatharth", v: 35, approx: true, src: [24] },
    { id: "hcg", name: "HCG", v: 33, src: [28] },
    { id: "narayana", name: "Narayana", v: 18, note: "schemes", src: [12] },
    { id: "jupiter", name: "Jupiter", v: 1, approx: true, note: "insurance 55.4%", src: [21] },
  ],
  debtorDays: [
    { id: "park", name: "Park Medi World", v: 129, prev: 161, src: [20] },
    { id: "max", name: "Max Healthcare", v: 87, src: [5] },
  ],
  cashConv: [
    { id: "yatharth", name: "Yatharth", v: 98, src: [23] },
    { id: "hcg", name: "HCG", v: 75, src: [28] },
  ],

  // Section 5.5 — definitional differences
  quirks: [
    { who: "Apollo", what: "Withdrew ARPOB; reports average revenue per patient.", src: [4] },
    { who: "Fortis, Narayana", what: "Report ARPOB per year, not per day.", src: [7, 12] },
    { who: "Max", what: "ARPOB on gross revenue; financials include partner facilities it does not own.", src: [5] },
    { who: "All", what: "Bed counts mix operational, census and capacity bases." },
    { who: "HCG", what: "Occupancy and ARPOB are 9M (ICRA); HCG's 'centre utilisation' is not bed occupancy.", src: [29] },
  ],

  playbook: [
    { h: "Place yourself by engine, not by name.", t: "Choose the segment whose model matches yours (price-led tertiary, volume-led regional, or single specialty) and benchmark against that range only." },
    { h: "Decompose the margin gap.", t: "Split it into ARPOB (mix and price), occupancy (volume) and cost per occupied bed-day. Each implies a different response." },
    { h: "Separate mature and ramping units.", t: "Benchmark mature units against the 25–30% mature-unit margins in Section 5.2, and track new units on a months-since-opening curve." },
    { h: "Report payer mix, debtor days and cash conversion with the margin.", t: "A margin that does not convert to cash is not comparable to one that does." },
    { h: "Publish your own definitions.", t: "State your bed basis and ARPOB formula so the comparison can be checked." },
  ],
  limitations: [
    "Sources are company disclosures and reputable summaries of them; where a primary filing could not be opened, the closest verbatim secondary report was used and is cited.",
    "Periods are full-year FY26 except where flagged: Apollo occupancy (Q4), HCG ARPOB and occupancy (9M), Shalby margin, occupancy and ARPOB (Q4).",
    "Revenue bases differ (net vs. gross, network vs. consolidated, segment vs. group). No normalisation for Ind AS 116 or other income was applied beyond what companies disclose.",
    "Listed chains are larger and better capitalised than most private hospitals; a standalone or MSME hospital should read these as direction, not targets.",
  ],

  // Section 7. kind: "primary" = company filing / rating agency; "secondary" = news or aggregator summary.
  sources: {
    1: { pub: "Apollo Hospitals", kind: "primary", t: "Q4 FY26 results release (May 2026)", url: "https://www.apollohospitals.com/sites/default/files/2026-05/ahel-q4fy26-resullts-release.pdf" },
    2: { pub: "Quartr", kind: "secondary", t: "Apollo Hospitals Q4 FY26 summary (healthcare services revenue and margin)", url: "https://quartr.com/events/apollo-hospitals-enterprise-limited-apollohosp-q4-25-26_FYSsn3Zb" },
    3: { pub: "Multibagg", kind: "secondary", t: "Apollo Q4 FY26 (ARPP, established-hospital margin)", url: "https://www.multibagg.ai/market-pulse/articles/apollo-q4fy26-94450" },
    4: { pub: "Alpha Spread", kind: "secondary", t: "Apollo Q2 FY26 earnings call (ARPOB withdrawn; HCS ROCE)", url: "https://www.alphaspread.com/security/nse/apollohosp/investor-relations/earnings-call/q2-2026" },
    5: { pub: "Max Healthcare (NSE filing)", kind: "primary", t: "Q4 & FY26 press release and earnings update, 21 May 2026", url: "https://nsearchives.nseindia.com/corporate/MAXHEALTH_21052026163255_SE_Intimation_Final.pdf" },
    6: { pub: "ANI", kind: "secondary", t: "Fortis Healthcare FY26 results (23 May 2026)", url: "https://aninews.in/news/business/fortis-healthcare-pat-jumps-44-in-q4-as-ebitda-margins-expand-fy26-profit-rises-3120260523141723/" },
    7: { pub: "Fortis Healthcare", kind: "primary", t: "Q4 FY26 earnings call transcript", url: "https://www.fortishealthcare.com/investor/investor%20presentations%20&%20transcripts/earnings%20call%20transcript%20for%20the%20quarter%20and%20year%20ended%20march%202026" },
    8: { pub: "Fortis Healthcare", kind: "primary", t: "Q4 FY26 press release (operational beds)", url: "https://www.fortishealthcare.com/investor/investor%20presentations%20&%20transcripts/fhl%20-%20q4fy26%20and%20fy26%20press%20release" },
    9: { pub: "Medical Buyer", kind: "secondary", t: "Healthcare's FY26-to-FY27 turn (Medanta, KIMS, HCG FY26)", url: "https://medicalbuyer.co.in/strong-finish-confident-start-healthcares-fy26-to-fy27-turn/" },
    10: { pub: "Whalesbook", kind: "secondary", t: "Medanta Q4 FY26 (bed capacity 3,665)", url: "https://www.whalesbook.com/news/Hinglish/healthcare/Medantas-Q4-Earnings-Soar-42percent-Amid-Expansion-Analyst-Lifts-Price-Target/6a0c31c7d94fcc5ede404a42" },
    11: { pub: "Indian Pharma Post", kind: "secondary", t: "Medanta FY26 (developing hospitals, Noida)", url: "https://www.indianpharmapost.com/hospitals/lite/medanta-delivers-record-fy26-performance-as-revenue-surges-profit-jumps-with-expansion-20233" },
    12: { pub: "Narayana Health (NSE filing)", kind: "primary", t: "Q4 FY26 investor presentation, 22 May 2026", url: "https://nsearchives.nseindia.com/corporate/Narayana_22052026221029_NHLSEInvestorPresentation.pdf" },
    13: { pub: "ScanX", kind: "secondary", t: "Narayana Hrudayalaya FY26 annual report (India hospital revenue)", url: "https://scanx.trade/stock-market-news/companies/narayana-hrudayalaya-submits-fy-2025-26-annual-report-consolidated-revenue-surges-44-to-78-960-35-million/46412033" },
    14: { pub: "ScanX", kind: "secondary", t: "Aster DM FY26 investor presentation", url: "https://scanx.trade/stock-market-news/companies/aster-dm-reports-fy26-revenue-of-4-643-crore-merger-update/42019095" },
    15: { pub: "Quartr", kind: "secondary", t: "Aster DM Quality Care investor presentation summary (ALOS)", url: "https://quartr.com/events/aster-dm-quality-care-limited-asterdm-investor-presentation_FPm8rWk3" },
    16: { pub: "Yahoo Finance", kind: "secondary", t: "KIMS Q4 FY26 earnings call highlights", url: "https://finance.yahoo.com/sectors/healthcare/articles/krishna-institute-medical-sciences-ltd-010034887.html" },
    17: { pub: "ScanX", kind: "secondary", t: "KIMS FY26 annual report (beds, occupancy, ARPOB)", url: "https://scanx.trade/stock-market-news/companies/kims-hospitals-fy26-results-revenue-up-28-pat-drops-42/47501764" },
    18: { pub: "ScanX", kind: "secondary", t: "KIMS Q4 FY26 results (mature-unit margin)", url: "https://scanx.trade/stock-market-news/companies/krishna-institute-of-medical-sciences-q4-results-net-profit-declines-to-425m-rupees-despite-revenue-growth/40421829" },
    19: { pub: "Outlook Business", kind: "secondary", t: "Park Medi World FY26", url: "https://www.outlookbusiness.com/spotlight/news-wire/park-medi-world-posts-record-fy26-revenue-and-profit-targets-5-740-bed-network-by-march-2028" },
    20: { pub: "IndiaIPO", kind: "secondary", t: "Park Medi World FY26 (debtor days)", url: "https://www.indiaipo.in/news/detail/park-medi-world-reports-record-fy26-revenue-of-inr-16794-mn-ebitda-up-20-yoy" },
    21: { pub: "ScanX", kind: "secondary", t: "Jupiter Life Line Q4 & FY26 results", url: "https://scanx.trade/stock-market-news/companies/jupiter-life-line-hospitals-schedules-q4-fy26-earnings-conference-call-for-may-18-2026/40065720" },
    22: { pub: "Multibagg", kind: "secondary", t: "Yatharth Hospitals Q4 FY26", url: "https://www.multibagg.ai/market-pulse/articles/yatharth-q4fy26-94935" },
    23: { pub: "ScanX", kind: "secondary", t: "Yatharth FY26 (cash conversion)", url: "https://scanx.trade/stock-market-news/companies/yatharth-hospital-to-attend-investor-conference-on-june-10/42285162" },
    24: { pub: "MoneyMuscle", kind: "secondary", t: "Yatharth FY26 results (government share of revenue)", url: "https://www.moneymuscle.in/p/yatharth-hospital-fy26-result-q4-26-earnings" },
    25: { pub: "ScanX", kind: "secondary", t: "Artemis Medicare FY26 annual report", url: "https://scanx.trade/stock-market-news/companies/artemis-medicare-services-ltd-schedules-22nd-annual-general-meeting-on-july-31-2026-reports-strong-fy26-financial-performance/44973490" },
    26: { pub: "ScanX", kind: "secondary", t: "Artemis Medicare Q2 FY26 (international share of revenue)", url: "https://scanx.trade/stock-market-news/earnings/artemis-medicare-services-reports-strong-q2-fy26-results-unveils-expansion-plans/24419570" },
    27: { pub: "Multibagg", kind: "secondary", t: "Rainbow Children's Medicare Q4 FY26", url: "https://www.multibagg.ai/market-pulse/articles/rainbow-q4fy26-94823" },
    28: { pub: "Multibagg", kind: "secondary", t: "HCG FY26 (revenue, adjusted EBITDA, payor mix)", url: "https://www.multibagg.ai/market-pulse/articles/hcg-fy26-results-94347" },
    29: { pub: "ICRA", kind: "primary", t: "HCG Oncology Hospitals LLP rating rationale (9M FY26 ARPOB, occupancy)", url: "https://www.icra.in/Rating/ShowRationalReportFilePdf/141857" },
    30: { pub: "Multibagg", kind: "secondary", t: "Q4 FY26 Indian hospital sector synthesis (HCG beds)", url: "https://www.multibagg.ai/deep-dive/sector-analysis/q4-fy2026-indian-hospital-sector-strategic-synthesis-cmraxnc8900222rm4cmtsto47" },
    31: { pub: "ScanX", kind: "secondary", t: "Dr Agarwal's Health Care FY26 results", url: "https://scanx.trade/stock-market-news/companies/dr-agarwal-s-health-care-reports-strong-q4-growth-with-net-profit-at-397m-rupees-and-revenue-at-5-64b-rupees/40922181" },
    32: { pub: "Dr Agarwal's Health Care", kind: "primary", t: "Q4 & FY26 investor presentation (EBITDA definition)", url: "https://dragarwals.co.in/wp-content/uploads/2026/05/Investor-Presentation-Q4.pdf" },
    33: { pub: "Yahoo Finance", kind: "secondary", t: "Dr Agarwal's FY26 earnings call highlights", url: "https://finance.yahoo.com/sectors/healthcare/articles/dr-agarwals-health-care-ltd-030328470.html" },
    34: { pub: "Multibagg", kind: "secondary", t: "Shalby Q4 FY26", url: "https://www.multibagg.ai/market-pulse/articles/shalby-q4fy26-95178" },
    35: { pub: "Yahoo Finance", kind: "secondary", t: "Shalby Q4 FY26 earnings call highlights", url: "https://finance.yahoo.com/markets/stocks/articles/shalby-ltd-bom-540797-q4-010309620.html" },
    36: { pub: "ICRA", kind: "primary", t: "Indian hospital sector research: FY2026 performance of rated sample", url: "https://www.icra.in/Research/ViewResearchReport/7044" },
  },
};
