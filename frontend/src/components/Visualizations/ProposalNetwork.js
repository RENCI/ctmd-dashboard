/*=========================================================================
 Name:        d3.proposalNetwork.js
 Author:      David Borland, The Renaissance Computing Institute (RENCI)
 Copyright:   The Renaissance Computing Institute (RENCI)
 Description: Proposal network visualization for Duke TIC
 =========================================================================*/

(function() {
  d3.proposalNetwork = function() {
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
        network = [],

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

        g = svgEnter.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Groups for layout
        var groups = ["network"];

        g.selectAll("g")
            .data(groups)
          .enter().append("g")
            .attr("class", function(d) { return d; });

        svg = svgEnter.merge(svg);

        draw();
      });
    }

    function processData() {
      console.log(data);

      var ticNames = d3.scaleOrdinal()
          .domain([-1, 1, 2, 3, 4])
          .range(["NA", "Duke/VUMC", "Utah", "JHU/Tufts", "VUMC"]);

      // First get all unique PIs, proposals, and orgs
      var pis = d3.map(),
          proposals = d3.map(),
          orgs = d3.map(),
          tics = d3.map();

      data.forEach(function(d) {
        addNode(d, pis, pi_id(d), "pi");
        addNode(d, proposals, d.proposal_id, "proposal");
        addNode(d, orgs, d.org_name, "org");
        addNode(d, tics, tic_id(d), "tic");
      });

      // Now link
      var links = [];

      data.forEach(function(d) {
        var pi = pis.get(pi_id(d)),
            proposal = proposals.get(d.proposal_id),
            org = orgs.get(d.org_name),
            tic = tics.get(tic_id(d));

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

      function tic_id(d) {
        return d.tic_ric_assign_v2 === "" ? -1 : +d.tic_ric_assign_v2;
      }

      function pi_id(d) {
        return d.pi_firstname + "_" + d.pi_lastname;
      }

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
              node.firsName = d.pi_firstname;
              node.lastName = d.pi_lastname;
              node.name = d.pi_lastname + ", " + d.pi_firstname;
              break;

            case "proposal":
              // XXX: Name placeholder
              node.name = id;
              node.budget = d.anticipated_budget.length > 0 ? d.anticipated_budget : "NA";
              node.duration = d.funding_duration.length > 0 ? d.funding_duration : "NA";
              node.status = d.protocol_status.length > 0 ? +d.protocol_status : "NA";
              break;

            case "org":
              // XXX: Name placeholder
              node.name = id;
              break;

            case "tic":
              // XXX: Name placeholder
              node.name = ticNames(id);
              break;
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
      svg.select(".network").selectAll(".node")
          .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
          });

      svg.select(".network").selectAll(".link")
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
    }

    function draw() {
      // Set width and height
      svg .attr("width", width)
          .attr("height", height);

      var manyBodyStrength = -0.02 / network.nodes.length * width * height;

      radiusScale
          .domain([0, d3.max(network.nodes, function(d) {
            return d.links.length;
          })])
          .range(radiusRange);

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

      // Tooltips
      $(".proposalNetwork .node").tooltip({
        container: "body",
        placement: "top",
        trigger: "manual",
        animation: false,
        html: true
      });

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
            })
            .on("drag", function(d) {
              d.fx = d3.event.x;
              d.fy = d3.event.y;

              $(this).tooltip("show");
            })
            .on("end", function(d) {
              if (!d3.event.active) {
                force.alphaTarget(0).alpha(1).restart();
              }

              d.fx = null;
              d.fy = null;

              dragNode = null;

              highlightNode();

              $(this).tooltip("hide");
            });

        // Color scale
        var nodeColorScale = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(network.nodeTypes);

        // Bind nodes
        var node = svg.select(".network").selectAll(".node")
            .data(network.nodes);

        // Node enter
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("data-toggle", "tooltip")
            .on("mouseover", function(d) {
              if (dragNode) return;

              highlightNode(d);

              $(this).tooltip("show");
            })
            .on("mouseout", function(d) {
              if (dragNode) return;

              highlightNode();

              $(this).tooltip("hide");
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
            svg.select(".network").selectAll(".link")
                .style("stroke", "#666");

            svg.select(".network").selectAll(".node").select("circle")
                .style("fill", nodeFill)
                .style("stroke", "black");

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
        var linkEnter = link.enter().append("line")
            .attr("class", "link")
            .style("fill", "none");

        // Link exit
        link.exit().remove();
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
  };
})();