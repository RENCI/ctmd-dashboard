import React, { Fragment, useState, useEffect, useReducer } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import Controls from './ProposalsNetworkControls';
import Visualizations from './ProposalsNetworkVisualizations';
import { CircularLoader } from '../Progress/Progress';

function createNodeData(data) {
  // Filter any proposals without a TIC
  data = data.filter(function(d) {
    return d.assignToInstitution;
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
  const pis = d3.map(),
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

  let nodes = pis.values()
      .concat(proposals.values())
      .concat(orgs.values())
      .concat(tics.values())
      .concat(areas.values())
      .concat(statuses.values());

  const nodeTypes = nodes.reduce((p, c) => {
    if (p.indexOf(c.type) === -1) p.push(c.type);
    return p;
  }, []).map(d => {
    return { type: d, show: true }
  });

  nodes = nodes.sort(function(a, b) {
    return d3.descending(a.proposals.length, b.proposals.length);
  });

  return {
    nodes: nodes,
    nodeTypes: nodeTypes
  };

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

function  ProposalsNetworkContainer(props) {
    const [proposals, setProposals] = useState([]);
    const [nodeData, setNodeData] = useState({ nodes: [], nodeTypes: [] });
    const [selectedNodes, selectedNodesDispatcher] = useReducer(updateSelectedNodes, []);

    async function fetchData() {
        await axios.get(props.apiUrl)
            .then(response => {
                setProposals(response.data);
                setNodeData(createNodeData(response.data));
            })
            .catch(error => {
                console.error('Error:', error)
            });
    }

    useEffect(() => {
      fetchData();
    }, []);

    function getProposals(nodes) {
        if (nodes.length === 0) return [];

        let ids = nodes[0].proposals.filter(d => {
          for (let i = 1; i < nodes.length; i++) {
            if (nodes[i].proposals.indexOf(d) === -1) return false;
          }
          return true;
        }).map(d => d.id);

        return proposals.filter(proposal =>
            ids.indexOf(proposal.proposalID) !== -1
        );
    }

    function handleControlChange(name, event) {
        switch (name) {
            case 'status':
                const nonStatusNodes = selectedNodes.filter(d => d.type !== 'status');

                const status = event.target.value;
                const node = nodeData.nodes.reduce((p, c) => {
                  return c.type === 'status' && c.name === status ? c : p;
                }, null);

                const newNodes = node ? nonStatusNodes.concat(node) : nonStatusNodes;

                updateSelectedNodes(newNodes);

                break;

            default:
        }
    }

    function updateSelectedNodes(selectedNodes, action) {
        let newNodes = [];

        switch (action.type) {
          case "select":
            newNodes = !action.nodes ? [] :
                action.nodes.reduce((p, c) => {
                    return p.indexOf(c) === -1 ? p.concat(c) : p;
                }, selectedNodes);
            break;

          case "deselect":
            newNodes = selectedNodes.filter(d => action.nodes.indexOf(d) === -1);
            break;

          default:
        }

        props.onSelectProposals(getProposals(newNodes));

        return newNodes;
    }

    function handleSelectNodes(nodes) {
      selectedNodesDispatcher({ nodes: nodes, type: "select" });
    }

    function handleDeselectNodes(nodes) {
      selectedNodesDispatcher({ nodes: nodes, type: "deselect" });
    }

    return (
        proposals.length > 0 ?
            <Fragment>
                <Controls
                    proposals={ proposals }
                    onChange={ handleControlChange } />
                <Visualizations
                    nodeData={ nodeData }
                    selectedNodes={ selectedNodes }
                    onSelectNodes={ handleSelectNodes }
                    onDeselectNodes={ handleDeselectNodes }/>
            </Fragment>
        : <CircularLoader />
    );
}

export default ProposalsNetworkContainer
