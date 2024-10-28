// Set up SVG dimensions and create a group for the graph
const svg = d3.select("svg")
  .attr("width", window.innerWidth)
  .attr("height", window.innerHeight);

const width = +svg.attr("width"),
  height = +svg.attr("height");

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
  const nodes = data.nodes;
  const links = data.links;

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
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))
    .on("dblclick", unfixNode);  // Add double-click to unfix node

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
      .attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    label
      .attr("x", d => d.x)
      .attr("y", d => d.y);
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
    // Keep nodes fixed in place after dragging
    d.fx = d.x;
    d.fy = d.y;
  }

  // Double-click function to unfix a node
  function unfixNode(event, d) {
    d.fx = null;
    d.fy = null;
  }
}).catch(error => {
  console.error("Error loading or processing data:", error);
});
