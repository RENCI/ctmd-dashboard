/**
 * material-table (v1) throws
 *   "TypeError: Cannot read properties of undefined (reading 'match')"
 * from CommonValues.reducePercentsInCalc when a column that is toggled visible
 * via the columns button has no computed width.
 *
 * Root cause: material-table's DataManager.setColumns() builds its list of
 * "columns needing a width" with a filter that excludes `hidden` columns, so a
 * hidden column keeps `tableData.width === undefined`. When the user reveals it
 * through the columns button, MTableHeader.getCellStyle() calls
 * reducePercentsInCalc(undefined) and crashes. With no error boundary this
 * unmounts the whole React tree — the reported "page goes blank" bug.
 *
 * Giving every column an explicit width (defaults to 'auto') guarantees a
 * defined width string, so revealing a column no longer crashes. 'auto' keeps
 * the browser's automatic sizing, matching prior visual behavior.
 */
export const ensureColumnWidths = (columns, defaultWidth = 'auto') =>
  columns.map((column) => ({ width: defaultWidth, ...column }))
