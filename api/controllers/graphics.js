const D3Node = require('d3-node')
const d3 = require('d3')
let d3n

//

const styles = (fill) => `
    .bar {
        stroke: black;
        stroke-width: 1;
        fill: ${ fill };
        transition: filter 250ms;
    }
    .bar:hover {
        filter: brightness(0.75);
    }
`

var formatCount = d3.format(',.0f')

// /api/v1/graphics
exports.vertical = (req, res) => {
    const fillColor = req.query.fill || 'steelblue'
    d3n = new D3Node({
        styles: styles(fillColor),
        d3Module: d3,
    })

    const ticData = [
        { name: 'Duke/VUMC TIC', value: 59 },
        { name: 'Utah TIC', value: 52 },
        { name: 'JHU/Tufts TIC', value: 56 },
        { name: 'VUMC RIC', value: 52 },
    ]

    const margin = { top: 60, right: 30, bottom: 30, left: 30 }
    const width = 400 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom
    const svgWidth = width + margin.left + margin.right
    const svgHeight = height + margin.top + margin.bottom
    const barX = (svgWidth - margin.left - margin.right) / 4

    var x = d3.scaleOrdinal(ticData.map(d => d.name), [0, 1, 2, 3].map(i => i * barX))
    var y = d3.scaleLinear().domain(ticData.map(d => d.value)).range([height, 0])

    const svg = d3n.createSVG(svgWidth, svgHeight)
        .attr('style', 'border: 1px solid #ccc')
        .append('g')
        .attr('transform', `translate(${ margin.left }, ${ margin.top })`)

    // Scale the range of the data in the domains
    x.domain(ticData.map(d => d.name))
    y.domain([0, d3.max(ticData, d => d.value)])
    
    // bars
    const bars = svg.append('g').attr('class', 'bars')

    const bar = bars.selectAll('.bar')
        .data(ticData)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.value))
        .attr('width', barX)
        .attr('height', d => y(0) - y(d.value))
    
    const barLabels = bars.selectAll('text')
        .data(ticData)
        .enter().append('text')
        .attr('class', 'text')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.value))
        .attr("transform", `translate(${ barX/2 }, -10)`)
        .style("text-anchor", "middle")
        .text(d => d.value)

    // add the x Axis
    svg.append('g')
        .attr("transform", `translate(50,${ height })`)
        .call(d3.axisBottom(x))

    // add the y Axis
    svg.append('g')
        .call(d3.axisLeft(y))

    res.status(200).type('application/xml').send(d3n.svgString())
}

// /api/v1/graphics/bar/horizontal
exports.horizontal = (req, res) => {
    const fillColor = req.query.fill || 'steelblue'
    d3n = new D3Node({
        styles: styles(fillColor),
        d3Module: d3,
    })

    var options = {
        styles: styles,
        d3Module: d3,
    }

    var formatCount = d3.format(',.0f')

    const ticData = [
        { name: 'Duke/VUMC TIC', value: 59 },
        { name: 'Utah TIC', value: 52 },
        { name: 'JHU/Tufts TIC', value: 56 },
        { name: 'VUMC RIC', value: 52 },
    ]

    const margin = { top: 60, right: 40, bottom: 30, left: 100 }
    const width = 400 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom
    const svgWidth = width + margin.left + margin.right
    const svgHeight = height + margin.top + margin.bottom
    const barX = width / 4
    const barY = height / 4

    var x = d3.scaleLinear().domain([0, d3.max(ticData, d => d.value)]).range([0, width])
    var y = d3.scaleOrdinal(ticData.map(d => d.name), [0, 1, 2, 3].map(i => i * barY))

    const svg = d3n.createSVG(svgWidth, svgHeight)
        .attr('style', 'border: 1px solid #ccc')
        .append('g')
        .attr('transform', `translate(${ margin.left }, ${ margin.top })`)

    // bars
    const bars = svg.append('g').attr('class', 'bars')

    const bar = bars.selectAll('.bar')
        .data(ticData)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => 0)
        .attr('y', d => y(d.name))
        .attr('height', barY)
        .attr('width', d => x(d.value))
        .attr('data-tic', d => d.name)
    
    const barLabels = bars.selectAll('.label')
        .data(ticData)
        .enter().append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.value))
        .attr('y', d => y(d.name))
        .attr("transform", `translate(20, ${ barY / 2 })`)
        .style("text-anchor", "middle")
        // .attr("font-size", "12")
        .text(d => d.value)

    // add the x Axis
    svg.append('g')
        .attr("transform", `translate(0, ${ height })`)
        .call(d3.axisBottom(x))

    // add the y Axis
    svg.append('g')
        .attr("transform", `translate(0, 50)`)
        .call(d3.axisLeft(y))

    res.status(200).type('application/xml').send(d3n.svgString())
}