const D3Node = require('d3-node')
const d3 = require('d3')

//

const d3Random = require('d3-random')

const randomUniform = (a,b) => d3Random.randomUniform(a, b)()

const randomArray = (count, a, b) => {
    return [...Array(count).keys()].map(i => Math.floor(randomUniform(a, b)))
}

//

const styles = `
    .bars {

    }
    .bar {
        stroke: black;
        stroke-width: 1;
        fill: steelblue;
        transition: filter 250ms;
    }
    .bar:hover {
        filter: brightness(0.75);
    }
`

var options = {
    svgStyles: styles,
    d3Module: d3,
}

const d3n = new D3Node(options)

var formatCount = d3.format(',.0f')

// /api/v1/image
exports.proofOfConcept = (req, res) => {
    const ticData = [
        { name: 'Duke/VUMC TIC', value: 59 },
        { name: 'Utah TIC', value: 52 },
        { name: 'JHU/Tufts TIC', value: 56 },
        { name: 'VUMC RIC', value: 52 },
    ]

    const data = d3.range(1000).map(d3.randomUniform(10))
    // const data = random.randomArray(10, 1, 50)

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
    x.domain(data.map(d => d.name))
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