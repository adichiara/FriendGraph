// Scale for edge width based on strength, with an increased range for clarity
const strengthScale = d3.scaleLinear()
  .domain(d3.extent(data, d => d.strength)) // scale based on min and max of `strength`
  .range([2, 15]); // Experiment with larger values for visibility

// Add links (edges) with console logging to verify scale application
const link = svg.append("g")
  .attr("class", "links")
  .selectAll("line")
  .data(data)
  .enter().append("line")
  .attr("stroke-width", d => {
    const width = strengthScale(d.strength);
    console.log(`Edge strength: ${d.strength}, Stroke width: ${width}`); // Debug log
    return width;
  });

