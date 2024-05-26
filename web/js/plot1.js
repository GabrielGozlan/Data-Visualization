// Set the dimensions and margins of the graph
var margin = {top: 60, right: 30, bottom: 70, left: 60}, // Increased top margin to make space for the title
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Append the svg object to the div with id "chart"
var svg = d3.select("#plot")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Add a title
svg.append("text")
  .attr("x", (width / 2))             
  .attr("y", -margin.top / 2)
  .attr("text-anchor", "middle")  
  .style("font-size", "20px") 
  .style("text-decoration", "underline")  
  .text("Evolution of Total Points for Selected Countries");

// Parse the Data
d3.csv("../../data/imo_results2.csv").then(function(data) {
  // List of initial countries
  var initialCountries = ['Russia', 'China', 'United States of America', 'South Korea', 'Switzerland'];
  var countriesDisplayed = new Set(initialCountries);

  // Add X axis
  var x = d3.scaleLinear()
    .domain(d3.extent(data, d => +d.year))
    .range([0, width]);
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  // Add Y axis
  var y = d3.scaleLinear()
    .range([height, 0]);
  var yAxis = svg.append("g")
    .attr("class", "y-axis");

  // Color scale
  var color = d3.scaleOrdinal(d3.schemeCategory10);

  // Function to update the plot
  function updatePlot(countries) {
    // Filter data for the selected countries
    var filteredData = data.filter(d => countries.includes(d.country));

    // Aggregate total points by year for each country
    var aggregatedData = d3.groups(filteredData, d => d.country)
      .map(([country, values]) => {
        return {
          country: country,
          values: d3.groups(values, d => +d.year).map(([year, entries]) => {
            return {
              year: year,
              totalPoints: d3.sum(entries, d => +d.total)
            };
          })
        };
      });

    // Update Y axis
    y.domain([0, d3.max(aggregatedData, c => d3.max(c.values, d => d.totalPoints))]);
    yAxis.transition().duration(1000).call(d3.axisLeft(y));

    // Bind data to the lines
    var lines = svg.selectAll(".line")
      .data(aggregatedData, d => d.country);

    // Enter new lines
    lines.enter()
      .append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", d => color(d.country))
      .attr("stroke-width", 1.5)
      .attr("opacity", 1.2)
      .merge(lines)
      .transition()
      .duration(1000)
      .attr("d", d => d3.line()
        .x(d => x(d.year))
        .y(d => y(d.totalPoints))
        (d.values)
      );

    // Exit old lines
    lines.exit().remove();

    // Bind data to the points
    var points = svg.selectAll(".dot")
      .data(aggregatedData.flatMap(d => d.values.map(v => ({ ...v, country: d.country }))), d => d.year + d.country);

    // Enter new points
    points.enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.totalPoints))
      .attr("r", 3)
      .attr("fill", d => color(d.country))
      .attr("opacity", 1.2)
      .append("title")
      .text(d => `${d.country}: ${d.totalPoints}`)
      .merge(points)
      .transition()
      .duration(1000)
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.totalPoints));

    // Exit old points
    points.exit().remove();
  }

  // Function to update the legend
  function updateLegend() {
    var legend = svg.selectAll(".legend")
      .data(Array.from(countriesDisplayed), d => d);

    var legendEnter = legend.enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => {
        var xPos = (i % 5) * 150;
        var yPos = height + margin.bottom - 40 + Math.floor(i / 5) * 20;
        return `translate(${xPos},${yPos})`;
      });

    legendEnter.append("rect")
      .attr("x", 0)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", d => color(d));

    legendEnter.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(d => d === "United States of America" ? "USA" : d);

    legend.exit().remove();

    // Increase opacity of the newly added country
    svg.selectAll(".line")
      .filter(d => d.country === Array.from(countriesDisplayed).pop())
      .attr("opacity", 1);

    svg.selectAll(".dot")
      .filter(d => d.country === Array.from(countriesDisplayed).pop())
      .attr("opacity", 1);
  }

  // Initialize the plot with the initial countries
  updatePlot(initialCountries);
  updateLegend();

  // Event listener for the search input
  d3.select("#country-input").on("keypress", function(event) {
    if (event.key === "Enter") {
      var country = d3.select(this).property("value").trim();
      if (country && !countriesDisplayed.has(country)) {
        countriesDisplayed.add(country);
        updatePlot(Array.from(countriesDisplayed));
        updateLegend();
      }
    }
  });
});
