// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getStories = async () => {
  try {
    const response = await axios.get(`${API_URL}/stories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stories:', error);
    throw error;
  }
};

export const getNetwork = async () => {
  try {
    const response = await axios.get(`${API_URL}/network`);
    return response.data;
  } catch (error) {
    console.error('Error fetching network:', error);
    throw error;
  }
};

export const getPath = async (source, target) => {
  try {
    const response = await axios.get(`${API_URL}/path`, {
      params: { source, target }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching path:', error);
    throw error;
  }
};

export const getConnections = async (character) => {
  try {
    const response = await axios.get(`${API_URL}/connections/${character}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching connections:', error);
    throw error;
  }
};

export const initDemoData = async () => {
  try {
    const response = await axios.post(`${API_URL}/init`);
    return response.data;
  } catch (error) {
    console.error('Error initializing demo data:', error);
    throw error;
  }
};

// Updated NetworkGraph.jsx component
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getPath, getConnections } from '../services/api';

function NetworkGraph({ story }) {
  const svgRef = useRef(null);
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!story) return;
    
    const fetchNetworkData = async () => {
      setLoading(true);
      try {
        // Get path between storyteller and target
        const pathData = await getPath(story.storyteller, story.target);
        
        if (!pathData.success) {
          throw new Error(pathData.message);
        }
        
        // Get connections for both storyteller and target to add more nodes
        const storytellerConnections = await getConnections(story.storyteller);
        const targetConnections = await getConnections(story.target);
        
        // Combine data into a network
        const combinedNetwork = combineNetworkData(
          pathData, 
          storytellerConnections, 
          targetConnections
        );
        
        setNetwork(combinedNetwork);
      } catch (err) {
        setError(err.message);
        // If API fails, use mock data as fallback
        setNetwork(generateMockNetwork(story));
      } finally {
        setLoading(false);
      }
    };
    
    fetchNetworkData();
  }, [story]);
  
  useEffect(() => {
    if (!network || !svgRef.current) return;
    
    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Create force simulation
    const width = svgRef.current.clientWidth || 500;
    const height = svgRef.current.clientHeight || 400;
    
    const simulation = d3.forceSimulation(network.nodes)
      .force("link", d3.forceLink(network.links).id(d => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1));
    
    // Create SVG elements
    const svg = d3.select(svgRef.current);
    
    // Add links
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(network.links)
      .join("line")
      .attr("stroke", d => d.onPath ? "#ffa500" : "#999")
      .attr("stroke-opacity", d => d.onPath ? 0.8 : 0.3)
      .attr("stroke-width", d => d.onPath ? 3 : Math.sqrt(d.strength) * 2);
    
    // Add nodes
    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(network.nodes)
      .join("circle")
      .attr("r", d => {
        if (d.id === story.storyteller || d.id === story.target) return 10;
        if (d.onPath) return 7;
        return 5;
      })
      .attr("fill", d => {
        if (d.id === story.storyteller) return "#ff6347";
        if (d.id === story.target) return "#4682b4";
        if (d.onPath) return "#ffa500";
        return "#ccc";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .call(drag(simulation));
    
    // Add hover interaction
    node.append("title")
      .text(d => `${d.id} (${d.role})\n${d.allegiance}`);
    
    // Add labels for important nodes
    const labels = svg.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(network.nodes.filter(d => 
        d.id === story.storyteller || 
        d.id === story.target || 
        d.onPath
      ))
      .join("text")
      .text(d => d.id)
      .attr("font-size", 10)
      .attr("dx", 12)
      .attr("dy", 4);
    
    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      
      node
        .attr("cx", d => d.x = Math.max(10, Math.min(width - 10, d.x)))
        .attr("cy", d => d.y = Math.max(10, Math.min(height - 10, d.y)));
      
      labels
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });
    
    // Drag functionality
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
    
    // Add zoom functionality
    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        svg.selectAll("g").attr("transform", event.transform);
      });
    
    svg.call(zoom);
    
  }, [network, story]);
  
  // Helper function to combine network data
  function combineNetworkData(pathData, storytellerConnections, targetConnections) {
    // Start with path nodes
    const nodes = [...pathData.nodes];
    const links = [...pathData.links];
    const nodeIds = new Set(nodes.map(n => n.id));
    
    // Add some connections from storyteller
    storytellerConnections.slice(0, 5).forEach(conn => {
      if (!nodeIds.has(conn.name)) {
        nodes.push({
          id: conn.name,
          role: conn.role,
          allegiance: conn.allegiance,
          onPath: false
        });
        nodeIds.add(conn.name);
      }
      
      links.push({
        source: story.storyteller,
        target: conn.name,
        strength: conn.connectionStrength,
        onPath: false
      });
    });
    
    // Add some connections from target
    targetConnections.slice(0, 5).forEach(conn => {
      if (!nodeIds.has(conn.name)) {
        nodes.push({
          id: conn.name,
          role: conn.role,
          allegiance: conn.allegiance,
          onPath: false
        });
        nodeIds.add(conn.name);
      }
      
      links.push({
        source: story.target,
        target: conn.name,
        strength: conn.connectionStrength,
        onPath: false
      });
    });
    
    return { nodes, links };
  }
  
  // Fallback mock network generator
  function generateMockNetwork(story) {
    if (!story) return { nodes: [], links: [] };
    
    // Use some WoT character names
    const characters = [
      "Rand al'Thor", "Matrim Cauthon", "Perrin Aybara", "Egwene al'Vere",
      "Nynaeve al'Meara", "Moiraine Damodred", "Lan Mandragoran", "Thom Merrilin",
      "Loial", "Min Farshaw", "Elayne Trakand", "Aviendha", "Faile Bashere", 
      "Siuan Sanche", "Verin Mathwin"
    ];
    
    // Create nodes
    const nodes = [];
    
    // Add storyteller and target
    nodes.push({ 
      id: story.storyteller, 
      role: story.storytellerRole,
      allegiance: "Unknown",
      type: 'storyteller', 
      onPath: true 
    });
    
    nodes.push({ 
      id: story.target, 
      role: story.targetRole,
      allegiance: "Unknown",
      type: 'target', 
      onPath: true 
    });
    
    // Add intermediaries based on steps away
    const pathNodes = [];
    for (let i = 0; i < story.stepsAway - 1; i++) {
      const characterIdx = Math.floor(Math.random() * characters.length);
      pathNodes.push({ 
        id: characters[characterIdx], 
        role: 'Intermediary',
        allegiance: 'Unknown',
        type: 'intermediary', 
        onPath: true 
      });
      characters.splice(characterIdx, 1);
    }
    
    // Add some extra nodes
    for (let i = 0; i < 5; i++) {
      if (characters.length > 0) {
        const characterIdx = Math.floor(Math.random() * characters.length);
        nodes.push({ 
          id: characters[characterIdx], 
          role: 'Extra',
          allegiance: 'Unknown',
          type: 'extra', 
          onPath: false 
        });
        characters.splice(characterIdx, 1);
      }
    }
    
    // Combine all nodes
    nodes.push(...pathNodes);
    
    // Create links
    const links = [];
    
    // Create the path
    if (pathNodes.length > 0) {
      links.push({ 
        source: story.storyteller, 
        target: pathNodes[0].id, 
        strength: 0.8, 
        onPath: true 
      });
      
      for (let i = 0; i < pathNodes.length - 1; i++) {
        links.push({ 
          source: pathNodes[i].id, 
          target: pathNodes[i + 1].id, 
          strength: 0.8,
          onPath: true
        });
      }
      
      links.push({ 
        source: pathNodes[pathNodes.length - 1].id, 
        target: story.target, 
        strength: 0.8,
        onPath: true
      });
    } else {
      links.push({ 
        source: story.storyteller, 
        target: story.target, 
        strength: 0.8, 
        onPath: true 
      });
    }
    
    // Add some extra connections
    for (let i = 0; i < 8; i++) {
      const sourceIdx = Math.floor(Math.random() * nodes.length);
      let targetIdx = Math.floor(Math.random() * nodes.length);
      
      // Avoid self-links
      while (targetIdx === sourceIdx) {
        targetIdx = Math.floor(Math.random() * nodes.length);
      }
      
      links.push({
        source: nodes[sourceIdx].id,
        target: nodes[targetIdx].id,
        strength: 0.3 + Math.random() * 0.5,
        onPath: false
      });
    }
    
    return { nodes, links };
  }
  
  return (
    <div className="network-graph">
      <h2>Network Visualization</h2>
      {!story ? (
        <div className="empty-state">Select a story to view the network</div>
      ) : loading ? (
        <div className="loading">Loading network data...</div>
      ) : error ? (
        <div className="error">
          <p>Error loading network: {error}</p>
          <p>Using mock data instead</p>
        </div>
      ) : (
        <div className="graph-container">
          <div className="legend">
            <div className="legend-item">
              <span className="dot storyteller"></span> Storyteller
            </div>
            <div className="legend-item">
              <span className="dot target"></span> Target
            </div>
            <div className="legend-item">
              <span className="dot path"></span> Path ({story.stepsAway} steps)
            </div>
          </div>
          <svg ref={svgRef} width="100%" height="400"></svg>
          
          <div className="network-stats">
            <p>Current distance: <strong>{story.stepsAway} steps</strong></p>
            <p>Share to reduce by 1 step!</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default NetworkGraph;