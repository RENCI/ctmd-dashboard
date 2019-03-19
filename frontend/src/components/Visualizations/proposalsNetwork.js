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
      allNodes = [],
      nodeTypes = [],
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
                      "Date submitted: " + d.dateSubmitted + "<br>" +
                      "Meeting date: " + d.meetingDate + "<br>" +
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

              case "status":
                return "Status: " + d.name + "<br><br>" +
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
        areas = d3.map(),
        statuses = d3.map();

    data.forEach(function(d) {
      const proposal = addNode(d, proposals, d.proposalID, "proposal");

      addNode(d, pis, d.piName, "pi", proposal);
      addNode(d, orgs, d.submitterInstitution, "org", proposal);
      addNode(d, tics, d.assignToInstitution, "tic", proposal);
      addNode(d, areas, d.therapeuticArea, "area", proposal);
      addNode(d, statuses, d.proposalStatus, "status", proposal);
    });

    allNodes = pis.values()
        .concat(proposals.values())
        .concat(orgs.values())
        .concat(tics.values())
        .concat(areas.values())
        .concat(statuses.values());

    nodeTypes = allNodes.reduce((p, c) => {
      if (p.indexOf(c.type) === -1) p.push(c.type);
      return p;
    }, []).map(d => {
      return { type: d, show: true }
    });

    allNodes = allNodes.sort(function(a, b) {
      return d3.descending(a.proposals.length, b.proposals.length);
    });

    linkNodes();

    function addNode(d, map, id, type, proposal) {
      if (!map.has(id)) {
        // Create node
        const node = {
          type: type,
          id: id
        };

        switch (type) {
          case "proposal":
            node.name = d.shortTitle;
            node.budget = d.totalBudget ? d.totalBudget : "NA";
            node.dateSubmitted = d.dateSubmitted ? d.dateSubmitted : "NA";
            node.meetingDate = d.meetingDate ? d.meetingDate : "NA";
            node.duration = d.fundingPeriod ? d.fundingPeriod : "NA";
            node.status = d.proposalStatus ? d.proposalStatus : "NA";
            node.protocolStatus = d.protocol_status ? +d.protocol_status : "NA";
            node.proposals = [node];
            node.nodes = [];
            break;

          case "pi":
          case "org":
          case "tic":
          case "area":
          case "status":
            node.name = id;
            node.proposals = [proposal];
            proposal.nodes.push(node);
            break;

          default:
            console.log("Invalid type: " + type);
            return null;
        };

        map.set(id, node);

        return node;
      }
      else {
        if (type === "proposal") return null;

        // Link nodes to proposals
        const node = map.get(id);
        node.proposals.push(proposal);
        proposal.nodes.push(node);

        return node;
      }
    }
  }

  function linkNodes() {
    // Get active nodes
    const activeTypes = nodeTypes.filter(d => d.show).map(d => d.type);
    const nodes = allNodes.filter(d => activeTypes.indexOf(d.type) !== -1);

    // Now link
    const proposals = allNodes.filter(d => d.type === "proposal");
    let links = [];

    proposals.forEach(proposal => {
      const nodes = activeTypes.filter(d => d !== "proposal").map(type => {
        return proposal.nodes.filter(d => d.type === type)[0];
      });

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
/*
    // Arrange proposals around tics
    var r = 5;

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
*/
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
        .domain([0, d3.max(allNodes, function(d) {
          return d.proposals.length;
        })])
        .range(radiusRange);

    // Color scale
    nodeColorScale.domain(nodeTypes.map(d => d.type));

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
      const maxLink = d3.max(network.links, d => d.value);

      const widthScale = d3.scaleLinear()
          .domain([1, maxLink])
          .range([1, 30]);

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
          .domain(nodeTypes.map(d => d.type))
          .range([r + 1, (r * 2.5) * (nodeTypes.length + 1)]);

      // Bind node type data
      var node = svg.select(".legend")
          .attr("transform", "translate(" + (r + 1) + ",0)")
      .selectAll(".legendNode")
          .data(nodeTypes);

      // Enter
      var nodeEnter = node.enter().append("g")
          .attr("class", "legendNode")
          .attr("transform", d => "translate(0," + yScale(d.type) + ")")
          .style("pointer-events", "all")
          .on("mouseover", function(d) {
            const node = d3.select(this);

            node.select("circle")
                .style("fill", d.show ? "none" : nodeColorScale(d.type));

            node.select("text")
                .style("fill", "black");
          })
          .on("mouseout", function(d) {
            const node = d3.select(this);

            node.select("circle")
                .style("fill", d.show ? nodeColorScale(d.type) : "none");

            node.select("text")
                .style("fill", d.show ? "#666" : "#ccc");
          })
          .on("click", function(d) {
            // Keep at least 2 active
            if (d.show && nodeTypes.filter(d => d.show).length <= 2) return;

            d.show = !d.show;

            d3.select(this).select("circle")
                .style("fill", d.show ? "none" : nodeColorScale(d.type));

            linkNodes();
            draw();
          });

      nodeEnter.append("circle")
          .attr("r", r)
          .style("fill", d => nodeColorScale(d.type))
          .style("stroke", d => nodeColorScale(d.type))
          .style("stroke-width", 2);

      nodeEnter.append("text")
          .text(d => d.type)
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
