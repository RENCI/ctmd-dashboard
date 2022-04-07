// studyEnrollmentGraph.js

import * as d3 from 'd3';
import d3Tip from 'd3-tip';

export default function() {
      // Size
  let margin = { top: 10, left: 50, bottom: 60, right: 60 },
      width = 800,
      height = 800,
      innerWidth = function() { return width - margin.left - margin.right; },
      innerHeight = function() { return height - margin.top - margin.bottom; },

      // Data
      data = null,
      enrolled = [],
      sites = [],

      // Keys
      dateKey = "date",
      actualEnrolledKey = "actualEnrollment",
      targetEnrolledKey = "targetEnrollment",
      actualSitesKey = "actualSites",
      targetSitesKey = "revisedProjectedSites",

      // Colors
      enrolledColor = "#fc8d62",
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
            const dateFormat = d3.timeFormat("%B %d, %Y");
            const numberFormat = d3.format(".1f");

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
                        valueString(enrolled, "target", numberFormat) +
                      "</div>" +
                    "</div>";

              function valueString(type, key, format) {
                let s = (key === "actual" ? "Actual: " : "Target: ");

                let v = type[i][key];

                if (v === null) {
                  s += "NA";
                }
                else {
                  if (format) {
                    v = format(v);
                  }

                  s += v;
                }

                return s;
              }
          }),

      // Event dispatcher
      dispatcher = d3.dispatch();

  // Create a closure containing the above variables
  function enrollmentGraph(selection) {
    selection.each(function(d) {
      const dateFormat = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");

      const isNumber = s => {
        return s !== null && !Number.isNaN(Number.parseFloat(s));
      }

      // Save data
      data = d.map(d => {
        const ae = d[actualEnrolledKey];
        const te = d[targetEnrolledKey];
        const as = d[actualSitesKey];
        const ts = d[targetSitesKey];

        const e = {};
        e[dateKey] = dateFormat(d[dateKey]);
        e[actualEnrolledKey] = isNumber(ae) ? +ae : null;
        e[targetEnrolledKey] = isNumber(te) ? +te : null;
        e[actualSitesKey] = isNumber(as) ? +as : null;
        e[targetSitesKey] = isNumber(ts) ? +ts : null;
        return e;
      }).sort((a, b) => a.date - b.date);

      // Select the svg element, if it exists
      svg = d3.select(this).selectAll("svg")
          .data([data]);

      // Otherwise create the skeletal chart
      const svgEnter = svg.enter().append("svg")
          .attr("class", "enrollmentGraph");

      const g = svgEnter.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Groups for layout
      const groups = ["chart", "axes", "legend"];

      g.selectAll("g")
          .data(groups)
        .enter().append("g")
          .attr("class", d => d);

      g.select(".legend").append("rect").attr("class", "background");

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
    const barStrokeWidth = 2;
    const pointRadius = 3;

    // Set width and height
    svg.attr("width", width)
        .attr("height", height)
      .select(".chart")
        .style("pointer-events", "none");

    // Generate data
    enrolled = createTimeSeries(actualEnrolledKey, targetEnrolledKey, dateKey);
    sites = createTimeSeries(actualSitesKey, targetSitesKey, dateKey);

    const barWidth = innerWidth() / sites.length / 4;

    // Scales
    const xOffset = barWidth * 0.75 + 10;

    const xExtent = d3.extent(enrolled, d => d.date);
    xExtent[0] = d3.timeMonth.floor(xExtent[0]);
    xExtent[1] = d3.timeMonth.offset(xExtent[1], 1);

    const xScale = d3.scaleTime()
        .domain(xExtent)
        .range([xOffset, innerWidth() - xOffset]);

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

    drawBarChart([{ name: "sites", data: sites }])
    drawAreaChart([{ name: "enrolled", data: enrolled }]);
    //drawBackground();
    drawAxes();
    drawLegend();

    function drawBarChart(data) {
      // Bind time series data
      const timeSeries = svg.select(".chart")
          .selectAll(".barTimeSeries")
          .data(data);

      // Enter
      const timeSeriesEnter = timeSeries.enter().append("g")
          .attr("class", "barTimeSeries");

      // Enter + update
      timeSeriesEnter.merge(timeSeries)
          .each(drawTimeSeries);

      // Exit
      timeSeries.exit().remove();

      function drawTimeSeries(d) {    
        const yScale = d.name === "enrolled" ? enrolledScale : sitesScale;
        const color = d.name === "enrolled" ? enrolledColor : sitesColor;

        // Bind data for bars
        const bars = d3.select(this).selectAll(".bars")
          .data(d.data);

        // Enter
        const barsEnter = bars.enter().append("g")
          .attr("class", "bars")
          .style("pointer-events", "all")
          .on("mouseover", function(d, i) {
            tip.show(i, this);

            d3.select(this).selectAll("rect")
                .style("stroke-width", barStrokeWidth + 1);

            svg.select(".chart").selectAll(".point").filter(e => e.date.getTime() === d.date.getTime())
                .attr("r", pointRadius + 1);
          })
          .on("mouseout", function(d, i) {
            tip.hide();
            
            d3.select(this).selectAll("rect")
                .style("stroke-width", barStrokeWidth);

            svg.select(".chart").selectAll(".point")
                .attr("r", pointRadius);
          });

        // Enter + update
        barsEnter.merge(bars)
            .each(drawBars);

        // Exit
        bars.exit().remove();

        function drawBars(d) {
          // Bind data
          const bar = d3.select(this)
              .attr("transform", "translate(" + (xScale(d.date) - barWidth / 2) + ")")
            .selectAll(".bar")
              .data([d.target, d.actual]);

          const barX = d3.scaleOrdinal()
              .domain([0, 1])
              .range([barWidth / 4, -barWidth / 4])
            
          const barFill = d3.scaleOrdinal()
              .domain([0, 1])
              .range([d3.hsl(color).brighter(0.5), d3.hsl(color).brighter(1.2)]);

          const barStroke = d3.scaleOrdinal()
              .domain([0, 1])
              .range([color, color]);

          const barEnter = bar.enter().append("rect")
              .attr("class", "bar")
              .style("stroke-width", barStrokeWidth);

          // Enter + update
          barEnter.merge(bar)
              .attr("x", (d, i) => barX(i))
              .attr("y", d => yScale(d))
              .attr("width", barWidth)
              .attr("height", d => yScale(0) - yScale(d))
              .style("fill", (d, i) => barFill(i))
              .style("stroke", (d, i) => barStroke(i));

          // Exit
          bar.exit().remove();
        }
      }
    }

    function drawAreaChart(data) {
      // Bind time series data
      const timeSeries = svg.select(".chart")
        .selectAll(".areaTimeSeries")
          .data(data);

      // Enter
      const timeSeriesEnter = timeSeries.enter().append("g")
          .attr("class", "areaTimeSeries");

      timeSeriesEnter.append("g").attr("class", "area");
      timeSeriesEnter.append("g").attr("class", "lines");
      timeSeriesEnter.append("g").attr("class", "points");

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
        const lineData = [
          d.data.filter(d => d.actual !== null).map(d => ({ date: d.date, value: d.actual })),
          d.data.map(d => ({ date: d.date, value: d.target }))
        ];

        const line = d3.select(this).select(".lines").selectAll(".line")
            .data(lineData);

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

        // Bind data for points
        const point = d3.select(this).select(".points").selectAll(".point")
            .data(lineData[0].concat(lineData[1]));

        // Enter
        const pointEnter = point.enter().append("circle")
            .attr("class", "point");

        // Enter + update
        pointEnter.merge(point)
            .attr("cx", d => xScale(d.date))
            .attr("cy", d => yScale(d.value))
            .attr("r", pointRadius)
            .style("fill", color)
            .style("stroke", "none");

        // Exit
        point.exit().remove();

        function drawArea(selection) {
          const data = selection.data()[0].data.filter(d => d.actual !== null);

          // Create regions
          const regions = [];
          let region = null;
          let currentSign = 0;

          data.forEach((d, i, a) => {
            const sign = Math.sign(d.actual - d.target);

            if (i === 0) {
              // Skip first time step
            }
            else if ((sign !== 0 && currentSign === 0) || i === 1) {
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

              if (p) {
                // Finish previous region
                region.push({ x: p[0], y1: p[1], y2: p[1] });

                // Start new region
                region = [
                  { x: p[0], y1: p[1], y2: p[1] },
                  { x: xScale(d.date), y1: yScale(d.actual), y2: yScale(d.target) },
                ];
                regions.push(region);
              }
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
              console.log("zero length");
              return null;
            }

            const denominator = ((p4[1] - p3[1]) * (p2[0] - p1[0]) - (p4[0] - p3[0]) * (p2[1] - p1[1]));

            // Lines are parallel
            if (denominator === 0) {
              console.log("parallel");
              return null;
            }

            const ua = ((p4[0] - p3[0]) * (p1[1] - p3[1]) - (p4[1] - p3[1]) * (p1[0] - p3[0])) / denominator,
                  ub = ((p2[0] - p1[0]) * (p1[1] - p3[1]) - (p2[1] - p1[1]) * (p1[0] - p3[0])) / denominator;

            // Is the intersection along the segments?
            const epsilon = 1e-6;
            if (ua < 0 - epsilon || ua > 1 + epsilon || ub < 0 - epsilon || ub > 1 + epsilon) {
              console.log("outside");
              console.log(ua, ub)
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
      // Different formats for printing tick labels     
      const monthFormat = d3.timeFormat("%b");
      const monthDayFormat = d3.timeFormat("%b %d");
      const monthYearFormat = d3.timeFormat("%b, %Y");
      const monthDayYearFormat = d3.timeFormat("%b %d, %Y");

      // Some math for filling in missing months
      const mod = (n, m) => (n % m + m) % m;
      const monthAdd = (a, b) => mod(mod(a, 12) + mod(b, 12), 12);
      const daysInMonth = (m, y) => new Date(y, m, 0).getDate();

      // Fill in missing months
      const axisDates = enrolled.reduce((dates, { date }, i, a) => {
        if (i === a.length - 1) {
          dates.push({
            date: date,
            present: true
          });
        }
        else {
          const nextDate = a[i + 1].date;
          const months = monthAdd(nextDate.getMonth(), -date.getMonth());

          dates.push({
            date: date,
            present: true
          });

          for (let j = 0; j < months - 1; j++) {
            date = new Date(date);
            date.setDate(date.getDate() + daysInMonth(date.getMonth() + 1, date.getFullYear()));

            dates.push({
              date: date,
              present: false
            });
          }
        }

        return dates;
      }, []);

      // Show year for first tick mark in the year
      axisDates.forEach((d, i) => d.showYear = d.date.getMonth() === 0 && (i === 0 || axisDates[i - 1].date.getMonth() !== 0));

      // Draw the axis
      const xAxis = d3.axisBottom(xScale)
          .tickValues(axisDates.map(d => d.date))
          .tickFormat((d, i) => {
            const { showYear, present } = axisDates[i];
            return present && showYear ? monthDayYearFormat(d) : 
              present ? monthDayFormat(d) : 
              showYear ? monthYearFormat(d) : 
              monthFormat(d);
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

      // Modify tick stroke
      axes.select(".xAxis").selectAll(".tick > line")
        .style("stroke", (d, i) => axisDates[i].present ? "#000" : "#999");          

      // Modify tick axis labels
      axes.select(".xAxis").selectAll(".tick > text")
          .attr("transform", "translate(5)rotate(45)")
          .style("text-anchor", "start")
          .style("fill", (d, i) => axisDates[i].showYear || axisDates[i].present ? "#000" : "#888")
          .style("font-weight", (d, i) => axisDates[i].showYear ? "bold" : null);

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
          .range([s * 3, s * 4, 0, s ]);

      const fillScale = d3.scaleOrdinal()
          .domain(entries)
          .range([null, null, d3.hsl(sitesColor).brighter(1.2), d3.hsl(sitesColor).brighter(0.5)]);

      const strokeScale = d3.scaleOrdinal()
          .domain(entries)
          .range([enrolledColor, enrolledColor, sitesColor, sitesColor]);

      const dashScale = d3.scaleOrdinal()
          .domain(entries)
          .range(["", "5 5", "", "5 5"]);

      // Background
      svg.select(".legend").select(".background")
          .attr("x", -10)
          .attr("y", -15)
          .attr("width", 135)
          .attr("height", 110)
          .attr("rx", 5)
          .style("fill", "#fff")
          .style("fill-opacity", 0.8)
          .style("stroke", "#ddd");

      // Bind data
      const entry = svg.select(".legend")
          .attr("transform", "translate(30, 10)")
          .style("pointer-events", "none")
        .selectAll(".entry")
          .data(entries);

      // Enter
      entry.enter().append("g")
          .attr("class", "entry")
          .attr("transform", d => "translate(0," + yScale(d) + ")")
          .each(function(d, i) {
            const g = d3.select(this);

            if (i < 2) {
              g.append("line")
                  .attr("x2", w)
                  .style("stroke", d => strokeScale(d))
                  .style("stroke-width", 2)
                  .style("stroke-dasharray", d => dashScale(d));
            }
            else {
              const w2 = 10;

              g.append("rect")
                  .attr("y", -w2 / 2)
                  .attr("x", w / 2 - w2 / 2)
                  .attr("width", w2)
                  .attr("height", w2)
                  .style("fill", d => fillScale(d))
                  .style("stroke", d => strokeScale(d))
                  .style("stroke-width", 2);
            }
  
            g.append("text")
                .text(d => d)
                .attr("x", w)
                .attr("dx", ".5em")
                .style("dominant-baseline", "middle");
          });
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
