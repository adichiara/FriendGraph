const svg = d3.select("svg")
  .attr("width", width)
  .attr("height", height);

// Scale for the link distance based on strength
const distanceScale = d3.scaleLinear()
  .domain(d3.extent(links, d => d.strength)) // Use `links` instead of `data`
  .range([50, 200]); // Adjust range as needed

const simulation = d3.forceSimulation()
  .force("link", d3.forceLink()
    .id(d => d.id)
    .distance(d => distanceScale(d.strength))) // Set distance based on strength
  .force("charge", d3.forceManyBody().strength(-400))
  .force("center", d3.forceCenter(width / 2, height / 2));

// Add links (edges)
const link = svg.append("g")
  .attr("class", "links")
  .selectAll("line")
  .data(data)
  .enter().append("line")
  .attr("stroke-width", 2); // Set fixed width or use another scale if needed

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
