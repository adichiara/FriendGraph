// Set up SVG dimensions and create a group for the graph
const svg = d3.select("svg")
  .attr("width", window.innerWidth)
  .attr("height", window.innerHeight);

const width = +svg.attr("width"),
  height = +svg.attr("height");

const maxDegree = 1;  // Set the number of degrees of separation to show

// Create a group element for the graph, which will be transformed by zooming/panning
const g = svg.append("g");

// Set up the zoom behavior
const zoom = d3.zoom()
  .scaleExtent([0.5, 5])  // Min and max zoom levels
  .on("zoom", (event) => {
    g.attr("transform", event.transform);  // Apply the transformation to the group
  });

// Apply the zoom behavior to the SVG
svg.call(zoom);

// Create the force simulation
const simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(d => d.id).distance(100))
  .force("charge", d3.forceManyBody().strength(-200))
  .force("center", d3.forceCenter(width / 2, height / 2));

// Load data from data.json
d3.json("data.json").then(data => {
  let nodes = data.nodes;
  let links = data.links;
  let activeNode = null;  // Track the active node

  // Set "Airen" as the default active node on load
  activeNode = nodes.find(d => d.id === "Airen");
  simulation.alpha(1).restart();  // Restart simulation to apply visibility changes

  // Define a scale for link stroke width based on strength
  const strengthScale = d3.scaleLinear()
    .domain([1, 8])  // Assuming strength ranges from 1 to 8
    .range([1, 5]);  // Scale stroke width from 1 to 5

  // Add links (edges) to the group with styling
  const link = g.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("stroke", "#888")
    .attr("stroke-opacity", 0.7)
    .attr("stroke-width", d => strengthScale(d.strength));

  // Add nodes with color and size, and make them draggable
  const node = g.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", 8)  // Node size
    .attr("fill", "#1f78b4")
    .on("click", setActiveNode)  // Click to set active node
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  // Add labels to each node using the id field
  const label = g.append("g")
    .attr("class", "labels")
    .selectAll("text")
    .data(nodes)
    .enter().append("text")
    .attr("dy", -10)
    .attr("text-anchor", "middle")
    .style("font-family", "Arial, sans-serif")
    .style("font-size", "10px")
    .style("fill", "#333")
    .text(d => d.id);

  // Apply nodes and links to the simulation
  simulation
    .nodes(nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(links);

  // Function to update link and node positions on each tick
  function ticked() {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y)
      .style("display", d => (isVisible(d.source, maxDegree) && isVisible(d.target, maxDegree)) ? "block" : "none");

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .style("display", d => isVisible(d, maxDegree) ? "block" : "none")
      .attr("fill", d => d === activeNode ? "#ff6347" : "#1f78b4");  // Highlight active node in a different color

    label
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .style("display", d => isVisible(d, maxDegree) ? "block" : "none");
  }

  // Drag functions to fix node position while dragging
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = d.x;
    d.fy = d.y;
  }

  // Set the active node on click
  function setActiveNode(event, d) {
    activeNode = d === activeNode ? null : d;  // Toggle active node
    simulation.alpha(1).restart();  // Restart simulation to apply visibility changes
  }

  // Helper function to determine visibility of nodes and links up to a specified degree
  function isVisible(node, degree) {
    if (!activeNode) return true;  // Show all nodes if no active node
    if (degree === 0) return node === activeNode;  // Only show active node if degree is 0

    // Create a set of nodes that are within the specified degree of the active node
    const neighbors = new Set([activeNode.id]);
    let currentLayer = new Set([activeNode.id]);

    // Expand neighbors up to the specified degree
    for (let i = 0; i < degree; i++) {
      const nextLayer = new Set();
      links.forEach(link => {
        if (currentLayer.has(link.source.id) && !neighbors.has(link.target.id)) {
          nextLayer.add(link.target.id);
          neighbors.add(link.target.id);
        } else if (currentLayer.has(link.target.id) && !neighbors.has(link.source.id)) {
          nextLayer.add(link.source.id);
          neighbors.add(link.source.id);
        }
      });
      currentLayer = nextLayer;
    }

    return neighbors.has(node.id);  // Only show nodes within specified degrees of separation
  }

  // Double-click function to unfix a node
  node.on("dblclick", (event, d) => {
    d.fx = null;
    d.fy = null;
  });
}).catch(error => {
  console.error("Error loading or processing data:", error);
});
