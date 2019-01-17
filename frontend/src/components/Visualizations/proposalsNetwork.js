import * as d3 from 'd3';

export default function() {
      // Size
  var margin = { top: 5, left: 5, bottom: 5, right: 5 },
      width = 800,
      height = 800,
      innerWidth = function() { return width - margin.left - margin.right; },
      innerHeight = function() { return height - margin.top - margin.bottom; },

      // Events
      event = d3.dispatch("highlightNode"),

      // Data
      data = [],
      network = {},

      // Layout
      force = d3.forceSimulation()
          .force("link", d3.forceLink())
          .on("tick", updateForce),

      // Appearance
      radiusRange = [4, 32],

      // Scales
      radiusScale = d3.scaleSqrt(),

      // Start with empty selections
      svg = d3.select(),

      // Event dispatcher
      dispatcher = d3.dispatch("highlightNode");

  // Create a closure containing the above variables
  function proposalNetwork(selection) {
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
          .attr("class", "proposalNetwork");

      var g = svgEnter.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Groups for layout
      var groups = ["network", "labels", "legend"];

      g.selectAll("g")
          .data(groups)
        .enter().append("g")
          .attr("class", function(d) { return d; });

      svg = svgEnter.merge(svg);

      draw();
    });
  }

  function processData() {
    // Filter any proposals without a TIC
    data = data.filter(function(d) {
      return d.tic_name;
    });

    // Filter identified test proposals
    var testProposals = [
      168, 200, 220, 189, 355, 390, 272, 338, 308, 309, 394, 286, 306, 401,
      390, 272, 306, 338, 200, 286, 220, 168, 401
    ];

    data = data.filter(function(d) {
      return testProposals.indexOf(+d.proposal_id) === -1;
    });

    // Flatten data
    // XXX: Do this in the query instead?
    data = data.reduce(function(p, c) {
      var id = c.proposal_id;
      var d = p[id];

      if (d) {
        // Update with any non-blank values
        d3.keys(c).forEach(function(key) {
          if (c[key] !== "") {
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
        tics = d3.map();

    data.forEach(function(d) {
      addNode(d, pis, d.pi_name, "pi");
      addNode(d, proposals, d.proposal_id, "proposal");
      addNode(d, orgs, d.org_name, "org");
      addNode(d, tics, d.tic_name, "tic");
    });

    // Now link
    var links = [];

    data.forEach(function(d) {
      var pi = pis.get(d.pi_name),
          proposal = proposals.get(d.proposal_id),
          org = orgs.get(d.org_name),
          tic = tics.get(d.tic_name);

      addLink(pi, proposal);
      addLink(proposal, org);
      addLink(proposal, tic);
    });

    var nodes = pis.values()
        .concat(proposals.values())
        .concat(orgs.values()
        .concat(tics.values()));

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
            node.name = d.id;
            break;

          case "proposal":
            // XXX: Name placeholder
            node.name = id;
            node.budget = d.anticipated_budget ? d.anticipated_budget : "NA";
            node.duration = d.funding_duration ? d.funding_duration : "NA";
            node.status = d.proposal_status ? d.proposal_status : "NA";
            node.protocolStatus = d.protocol_status ? +d.protocol_status : "NA";
            break;

          case "org":
            // XXX: Name placeholder
            node.name = id;
            break;

          case "tic":
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
          return d.links.length;
        })])
        .range(radiusRange);

    // Color scale
    var nodeColorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(network.nodeTypes);

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
/*
    // Tooltips
    $(".proposalNetwork .node").tooltip({
      container: "body",
      placement: "top",
      trigger: "manual",
      animation: false,
      html: true
    });
*/

    function drawNodes() {
      // Drag behavior, based on:
      // http://bl.ocks.org/mbostock/2675ff61ea5e063ede2b5d63c08020c7
      var dragNode = null;

      var drag = d3.drag()
          .on("start", function(d) {
            if (!d3.event.active) {
              force.alphaTarget(0.3).restart();
            }

            d.fx = d.x;
            d.fy = d.y;

            dragNode = d;

//            $(this).tooltip("show");
          })
          .on("drag", function(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;

//            $(this).tooltip("show");
          })
          .on("end", function(d) {
            if (!d3.event.active) {
              force.alphaTarget(0).alpha(1).restart();
            }

            d.fx = null;
            d.fy = null;

            dragNode = null;

            highlightNode();

//            $(this).tooltip("hide");
          });

      // Bind nodes
      var node = svg.select(".network").selectAll(".node")
          .data(network.nodes, function(d) {
            return d.id;
          });

      // Node enter
      var nodeEnter = node.enter().append("g")
          .attr("class", "node")
          .attr("data-toggle", "tooltip")
          .on("mouseover", function(d) {
            if (dragNode) return;

            highlightNode(d);

//            $(this).tooltip("show");
          })
          .on("mouseout", function(d) {
            if (dragNode) return;

            highlightNode();

//            $(this).tooltip("hide");
          })
          .call(drag);

      nodeEnter.append("circle");

      // Node update
      nodeEnter.merge(node)
          .attr("data-original-title", nodeLabel)
        .select("circle")
          .attr("r", nodeRadius);

      // Node exit
      node.exit().remove();

      highlightNode();

      function highlightNode(d) {
        if (d) {
          // Change link appearance
          svg.select(".network").selectAll(".link")
              .style("stroke", function(e) {
                return nodeLinkConnected(d, e) ? "#666" : "#eee";
              })
              .filter(function(e) {
                return nodeLinkConnected(d, e);
              }).raise();

          // Change node appearance
          svg.select(".network").selectAll(".node").select("circle")
              .style("fill", function(e) {
                return nodesConnected(d, e) ? nodeFill(e) : "white";
              })
              .style("stroke", function(e) {
                return nodesConnected(d, e) ? "black" : "#eee";
              })
              .filter(function(e) {
                return nodesConnected(d, e);
              }).raise();

          // Change label appearance
          svg.select(".labels").selectAll(".foreground")
              .style("fill", function(e) {
                return nodesConnected(d, e) ? "black" : "#ddd";
              })
              .filter(function(e) {
                return nodesConnected(d, e);
              }).raise();

          // Sort links
          svg.select(".network").selectAll(".link")
              .filter(function(e) {
                return nodeLinkConnected(d, e);
              }).raise();

          // Sort nodes
          svg.select(".network").selectAll(".node")
              .filter(function(e) {
                return nodesConnected(d, e);
              }).raise();

          function nodesConnected(n1, n2) {
            for (var i = 0; i < n1.proposals.length; i++) {
              if (n2.proposals.indexOf(n1.proposals[i]) !== -1) return true;
            }

            return false;
          }

          function nodeLinkConnected(n, l) {
            if (n.proposals.indexOf(l.source) !== -1) return true;
            if (n.proposals.indexOf(l.target) !== -1) return true;

            return false;
          }
        }
        else {
          // Reset
          svg.select(".network").selectAll(".link")
              .style("stroke", "#666");

          svg.select(".network").selectAll(".node").select("circle")
              .style("fill", nodeFill)
              .style("stroke", "black");

          svg.select(".labels").selectAll(".foreground")
              .style("fill", "black");

          svg.select(".network").selectAll(".node").raise();
        }
      }

      function nodeLabel(d) {
        switch (d.type) {
          case "pi":
            return "PI: " + d.name + "<br><br>" +
                   "Proposals: " + d.proposals.length;

          case "proposal":
            return "Proposal: " + d.name + "<br><br>" +
                   "Budget: " + d.budget + "<br>" +
                   "Duration: " + d.duration + "<br>" +
                   "Status: " + d.status;

          case "org":
            return "Organization: " + d.name + "<br><br>" +
                   "Proposals: " + d.proposals.length;

          case "tic":
            return "TIC: " + d.name + "<br><br>" +
                   "Proposals: " + d.proposals.length;

          default:
            console.log("Invalid type: " + d.type);
            return "";
        }
      }

      function nodeFill(d) {
        return nodeColorScale(d.type);
      }
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
          .style("pointer-events", "none");

      labelEnter.append("text")
          .attr("class", "background")
          .text(function(d) {
            return d.name;
          })
          .style("text-anchor", "middle")
          .style("font-size", "small")
          .style("font-weight", "bold")
          .style("dominant-baseline", "middle")
          .style("stroke", "white")
          .style("stroke-width", 3)
          .style("stroke-opacity", 0.5);

      labelEnter.append("text")
          .attr("class", "foreground")
          .text(function(d) {
            return d.name;
          })
          .style("text-anchor", "middle")
          .style("font-size", "small")
          .style("font-weight", "bold")
          .style("dominant-baseline", "middle")
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

  function nodeRadius(d) {
    return d.type === "proposal" ? radiusScale(1) : radiusScale(d.links.length);
  }

  // Getters/setters

  proposalNetwork.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return proposalNetwork;
  };

  proposalNetwork.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return proposalNetwork;
  };

  // For registering event callbacks
  proposalNetwork.on = function() {
    var value = dispatcher.on.apply(dispatcher, arguments);
    return value === dispatcher ? proposalNetwork : value;
  };

  return proposalNetwork;
}
