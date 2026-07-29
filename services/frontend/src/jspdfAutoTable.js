// material-table's PDF export calls `doc.autoTable(content)`, which jspdf-autotable v3
// registered as an import side effect. v5 no longer auto-applies -- it exports
// `applyPlugin(jsPDF)` instead -- and material-table (unmaintained since 2020) only does
// a bare `require('jspdf-autotable')`, so the method never gets installed.
//
// Applying the plugin here lets us stay on patched jspdf 4.x / jspdf-autotable 5.x
// (which clears 13 security advisories, incl. 2 critical) without forking material-table.
// This must be imported before the first PDF export; importing it from index.js is enough,
// since it patches the shared jsPDF class that material-table also resolves to.
import { applyPlugin } from 'jspdf-autotable'
import { jsPDF } from 'jspdf'

applyPlugin(jsPDF)
