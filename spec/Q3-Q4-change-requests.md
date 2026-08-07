# Q3–Q4 Change Requests — CTMD Dashboard

> **Status:** Draft for scoping (2026-08-05). Source of requirements:
> - `CTMD Change Request and Brainstorming following July 17 2026.docx`
> - `TIN Metrics Chart Reference.pptx` (slides 1–8)
>
> This spec maps each requested change to the data actually available in
> `ctmd-db2`, flags gaps and open questions, anchors each item to the current
> code, and proposes Jira tickets. Data findings below were verified against
> production (`ks port-forward svc/ctmd-db2 -n ctmd`) on 2026-08-05.

---

## 1. Summary of requests

All requests target the **Home tab** visualizations plus the **Proposals tab**:

| # | Area | Component today | Nature |
|---|------|-----------------|--------|
| A | All charts: export filtered visual/data | (none of the Home widgets export) | New, cross-cutting |
| B | Proposals by Application Status: filters, grouping/comparison, status checkboxes, presets, colors | `Widgets/ProposalsByTic.js` (+ `controllers/graphics.js`) | Enhance existing |
| C | Timeline Metrics chart: chart-type switch, add/remove interval rows, time filter | seed logic in `Widgets/DayStats.js` | New chart, existing calc |
| D | Submissions by Month: interval dropdown, flexible bounds, period comparison, axis fixes | `Widgets/ProposalsByMonth.js` | Enhance existing |
| E | Proposal tab: per-proposal timelines, aggregate pathways (Sankey), intake-date filter, export | `Visualizations/proposalsSankey.js` exists | New + existing seed |

---

## 2. Key cross-cutting data finding: "TIN Cycle" is derived, not stored

Multiple requests filter/compare by **TIN Cycle (1.0 vs 2.0)**. **There is no
`cycle` field in the database.** It must be derived from the TIC assignment
(`AssignProposal.assignToInstitution` → `name` lookup). The institutions in the
data map cleanly to the cycles named in the docx:

| TIN Cycle | Institution (`name.description`) | `name.index` | Proposals assigned |
|-----------|----------------------------------|--------------|--------------------|
| **Cycle 1 (TIN 1.0)** | JHU/Tufts TIC | 23 | 77 |
| | Duke/VUMC TIC | 22 | 82 |
| | University of Utah TIC | 2 | 87 |
| **Cycle 2 (TIN 2.0)** | JHU TIC | 3 | 76 |
| | VUMC TIC | 1 | 56 |
| **RIC / other** | VUMC RIC | 4 | 160 |
| | NCATS | 5 | (coordinating) |

**Implication / decision needed:** the cycle→TIC mapping should live in **one
authoritative place**. Options: (a) a small config/lookup table in the DB, or
(b) a constant map in the API/frontend. A DB lookup is preferable so it can
change without a deploy, and so new TICs in future cycles are easy to add.
**Open question:** which cycle do `VUMC RIC` and `NCATS` belong to (or are they
excluded from cycle comparisons)?

---

## 3. Data availability matrix (filters)

| Requested filter | Source | Available? | Notes |
|------------------|--------|-----------|-------|
| **TIN Cycle (1.0/2.0)** | derived from `assignToInstitution` | ⚠️ Derivable | needs cycle→TIC map (§2) |
| **TIC/RIC assignment** | `AssignProposal.assignToInstitution` → `name` | ✅ Yes | already a proposal field/column |
| **Grant Year** | derived from `Proposal.dateSubmitted` | ✅ Yes | grant year = May 1–Apr 30 (see `Counts.js`) |
| **Intake date bounds** | `Proposal.dateSubmitted` (REDCap `prop_submit`) | ✅ Yes | 550/769 proposals have a date; **confirm "intake" == submission date** |
| **Active / Completed** | derived from `proposalStatus` | ⚠️ Derivable | needs an active-vs-completed status classification (see §4.B) |
| **Proposal status (checkboxes/presets)** | `Proposal.proposalStatus` → `name` | ✅ Yes | 33 distinct statuses; grouping logic already exists |

### Timeline / interval date coverage (for chart C and E)

Milestone dates exist across several tables, but **coverage drops sharply for
later (grant/funding) stages** — important for expectations:

| Interval date field | Populated | Coverage |
|---------------------|-----------|----------|
| `Proposal.dateSubmitted` | 550 / 769 | 71% |
| `PATMeeting.meetingDate` | 453 / 665 | 68% |
| `InitialConsultationDates.FirstContact` | 464 / 665 | 70% |
| `InitialConsultationDates.workComplete` | 382 / 665 | 57% |
| `ProtocolTimelines_estimated.actualGrantSubmissionDate` | 63 / 769 | **8%** |
| `ProtocolTimelines_estimated.actualGrantAwardDate` | 45 / 769 | **6%** |
| `ProposalFunding.fundingStart` | 45 / 769 | **6%** |
| `StudySites.dateSiteActivated` | 721 / 905 | 80% (site-level) |

**Implication:** intervals through PAT review and initial consult are well
populated; **grant-submission-to-award style intervals will be sparse** and any
chart must handle small-N gracefully (and probably surface the N per bar).

---

## 4. Change requests — detail, data mapping, and current-code anchors

### 4.A — All charts: export the filtered visual/data

- **Now:** none of the Home widgets (`ProposalsByTic`, `ProposalsByMonth`,
  `Counts`, `DayStats`, `ResourceMetrics`) expose an export. CSV export exists
  elsewhere (`SiteMetricsDownload`, material-table `exportButton`) so there is a
  pattern to reuse (`react-csv` `CSVLink`, or the `filefy` `CsvBuilder` used in
  `ProposalsTable`).
- **Scope:** add a consistent "Export" affordance to each chart that outputs
  **the currently-filtered data** as CSV, plus a **chart image** (PNG/SVG).
- **Image-export lift (assessed 2026-08-07):** the Home charts are all **nivo,
  rendering SVG** in the DOM (no export tooling installed yet). SVG export is
  trivial (serialize the `<svg>` + download). PNG is a routine add: a shared
  "Export image" button using `html-to-image` (`toPng(chartRef)`), reused across
  the ~5 charts — roughly **a day** for the shared mechanism, near-trivial per
  chart after. Two details to get right: **embed the chart font** so raster text
  isn't a fallback, and export at **2× DPI / fixed size** for crisp slides.
  Server-side rasterization (`sharp`/`resvg`, precedent in `graphics.js`) is
  possible but unnecessary — client-side is simpler.
- **Recommendation:** ship **filtered-data CSV** first (small, highest value),
  then the image export (modest, per the lift above) — deliver both, per the
  requirement wording "export the filtered *visual/data*."

### 4.B — Proposals by Application Status (`ProposalsByTic.js` + `graphics.js`)

Requested (docx + slides 2–4):
1. **Filter options:** TIN Cycle, Active, Completed, Grant Year, "other variables".
2. **Grouping / comparison:** split the chart into N independently-filterable
   groups (e.g. show Cycle 1 vs Cycle 2 side by side — slides 3–4, "Number of
   Groups: 2", "Stepwise Filtering").
3. **Status checkboxes:** toggle individual proposal statuses on/off.
4. **Presets:** quick-filter groups — "Initial Consults", "Comprehensive
   Consults", "Pilots", "Full Implementation Studies", "Resources" (categories
   TBD by WG).
5. **Color fixes** for readability, by category preset.

Data/code mapping:
- Status categorization already exists in **two** places: `statusMap` in
  `Widgets/ProposalsByTic.js` and `statusGroup()` in `controllers/graphics.js`.
  These **disagree** and are incomplete vs. the 33 live statuses — the preset
  work should **consolidate them into one shared, complete mapping** (ideally
  API-side or a shared module) and reconcile with the WG's preset list.
- TIN Cycle / TIC / Grant Year filters are all supported by §2–§3 data.
- **Active vs Completed** needs a definition: e.g. any status containing
  "Complete", "No Further…", "Withdrawn", "Not Funded", "Did Not Receive" →
  Completed; "in Progress", "Ongoing", "Pending", "Ready", "Approved for…" →
  Active. **This classification must be confirmed by the WG** and stored once
  (same home as the presets).
- "Grouping into N independently-filterable chunks" is the largest sub-item —
  it changes the component from one chart to a **panel of N configurable chart
  instances** with shared status/category definitions.

### 4.C — Timeline Metrics chart (new; seed in `DayStats.js`)

Requested (docx + slides 5–6):
1. **Change chart types** (Bar, Box & Whisker, …) to show outliers.
2. **Button to add/remove rows** (each row = one interval between two milestones).
3. Additional intervals beyond the defaults.
4. **Filter by time period** and by TIN 1.0/2.0 / TIC (slide 5: "Show: JHU-Tufts
   TIC – TIN 1.0").

Data/code mapping:
- `DayStats.js` **already computes** the exact intervals as avg & median days:
  `dateSubmitted→meetingDate` (submission→PAT), `meetingDate→actualGrantSubmission`,
  `dateSubmitted→actualGrantSubmission`, `actualGrantSubmission→fundingStart`,
  `dateSubmitted→kickOff`, `dateSubmitted→firstContact`. This is the calculation
  seed for the new chart.
- A **Box & Whisker** chart needs the **full distribution** of per-proposal
  durations (not just avg/median) — the calc must return the array of day-values
  per interval, not just the aggregate. nivo has `@nivo/boxplot`.
- **Data caveat (see §3):** grant-stage intervals are sparse (~6–8%); the chart
  should show N and handle empty groups.
- Filtering by TIC/cycle reuses §2 mapping.

### 4.D — Submissions by Month (`ProposalsByMonth.js`)

Requested (docx + slides 7–8):
1. **Interval dropdown:** Week / Month / Quarter / Year.
2. **Flexible time bounds** (custom start/end).
3. **Compare time periods** (overlay/side-by-side).
4. Axis/format fixes: don't cut off the top of the dots; add y-axis labels.

Data/code mapping:
- Single source field: `Proposal.dateSubmitted` (already used). Bucketing by
  week/quarter/year is client-side date math; the existing month-bucketing loop
  generalizes.
- **Note:** 219/769 proposals have no `dateSubmitted` — they silently drop from
  all submission bucketing. Consider surfacing "N with no submission date".
- Also fold in the already-fixed grant-year definition (May 1) where relevant.
- Axis fixes are contained nivo config changes (margins, `axisLeft`, point size).

### 4.E — Proposal tab

Requested (docx, no slide):
1. **Per-proposal progress timeline** with calculated durations between all
   steps (reuses `DayStats` interval logic; per-proposal instead of aggregate).
2. **Aggregate pathways** — how many initial consults → comprehensive → what
   conclusions, with average timelines. Sankey suggested.
3. **Filter by intake date bounds** (`dateSubmitted`).
4. **Make proposal data exportable.**

Data/code mapping:
- Milestone dates for a per-proposal timeline exist (Proposal, PATMeeting,
  InitialConsultationDates, ProtocolTimelines_estimated, ProposalFunding) — with
  the coverage caveats in §3 (some steps will be blank per proposal).
- **A Sankey already exists**: `Visualizations/proposalsSankey.js` — evaluate
  whether it can be repurposed for status-pathway flows, or whether "pathway" =
  ordered status transitions, which we **do not currently store** (we only have
  the *current* status: `protocol_status`, a single dropdown — no history field).
  **Checked REDCap (2026-08-07):** the audit log *does* record every
  `protocol_status` change with timestamps, but the CTMD API token returns
  `403 "you do not have Logging privileges"`. So a genuine transition Sankey is
  feasible **only if VUMC grants the token Logging export access**; otherwise
  pathways must be approximated from milestone-date presence.
- Export reuses §4.A.

---

## 5. Open questions for the Working Group

1. **TIN Cycle mapping** — confirm the Cycle 1/2 → TIC assignments in §2; where
   do **VUMC RIC** and **NCATS** sit (own bucket, or excluded from cycle views)?
2. **"Intake date"** — is this `Proposal.dateSubmitted` (REDCap `prop_submit`),
   or a different milestone (e.g. `InitialConsultationDates.FirstContact`)?
3. **Active vs Completed** — need the authoritative status→state classification.
4. **Preset categories** — confirm the exact status membership of "Initial
   Consults", "Comprehensive Consults", "Pilots", "Full Implementation
   Studies", "Resources" (reconcile with existing `statusMap`/`statusGroup`).
5. **Aggregate pathways** — *resolved to a decision:* status history lives in
   REDCap's audit log but the CTMD token lacks Logging export access. Request
   Logging access from VUMC (→ true transition Sankey), or accept a
   milestone-presence approximation?
6. **Export** — data-only CSV sufficient for v1, or is chart-image export required?
7. **Grant Year** — confirm May 1–Apr 30 boundary applies to all "Grant Year"
   filters (matches the recent `Counts.js` fix).

---

## 6. Proposed Jira tickets

Suggested structure: **one epic per chart area** + a cross-cutting export epic,
with a shared "foundation" story for the cycle/preset/active-completed lookups
that several stories depend on. (No Jira integration is connected to this
workspace, so these are drafted here for paste/import.)

### EPIC 0 — Foundation: shared classifications
- **CTMD-Q34-1 — Authoritative TIN Cycle → TIC mapping**
  - *As* a maintainer *I want* a single source of truth mapping TICs to TIN
    Cycle 1.0/2.0 *so that* every chart filters/compares consistently.
  - AC: mapping stored once (DB lookup preferred); covers the 5 TICs in §2;
    documented handling for VUMC RIC / NCATS; exposed via API for the frontend.
  - Blocks: CTMD-Q34-10, -11, -20, -40.
- **CTMD-Q34-2 — Consolidated status → category / active-completed classification**
  - AC: one shared mapping of all 33 live statuses → preset category and →
    active/completed; reconciles `statusMap` (`ProposalsByTic.js`) and
    `statusGroup` (`graphics.js`); reviewed by WG.
  - Blocks: CTMD-Q34-11, -12, -13.

### EPIC 1 — Proposals by Application Status enhancements
- **CTMD-Q34-10 — Add filters: TIN Cycle, TIC/RIC, Grant Year, Active/Completed**
  (depends on -1, -2)
- **CTMD-Q34-11 — Status checkboxes + category presets** (depends on -2)
- **CTMD-Q34-12 — Grouping/comparison: N independently-filterable panels**
  (Cycle 1 vs Cycle 2 side-by-side; slides 3–4)
- **CTMD-Q34-13 — Category-preset color scheme for readability**

### EPIC 2 — Timeline Metrics chart
- **CTMD-Q34-20 — Timeline Metrics chart with chart-type switch (bar/box-whisker)**
  (extend `DayStats` calc to return per-proposal distributions; depends on -1)
- **CTMD-Q34-21 — Add/remove interval rows + configurable milestone pairs**
- **CTMD-Q34-22 — Filter Timeline Metrics by time period + TIC/cycle**

### EPIC 3 — Submissions by Month enhancements
- **CTMD-Q34-30 — Interval dropdown (week/month/quarter/year) + flexible bounds**
- **CTMD-Q34-31 — Compare time periods (overlay/side-by-side)**
- **CTMD-Q34-32 — Axis/format fixes (uncropped points, y-axis labels)**

### EPIC 4 — Proposal tab
- **CTMD-Q34-40 — Per-proposal progress timeline with step durations**
- **CTMD-Q34-41 — Aggregate pathways visualization (Sankey)** (blocked on a
  decision, §5.5: request REDCap **Logging export access** for a true transition
  Sankey, else build the milestone-presence approximation)
- **CTMD-Q34-42 — Filter proposals by intake-date bounds**
- **CTMD-Q34-43 — Export proposal data (CSV)**

### EPIC 5 — Cross-cutting export
- **CTMD-Q34-50 — Filtered-data CSV export on all Home charts** (reuse
  `react-csv` / `filefy` pattern)
- **CTMD-Q34-51 — Chart image (PNG/SVG) export** (shared `html-to-image` button
  across the nivo charts; ~1 day for the mechanism — embed font, 2× DPI. See
  §4.A lift note)

---

## 7. Notes for implementers

- Filters (cycle/TIC/grant-year/status) apply to the **proposals** collection
  already in the store (`useProposals`); most of B/D can be done client-side
  without new endpoints once the shared classifications (Epic 0) exist.
- Timeline distributions (Epic 2) and pathways (Epic 4) may warrant **new API
  endpoints** to compute server-side rather than shipping all milestone dates to
  the client.
- Respect the recent fixes: grant-year = May 1 (`Counts.js`), and the
  material-table column-width guard (`ensureColumnWidths`) if any new tables are
  added.
