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
      enrollment = null,

      // Keys
      dateKey = "CE01-120",
      actualEnrolledKey = "Actual Enrolled",
      targetEnrolledKey = "Revised Target Enrolled",
      actualSitesKey = "Actual Sites",
      targetSitesKey = "Revised Projected Sites",

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
    selection.each(function(d) {
      // Save data
      study = d.study;
      sites = d.sites;
      enrollment = d3.csvParse(d.enrollmentString);

      // Process data
      const dateFormat = d3.timeParse("%y-%b");
      enrollment.forEach(d => d[dateKey] = dateFormat(d[dateKey]));
      enrollment.forEach(d => d[actualEnrolledKey] = +d[actualEnrolledKey]);
      enrollment.forEach(d => d[targetEnrolledKey] = +d[targetEnrolledKey]);
      enrollment.forEach(d => d[actualSitesKey] = +d[actualSitesKey]);
      enrollment.forEach(d => d[targetSitesKey] = +d[targetSitesKey]);

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
      const groups = ["chart"];

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

  function createTimeSeries(actualKey, targetKey, dateKey) {
    return enrollment.map(d => {
      return {
        actual: d[actualKey],
        target: d[targetKey],
        date: d[dateKey]
      };
    });
  }

  function draw() {
    // Set width and height
    svg.attr("width", width)
        .attr("height", height);

    // Generate data
    const enrolled = createTimeSeries(actualEnrolledKey, targetEnrolledKey, dateKey),
          sites = createTimeSeries(actualSitesKey, targetSitesKey, dateKey),
          timeSeriesData = [
            { name: "sites", data: sites },
            { name: "enrolled", data: enrolled }
          ];

    // Scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(enrolled, d => d.date))
        .range([0, innerWidth()]);

    const maxActualEnrolled = d3.max(enrolled, d => d.actual),
          maxTargetEnrolled = d3.max(enrolled, d => d.target),
          maxActualSites = d3.max(sites, d => d.actual),
          maxTargetSites = d3.max(sites, d => d.target);

    const enrolledScale = d3.scaleLinear()
        .domain([0, Math.max(maxActualEnrolled, maxTargetEnrolled)])
        .range([innerHeight(), 0]);

    const sitesScale = d3.scaleLinear()
        .domain([0, Math.max(maxActualSites, maxTargetSites)])
        .range([innerHeight(), 0]);

    // Bind time series data
    const timeSeries = svg.select(".chart").selectAll(".timeSeries")
        .data(timeSeriesData);

    // Enter
    const timeSeriesEnter = timeSeries.enter().append("g")
        .attr("class", "timeSeries");

    timeSeriesEnter.append("g").attr("class", "area");
    timeSeriesEnter.append("g").attr("class", "lines");

    // Enter + update
    timeSeriesEnter.merge(timeSeries)
        .each(drawTimeSeries);

    // Exit
    timeSeries.exit().remove();

    function drawTimeSeries(d) {
      const yScale = d.name === "enrolled" ? enrolledScale : sitesScale;

      // Draw area
      d3.select(this).select(".area")
          .call(drawArea);

      // Bind data for lines
      const line = d3.select(this).select(".lines").selectAll(".line")
          .data([
            d3.pairs(d.data.map(d => ({ date: d.date, value: d.actual }))),
            d3.pairs(d.data.map(d => ({ date: d.date, value: d.target })))
          ]);

      // Enter
      const lineEnter = line.enter().append("g")
          .attr("class", "line");

      // Enter + update
      lineEnter.merge(line)
          .each(drawLine);

      function drawLine(d, i) {
        // Bind data for line segments
        const segment = d3.select(this).selectAll(".segment")
            .data(d);

        // Enter + update
        segment.enter().append("line")
            .attr("class", "segment")
          .merge(segment)
            .call(drawSegment);

        // Exit
        segment.exit().remove();

        function drawSegment(selection) {
          selection
              .attr("x1", d => xScale(d[0].date))
              .attr("y1", d => yScale(d[0].value))
              .attr("x2", d => xScale(d[1].date))
              .attr("y2", d => yScale(d[1].value))
              .style("stroke", i === 0 ? "#999" : "#000");
        }
      }

      function drawArea(selection) {
        // Bind data
        const section = selection.selectAll(".section")
            .data(d => d3.pairs(d.data));

        // Enter + update
        section.enter().append("polygon")
            .attr("class", ".section")
          .merge(section)
            .call(drawSection);

        // Exit
        section.exit().remove();

        function drawSection(selection) {
          selection
              .attr("points", function(d) {
                return xScale(d[0].date) + "," + yScale(d[0].actual) + " " +
                       xScale(d[0].date) + "," + yScale(d[0].target) + " " +
                       xScale(d[1].date) + "," + yScale(d[1].target) + " " +
                       xScale(d[1].date) + "," + yScale(d[1].actual);
              })
              .style("fill", d => {
                  const diff0 = d[0].actual - d[0].target,
                        diff1 = d[1].actual - d[1].target,
                        diff = Math.abs(diff0) > Math.abs(diff1) ? diff0 : diff1;

                  return diff > 0 ? "#2166ac" : "#b2182b";
              })
              .style("fill-opacity", 0.5);
        }
      }
    }
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
