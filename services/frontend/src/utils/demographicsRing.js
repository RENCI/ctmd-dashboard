// Pure helpers for the Patient Demographics shaded ring (study report). No React
// deps, so the data-shaping and arc geometry are unit-testable in isolation
// (demographicsRing.test.js). The ring shows ONE band per view: each race/ethnicity
// wedge is shaded by sex (lighter female, darker male) — see CTMD-204.

export const num = (v) => parseInt(v || 0, 10)

// Race axis categories (column stems). Ethnicity axis uses the two stems below,
// relabeled for display. Columns look like `${kind}${stem}Female` e.g.
// actualWhiteMale, plannedHispanicFemale.
export const RACES = ['AIAN', 'Asian', 'NHPI', 'Black', 'White']
export const ETHNICITIES = ['Hispanic', 'NonHispanic']
const ETH_LABEL = { Hispanic: 'Hispanic', NonHispanic: 'Non-Hispanic' }

// Shape one EnrollmentDemographics row into ring slices for an axis + kind:
// [{ cat, f, m }] (one entry per category). `kind` is 'actual' | 'planned'.
// The 'sex' axis collapses every category into a two-slice Female/Male breakdown
// (CTMD-203); each slice carries its own count on one side so the ring shades it
// as a single tone.
export const buildRingData = (row, kind, axis) => {
  if (!row) return []
  if (axis === 'sex') {
    const f = RACES.reduce((sum, r) => sum + num(row[`${ kind }${ r }Female`]), 0)
    const m = RACES.reduce((sum, r) => sum + num(row[`${ kind }${ r }Male`]), 0)
    return [{ cat: 'Female', f, m: 0 }, { cat: 'Male', f: 0, m }]
  }
  const stems = axis === 'ethnicity' ? ETHNICITIES : RACES
  return stems.map((stem) => ({
    cat: axis === 'ethnicity' ? ETH_LABEL[stem] : stem,
    f: num(row[`${ kind }${ stem }Female`]),
    m: num(row[`${ kind }${ stem }Male`]),
  }))
}

export const ringTotals = (data) => {
  const f = data.reduce((sum, d) => sum + d.f, 0)
  const m = data.reduce((sum, d) => sum + d.m, 0)
  return { f, m, total: f + m }
}

// ── colour shading (female = lighter, male = darker of the category hue) ──────
const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)))
const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const rgb2hex = (a) => '#' + a.map((v) => clamp(v).toString(16).padStart(2, '0')).join('')
const mix = (h, t, amt) => rgb2hex(hex2rgb(h).map((c, i) => c + (hex2rgb(t)[i] - c) * amt))
export const lighten = (h, amt) => mix(h, '#ffffff', amt)
export const darken = (h, amt) => mix(h, '#000000', amt)

// ── SVG arc geometry (clockwise, 0° at top) ──────────────────────────────────
export const polar = (cx, cy, r, deg) => {
  const a = (deg - 90) * Math.PI / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

// A ring-segment path between two radii and two angles (degrees).
export const arcPath = (cx, cy, rIn, rOut, a0, a1) => {
  if (a1 - a0 >= 359.999) a1 = a0 + 359.999 // full-circle guard (avoid 360° no-op)
  const large = (a1 - a0) > 180 ? 1 : 0
  const [x1, y1] = polar(cx, cy, rOut, a0)
  const [x2, y2] = polar(cx, cy, rOut, a1)
  const [x3, y3] = polar(cx, cy, rIn, a1)
  const [x4, y4] = polar(cx, cy, rIn, a0)
  return `M${ x1 } ${ y1 } A${ rOut } ${ rOut } 0 ${ large } 1 ${ x2 } ${ y2 } ` +
         `L${ x3 } ${ y3 } A${ rIn } ${ rIn } 0 ${ large } 0 ${ x4 } ${ y4 } Z`
}
