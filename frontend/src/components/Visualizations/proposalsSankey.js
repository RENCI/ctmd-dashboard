import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';
import d3Tip from 'd3-tip';

export default function() {
      // Size
  var margin = { top: 5, left: 10, bottom: 5, right: 150 },
      width = 800,
      height = 800,
      innerWidth = function() { return width - margin.left - margin.right; },
      innerHeight = function() { return height - margin.top - margin.bottom; },

      // Data
      data = [],
      network = {},
      selectedProposals = [],

      // Scales
      linkOpacityScale = d3.scaleLinear(),

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
          .style("pointer-events", "noe")
          .html(function(d) {
            if (d.source) {
              // Link
              return d.source.name + "→" + d.target.name + "<br><br>" +
                     "Proposals: " + d.proposals.length;
            }
            else {
              // Node
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

                case "area":
                  return "Therapeutic area: " + d.name + "<br><br>" +
                         "Proposals: " + d.proposals.length;

                case "status":
                  return "Status: " + d.name + "<br><br>" +
                         "Proposals: " + d.proposals.length;

                default:
                  console.log("Invalid type: " + d.type);
                  return "";
              }
            }
          }),

      // Event dispatcher
      dispatcher = d3.dispatch("highlightProposals", "selectProposals");

  // Create a closure containing the above variables
  function proposalsSankey(selection) {
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
          .attr("class", "proposalsSankey")
          .on("click", function() {
            dispatcher.call("selectProposals", this, null);
          });

      var g = svgEnter.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Groups for layout
      var groups = ["links", "nodes", "labels"];

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
      addNode(d, pis, d.pi_name, "pi");
      addNode(d, proposals, d.proposal_id, "proposal");
      addNode(d, orgs, d.org_name, "org");
      addNode(d, tics, d.tic_name, "tic");
      addNode(d, areas, d.therapeutic_area, "area");
      addNode(d, statuses, d.proposal_status, "status");
    });

    // Now link
    var links = [];

    data.forEach(function(d) {
      var pi = pis.get(d.pi_name),
          proposal = proposals.get(d.proposal_id),
          org = orgs.get(d.org_name),
          tic = tics.get(d.tic_name),
          area = areas.get(d.therapeutic_area),
          status = statuses.get(d.proposal_status);

      var order = [
        tic, area, org, status, pi, proposal
      ];

      d3.pairs(order).forEach(function(d) {
        addLink(d[0], d[1], proposal);
      });

      // Add proposal to final node
      order[order.length - 1].proposals.push(proposal);
    });

    var nodes = pis.values()
        .concat(proposals.values())
        .concat(orgs.values())
        .concat(tics.values())
        .concat(areas.values())
        .concat(statuses.values());

    var nodeTypes = nodes.reduce(function(p, c) {
      if (p.indexOf(c.type) === -1) p.push(c.type);
      return p;
    }, []);

    nodes = nodes.sort(function(a, b) {
      return d3.descending(a.proposals.length, b.proposals.length);
    });

    links = links.sort(function(a, b) {
      return d3.ascending(a.value, b.value);
    });

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
        };

        switch (type) {
          case "pi":
            node.name = id;
            break;

          case "proposal":
            // XXX: Name placeholder
            node.name = d.short_name;
            node.budget = d.anticipated_budget ? d.anticipated_budget : "NA";
            node.duration = d.funding_duration ? d.funding_duration : "NA";
            node.status = d.proposal_status ? d.proposal_status : "NA";
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

          case "status":
            node.name = id;
            break;

          default:
            console.log("Invalid type: " + type);
            return;
        };

        map.set(id, node);
      }
    }

    function addLink(node1, node2, proposal) {
      // Get link if already created
      var link = links.filter(function(d) {
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

      node1.proposals.push(proposal);
    }
  }

  function draw() {
    // Set width and height
    svg.attr("width", width)
        .attr("height", height);

    // Do Sankey layout
    var sankey = d3Sankey.sankey()
        .size([innerWidth(), innerHeight()])
        .nodePadding(2)
        .iterations(1000);

    var {nodes, links} = sankey(network);

    // Color scale
    var nodeColorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(network.nodeTypes);

    linkOpacityScale
          .domain([1, d3.max(links, function(d) { return d.value; })])
          .range([0.4, 1]);

    // Draw the visualization
    drawLinks();
    drawNodes();
    drawLabels();

    function drawNodes() {
      // Bind nodes
      var node = svg.select(".nodes").selectAll(".node")
          .data(nodes, function(d) {
            return d.id;
          });

      // Node enter
      node.enter().append("rect")
          .attr("class", "node")
          .attr("rx", 2)
          .attr("ry", 2)
          .attr("x", function(d) { return d.x0; })
          .attr("y", function(d) { return d.y0; })
          .attr("width", function(d) { return d.x1 - d.x0; })
          .attr("height", function(d) { return d.y1 - d.y0; })
          .style("fill", nodeFill)
          .on("mouseover", function(d) {
            if (!active(d)) return;

            tip.show(d, this);

            var ids = d.proposals.map(function(d) { return d.id; });

            dispatcher.call("highlightProposals", this, ids);
          })
          .on("mouseout", function() {
            highlightProposals();

            tip.hide();

            dispatcher.call("highlightProposals", this, null);
          })
          .on("click", function(d) {
            d3.event.stopPropagation();

            if (!active(d)) return;

            var ids = d.proposals.map(function(d) { return d.id; });

            dispatcher.call("selectProposals", this, ids);
          });

      // Node update
      node.transition()
          .attr("x", function(d) { return d.x0; })
          .attr("y", function(d) { return d.y0; })
          .attr("width", function(d) { return d.x1 - d.x0; })
          .attr("height", function(d) { return d.y1 - d.y0; });

      // Node exit
      node.exit().remove();

      highlightProposals();

      function nodeFill(d) {
        return nodeColorScale(d.type);
      }
    }

    function drawLinks() {
      // Bind data for links
      var link = svg.select(".links").selectAll(".link")
          .data(links, function(d) {
            return d.source.id + "_" + d.target.id;
          });

      // Link enter
      link.enter().append("path")
          .attr("class", "link")
          .style("fill", "none")
          .style("stroke", "#999")
          .style("stroke-opacity", linkOpacity)
          .style("stroke-width", function(d) { return d.width / 2; })
          .attr("d", d3Sankey.sankeyLinkHorizontal())
          .on("mouseover", function(d) {
            if (!active(d)) return;

            tip.show(d, this);

            var ids = d.proposals.map(function(d) { return d.id; });

            dispatcher.call("highlightProposals", this, ids);
          })
          .on("mouseout", function(d) {
            tip.hide();

            dispatcher.call("highlightProposals", this, null);
          })
          .on("click", function(d) {
            d3.event.stopPropagation();

            if (!active(d)) return;

            var ids = d.proposals.map(function(d) { return d.id; });

            dispatcher.call("selectProposals", this, ids);
          });

      // Link update
      link.transition()
          .attr("d", d3Sankey.sankeyLinkHorizontal());

      // Link exit
      link.exit().remove();
    }

    function drawLabels() {
      // Bind nodes
      var label = svg.select(".labels").selectAll(".nodeLabel")
          .data(nodes, function(d) {
            return d.id;
          });

      // Label enter
      var labelEnter = label.enter().append("g")
          .attr("class", "nodeLabel")
          .style("font-size", "small")
          .style("font-weight", "bold")
          .style("pointer-events", "none")
          .style("dominant-baseline", "middle")
          .style("opacity", labelOpacity)
          .attr("transform", function(d) {
            return "translate(" + d.x1 + "," + ((d.y1 + d.y0) / 2) + ")";
          });

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

      // Label update
      label.transition()
          .attr("transform", function(d) {
            return "translate(" + d.x1 + "," + ((d.y1 + d.y0) / 2) + ")";
          });

      // Label exit
      label.exit().remove();
    }
  }

  function linkOpacity(d) {
    return linkOpacityScale(d.value);
  }

  function labelOpacity(d) {
    return d.proposals.length >= 5 ? 1 : 0;
  }

  function active(d) {
    return selectedProposals.length == 0 || d.proposals.reduce(function(p, c) {
      return p || selectedProposals.indexOf(c.id) !== -1;
    }, false);
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
      // Change link appearance
      svg.select(".links").selectAll(".link").transition()
          .style("stroke-opacity", function(d) {
            return linkConnected(d) ? 0.9 : 0.1;
          });

      svg.select(".links").selectAll(".link")
          .filter(function(d) {
            return linkConnected(d);
          }).raise();

      // Change node appearance
      svg.select(".nodes").selectAll(".node").transition()
          .style("fill-opacity", function(d) {
            return nodeConnected(d) ? 1 : 0.1;
          });

      // Change label appearance
      svg.select(".labels").selectAll(".nodeLabel").transition()
          .style("opacity", function(d) {
            return nodeConnected(d) ? 1.0 : 0.0;
          });

      function nodeConnected(d) {
        for (var i = 0; i < d.proposals.length; i++) {
          if (proposals.indexOf(d.proposals[i].id) !== -1) return true;
        }

        return false;
      }

      function linkConnected(d) {
        return nodeConnected(d.source) && nodeConnected(d);
      }
    }
    else {
      // Reset
      svg.select(".links").selectAll(".link").transition()
          .style("stroke-opacity", linkOpacity);

      svg.select(".nodes").selectAll(".node").transition()
          .style("fill-opacity", 1);

      svg.select(".labels").selectAll(".nodeLabel").transition()
          .style("opacity", labelOpacity);
    }
  }

  // Getters/setters

  proposalsSankey.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return proposalsSankey;
  };

  proposalsSankey.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return proposalsSankey;
  };

  proposalsSankey.highlightProposals = function(_) {
    highlightProposals(_);
    return proposalsSankey;
  };

  proposalsSankey.selectProposals = function(_) {
    selectedProposals = _.length ? _ : [];
    highlightProposals();
    return proposalsSankey;
  };

  // For registering event callbacks
  proposalsSankey.on = function() {
    var value = dispatcher.on.apply(dispatcher, arguments);
    return value === dispatcher ? proposalsSankey : value;
  };

  return proposalsSankey;
}
