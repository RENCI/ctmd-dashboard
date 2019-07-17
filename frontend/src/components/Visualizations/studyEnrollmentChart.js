import * as d3 from 'd3';
import d3Tip from 'd3-tip';

export default function() {
      // Size
  let margin = { top: 10, left: 30, bottom: 20, right: 30 },
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
      const groups = ["chart", "axes"];

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

    drawData();
    drawAxes();

    function drawData() {
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
        const color = d.name === "enrolled" ? "#8da0cb" : "#66c2a5";

        // Draw area
        d3.select(this).select(".area")
            .call(drawArea);

        // Line generator
        const lineShape = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.value));

        // Bind data for lines
        const line = d3.select(this).select(".lines").selectAll(".line")
            .data([
              d.data.map(d => ({ date: d.date, value: d.actual })),
              d.data.map(d => ({ date: d.date, value: d.target }))
            ]);

        // Enter
        const lineEnter = line.enter().append("path")
            .attr("class", "line");

        // Enter + update
        lineEnter.merge(line)
            .attr("d", lineShape)
            .style("fill", "none")
            .style("stroke", color)
            .style("stroke-width", 2)
            .style("stroke-dasharray", (d, i) => i === 0 ? null : "5 5");

        // Exit
        line.exit().remove();

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
                .style("fill", color)
                .style("fill-opacity", d => actualBigger(d) ? 0.1 : 0.5);

            function actualBigger(d) {
              const diff0 = d[0].actual - d[0].target,
                    diff1 = d[1].actual - d[1].target,
                    diff = Math.abs(diff0) > Math.abs(diff1) ? diff0 : diff1;

              return diff > 0;
            }
          }
        }
      }
    }

    function drawAxes() {
      // Axes
      const xAxis = d3.axisBottom(xScale)
          .ticks(d3.timeMonth.every(1));
      const enrolledAxis = d3.axisRight(enrolledScale);
      const sitesAxis = d3.axisLeft(sitesScale);

      // Get group for axes
      const axes = svg.select(".axes");

      // Draw x axis
      const gX = axes.selectAll(".xAxis")
          .data([0]);

      // Enter + upate
      gX.enter().append("g")
          .attr("class", "xAxis")
        .merge(gX)
          .attr("transform", "translate(0," + innerHeight() + ")")
          .call(xAxis);

      // Draw enrolled axis
      const gEnrolled = axes.selectAll(".enrolledAxis")
          .data([0]);

      // Enter + upate
      gEnrolled.enter().append("g")
          .attr("class", "enrolledAxis")
        .merge(gEnrolled)
          .attr("transform", "translate(" + innerWidth() + ",0)")
          .call(enrolledAxis);

      // Draw sites axis
      const gSites = axes.selectAll(".sitesAxis")
          .data([0]);

      // Enter + upate
      gSites.enter().append("g")
          .attr("class", "sitesAxis")
        .merge(gSites)
          .call(sitesAxis);
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
