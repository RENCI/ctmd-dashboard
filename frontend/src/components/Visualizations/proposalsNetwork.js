import * as d3 from 'd3';
import d3Tip from 'd3-tip';

export default function() {
      // Size
  var margin = { top: 5, left: 5, bottom: 5, right: 5 },
      width = 800,
      height = 800,
      //innerWidth = function() { return width - margin.left - margin.right; },
      //innerHeight = function() { return height - margin.top - margin.bottom; },

      // Data
      data = [],
      network = {},
      selectedProposals = [],
      selectedNodes = [],

      // Layout
      force = d3.forceSimulation()
          .force("link", d3.forceLink())
          .on("tick", updateForce),

      // Appearance
      radiusRange = [0, 32],
      backgroundColor = "#e5e5e5",

      // Scales
      nodeColorScale = d3.scaleOrdinal(d3.schemeCategory10),
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
                       "Duration: " + d.duration + "<br>" +
                       "Status: " + d.status;

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

              default:
                console.log("Invalid type: " + d.type);
                return "";
            }
          }),

      // Event dispatcher
      dispatcher = d3.dispatch("highlightProposals", "selectProposals");

  // Create a closure containing the above variables
  function proposalsNetwork(selection) {
    selection.each(function(d) {
      // Save data
      data = d;

      // Process data
      processData();

      // Select the svg element, if it exists
      svg = d3.select(this).selectAll("svg")
          .data([data]);

      // Otherwise create the skeletal chart
      var svgEnter = svg.enter().append("svg")
          .attr("class", "proposalsNetwork")
          .on("click", function() {
            selectedNodes = [];
            dispatcher.call("selectProposals", this, null);
          });

      var g = svgEnter.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Groups for layout
      var groups = ["network", "labels", "legend"];

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

  function processData() {
    // Filter any proposals without a TIC
    data = data.filter(function(d) {
      return d.assignToInstitution;
    });

    // Filter identified test proposals
    var testProposals = [
      168, 200, 220, 189, 355, 390, 272, 338, 308, 309, 394, 286, 306, 401,
      390, 272, 306, 338, 200, 286, 220, 168, 401
    ];

    data = data.filter(function(d) {
      return testProposals.indexOf(+d.proposalID) === -1;
    });

    // Flatten data
    // XXX: Do this in the query instead?
    data = data.reduce(function(p, c) {
      var id = c.proposalID;
      var d = p[id];

      if (d) {
        // Update with any non-blank values
        d3.keys(c).forEach(function(key) {
          if (c[key]) {
            d[key] = c[key];
          }
        });
      }
      else {
        // Start with this version
        p[id] = c;
      }

      return p;
    }, {});

    data = d3.values(data);

    // First get all unique PIs, proposals, and orgs
    var pis = d3.map(),
        proposals = d3.map(),
        orgs = d3.map(),
        tics = d3.map(),
        areas = d3.map();

    data.forEach(function(d) {
      addNode(d, pis, d.piName, "pi");
      addNode(d, proposals, d.proposalID, "proposal");
      addNode(d, orgs, d.submitterInstitution, "org");
      addNode(d, tics, d.assignToInstitution, "tic");
      addNode(d, areas, d.therapeuticArea, "area");
    });

    // Now link
    var links = [];

    data.forEach(function(d) {
      var pi = pis.get(d.piName),
          proposal = proposals.get(d.proposalID),
          org = orgs.get(d.submitterInstitution),
          tic = tics.get(d.assignToInstitution),
          area = areas.get(d.therapeuticArea);

      addLink(pi, proposal);
      addLink(proposal, org);
      addLink(proposal, tic);
      addLink(proposal, area);
    });

    var nodes = pis.values()
        .concat(proposals.values())
        .concat(orgs.values())
        .concat(tics.values())
        .concat(areas.values());

    var nodeTypes = nodes.reduce(function(p, c) {
      if (p.indexOf(c.type) === -1) p.push(c.type);
      return p;
    }, []);

    network = {
      nodes: nodes,
      nodeTypes: nodeTypes,
      links: links
    };

    function addNode(d, map, id, type) {
      if (!map.has(id)) {
        var node = {
          type: type,
          id: id,
          proposals: [],
          links: []
        };

        switch (type) {
          case "pi":
            node.name = id;
            break;

          case "proposal":
            // XXX: Name placeholder
            node.name = d.ShortTitle;
            node.budget = d.totalBudget ? d.totalBudget : "NA";
            node.duration = d.fundingPeriod ? d.fundingPeriod : "NA";
            node.status = d.proposalStatus ? d.proposalStatus : "NA";
            node.protocolStatus = d.protocol_status ? +d.protocol_status : "NA";
            break;

          case "org":
            node.name = id;
            break;

          case "tic":
            node.name = id;
            break;

          case "area":
            node.name = id;
            break;

          default:
            console.log("Invalid type: " + type);
            return;
        };

        map.set(id, node);
      }
    }

    function addLink(node1, node2) {
      var link = {
        source: node1,
        target: node2,
        type: node1.type + "_" + node2.type
      };

      // Keep track of proposals for ease when highlighting
      if (node1.type === "proposal") {
        addProposal(node1, node1);
        addProposal(node2, node1);
      }
      else if (node2.type === "proposal") {
        addProposal(node1, node2);
        addProposal(node2, node2);
      }

      node1.links.push(link);
      node2.links.push(link);
      links.push(link);
    }

    function addProposal(node, proposal) {
      if (node.proposals.indexOf(proposal) === -1) node.proposals.push(proposal);
    }
  }

  function updateForce() {
    if (!network.nodes) return;

    // Arrange proposals around tics
    var r = radiusScale(1);

    network.nodes.filter(function(d) {
      return d.type === "proposal";
    }).forEach(function(d) {
      var tic = d.links.filter(function(d) {
        return d.type === "proposal_tic";
      })[0].target;

      var vx = d.x - tic.x,
          vy = d.y - tic.y,
          dist = Math.sqrt(vx * vx + vy * vy);

      vx /= dist;
      vy /= dist;

      var nr = tic.links.length * r / Math.PI;

      d.x = tic.x + vx * nr;
      d.y = tic.y + vy * nr;
    });

    svg.select(".network").selectAll(".node")
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        });

    svg.select(".network").selectAll(".link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    svg.select(".labels").selectAll(".ticLabel")
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
  }

  function draw() {
    // Set width and height
    svg.attr("width", width)
        .attr("height", height);

    var manyBodyStrength = -0.02 / network.nodes.length * width * height;

    radiusScale
        .domain([0, d3.max(network.nodes, function(d) {
          return d.proposals.length;
        })])
        .range(radiusRange);

    // Color scale
    nodeColorScale.domain(network.nodeTypes);

    // Set force directed network
    force
        .nodes(network.nodes)
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("manyBody", d3.forceManyBody().strength(manyBodyStrength))
        .force("collide", d3.forceCollide().radius(nodeRadius))
        .force("x", d3.forceX(width / 2))
        .force("y", d3.forceY(height / 2))
        .force("link").links(network.links);

    force
        .alpha(1)
        .restart();

    // Draw the visualization
    drawLinks();
    drawNodes();
    drawLabels();
    drawLegend();

    function drawNodes() {
      // Drag behavior, based on:
      // http://bl.ocks.org/mbostock/2675ff61ea5e063ede2b5d63c08020c7
      var dragNode = null;

      var drag = d3.drag()
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

              highlightProposals();
            }
            else {
              // Click
              isNodeSelected(d) ? deselectNode(d) : selectNode(d);

              var ids = d.proposals.map(function(d) { return d.id; });

              dispatcher.call("selectProposals", this, ids);

              tip.hide();
              tip.show(d, this);
            }
          });

      // Bind nodes
      var node = svg.select(".network").selectAll(".node")
          .data(network.nodes, function(d) {
            return d.id;
          });

      // Node enter
      var nodeEnter = node.enter().append("g")
          .attr("class", "node")
          .on("mouseover", function(d) {
            if (dragNode) return;

            tip.show(d, this);

            var ids = d.proposals.map(function(d) { return d.id; });

            dispatcher.call("highlightProposals", this, ids);
          })
          .on("mouseout", function() {
            if (dragNode) return;

            tip.hide();

            dispatcher.call("highlightProposals", this, null);
          })
          .call(drag);

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

      // Node exit
      node.exit().remove();

      highlightProposals();
    }

    function selectNode(d) {
      let i = selectedNodesIndexOf(d);

      if (i === -1) selectedNodes.push({
        type: d.type,
        id: d.id
      });
    }

    function deselectNode(d) {
      let i = selectedNodesIndexOf(d);

      if (i !== -1) selectedNodes.splice(i, 1);
    }

    function drawLinks() {
      // Bind data for links
      var link = svg.select(".network").selectAll(".link")
          .data(network.links);

      // Link enter
      link.enter().append("line")
          .attr("class", "link")
          .style("fill", "none");

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
      let types = network.nodeTypes;

      var r = radiusScale(1);

      var yScale = d3.scaleBand()
          .domain(types)
          .range([r + 1, (r * 2.5) * (types.length + 1)]);

      // Bind node type data
      var node = svg.select(".legend")
          .attr("transform", "translate(" + (r + 1) + ",0)")
      .selectAll(".legendNode")
          .data(types);

      // Enter
      var nodeEnter = node.enter().append("g")
          .attr("class", "legendNode")
          .attr("transform", function(d) {
            return "translate(0," + yScale(d) + ")";
          });

      nodeEnter.append("circle")
          .attr("r", r)
          .style("fill", function(d) {
            return nodeColorScale(d);
          })
          .style("stroke", "black");

      nodeEnter.append("text")
          .text(function(d) { return d; })
          .attr("x", r * 1.5)
          .style("font-size", "small")
          .style("dominant-baseline", "middle");

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

  function selectedNodesIndexOf(d) {
    for (let i = 0; i < selectedNodes.length; i++) {
      let node = selectedNodes[i];
      if (node.type === d.type && node.id === d.id) return i;
    }

    return -1;
  }

  function selectionOverlap(d) {
    return d.proposals.reduce(function(p, c) {
      if (selectedProposals.indexOf(c.id) !== -1) p++;
      return p;
    }, 0);
  }

  function isNodeSelected(d) {
    return selectedNodesIndexOf(d) !== -1;
  }

  function highlightProposals(proposals) {
    if (!proposals) proposals = [];

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

      link.transition()
          .style("stroke", function(d) {
            return linkConnected(d) ? "#666" : outlineFaded;
          })

      link.filter(function(d) {
        return linkConnected(d);
      }).raise();

      // Change node appearance
      const node = svg.select(".network").selectAll(".node")
          .style("pointer-events", function(d) {
            return active(d) ? null : "none";
          });

      node.select(".background").transition()
          .style("fill", function(d) {
            const scale = d3.scaleLinear()
                .domain([0, 1])
                .range([backgroundColor, nodeFill(d)]);

            return nodeConnected(d) ? scale(0.5) : scale(0.1);
          });

      node.select(".foreground").transition()
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
      svg.select(".labels").selectAll(".foreground").transition()
          .style("fill", function(d) {
            return nodeConnected(d) ? "black" : "#ddd";
          });

      function overlap(d) {
        return d.proposals.reduce(function(p, c) {
          if (proposals.indexOf(c.id) !== -1) p++;
          return p;
        }, 0);
      }

      function nodeConnected(d) {
        for (var i = 0; i < d.proposals.length; i++) {
          if (proposals.indexOf(d.proposals[i].id) !== -1) return true;
        }

        return false;
      }

      function linkConnected(d) {
        return nodeConnected(d.source) && nodeConnected(d.target);
      }
    }
    else {
      // Reset
      svg.select(".network").selectAll(".link").transition()
          .style("stroke", "#666");

      const node = svg.select(".network").selectAll(".node");

      node.select(".foreground").transition()
          .attr("r", nodeRadius);

      node.select(".border")
          .style("stroke", "black")
          .style("stroke-width", 1)

      svg.select(".labels").selectAll(".foreground").transition()
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

  proposalsNetwork.highlightProposals = function(_) {
    highlightProposals(_);
    return proposalsNetwork;
  };

  proposalsNetwork.selectProposals = function(_) {
    selectedProposals = _.length ? _ : [];
    highlightProposals();
    return proposalsNetwork;
  };

  // For registering event callbacks
  proposalsNetwork.on = function() {
    var value = dispatcher.on.apply(dispatcher, arguments);
    return value === dispatcher ? proposalsNetwork : value;
  };

  return proposalsNetwork;
}
