const D3Node = require('d3-node')
const d3 = require('d3')
const axios = require('axios')
let d3n
const { getProposals } = require('./proposals')

//

// /api/graphics/proposals-by-tic

exports.proposalsByTic = (req, res) => {
    const statusGroup = status => {
        switch (status) {
            case "Approved for Initial Consultation":
            case "Ready for Initial Consultation":
            case "Initial Consult in Progress":
            case "Initial Consult on Hold":
            case "Initial Consult Complete: Recommend for Comprehensive Consultation":
            case "Initial Consult Complete: Recommended for Resources":
            case "Initial Consult Complete: No Further Support Needed":
                return "Initial Consultations"
    
            case "Recommend for Comprehensive Consultation":
            case "Comprehensive Complete - Grant Submitted":
            case "Comprehensive Consult in Progress":
            case "Comprehensive Consult on Hold":
            case "Comprehensive Consult Complete: No Further Support Needed":
            case "Comprehensive Consult Complete: Grant Submitted (Awaiting Outcome)":
            case "Comprehensive Consult Complete: Funding Awarded TIC/RIC Support Ongoing":
            case "Comprehensive Consult Complete":
            case "Comprehensive Consult Complete: Not Funded (No Further Network Support)":
            case "Comprehensive Consult Complete: Not Funded (Resubmission pending)":
                return "Comprehensive Consults"
        
            case "Ready for Implementation":
            case "Implementation Ongoing: Planning Phase":
            case "Implementation Ongoing: Execution Phase":
            case "Implementation Ongoing: Close Out Phase":
            case "Implementation Complete":
            case "Implementation on Hold":
            case "Implementation: Planning Grant":
            case "Pilot Ongoing: Planning Phase":
            case "Pilot Ongoing: Execution Phase":
            case "Pilot Ongoing: Close Out Phase":
            case "Pilot Complete":
            case "Pilot on Hold":
            case "Demo Ongoing":
            case "Demo Complete":
            case "Demo on Hold":
                return "In Full Implementation"
        
            case "Approved for Resource(s)":
            case "Approved for Resource(s) Pending Receipt of Funding":
            case "Did Not Receive Funding No Further Network Support":
            case "Resources Ongoing":
            case "Resources Complete":
            case "Resources Pending Award":
            case "Resource(s) Complete":
            case "No Longer Providing Resources - Declined by PI":
                return "Discrete Resources"
        
            default:
                return "Other"
      }
    }
    
    const colorScale = d3.scaleOrdinal()
        .domain([
            "Initial Consultations",  
            "Discrete Resources", 
            "Comprehensive Consults", 
            "In Full Implementation",
            "Other"])
        .range([
            "#40a5ad",
            "#b7c6cc",
            "#4e6889",
            "#f0f2f4",
            "#e1f1f2"
        ])

        getProposals().then(proposals => {
            d3n = new D3Node({
                d3Module: d3,
            })
            // Filter proposals
            proposals = proposals.filter(d => d.assignToInstitution)

        // Decorate with status groups
        proposals.forEach(proposal => {
          proposal.proposalStatusGroup = statusGroup(proposal.proposalStatus);
        });

        // Group by tic and then status group
        const tics = d3.nest()
            .key(d => d.assignToInstitution)
            .key(d => d.proposalStatusGroup)
            .entries(proposals);

        const width = 800;
        const height = 400;
        const margin = { top: 10, right: 10, bottom: 20, left: 110 };
        const legendHeight = 120;
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - legendHeight - margin.top - margin.bottom;

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

          d.values.sort((a, b) => {
            return d3.ascending(colorScale.domain().indexOf(a.key), colorScale.domain().indexOf(b.key));
          });

          d.values.forEach(d => {
            d.x = x;
            x += xScale(d.values.length);
          });
        });

        const svg = d3n.createSVG(width, height)

        const g = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top + legendHeight) + ')');

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
            .style('fill', d => colorScale(d.key))
           // .style('stroke', d => d.key === "Other" ? '#eee' : null);
            //.on("mouseover", d => console.log(d));

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
            .style('fill', 'none')
            .style('stroke', '#eee');

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
        const items = colorScale.domain();

        const legendYScale = d3.scaleBand()
            .domain(items)
            .range([0, legendHeight])
            .paddingInner(0.4)
            .paddingOuter(0);

        const item = svg.select('.legend')
            .attr('transform', 'translate(' + (width - margin.right - legendYScale.bandwidth()) + ',' + margin.top + ')')
          .selectAll(".item")
            .data(items)
          .enter().append('g')
            .attr('transform', d => 'translate(0,' + legendYScale(d) + ')');
        
        item.append('rect')
            .attr('width', legendYScale.bandwidth())
            .attr('height', legendYScale.bandwidth())
            .attr('rx', radius)
            .attr('ry', radius)
            .style('fill', d => colorScale(d));

        item.append('text')
            .attr('y', legendYScale.bandwidth() / 2)
            .attr('dx', '-.5em')
            .style('font-family', 'arial')
            .style('font-size', 'small')
            .style('text-anchor', 'end')
            .style('dominant-baseline', 'central')
            .text(d => d);

        res.status(200).type('image/svg-xml').send(d3n.svgString())
    }).catch(error => {
        console.log(error)
        res.status(500).send({ message: error })
    })
}
