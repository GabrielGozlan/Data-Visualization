const width = 1000;
const height = 750;
const legendWidth = 2000;
const legendXPosition = 20;
const mapUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

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

document.addEventListener("DOMContentLoaded", function() {
    const slider = document.getElementById('year-slider');
    const yearDisplay = document.getElementById('year-display');

    slider.oninput = function() {
        yearDisplay.textContent = this.value;
        updateMapColors(this.value);
    };

    initializeMap();
});

function getGdpDataUrl(year) {
    const url = `../../data/mapslider/world-data-${year}.csv`;
    console.log(`Fetching data from: ${url}`);
    return url;
}

let topoDataGlobal;
let svgGlobal;
let gdpLookupGlobal;
let colorScaleGlobal;
let markerLineGlobal;

function initializeMap() {
    Promise.all([
        d3.json(mapUrl),
        d3.csv(getGdpDataUrl(1960))
    ]).then(function([topoData, gdpData]) {
        topoDataGlobal = topoData;
        gdpLookupGlobal = prepareGdpData(gdpData);
        
        const colorDomain = d3.extent(Array.from(gdpLookupGlobal.values()));
        colorScaleGlobal = d3.scaleSequentialLog(d3.interpolateBlues)
            .domain(colorDomain)
            .clamp(true);


        const svg = d3.select("#map").append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(d3.zoom().scaleExtent([1, 8]).on("zoom", function (event) {
                svg.attr("transform", event.transform);
            }))
            .append("g");
        svgGlobal = svg;

        const projection = d3.geoMercator()
            .translate([width / 2, height / 2])
            .scale(100);

        const path = d3.geoPath().projection(projection);

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        const countries = topojson.feature(topoData, topoData.objects.countries).features;

        const legendScale = d3.scaleLog()
            .domain(colorDomain)
            .range([legendXPosition, legendXPosition + legendWidth+100])
            .clamp(true);


        svg.selectAll(".country")
            .data(countries)
            .enter().append("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("fill", d => {
                const correctedName = countryNameMap[d.properties.name] || d.properties.name;
                const gdp = gdpLookupGlobal.get(correctedName);
                return gdp ? colorScaleGlobal(gdp) : '#ccc';
            })
            .attr("stroke", "white")
            .attr("stroke-width", 0.5)
            .on("mouseover", function(event, d) {
                const correctedName = countryNameMap[d.properties.name] || d.properties.name;
                const gdp = gdpLookupGlobal.get(correctedName);

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltip.html(d.properties.name + (gdp ? ": GDP $" + d3.format(".2s")(gdp) : ": No data"))
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
                d3.select(this)
                    .style("stroke", "black")
                    .style("stroke-width", 1.5);

               
            })
            .on("mouseout", function() {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
                d3.select(this)
                    .style("stroke", "white")
                    .style("stroke-width", 0.5);

            });

        d3.select('#year-slider').on('input', function() {
            const year = +this.value;
            d3.csv(getGdpDataUrl(year)).then(newGdpData => {
               
                gdpLookupGlobal = prepareGdpData(newGdpData);
                updateMapColors(year);
                
                updateLegend(colorScaleGlobal, gdpLookupGlobal);
            }).catch(error => console.error("Error fetching GDP data:", error));
        });

    }).catch(error => console.error("Error initializing map:", error));
}

function prepareGdpData(gdpData) {
    const gdpLookup = new Map();

    gdpData.forEach(d => {
        const originalGDP = d.GDP;
        const cleanGDP = originalGDP.replace(/[^\d.]/g, '');
        const parsedGDP = parseFloat(cleanGDP);

        if (!isNaN(parsedGDP)) {
            const countryName = countryNameMap[d.Country.trim()] || d.Country.trim();
            gdpLookup.set(countryName, parsedGDP);
        }
    });

    return gdpLookup;
}

function updateMapColors(year) {
    const countries = svgGlobal.selectAll(".country");

    countries.attr("fill", d => {
        const correctedName = countryNameMap[d.properties.name] || d.properties.name;
        const gdp = gdpLookupGlobal.get(correctedName);
        return gdp ? colorScaleGlobal(gdp) : '#ccc';
    });
}

