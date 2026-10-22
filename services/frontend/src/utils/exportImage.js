import { toPng } from 'html-to-image'

// Shared chart-image export (CTMD-190). Rasterizes a DOM node (a chart card) to a
// high-resolution PNG and downloads it:
//   - pixelRatio 2  -> crisp on slides / retina
//   - white background (cards are transparent over the page)
//   - html-to-image embeds the web fonts, so exported text is the real chart font,
//     not a system fallback
//   - nodes marked data-export-ignore="true" (the export/info buttons) are skipped
// Works for both the SVG (nivo) charts and the DOM/CSS ones (matrix, consultation).
export const exportNodeAsPng = async (node, filename = 'chart') => {
  if (!node) return
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
    filter: (el) => !(el && el.dataset && el.dataset.exportIgnore === 'true'),
  })
  const safe = String(filename).trim().replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '') || 'chart'
  const link = document.createElement('a')
  link.download = `${ safe }.png`
  link.href = dataUrl
  link.click()
}
