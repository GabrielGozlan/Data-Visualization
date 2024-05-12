const width = 960; // Set the width for the SVG element
const height = 500; 
const legendWidth = 360;  // Width of the gradient rectangle
const legendXPosition = 20;  // Starting x position of the gradient rectangle
const mapUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';
const gdpDataUrl = '../../data/world-data-2023.csv'; 

const countryNameMap = {
    "United States": "United States of America",
    "Republic of Ireland": "Ireland",
    "Czech Republic": "Czechia",
    "Bosnia and Herzegovina": "Bosnia and Herz",
    "North Macedonia": "Macedonia",
    "Central African Republic": "Central African Rep.",
    "South Sudan": "S. Sudan",
    "Republic of the Congo": "Congo",
    "Democratic Republic of the Congo": "Dem. Rep. Congo",
    "Somalia": "Somalia",
    "Dominican Republic": "Dominican Rep."
  };

// Load and display the world map
Promise.all([
    d3.json(mapUrl),
    d3.csv(gdpDataUrl)
]).then(function([topoData, gdpData]) {
    const countries = topojson.feature(topoData, topoData.objects.countries).features; // Convert TopoJSON to GeoJSON
    const gdpLookup = new Map();

    gdpData.forEach(d => {
        const originalGDP = d.GDP;
        const cleanGDP = originalGDP.replace(/[^\d.]/g, ''); // Clean the GDP string
        const parsedGDP = parseFloat(cleanGDP);

        if (isNaN(parsedGDP)) {
            // console.error(`GDP parse error for ${d.Country}: Original GDP - '${originalGDP}', Cleaned GDP - '${cleanGDP}'`);
        } else {
            const countryName = countryNameMap[d.Country.trim()] || d.Country.trim();
            gdpLookup.set(countryName, parsedGDP);
            // console.log(`Parsed and stored GDP for ${countryName}: ${parsedGDP}`);
        }
    });
    // Check for parsing errors or mismatches in country names
    // gdpData.forEach(d => {
    //     if (isNaN(d.GDP)) {
    //         console.error('GDP parse error for', d.Country, d.GDP);
    //     }
    // });

    // Create color scale
    const colorDomain = d3.extent(Array.from(gdpLookup.values()));
    console.log('Color Domain:', colorDomain);

    // use log because of huge values in gdp
    const colorScale = d3.scaleSequentialLog(d3.interpolateBlues)
        .domain(colorDomain)
        .clamp(true);
    
    // Create SVG container
    const svg = d3.select("#map").append("svg")
                  .attr("width", width)
                  .attr("height", height)
                  .call(d3.zoom().scaleExtent([1, 8]).on("zoom", function (event) { // Allows zooming from 1x to 8x
                      svg.attr("transform", event.transform);
                  }))
                  .append("g");

    // Create a projection to translate geographic coordinates
    const projection = d3.geoMercator()
                         .translate([width / 2, height / 2])
                         .scale(100);

    // Create a path generator using the projection
    const path = d3.geoPath()
                   .projection(projection);

    const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    const legendSvg = d3.select("#legend-container")
        .append("svg:svg")
        .attr("width", 400) // Width of the legend
        .attr("height", 60); // Height of the legend (with some padding for the labels)

    // Define the SVG gradient (for the legend of the map)
    const gradient = legendSvg.append('defs')
        .append('linearGradient')
        .attr('id', 'gradient')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%');

    gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorScale.range()[0]); // Start color

    gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorScale.range()[1]); // End color

    // Draw the rectangle that will represent the gradient
    legendSvg.append('rect')
        .attr('x', 20) // Position from the left of the SVG
        .attr('y', 10) // Position from the top of the SVG
        .attr('width', 360) // Width of the gradient rect
        .attr('height', 20) // Height of the gradient rect
        .style('fill', 'url(#gradient)');
    
    // Append text for the start of the scale (min GDP)
    legendSvg.append("text")
    .attr("class", "legend-text")
    .attr("x", 20) // Align with the left edge of the gradient rect
    .attr("y", 50) // Position below the gradient rect
    .style("text-anchor", "start") // Align text to the start
    .text(d3.format(".2s")(colorScale.domain()[0])); // Format and display min GDP

    // Append text for the middle of the scale (median GDP)
    legendSvg.append("text")
    .attr("class", "legend-text")
    .attr("x", 200) // Position in the middle of the gradient rect
    .attr("y", 50)
    .style("text-anchor", "middle") // Center the text
    .text(d3.format(".2s")(d3.median(Array.from(gdpLookup.values())))); // Format and display median GDP

    // Append text for the end of the scale (max GDP)
    legendSvg.append("text")
    .attr("class", "legend-text")
    .attr("x", 380) // Align with the right edge of the gradient rect
    .attr("y", 50)
    .style("text-anchor", "end") // Align text to the end
    .text(d3.format(".2s")(colorScale.domain()[1])); // Format and display max GDP

    const legendScale = d3.scaleLog()
                            .domain(colorScale.domain())  // Use the same domain as your color scale
                            .range([legendXPosition, legendXPosition + legendWidth])
                            .clamp(true);

    // marker line that shows the country gdp on the scale
    const markerLine = legendSvg.append("line")
    .attr("x1", legendXPosition)
    .attr("x2", legendXPosition)
    .attr("y1", 5)  // Slightly above the rectangle
    .attr("y2", 35) // Slightly below the rectangle
    .style("stroke", "red")  // Red is visible, change as needed
    .style("stroke-width", 2)
    .style("visibility", "hidden");  // Initially hidden


    svg.selectAll(".country")
    .data(countries)
    .enter().append("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("fill", d => {
        const correctedName = countryNameMap[d.properties.name] || d.properties.name;
        const gdp = gdpLookup.get(correctedName);
        return gdp ? colorScale(gdp) : '#ccc';  // Default color for missing data
    })
    .attr("stroke", "white")
    .attr("stroke-width", 0.5)
    .on("mouseover", function(event, d) {
        tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
        tooltip.html(d.properties.name + (gdpLookup.get(d.properties.name) ? ": GDP $" + d3.format(".2s")(gdpLookup.get(d.properties.name)) : ": No data"))
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
                              
        // Determine the GDP position on the scale and update the marker line
        const gdp = gdpLookup.get(d.properties.name);
        if (gdp !== undefined) {
        const xPos = legendScale(gdp);
        markerLine.attr("x1", xPos)
            .attr("x2", xPos)
            .style("visibility", "visible");
        }
    
        d3.select(this)
        .style("stroke", "black")
        .style("stroke-width", 1.5);
    })
    .on("mouseout", function(d) {
        tooltip.transition()
        .duration(500)
        .style("opacity", 0);
        d3.select(this)
        .style("stroke", "white")
        .style("stroke-width", 0.5);
    
        // Hide the marker line when not hovering
        markerLine.style("visibility", "hidden");
    })
    .translateExtent([[-width * 0.5, -height * 0.5], [width * 1.5, height * 1.5]]);
});