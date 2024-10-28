const svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

const simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(d => d.id))
  .force("charge", d3.forceManyBody().strength(-400))
  .force("center", d3.forceCenter(width / 2, height / 2));

// Scale for edge width based on strength
const strengthScale = d3.scaleLinear()
  .domain(d3.extent(data, d => d.strength)) // adjust based on min/max of strength
  .range([1, 5]); // min/max width of lines

// Add links (edges)
const link = svg.append("g")
  .attr("class", "links")
  .selectAll("line")
  .data(data)
  .enter().append("line")
  .attr("stroke-width", d => strengthScale(d.strength)); // scale width based on strength

// Add nodes
const node = svg.append("g")
  .attr("class", "nodes")
  .selectAll("circle")
  .data(nodes)
  .enter().append("circle")
  .attr("r", 5) // node size
  .call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));

simulation
  .nodes(nodes)
  .on("tick", ticked);

simulation.force("link")
  .links(data);

function ticked() {
  link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

  node
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);
}

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
  d.fx = null;
  d.fy = null;
}
