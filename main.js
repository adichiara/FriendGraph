// Ensure code runs after the DOM has fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Set up SVG dimensions and create a group for zoom/pan
    const svg = d3.select("svg")
        .attr("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g")
        .attr("pointer-events", "all");  // Ensure interactions are allowed

    // Load the CSV data
    d3.csv("data.csv").then(data => {
        // Confirm data is loaded
        console.log("Data loaded:", data);

        // Convert the CSV data to a format compatible with D3
        const nodes = Array.from(new Set(data.flatMap(d => [d.Source, d.Target])), id => ({ id }));
        const links = data.map(d => ({ source: d.Source, target: d.Target }));

        // Calculate node degrees for sizing
        const nodeDegree = {};
        links.forEach(link => {
            nodeDegree[link.source] = (nodeDegree[link.source] || 0) + 1;
            nodeDegree[link.target] = (nodeDegree[link.target] || 0) + 1;
        });

        // Scale for node size based on degree
        const sizeScale = d3.scaleLinear()
            .domain([1, d3.max(Object.values(nodeDegree))])
            .range([5, 15]);  // Smaller range to suit mobile dimensions

        // Force simulation setup
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(60))
            .force("charge", d3.forceManyBody().strength(-100))
            .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))  // Center based on viewport dimensions
            .stop();  // Stop automatic simulation

        // Run the simulation manually and fix node positions
        for (let i = 0; i < 300; i++) simulation.tick();  // Run initial ticks to settle layout

        // Draw links (edges)
        const link = g.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke", "#aaa");

        // Draw nodes
        const node = g.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("r", d => sizeScale(nodeDegree[d.id] || 1))  // Size based on degree
            .attr("fill", "lightblue")
            .call(drag(simulation));

        // Add node labels
        const label = g.append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("dy", -3)
            .attr("text-anchor", "middle")
            .text(d => d.id);

        // Update positions on each tick
        simulation.on("tick", () => {
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
        });

        // Drag functionality to fix node position on drag end
        function drag(simulation) {
            return d3.drag()
                .on("start", event => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    event.subject.fx = event.subject.x;
                    event.subject.fy = event.subject.y;
                })
                .on("drag", event => {
                    event.subject.fx = event.x;
                    event.subject.fy = event.y;
                })
                .on("end", event => {
                    if (!event.active) simulation.alphaTarget(0);
                    event.subject.fx = event.subject.x;  // Keep node in place after dragging
                    event.subject.fy = event.subject.y;
                });
        }

        // Add zoom and pan functionality
        const zoom = d3.zoom()
            .scaleExtent([0.5, 4])  // Set min and max zoom levels
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svg.call(zoom);
    }).catch(error => {
        console.error("Error loading or processing data:", error);
    });
});
