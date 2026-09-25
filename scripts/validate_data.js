// Re-checks the derived figures and segment ranges in data.js.
// Usage: node scripts/validate_data.js
const fs = require("fs");
const path = require("path");
const window = {};
eval(fs.readFileSync(path.join(__dirname, "..", "data.js"), "utf8"));
const { hospitals, sources, mature } = window.BENCH;

let failures = 0;
const fail = (msg) => { failures++; console.error("FAIL  " + msg); };

// 1. Revenue per available bed-day = ARPOB × occupancy (within ₹2 rounding)
for (const h of hospitals) {
  const a = h.arpob.v, o = h.occ.v, r = h.rpab.v;
  if (a != null && o != null) {
    const calc = a * o / 100;
    if (r == null || Math.abs(calc - r) > 2) fail(`${h.name}: rpab ${r} != ARPOB×occ ${calc.toFixed(0)}`);
  } else if (r != null) fail(`${h.name}: rpab given without both inputs`);
}

// 2. Every cited source number exists
const cited = new Set();
const walk = (x) => {
  if (Array.isArray(x)) return x.forEach(walk);
  if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) {
    if (k === "src") v.forEach((n) => cited.add(n)); else walk(v);
  }
};
walk(window.BENCH);
cited.delete(undefined);
for (const n of cited) if (!sources[n]) fail(`source ${n} is cited but not listed`);

// 3. Blended margins in the mature-unit table match the hospital rows
for (const m of mature) {
  const h = hospitals.find((x) => x.id === m.id);
  if (h && h.margin.v !== m.blended) fail(`${m.name}: blended ${m.blended} != margin ${h.margin.v}`);
}

// 4. Print segment ranges so they can be compared with the document's table
for (const seg of ["A", "B", "C"]) {
  const rows = hospitals.filter((h) => h.seg === seg);
  const line = ["margin", "occ", "arpob", "rpab"].map((k) => {
    const v = rows.map((h) => h[k].v).filter((x) => x != null);
    return `${k} ${Math.min(...v)}–${Math.max(...v)} (n=${v.length})`;
  });
  console.log(`Segment ${seg}: ${line.join(" | ")}`);
}

const uncited = Object.keys(sources).map(Number).filter((n) => !cited.has(n));
if (uncited.length) console.log("Sources listed but not cited in data:", uncited.join(", "));
console.log(failures ? `${failures} check(s) failed` : "All checks passed");
process.exit(failures ? 1 : 0);
