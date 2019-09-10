import * as d3 from 'd3';
import d3Tip from 'd3-tip';

export default function() {
      // Size
  let margin = { top: 10, left: 40, bottom: 20, right: 40 },
      width = 800,
      height = 800,
      innerWidth = function() { return width - margin.left - margin.right; },
      innerHeight = function() { return height - margin.top - margin.bottom; },

      // Data
      data = null,
      enrolled = [],
      sites = [],

      // Keys
      dateKey = "CE01-120",
      actualEnrolledKey = "Actual Enrolled",
      targetEnrolledKey = "Revised Target Enrolled",
      actualSitesKey = "Actual Sites",
      targetSitesKey = "Revised Projected Sites",

      // Colors
      enrolledColor = "#8da0cb",
      sitesColor = "#66c2a5",

      // Start with empty selection
      svg = d3.select(),

      // Tooltip
      tip = d3Tip()
          .attr("class", "d3-tip")
          .style("line-height", 1)
          //.style("font-weight", "bold")
          //.style("font-size", "small")
          .style("padding", "12px")
          .style("background", "rgba(255, 255, 255)")
          //.style("color", "#fff")
          .style("border", "1px solid #999")
          .style("border-radius", "5px")
          .style("pointer-events", "none")
          .offset([-10, 0])
          .html(i => {
            const dateFormat = d3.timeFormat("%B, %Y");

            return "<div style='font-weight: bold; margin-bottom: 10px;'>" + dateFormat(enrolled[i].date) + "</div>" +
                    "<div style='padding-left: 5px; margin-bottom: 10px; border-left: 2px solid " + sitesColor + ";'>" +
                      "<div style='font-weight: bold;'>Sites</div>" +
                      "<div style='padding-left: 10px'>" +
                        valueString(sites, "actual") + "<br>" +
                        valueString(sites, "target") +
                      "</div>" +
                    "</div>" +
                    "<div style='padding-left: 5px; border-left: 2px solid " + enrolledColor + ";'>" +
                      "<div style='font-weight: bold;'>Enrolled</div>" +
                      "<div style='padding-left: 10px'>" +
                        valueString(enrolled, "actual") + "<br>" +
                        valueString(enrolled, "target") +
                      "</div>" +
                    "</div>";

              function valueString(type, key) {
                const v1 = type[i][key],
                      v2 = type[i + 1][key];

                return (key === "actual" ? "Actual: " : "Target: ") +
                        v1 + (v2 !== v1 ? " ⮕ " + type[i + 1][key] : "");
              }
          }),

      // Event dispatcher
      dispatcher = d3.dispatch();

  // Create a closure containing the above variables
  function enrollmentGraph(selection) {
    selection.each(function(d) {
      const dateFormat = d3.timeParse("%Y-%b");

      // Save data
      data = d.map(d => {
        const e = {};
        e[dateKey] = dateFormat(d[dateKey]);
        e[actualEnrolledKey] = +d[actualEnrolledKey];
        e[targetEnrolledKey] = +d[targetEnrolledKey];
        e[actualSitesKey] = +d[actualSitesKey];
        e[targetSitesKey] = +d[targetSitesKey];
        return e;
      });

      // Select the svg element, if it exists
      svg = d3.select(this).selectAll("svg")
          .data([data]);

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
      const groups = ["background", "legend", "chart", "axes"];

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
    return data.map(d => {
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
    enrolled = createTimeSeries(actualEnrolledKey, targetEnrolledKey, dateKey);
    sites = createTimeSeries(actualSitesKey, targetSitesKey, dateKey);

    const timeSeriesData = [
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
    drawBackground();
    drawAxes();
    drawLegend();

    function drawData() {
      // Bind time series data
      const timeSeries = svg.select(".chart")
          .style("pointer-events", "none")
        .selectAll(".timeSeries")
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
        const color = d.name === "enrolled" ? enrolledColor : sitesColor;

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
          const data = selection.data()[0].data;

          // Create regions
          const regions = [];
          let region = null;
          let currentSign = 0;

          data.forEach((d, i, a) => {
            const sign = Math.sign(d.actual - d.target);

            if (sign !== 0 && currentSign === 0) {
              // Start new region
              region = [
                { x: xScale(a[i - 1].date), y1: yScale(a[i - 1].actual), y2: yScale(a[i - 1].target) },
                { x: xScale(d.date), y1: yScale(d.actual), y2: yScale(d.target) },
              ];
              regions.push(region);
            }
            else if (sign === currentSign && currentSign !== 0) {
              // Continue region
              region.push({ x: xScale(d.date), y1: yScale(d.actual), y2: yScale(d.target) });
            }
            else if (sign === 0 && currentSign !== 0) {
              // Continue region
              region.push({ x: xScale(d.date), y1: yScale(d.actual), y2: yScale(d.target) });
            }
            else if (sign !== currentSign) {
              // Compute intersection
              const ax = xScale(a[i - 1].date),
                    ay1 = yScale(a[i - 1].actual),
                    ay2 = yScale(a[i - 1].target),
                    bx = xScale(d.date),
                    by1 = yScale(d.actual),
                    by2 = yScale(d.target);

              const p = lineSegmentIntersection([ax, ay1], [bx, by1], [ax, ay2], [bx, by2]);

              // Finish previous region
              region.push({ x: p[0], y1: p[1], y2: p[1] });

              // Start new region
              region = [
                { x: p[0], y1: p[1], y2: p[1] },
                { x: xScale(d.date), y1: yScale(d.actual), y2: yScale(d.target) },
              ];
              regions.push(region);
            }

            currentSign = sign;
          });

          // Bind data
          const section = selection.selectAll(".section")
              .data(regions);

          // Enter + update
          section.enter().append("polygon")
              .attr("class", "section")
            .merge(section)
              .attr("points", d => {
                let s = "";

                d.forEach(d => {
                  s += d.x + "," + d.y1 + " ";
                });
                d.reverse().forEach(d => {
                  s += d.x + "," + d.y2 + " ";
                });

                return s;
              })
              .style("fill", color)
              .style("fill-opacity", d => actualBigger(d) ? 0.1 : 0.5);

          // Exit
          section.exit().remove();

          function actualBigger(d) {
            // See if the biggest difference between actual and target is positive or negative
            return d.reduce((p, c) => {
              const diff = c.y1 - c.y2;
              return Math.abs(diff) > Math.abs(p) ? diff : p;
            }, 0) < 0;
          }

          // Return intersection point of two line segments
          // Based on technique described here: http://paulbourke.net/geometry/pointlineplane/
          function lineSegmentIntersection(p1, p2, p3, p4) {
            // Check that none of the lines are of length 0
          	if ((p1[0] === p2[0] && p1[1] === p2[1]) || (p3[0] === p4[0] && p3[1] === p4[1])) {
          		return false;
          	}

          	const denominator = ((p4[1] - p3[1]) * (p2[0] - p1[0]) - (p4[0] - p3[0]) * (p2[1] - p1[1]));

            // Lines are parallel
          	if (denominator === 0) {
          		return null;
          	}

          	const ua = ((p4[0] - p3[0]) * (p1[1] - p3[1]) - (p4[1] - p3[1]) * (p1[0] - p3[0])) / denominator,
          	      ub = ((p2[0] - p1[0]) * (p1[1] - p3[1]) - (p2[1] - p1[1]) * (p1[0] - p3[0])) / denominator;

            // Is the intersection along the segments?
          	if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
          		return null;
          	}

            // Return the x and y coordinates of the intersection
          	const x = p1[0] + ua * (p2[0] - p1[0]),
          	      y = p1[1] + ua * (p2[1] - p1[1]);

          	return [x, y];
          }
        }
      }
    }

    function drawBackground() {
      // Bind data for rectangles
      const rects = svg.select(".background").selectAll(".backgroundRect")
          .data(d3.pairs(enrolled.map(d => d.date)));

      // Enter + update
      rects.enter().append("rect")
          .attr("class", "backgroundRect")
          .style("fill", "none")
          .style("pointer-events", "all")
          .on("mouseover", function(d, i) {
            tip.show(i, this);
            d3.select(this).style("fill", "#fcfcfc");
          })
          .on("mouseout",  function(d, i) {
            tip.hide();
            d3.select(this).style("fill", "none");
          })
        .merge(rects)
          .attr("x", d => xScale(d[0]))
          .attr("width", d => xScale(d[1]) - xScale(d[0]))
          .attr("height", innerHeight());

      // Exit
      rects.exit().remove();

      // Bind data for lines
      const lines = svg.select(".background").selectAll(".backgroundLine")
          .data(enrolled.map(d => d.date));

      // Enter + update
      lines.enter().append("line")
          .attr("class", "backgroundLine")
          .style("stroke", "#eee")
          .style("pointer-events", "none")
        .merge(lines)
          .attr("x1", d => xScale(d))
          .attr("y1", innerHeight())
          .attr("x2", d => xScale(d));

      // Exit
      lines.exit().remove();
    }

    function drawAxes() {
      // Axes
      const xAxis = d3.axisBottom(xScale)
          .ticks(d3.timeMonth.every(1))
          .tickFormat(d => {
            const format = d3.timeYear(d) < d ? "%b" : "%Y";
            return d3.timeFormat(format)(d);
          });
      const enrolledAxis = d3.axisRight(enrolledScale);
      const sitesAxis = d3.axisLeft(sitesScale);

      // Get group for axes
      const axes = svg.select(".axes")
          .style("pointer-events", "none");

      // Draw x axis
      const gX = axes.selectAll(".xAxis")
          .data([0]);

      // Enter + upate
      gX.enter().append("g")
          .attr("class", "xAxis")
        .merge(gX)
          .attr("transform", "translate(0," + innerHeight() + ")")
          .call(xAxis);

      // Set year format
      axes.select(".xAxis").selectAll(".tick text")
          .style("font-weight", d => {
            return d.getMonth() === 0 ? "bold" : null;
          });

      // Draw enrolled axis
      const gEnrolled = axes.selectAll(".enrolledAxis")
          .data([0]);

      // Enter + upate
      gEnrolled.enter().append("g")
          .attr("class", "enrolledAxis")
        .merge(gEnrolled)
          .attr("transform", "translate(" + innerWidth() + ",0)")
          .call(enrolledAxis);

      // Draw enrolled label
      const labelEnrolled = axes.selectAll(".labelEnrolled")
          .data([0]);

      // Enter + update
      labelEnrolled.enter().append("text")
          .text("Patients enrolled")
          .attr("class", "labelEnrolled")
          .style("text-anchor", "middle")
          .attr("dy", "-.2em")
        .merge(labelEnrolled)
          .attr("transform", "translate(" + (innerWidth() + margin.right) +"," + innerHeight() / 2 + ")rotate(-90)");

      // Set tick color
      axes.select(".enrolledAxis").selectAll(".tick line")
          .style("stroke", enrolledColor);

      axes.select(".enrolledAxis").select(".domain")
          .style("stroke", enrolledColor);

      // Draw sites axis
      const gSites = axes.selectAll(".sitesAxis")
          .data([0]);

      // Enter + upate
      gSites.enter().append("g")
          .attr("class", "sitesAxis")
        .merge(gSites)
          .call(sitesAxis);

      // Set tick color
      axes.select(".sitesAxis").selectAll(".tick line")
          .style("stroke", sitesColor);

      axes.select(".sitesAxis").select(".domain")
          .style("stroke", sitesColor);

      // Draw sites label
      const labelSites = axes.selectAll(".labelSites")
          .data([0]);

      // Enter + update
      labelSites.enter().append("text")
          .text("Sites")
          .attr("class", "labelSites")
          .style("text-anchor", "middle")
          .attr("dy", ".8em")
        .merge(labelSites)
          .attr("transform", "translate(" + (-margin.left) +"," + innerHeight() / 2 + ")rotate(-90)");
    }

    function drawLegend() {
      const entries = [
        "Actual enrolled",
        "Target enrolled",
        "Actual sites",
        "Projected sites"
      ];

      const s = 20;
      const w = 35;

      const yScale = d3.scaleOrdinal()
          .domain(entries)
          .range([s * 3, s * 4, 0, s, ]);

      const colorScale = d3.scaleOrdinal()
          .domain(entries)
          .range([enrolledColor, enrolledColor, sitesColor, sitesColor]);

      const dashScale = d3.scaleOrdinal()
          .domain(entries)
          .range(["", "5 5", "", "5 5"]);

      // Bind data
      const entry = svg.select(".legend")
          .attr("transform", "translate(30, 0)")
          .style("pointer-events", "none")
        .selectAll(".entry")
          .data(entries);

      // Enter
      const entryEnter = entry.enter().append("g")
          .attr("class", "entry")
          .attr("transform", d => "translate(0," + yScale(d) + ")");

      entryEnter.append("line")
          .attr("x2", w)
          .style("stroke", d => colorScale(d))
          .style("stroke-width", 2)
          .style("stroke-dasharray", d => dashScale(d));

      entryEnter.append("text")
          .text(d => d)
          .attr("x", w)
          .attr("dx", ".5em")
          .style("dominant-baseline", "middle");
    }
  }

  // Getters/setters

  enrollmentGraph.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return enrollmentGraph;
  };

  enrollmentGraph.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return enrollmentGraph;
  };

  // For registering event callbacks
  enrollmentGraph.on = function() {
    let value = dispatcher.on.apply(dispatcher, arguments);
    return value === dispatcher ? enrollmentGraph : value;
  };

  return enrollmentGraph;
}
