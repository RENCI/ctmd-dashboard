import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';
import d3Tip from 'd3-tip';

export default function() {
      // Size
  var margin = { top: 90, left: 10, bottom: 5, right: 150 },
      width = 800,
      height = 800,
      innerWidth = function() { return width - margin.left - margin.right; },
      innerHeight = function() { return height - margin.top - margin.bottom; },

      // Data
      data = [],
      allNodes = [],
      nodeTypes = [],
      typeOrder = ["tic", "area", "org", "status", "pi", "proposal"],
      network = {},
      selectedProposals = [],
      selectedNodes = [],

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
                     "Proposals: " + d.proposals.length +
                     (selectedNodes.length > 0 ?
                     "<br>Selected proposals: " + selectionOverlap(d) : "");
            }
            else {
              // Node
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
            selectedNodes = [];
            dispatcher.call("selectProposals", this, null);
          });

      svgEnter.append("g").attr("class", "legend");

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
    const activeTypes = nodeTypes.filter(d => d.show).map(d => d.type).sort((a, b) => {
      return d3.ascending(typeOrder.indexOf(a), typeOrder.indexOf(b));
    });
    const nodes = allNodes.filter(d => activeTypes.indexOf(d.type) !== -1);

    // Now link
    const proposals = allNodes.filter(d => d.type === "proposal");
    let links = [];

    proposals.forEach(proposal => {
      const nodes = activeTypes.map(type => {
        return type === "proposal" ? proposal : proposal.nodes.filter(d => d.type === type)[0];
      });

      d3.pairs(nodes).forEach(d => {
        addLink(d[0], d[1], proposal);
      });
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
        .domain(nodeTypes.map(d => d.type));

    linkOpacityScale
          .domain([1, d3.max(links, function(d) { return d.value; })])
          .range([0.4, 0.9]);

    // Draw the visualization
    drawLinks();
    drawNodes();
    drawLabels();
    drawLegend();

    function drawNodes() {
      let r = 2;

      // Bind nodes
      let node = svg.select(".nodes").selectAll(".node")
          .data(nodes, function(d) {
            return d.id;
          });

      // Node enter
      let nodeEnter = node.enter().append("g")
          .attr("class", "node");

      nodeEnter.append("rect")
          .attr("class", "background");

      nodeEnter.append("rect")
          .attr("class", "foreground");

      nodeEnter.append("rect")
          .attr("class", "border")
          .style("fill", "none")
          .style("stroke-width", 2);

      // Node update + enter
      let nodeUpdate = nodeEnter.merge(node)
          .on("mouseover", function(d) {
            tip.show(d, this);

            var ids = d.proposals.map(function(d) { return d.id; });

            dispatcher.call("highlightProposals", this, ids);
          })
          .on("mouseout", function() {
            tip.hide();

            dispatcher.call("highlightProposals", this, null);
          })
          .on("click", function(d) {
            d3.event.stopPropagation();

            isNodeSelected(d) ? deselectNode(d) : selectNode(d);

            var ids = d.proposals.map(function(d) { return d.id; });

            dispatcher.call("selectProposals", this, ids);

            tip.hide();
            tip.show(d, this);
          });

      nodeUpdate.select(".background")
          .attr("rx", r)
          .attr("ry", r)
          .attr("x", x)
          .attr("y", y)
          .attr("width", width)
          .attr("height", height)
          .style("fill", fill);

      nodeUpdate.select(".foreground")
          .attr("rx", r)
          .attr("ry", r)
          .attr("x", x)
          .attr("y", y)
          .attr("width", width)
          .attr("height", height)
          .style("fill", fill);

      nodeUpdate.select(".border")
          .attr("rx", r)
          .attr("ry", r)
          .attr("x", x)
          .attr("y", y)
          .attr("width", width)
          .attr("height", height);

      // Node exit
      node.exit().remove();

      highlightProposals();

      function x(d) {
        return d.x0;
      }

      function y(d) {
        return d.y0;
      }

      function width(d) {
        return d.x1 - d.x0;
      }

      function height(d) {
        return d.y1 - d.y0;
      }

      function fill(d) {
        return nodeColorScale(d.type);
      }
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
      let link = svg.select(".links").selectAll(".link")
          .data(links, function(d) {
            return d.source.id + "_" + d.target.id;
          });

      // Link enter
      let linkEnter = link.enter().append("g")
          .attr("class", "link")
          .on("mouseover", function(d) {
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

            if (isNodeSelected(d.source) && isNodeSelected(d.target)) {
              deselectNode(d.source);
              deselectNode(d.target);
            }
            else {
              selectNode(d.source);
              selectNode(d.target);
            }

            var ids = d.proposals.map(function(d) { return d.id; });

            dispatcher.call("selectProposals", this, ids);

            tip.hide();
            tip.show(d, this);
          });

      linkEnter.append("path")
          .attr("class", "background")
          .style("fill", "none")
          .style("stroke", "#999")
          .style("stroke-opacity", linkOpacity)
          .style("stroke-width", strokeWidth)
          .attr("d", d3Sankey.sankeyLinkHorizontal())

      linkEnter.append("path")
          .attr("class", "foreground")
          .style("fill", "none")
          .style("stroke", "#999")
          .style("stroke-opacity", 0.9)
          .style("stroke-width", 0)
          .attr("d", d3Sankey.sankeyLinkHorizontal());

      // Link update
      link.select(".background")//.transition()
          .attr("d", d3Sankey.sankeyLinkHorizontal())
          .style("stroke-width", strokeWidth);

      link.select(".foreground")//.transition()
          .attr("d", d3Sankey.sankeyLinkHorizontal());

      // Link exit
      link.exit().remove();

      function strokeWidth(d) {
        return d.width / 2;
      }
    }

    function drawLabels() {
      const dy = ".35em";

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
          .style("opacity", labelOpacity)
          .attr("transform", function(d) {
            return "translate(" + d.x1 + "," + ((d.y1 + d.y0) / 2) + ")";
          });

      labelEnter.append("text")
          .attr("class", "background")
          .attr("dy", dy)
          .text(function(d) {
            return d.name;
          })
          .style("stroke", "white")
          .style("stroke-width", 3)
          .style("stroke-opacity", 0.5);

      labelEnter.append("text")
          .attr("class", "foreground")
          .attr("dy", dy)
          .text(function(d) {
            return d.name;
          })
          .style("fill", "black");

      // Label update
      label//.transition()
          .attr("transform", function(d) {
            return "translate(" + d.x1 + "," + ((d.y1 + d.y0) / 2) + ")";
          });

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

  function linkOpacity(d) {
    return linkOpacityScale(d.value);
  }

  function labelOpacity(d) {
    return d.proposals.length >= 5 ? 1 : 0;
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
      // Change link appearance
      let link = svg.select(".links").selectAll(".link")
          .style("pointer-events", function(d) {
            return active(d) ? null : "none";
          });

      link.select(".background")//.transition()
          .style("stroke-opacity", function(d) {
            return linkConnected(d) ? 0.5 : 0.1;
          });

      link.select(".foreground")//.transition()
          .style("stroke-width", function(d) {
            let o = overlap(d) / d.proposals.length;
            return d.width / 2 * o;
          });

      link.filter(function(d) {
        return linkConnected(d);
      }).raise();

      // Change node appearance
      let node = svg.select(".nodes").selectAll(".node")
          .style("pointer-events", function(d) {
            return active(d) ? null : "none";
          });

      node.select(".background")//.transition()
          .style("fill-opacity", function(d) {
            return nodeConnected(d) ? 0.5 : 0.1;
          });

      node.select(".foreground")//.transition()
          .attr("y", function(d) {
            let o = 1 - overlap(d) / d.proposals.length;
            return d.y0 + (d.y1 - d.y0) * o / 2;
          })
          .attr("height", function(d) {
            let o = overlap(d) / d.proposals.length;
            return (d.y1 - d.y0) * o;
          });

      node.select(".border")
          .style("stroke", function(d) {
            return isNodeSelected(d) ? "black" : "none";
          });

      // Change label appearance
      svg.select(".labels").selectAll(".nodeLabel")//.transition()
          .style("opacity", function(d) {
            return nodeConnected(d) ? 1.0 : 0.0;
          });

      function overlap(d) {
        return d.proposals.reduce(function(p, c) {
          if (proposals.indexOf(c.id) !== -1) p++;
          return p;
        }, 0);
      }

      function nodeConnected(d) {
        for (let i = 0; i < d.proposals.length; i++) {
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
      let link = svg.select(".links").selectAll(".link");

      link.select(".background")//.transition()
          .style("stroke-opacity", linkOpacity);

      link.select(".foreground")//.transition()
          .style("stroke-width", 0);

      let node = svg.select(".nodes").selectAll(".node");

      node.select(".foreground")//.transition()
          .attr("y", function(d) {
            return d.y0;
          })
          .attr("height", function(d) {
            return d.y1 - d.y0;
          });

      node.select(".border")
          .style("stroke", "none");

      svg.select(".labels").selectAll(".nodeLabel")//.transition()
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
