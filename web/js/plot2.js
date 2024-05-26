// Set the dimensions and margins of the graph
var margin = {top: 60, right: 30, bottom: 70, left: 60}, // Increased top margin to make space for the title
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Append the svg object to the div with id "chart2"
var svg = d3.select("#chart2")
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
  .text("Evolution of Total Points / GDP for Selected Countries");

// Function to load GDP data for a given year
function loadGDPData(year) {
  return d3.csv(`../../data/mapslider2/world-data-${year}.csv`).then(function(data) {
    var gdpMap = {};
    data.forEach(d => {
      gdpMap[d.Country] = +d.GDP;
    });
    return gdpMap;
  });
}

// Parse the IMO results data
d3.csv("../../data/imo_results2.csv").then(function(imoData) {
  var years = d3.extent(imoData, d => +d.year);
  var allYears = d3.range(years[0], years[1] + 1);

  // Load GDP data for all years
  var gdpDataPromises = allYears.map(year => loadGDPData(year));

  Promise.all(gdpDataPromises).then(function(gdpDataArray) {
    var gdpData = {};
    for (var i = 0; i < gdpDataArray.length; i++) {
      gdpData[allYears[i]] = gdpDataArray[i];
    }

    // Aggregate IMO data to calculate total points for each country and year
    var aggregatedData = d3.rollups(imoData, v => d3.sum(v, d => +d.total), d => d.year, d => d.country);

    // Compute the ratio for each country and year
    var ratioData = {};
    aggregatedData.forEach(([year, countries]) => {
      countries.forEach(([country, totalPoints]) => {
        var gdp = gdpData[year] ? gdpData[year][country] : null;
        if (gdp && totalPoints) {
          if (!ratioData[country]) {
            ratioData[country] = []; 
          }
          ratioData[country].push({
            year: +year,
            ratio: totalPoints / gdp
          });
        }
      });
    });

    // List of countries to plot
    var countriesToPlot = ['Morocco', 'China', 'Bulgaria', 'Tajikistan', 'Syria', 'Bangladesh'];

    // Filter the data to include only the specified countries
    var selectedRatioData = countriesToPlot.map(country => {
      return {
        country: country,
        values: ratioData[country]
      };
    });

    // Add X axis
    var x = d3.scaleLinear()
      .domain(d3.extent(imoData, d => +d.year))
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
    function updatePlot(countriesData) {
      // Update Y axis
      y.domain([0, d3.max(countriesData, c => d3.max(c.values, d => d.ratio))]);
      yAxis.transition().duration(1000).call(d3.axisLeft(y));

      // Bind data to the lines
      var lines = svg.selectAll(".line")
        .data(countriesData, d => d.country);

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
          .y(d => y(d.ratio))
          (d.values)
        );

      // Exit old lines
      lines.exit().remove();

      // Bind data to the points
      var points = svg.selectAll(".dot")
        .data(countriesData.flatMap(d => d.values.map(v => ({ ...v, country: d.country }))), d => d.year + d.country);

      // Enter new points
      points.enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.ratio))
        .attr("r", 3)
        .attr("fill", d => color(d.country))
        .attr("opacity", 1.2)
        .append("title")
        .text(d => `${d.country}: ${d.ratio}`)
        .merge(points)
        .transition()
        .duration(1000)
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.ratio));

      // Exit old points
      points.exit().remove();
    }

    // Function to update the legend
    function updateLegend(countries) {
      var legend = svg.selectAll(".legend")
          .data(countries, d => d);
  
      var legendEnter = legend.enter().append("g")
          .attr("class", "legend")
          .attr("transform", (d, i) => {
              var xPos = (i % 5) * 150; // Keeps items in rows of 5
              // Increase yPos every 5 countries. Each row is now further apart.
              var yPos = height + margin.bottom - 40 + Math.floor(i / 5) *20; // Increased the vertical spacing to 30
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
          .filter(d => d.country === Array.from(countries).pop())
          .attr("opacity", 1);
  
      svg.selectAll(".dot")
          .filter(d => d.country === Array.from(countries).pop())
          .attr("opacity", 1);
  }

    // Initialize the plot with the selected countries
    updatePlot(selectedRatioData);
    updateLegend(countriesToPlot);

    // Add event listener for search button


    d3.select("#country-input2").on("keypress", function(event) {
      if (event.key === 'Enter') {
        var country = d3.select(this).property("value").trim();
        if (country in ratioData) {
          countriesToPlot.push(country);
          var newCountryData = {
            country: country,
            values: ratioData[country]
          };
          selectedRatioData.push(newCountryData);
          updatePlot(selectedRatioData);
          updateLegend(countriesToPlot);
        }
      }
    });
  });
});
