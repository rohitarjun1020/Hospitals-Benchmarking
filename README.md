# Hospital Benchmarking FY26

An interactive dashboard for the FY2025-26 benchmark of 15 listed Indian hospital operators. It shows every benchmark, explains why each metric matters, and puts the numbered source next to each figure and claim, so you can open the original and check it yourself.

The analysis it is built from is in [`docs/Hospital_Benchmarking_FY26.docx`](docs/Hospital_Benchmarking_FY26.docx).

## Open it

Two static pages, no build step:

- **`index.html`: 3D walk-through.** Start outside Benchmark General Hospital and click the glowing doors to walk in. Reception sends you to each department:
  - **ICU:** EBITDA margin as 15 bedside monitors. The trace turns amber below the ICRA sector average.
  - **General Ward:** occupancy as a 10-bed ward that fills to each hospital's level.
  - **Billing & Accounts:** ARPOB, revenue per available bed-day and revenue as gold coin stacks, plus payer mix.
  - **Boardroom:** the five findings on a whiteboard, and how to use the benchmark.
  - **Medical Records:** all 36 sources as binders on a shelf.

  Drag to look around, click monitors, stacks or binders, or use the floor plan to walk between rooms. It needs WebGL and loads Three.js from cdnjs.
- **`dashboard.html`: classic dashboard.** The same content as tabs and tables, including the form for placing your own hospital's figures.

Open either file in a browser, or turn on GitHub Pages (Settings → Pages → deploy from branch, root folder).

## Classic dashboard tabs

| Tab | What it does |
|---|---|
| Overview | Purpose, the ICRA sector reference, the three operating-model segments, and where each segment's hospitals fall on margin, occupancy, ARPOB and revenue per available bed-day |
| Benchmarks | Pick a metric to see its definition, what a gap means, why it matters and its comparability watch-outs, plus a chart of all 15 hospitals grouped by segment with ranges and n |
| Hospitals | A sortable, filterable table of every figure. Click a row for that hospital's notes, per-metric sources and rank within its segment |
| Insights | The five findings from Section 5, each with a chart and inline citations |
| How to use | The five-step method, a form that places your own hospital's figures against its segment range, and the limitations |
| Sources | All 36 sources, marked as filings or summaries, each listing which figures and findings it supports |

Click any numbered chip to see its source and open the link. The panel on the right lists every source cited in the current view.

## Files

- `index.html`: the 3D walk-through (Three.js)
- `dashboard.html`: the classic dashboard
- `data.js`: every figure, note and source, transcribed from the document. Edit this file to update numbers.
- `scripts/validate_data.js`: run `node scripts/validate_data.js` after editing. It checks that revenue per available bed-day = ARPOB × occupancy, that every cited source exists, and prints the segment ranges to compare against the document.

## Conventions

- `d` = derived from disclosed numbers; `~` = approximate; `Q4` / `9M` = part-year; `adj.` = adjusted; `n.r.` = not reported.
- Source numbers match Section 7 of the document. **Filing** = company release, exchange filing or rating-agency report. **Summary** = news or aggregator report of the disclosure.
