const D3Node = require('d3-node')
const d3 = require('d3')
const axios = require('axios')
let d3n
const { getProposals } = require('./proposals')

//

// /api/graphics/proposals-by-tic

exports.proposalsByTic = (req, res) => {
    getProposals.then(proposals => {
        d3n = new D3Node({
            d3Module: d3,
        })
        // Filter proposals
        proposals = proposals.filter(d => d.assignToInstitution);

        // Group by tic and then status
        const tics = d3.nest()
            .key(d => d.assignToInstitution)
            .key(d => d.proposalStatus)
            .entries(proposals);

        // Threshold statuses
        const threshold = 6;
        const statuses = [];

        tics.forEach(d => {
          d.values.forEach(d => {
            if (d.values.length >= threshold) {
              if (!statuses.includes(d.key)) {
                statuses.push(d.key);
              }
            }
          });
        });

        statuses.sort((a, b) => d3.ascending(a, b));

        tics.forEach(d => {
          const filteredValues = d.values.reduce((values, value) => {
            if (statuses.includes(value.key)) {
              values.push(value);
            }
            else {
              values.find(d => d.key === "Other").values.push(value.value);
            }

            return values;
          },[{ key: "Other", values: [] }]);

          d.values = filteredValues;
        });

        tics.forEach(d => {
          d.values.sort((a, b) => {
            return a.key === "Other" ? 1 : b.key === "Other" ? -1 : d3.ascending(a.key, b.key);
          });
        });

        // Color scale
        const colorScale = d3.scaleOrdinal()
            .domain(statuses)
            .range(d3.schemeTableau10);

        const width = 800;
        const height = 400;
        const margin = { top: 150, right: 10, bottom: 20, left: 110 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(tics, d => d3.sum(d.values, d => d.values.length))])
            .range([0, innerWidth]);
        
        const yScale = d3.scaleBand()
            .domain(tics.map(d => d.key))
            .rangeRound([0, innerHeight])
            .paddingInner(0.4)
            .paddingOuter(0.4);

        // Set up for stacking
        tics.forEach(d => {
          let x = 0;

          d.values.forEach(d => {
            d.x = x;
            x += xScale(d.values.length);
          });
        });

        const svg = d3n.createSVG(width, height)

        const g = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // Set up groups
        g.append('g').attr('class', 'labels');
        g.append('g').attr('class', 'backgrounds');
        g.append('g').attr('class', 'bars');
        g.append('g').attr('class', 'axis');
        svg.append('g').attr('class', 'legend');

        // Draw bars
        const radius = 5;
        const pad = 2;

        svg.select('.bars').selectAll('.bar')
            .data(tics)
          .enter().append('g')
            .attr('class', 'bar')
            .attr('transform', d => 'translate(0,' + yScale(d.key) + ')')
          .selectAll('.section') 
            .data(d => d.values)
          .enter().append('rect')      
            .attr('class', 'section')
            .attr('x', d => d.x + pad / 2)
            .attr('width', d => xScale(d.values.length) - pad)
            .attr('height', yScale.bandwidth())
            .attr('rx', radius)
            .attr('ry', radius)
            .style('fill', d => d.key === "Other" ? "#999" : colorScale(d.key))
            .on("mouseover", d => console.log(d));

        // Draw backgrounds
        svg.select('.backgrounds').selectAll('rect')
            .data(tics)
          .enter().append('rect')      
            .attr('class', 'section')
            .attr('y', d => yScale(d.key))
            .attr('width', d => xScale.range()[1])
            .attr('height', yScale.bandwidth())
            .attr('rx', radius)
            .attr('ry', radius)
            .style('fill', "#eee");

        // Draw labels
        svg.select('.labels').selectAll('text')
            .data(tics)
          .enter().append('text')
            .attr('dx', '-.5em')
            .attr('y', d => yScale(d.key) + yScale.bandwidth() / 2)
            .style('text-anchor', 'end')
            .style('font-family', 'arial')
            .style('font-size', 'small')
            .style('dominant-baseline', 'central')
            .text(d => d.key);

        // Draw the x Axis
        svg.select('.axis')
            .attr('transform', 'translate(0,' + innerHeight + ')')
            .call(d3.axisBottom(xScale));

        // Draw the legend
        const items = statuses.concat('Other');

        const legendYScale = d3.scaleBand()
            .domain(items)
            .range([0, margin.top])
            .paddingInner(0.4)
            .paddingOuter(0);

        const item = svg.select('.legend')
            .attr('transform', 'translate(' + (width - margin.right - legendYScale.bandwidth()) + ')')
          .selectAll(".item")
            .data(items)
          .enter().append('g')
            .attr('transform', d => 'translate(0,' + legendYScale(d) + ')');
        
        item.append('rect')
            .attr('width', legendYScale.bandwidth())
            .attr('height', legendYScale.bandwidth())
            .attr('rx', radius)
            .attr('ry', radius)
            .style('fill', d => d === 'Other' ? '#999' : colorScale(d));

        item.append('text')
            .attr('y', legendYScale.bandwidth() / 2)
            .attr('dx', '-.5em')
            .style('font-family', 'arial')
            .style('font-size', 'small')
            .style('text-anchor', 'end')
            .style('dominant-baseline', 'central')
            .text(d => d);

        res.status(200).type('application/xml').send(d3n.svgString())
    }).catch(error => {
        console.log(error)
        res.status(500).send({ message: error })
    })
}
