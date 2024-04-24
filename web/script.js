const width = 960; // Set the width for the SVG element
const height = 500; 
const mapUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';
const gdpDataUrl = '../data/world-data-2023.csv'; 

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

    const colorScale = d3.scaleSequentialLog(d3.interpolateBlues)
        .domain(colorDomain)
        .clamp(true);

    // Create SVG container
    const svg = d3.select("#map").append("svg")
                  .attr("width", width)
                  .attr("height", height)
                  .call(d3.zoom().scaleExtent([1, 8]).on("zoom", function (event) {
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

    // Only run this code after the colorScale is fully defined
    const legendSvg = d3.select("#legend-container")
        .append("svg:svg")
        .attr("width", 400) // Width of the legend
        .attr("height", 60); // Height of the legend (with some padding for the labels)

    // Define the SVG gradient
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

    console.log("COLOUR SCALE");
    console.log(colorScale.range());

    // Draw the rectangle that will represent the gradient
    legendSvg.append('rect')
        .attr('x', 20) // Position from the left of the SVG
        .attr('y', 10) // Position from the top of the SVG
        .attr('width', 360) // Width of the gradient rect
        .attr('height', 20) // Height of the gradient rect
        .style('fill', 'url(#gradient)');

    console.log(d3.select("#legend-container"));

    svg.selectAll(".country")
        .data(countries)
        .enter().append("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", d => {
            const correctedName = countryNameMap[d.properties.name] || d.properties.name;
            const gdp = gdpLookup.get(correctedName);
            if (gdp === undefined) {
                // console.warn(`No GDP data available for '${d.properties.name}' corrected as '${correctedName}'`);
                return '#ccc';  // Default color for missing data
            }
            const color = colorScale(gdp);
            // console.log(`${correctedName}: GDP = ${gdp}, Color = ${color}`);
            return color;
        })
        .attr("stroke", "white")
        .attr("stroke-width", 0.5)
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(d.properties.name + (gdpLookup.get(d.properties.name) ? ": GDP $" + gdpLookup.get(d.properties.name) : ": No data"))
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
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
        });
});