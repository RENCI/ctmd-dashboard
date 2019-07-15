import * as d3 from 'd3';
import d3Tip from 'd3-tip';

export default function() {
      // Size
  let margin = { top: 10, left: 10, bottom: 10, right: 10 },
      width = 800,
      height = 800,
      innerWidth = function() { return width - margin.left - margin.right; },
      innerHeight = function() { return height - margin.top - margin.bottom; },

      // Data
      study = null,
      sites = [],

      // Scales
      colors = d3.schemeCategory10,

      // Start with empty selection
      svg = d3.select(),

      // Tooltip
      tip = d3Tip()
          //.attr("class", "d3-tip")
          .style("line-height", 1)
          .style("font-weight", "bold")
          .style("font-size", "small")
          .style("padding", "12px")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "#fff")
          .style("border-radius", "2px")
          .style("pointer-events", "none")
          .html(d => {
            console.log(d);
          }),

      // Event dispatcher
      dispatcher = d3.dispatch();

  // Create a closure containing the above variables
  function enrollmentChart(selection) {
    selection.each(d => {
      // Save data
      study = d.study;
      sites = d.sites;

      // Select the svg element, if it exists
      svg = d3.select(this).selectAll("svg")
          .data([d]);

      // Otherwise create the skeletal chart
      const svgEnter = svg.enter().append("svg")
          .attr("class", "proposalsSankey")
          .on("click", () => {
//            dispatcher.call("selectNodes", this, null);
          });

//      svgEnter.append("g").attr("class", "legend");

      const g = svgEnter.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Groups for layout
      const groups = [];

      g.selectAll("g")
          .data(groups)
        .enter().append("g")
          .attr("class", d => d);

      svg = svgEnter.merge(svg);

      // Tooltips
      svg.call(tip);

      draw();
    });
  }

  function draw() {
    // Set width and height
    svg.attr("width", width)
        .attr("height", height);

    console.log(sites);
  }

  // Getters/setters

  enrollmentChart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return enrollmentChart;
  };

  enrollmentChart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return enrollmentChart;
  };

  enrollmentChart.colors = function(_) {
    if (!arguments.length) return colors;
    colors = _;
    return enrollmentChart;
  };

  // For registering event callbacks
  enrollmentChart.on = function() {
    let value = dispatcher.on.apply(dispatcher, arguments);
    return value === dispatcher ? enrollmentChart : value;
  };

  return enrollmentChart;
}
