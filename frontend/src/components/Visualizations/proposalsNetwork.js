import * as d3 from 'd3';
import d3Tip from 'd3-tip';

export default function() {
      // Size
  var margin = { top: 5, left: 5, bottom: 5, right: 5 },
      width = 800,
      height = 800,
      innerWidth = function() { return width - margin.left - margin.right; },
      innerHeight = function() { return height - margin.top - margin.bottom; },

      // Data
      allNodes = [],
      nodeTypes = [],
      network = {},
      selectedProposals = [],
      selectedNodes = [],
      typeActive = {},

      // Layout
      force = d3.forceSimulation()
          .force("link", d3.forceLink())
          .on("tick", updateForce),

      // Appearance
      radiusRange = [0, 32],
      backgroundColor = "#e5e5e5",

      // Scales
      colors = d3.schemeCategory10,
      nodeColorScale = d3.scaleOrdinal(),
      radiusScale = d3.scaleSqrt(),

      // Start with empty selections
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
          .html(function(d) {
            switch (d.type) {
              case "pi":
                return "PI: " + d.name + "<br><br>" +
                       "Proposals: " + d.proposals.length +
                       (selectedNodes.length > 0 ?
                       "<br>Selected proposals: " + selectionOverlap(d) : "");

              case "proposal":
                return "Proposal: " + d.name + "<br><br>" +
                       "Budget: " + d.budget + "<br>" +
                       "Date submitted: " + d.dateSubmitted + "<br>" +
                       "Meeting date: " + d.meetingDate + "<br>" +
                       "Duration: " + d.duration + "<br>";

              case "org":
                return "Organization: " + d.name + "<br><br>" +
                       "Proposals: " + d.proposals.length +
                       (selectedNodes.length > 0 ?
                       "<br>Selected proposals: " + selectionOverlap(d) : "");

              case "tic":
                return "TIC: " + d.name + "<br><br>" +
                       "Proposals: " + d.proposals.length +
                       (selectedNodes.length > 0 ?
                       "<br>Selected proposals: " + selectionOverlap(d) : "");

              case "area":
                return "Therapeutic area: " + d.name + "<br><br>" +
                       "Proposals: " + d.proposals.length +
                       (selectedNodes.length > 0 ?
                       "<br>Selected proposals: " + selectionOverlap(d) : "");

              case "status":
                return "Status: " + d.name + "<br><br>" +
                       "Proposals: " + d.proposals.length +
                       (selectedNodes.length > 0 ?
                       "<br>Selected proposals: " + selectionOverlap(d) : "");

              case "resource":
                return "Resource requested: " + d.name + "<br><br>" +
                       "Proposals: " + d.proposals.length +
                       (selectedNodes.length > 0 ?
                       "<br>Selected proposals: " + selectionOverlap(d) : "");

              default:
                console.log("Invalid type: " + d.type);
                return "";
            }
          }),

      // Event dispatcher
      dispatcher = d3.dispatch("highlightNodes", "selectNodes", "deselectNodes");

  // Create a closure containing the above variables
  function proposalsNetwork(selection) {
    selection.each(function(d) {
      // Save data
      allNodes = d.nodes;
      nodeTypes = d.nodeTypes;

      // Link nodes
      linkNodes();

      // Select the svg element, if it exists
      svg = d3.select(this).selectAll("svg")
          .data([allNodes]);

      // Otherwise create the skeletal chart
      var svgEnter = svg.enter().append("svg")
          .attr("class", "proposalsNetwork")
          .on("click", function() {
            selectedNodes = [];
            dispatcher.call("selectNodes", this, null);
          });

      svgEnter.append("g").attr("class", "legend");

      var g = svgEnter.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Groups for layout
      var groups = ["network", "labels"];

      g.selectAll("g")
          .data(groups)
        .enter().append("g")
          .attr("class", function(d) { return d; });

      svg = svgEnter.merge(svg);

      // Tooltips
      svg.call(tip);

      draw();
    });
  }

  function linkNodes() {
    if (d3.values(typeActive).length !== nodeTypes.length){
      typeActive = {};
      nodeTypes.forEach((d, i) => {
        typeActive[d] = i < 2;
      });
    }

    // Get active nodes
    const activeTypes = nodeTypes.filter(d => typeActive[d]);
    const nodes = allNodes.filter(d => activeTypes.indexOf(d.type) !== -1);

    // Now link
    const proposals = allNodes.filter(d => d.type === "proposal");
    let links = [];

    proposals.forEach(proposal => {
      const nodes = activeTypes.filter(d => d !== "proposal").reduce((p, c) => {
        return p.concat(proposal.nodes.filter(d => d.type === c));
      }, []);

      if (activeTypes.indexOf("proposal") !== -1) {
        nodes.forEach(d => {
          addLink(proposal, d, proposal);
        });
      }
      else {
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            addLink(nodes[i], nodes[j], proposal);
          }
        }
      }
    });

    links = links.sort(function(a, b) {
      return d3.ascending(a.value, b.value);
    });

    network = {
      nodes: nodes,
      links: links
    };

    function addLink(node1, node2, proposal) {
      // Get link if already created
      let link = links.filter(function(d) {
        return d.source === node1 && d.target === node2;
      });

      if (link.length > 0) {
        link = link[0];
        link.proposals.push(proposal)
        link.value++;
      }
      else {
        link = {
          source: node1,
          target: node2,
          proposals: [proposal],
          value: 1,
          type: node1.type + "_" + node2.type
        };

        links.push(link);
      }
    }
  }

  function updateForce() {
    if (!network.nodes) return;

    if (typeActive["tic"]) {
      // Arrange proposals around tics
      const r = 5;

      network.nodes.filter(function(d) {
        return d.type === "proposal";
      }).forEach(d => {
        const tic = d.nodes.reduce((p, c) => {
          return c.type === "tic" ? c : p;
        }, null);

        let vx = d.x - tic.x,
            vy = d.y - tic.y;

        const dist = Math.sqrt(vx * vx + vy * vy);

        vx /= dist;
        vy /= dist;

        const nr = tic.proposals.length * r / Math.PI;

        d.x = tic.x + vx * nr;
        d.y = tic.y + vy * nr;
      });
    }

    // Scale to fit svg
    const r = innerWidth() / 2;
    const maxDist = d3.max(network.nodes, d => {
      const x = d.x - r,
            y = d.y - r;
      return Math.sqrt(x * x + y * y);
    });
    const scale = r / maxDist;

    network.nodes.forEach(d => {
      d.sx = (d.x - r) * scale + r;
      d.sy = (d.y - r) * scale + r;
    });

    // Update the visualization
    svg.select(".network").selectAll(".node")
        .attr("transform", function(d) {
          return "translate(" + d.sx + "," + d.sy + ")";
        });

    svg.select(".network").selectAll(".link")
        .attr("x1", function(d) { return d.source.sx; })
        .attr("y1", function(d) { return d.source.sy; })
        .attr("x2", function(d) { return d.target.sx; })
        .attr("y2", function(d) { return d.target.sy; });

    svg.select(".labels").selectAll(".ticLabel")
        .attr("transform", function(d) {
          return "translate(" + d.sx + "," + d.sy + ")";
        });
  }

  function draw() {
    // Set width and height
    svg.attr("width", width)
        .attr("height", height);

    const k = Math.sqrt(network.nodes.length / (innerWidth() * innerHeight()));

    radiusScale
        .domain([0, d3.max(allNodes, function(d) {
          return d.proposals.length;
        })])
        .range(radiusRange);

    // Color scale
    nodeColorScale
        .domain(nodeTypes)
        .range(colors);

    // Set force directed network
    force
        .nodes(network.nodes)
        .force("center", d3.forceCenter(innerWidth() / 2, innerHeight() / 2))
        .force("manyBody", d3.forceManyBody().strength(-0.5 / k))
        .force("collide", d3.forceCollide().radius(nodeRadius))
        .force("x", d3.forceX(innerWidth() / 2).strength(0.1))
        .force("y", d3.forceY(innerHeight() / 2).strength(0.1))
        .force("link").links(network.links);

    force
        .alpha(1)
        .restart();

    // Draw the visualization
    drawLinks();
    drawNodes();
    drawLabels();
    drawLegend();

    highlightNodes();

    function drawNodes() {
      // Drag behavior, based on:
      // http://bl.ocks.org/mbostock/2675ff61ea5e063ede2b5d63c08020c7
      let dragNode = null;

      const drag = d3.drag()
          .on("drag", function(d) {
            if (!dragNode) {
              dragNode = d;

              force.alphaTarget(0.3).restart();
            }

            d.fx = d3.event.x;
            d.fy = d3.event.y;

            tip.show(d, this);
          })
          .on("end", function(d) {
            if (dragNode) {
              force.alphaTarget(0).alpha(1).restart();

              d.fx = null;
              d.fy = null;

              dragNode = null;

              highlightNodes();
            }
            else {
              // Click
              isNodeSelected(d) ?
                  dispatcher.call("deselectNodes", this, [d]) :
                  dispatcher.call("selectNodes", this, [d]);

              tip.hide();
              tip.show(d, this);
            }
          });

      // Bind nodes
      const node = svg.select(".network").selectAll(".node")
          .data(network.nodes, d => d.id);

      // Node enter
      const nodeEnter = node.enter().append("g")
          .attr("class", "node");

      nodeEnter.append("circle")
          .attr("class", "background")
          .attr("r", nodeRadius);

      nodeEnter.append("circle")
          .attr("class", "foreground")
          .attr("r", nodeRadius)
          .style("fill", nodeFill);

      nodeEnter.append("circle")
          .attr("class", "border")
          .attr("r", nodeRadius)
          .style("fill", "none");

      // Node update
      nodeEnter.merge(node)
          .on("mouseover", function(d) {
            if (dragNode) return;

            tip.show(d, this);
            dispatcher.call("highlightNodes", this, [d]);
          })
          .on("mouseout", function() {
            if (dragNode) return;

            tip.hide();
            dispatcher.call("highlightNodes", this, null);
          })
          .call(drag);

      // Node exit
      node.exit().remove();
    }

    function drawLinks() {
      const maxLink = d3.max(network.links, d => d.value);

      const widthScale = d3.scaleLinear()
          .domain([1, maxLink])
          .range([1, radiusRange[0]]);

      // Bind data for links
      var link = svg.select(".network").selectAll(".link")
          .data(network.links);

      // Link enter + update
      link.enter().append("line")
          .attr("class", "link")
          .style("fill", "none")
          .style("stroke-opacity", 0.8)
        .merge(link)
          .style("stroke-width", d => widthScale(d.value));

      // Link exit
      link.exit().remove();
    }

    function drawLabels() {
      // Bind TIC data
      var label = svg.select(".labels").selectAll(".ticLabel")
          .data(network.nodes.filter(function(d) {
            return d.type === "tic";
          }), function(d) {
            return d.id;
          });

      // Label enter
      var labelEnter = label.enter().append("g")
          .attr("class", "ticLabel")
          .style("text-anchor", "middle")
          .style("font-size", "small")
          .style("font-weight", "bold")
          .style("dominant-baseline", "middle")
          .style("pointer-events", "none");

      labelEnter.append("text")
          .attr("class", "background")
          .text(function(d) {
            return d.name;
          })
          .style("stroke", "white")
          .style("stroke-width", 3)
          .style("stroke-opacity", 0.5);

      labelEnter.append("text")
          .attr("class", "foreground")
          .text(function(d) {
            return d.name;
          })
          .style("fill", "black");

      // Label exit
      label.exit().remove();
    }

    function drawLegend() {
      var r = 5;

      var yScale = d3.scaleBand()
          .domain(nodeTypes)
          .range([r + 1, (r * 2.5) * (nodeTypes.length + 1)]);

      // Bind node type data
      var node = svg.select(".legend")
          .attr("transform", "translate(" + (r + 1) + ",0)")
      .selectAll(".legendNode")
          .data(nodeTypes);

      // Enter
      var nodeEnter = node.enter().append("g")
          .attr("class", "legendNode")
          .attr("transform", d => "translate(0," + yScale(d) + ")")
          .style("pointer-events", "all")
          .on("mouseover", function(d) {
            const node = d3.select(this);

            node.select("circle")
                .style("fill", typeActive[d] ? "none" : nodeColorScale(d));

            node.select("text")
                .style("fill", "black");
          })
          .on("mouseout", function(d) {
            const node = d3.select(this);

            node.select("circle")
                .style("fill", typeActive[d] ? nodeColorScale(d) : "none");

            node.select("text")
                .style("fill", typeActive[d] ? "#666" : "#ccc");
          })
          .on("click", function(d) {
            // Keep at least 2 active
            if (typeActive[d] && d3.values(typeActive).filter(d => d).length <= 2) return;

            typeActive[d] = !typeActive[d];

            d3.select(this).select("circle")
                .style("fill", typeActive[d] ? "none" : nodeColorScale(d));

            linkNodes();
            draw();
          });

      nodeEnter.append("circle")
          .attr("r", r)
          .style("fill", d => typeActive[d] ? nodeColorScale(d) : "none")
          .style("stroke", d => nodeColorScale(d))
          .style("stroke-width", 2);

      nodeEnter.append("text")
          .text(d => d)
          .attr("x", r * 1.5)
          .attr("dy", ".35em")
          .style("fill", "#666")
          .style("font-size", "small");

      // Node exit
      node.exit().remove();
    }
  }

  function nodeFill(d) {
    return nodeColorScale(d.type);
  }

  function nodeRadius(d) {
    return radiusScale(d.proposals.length);
  }

  function active(d) {
    return selectedProposals.length === 0 || selectionOverlap(d) > 0;
  }

  function selectionOverlap(d) {
    return d.proposals.reduce(function(p, c) {
      if (selectedProposals.indexOf(c) !== -1) p++;
      return p;
    }, 0);
  }

  function isNodeSelected(d) {
    return selectedNodes.indexOf(d) !== -1;
  }

  function highlightNodes(nodes) {
    function nodeProposals(d) {
      if (d.length === 0) return [];

      return d[0].proposals.filter(proposal => {
        for (let i = 1; i < d.length; i++) {
          if (d[i].proposals.indexOf(proposal) === -1) return false;
        }
        return true;
      });
    }

    selectedProposals = nodeProposals(selectedNodes);
    let proposals = !nodes ? [] : nodeProposals(nodes);

    if (selectedProposals.length > 0 && proposals.length > 0) {
      proposals = selectedProposals.filter(function(proposal) {
        return proposals.indexOf(proposal) !== -1;
      });

      if (proposals.length === 0) proposals = selectedProposals;
    }
    else {
      proposals = selectedProposals.concat(proposals);
    }

    if (proposals.length > 0) {
      const outlineFaded = d3.color(backgroundColor).darker(0.1);

      // Change link appearance
      const link = svg.select(".network").selectAll(".link");

      link//.transition()
          .style("stroke", function(d) {
            return linkConnected(d) ? "#666" : outlineFaded;
          });

      link.filter(function(d) {
        return linkConnected(d);
      }).raise();

      // Change node appearance
      const node = svg.select(".network").selectAll(".node")
          .style("pointer-events", function(d) {
            return active(d) ? null : "none";
          });

      node.select(".background")//.transition()
          .style("fill", function(d) {
            const scale = d3.scaleLinear()
                .domain([0, 1])
                .range([backgroundColor, nodeFill(d)]);

            return nodeConnected(d) ? scale(0.5) : scale(0.1);
          });

      node.select(".foreground")//.transition()
          .attr("r", function(d) {
            return radiusScale(overlap(d));
          });

      node.select(".border")
          .style("stroke", function(d) {
            return nodeConnected(d) ? "black" : outlineFaded;
          })
          .style("stroke-width", function(d) {
            return isNodeSelected(d) ? 3 : 1;
          });

      node.filter(function(d) {
        return nodeConnected(d);
      }).raise();

      // Change label appearance
      svg.select(".labels").selectAll(".foreground")//.transition()
          .style("fill", function(d) {
            return nodeConnected(d) ? "black" : "#ddd";
          });

      function overlap(d) {
        return d.proposals.reduce(function(p, c) {
          if (proposals.indexOf(c) !== -1) p++;
          return p;
        }, 0);
      }

      function nodeConnected(d) {
        for (var i = 0; i < d.proposals.length; i++) {
          if (proposals.indexOf(d.proposals[i]) !== -1) return true;
        }

        return false;
      }

      function linkConnected(d) {
        return nodeConnected(d.source) && nodeConnected(d.target);
      }
    }
    else {
      // Reset
      svg.select(".network").selectAll(".link")//.transition()
          .style("stroke", "#666");

      const node = svg.select(".network").selectAll(".node");

      node.select(".foreground")//.transition()
          .attr("r", nodeRadius);

      node.select(".border")
          .style("stroke", "black")
          .style("stroke-width", 1)

      svg.select(".labels").selectAll(".foreground")//.transition()
          .style("fill", "black");

      svg.select(".network").selectAll(".node").raise();
    }
  }

  // Getters/setters

  proposalsNetwork.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return proposalsNetwork;
  };

  proposalsNetwork.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return proposalsNetwork;
  };

  proposalsNetwork.colors = function(_) {
    if (!arguments.length) return colors;
    colors = _;
    return proposalsNetwork;
  };

  proposalsNetwork.highlightNodes = function(_) {
    highlightNodes(_);
    return proposalsNetwork;
  };

  proposalsNetwork.selectNodes = function(_) {
    selectedNodes = _.length ? _ : [];
    highlightNodes();
    return proposalsNetwork;
  };

  // For registering event callbacks
  proposalsNetwork.on = function() {
    var value = dispatcher.on.apply(dispatcher, arguments);
    return value === dispatcher ? proposalsNetwork : value;
  };

  return proposalsNetwork;
}
