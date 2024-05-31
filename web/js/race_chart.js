const margin = { top: 20, right: 20, bottom: 30, left: 60 };
const width = 500 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select(".bg").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


const xScale = d3.scaleLinear()
const yScale = d3.scaleBand()
const xAxis = d3.axisBottom(xScale)
const yAxis = d3.axisLeft(yScale);


const color = d3.scaleOrdinal(d3.schemeCategory10);

let maxTotal = 0; 
let color_of_countries = {};

let startButton = document.getElementById("start_race");
let stopButton = document.getElementById("stop_race");

let isPaused = false; // Flag to indicate whether execution is paused or not
let currentYear = null; // Current year when race chart execution is paused
let startYear = null; // Starting year of execution


function loadCSVRaceChart() {
  fetch('../../data/test.csv')
  .then(response => response.text())
  .then(data => {

    const dataByYear = processDataRaceChart(data);
    const years = Object.keys(dataByYear);

    startYear = years[0];

    const countries = [];

    for (const year of years) {
      for (const ele of dataByYear[year]) {
        const local_country = ele.country;
        countries.push(local_country);
      }
   }

   // Delete duplicates from country list
    const uniqueCountries = [...new Set(countries)];
    uniqueCountries.forEach((country, i) => {
      color_of_countries[country] = color(i);
    });


    // maxTotal was created to have a fixed x-axis, which stops at the maximum number of points possible in the data.
    for (let year in dataByYear) {
      for (let i = 0; i < dataByYear[year].length; i++) {
         (dataByYear[year][i].total > maxTotal) 
          maxTotal = dataByYear[year][i].total;
      }
    }

    // When data is initialized, the year selector is also initialized.
    const selectionYear = document.getElementById('start_year');
    years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    selectionYear.appendChild(option);
    });

    //When a new year is selected, the race chart starts the animation from that year. 
    selectionYear.addEventListener("change", () => {
        currentYear = selectionYear.value;
        isPaused = false;
        transitions(data, currentYear);
    });


    let hitButton = 0;
    // HitButton is necessary to prevent the race chart animation from running several times and creating something totally incoherent.
    startButton.addEventListener("click", function(){
    hitButton += 1;
    if (isPaused === false && hitButton === 1) {
      transitions(data, startYear);
    }

    // The transitions function is modified to display only the last year in which the animation was not paused when the pause button is clicked.
    else if (isPaused === true) {
      if (currentYear !== null) {
        isPaused = false;
        transitions(data, currentYear);
      }

    }
  });
    
  });
   
};



 // Processes the given CSV data to group it by year and extract relevant information
function processDataRaceChart(csvData) {
  const dataRows = csvData.split('\n').map(row => row.split(','));
  const years = dataRows.map(row => parseInt(row[1])); 
  const minYear = d3.min(years);
  const maxYear = d3.max(years);

  const dataByYear = {}; 

  for(let year = minYear; year <= maxYear; year++) {
    const filteredData = dataRows.filter(row => parseInt(row[1]) === year);
    const dataYear = [];

    for(let i = 0; i < filteredData.length; i++) {

      
     
     if (!isNaN(filteredData[i][3])) {
      let total = parseInt(filteredData[i][3]);
      let country = filteredData[i][7];
      dataYear.push({total: total, country: country });
    }
      
    }
    dataByYear[year] = dataYear; 
  }

  return dataByYear; 
}


// This function updates the race chart display according to the year.
function updateRaceChart(data, transition_duration) {

  /*data = data.sort(function(a, b){return a.total-b.total}); */


  xScale.domain([0, maxTotal]).range([0, width]);
  yScale.domain(data.map(d => d.country)).range([height, 0]).padding(0.1);

  const rects = svg.selectAll(".test")
    .data(data)
    

  rects.exit().remove(); 
  rects.enter().append("rect") 
    .attr("class", "test")
    .merge(rects) 
    .transition()
    .duration(transition_duration)
    .attr("fill", d => color_of_countries[d.country]) 
    .attr("width", d => xScale(d.total)) 
    .attr("height", yScale.bandwidth())
    .attr("y", d => yScale(d.country))
    .attr("x", 0);
    
    

  // Delete old axes before updating
  svg.selectAll(".x-axis").remove();
  svg.selectAll(".y-axis").remove();

  
  svg.append("g")
   .attr("transform", "translate(0," + height + ")")
   .attr("class", "x-axis")
   .call(xAxis);


  svg.append("g")
   .attr("class", "y-axis")
   .call(yAxis);

     

}


let timeouts = []; // Table to store current timeouts

function transitions(data, startYear) {
  const dataByYear = processDataRaceChart(data);
  const years = Object.keys(dataByYear);

  let delay = 0;
  let displayYear = document.getElementById("display_year");

  const startYearIndex = years.indexOf(startYear);
  const remainingYears = years.slice(startYearIndex);

  // Annuler tous les timeouts en cours avant de créer une nouvelle série de timeouts
  timeouts.forEach(clearTimeout);
  timeouts = [];

  for (const year of remainingYears) {
    const timeoutId = setTimeout(() => {
      if (!isPaused) { // // Check that execution is not paused before running updateRaceChart
        updateRaceChart(dataByYear[year], 2000);
        currentYear = year;
        displayYear.textContent = currentYear;
      }
    }, delay);
    delay += 2000;
    timeouts.push(timeoutId); // Store the current timeout in the timeouts table
  }

  stopButton.addEventListener("click", function() {
    isPaused = true;
  });

}



/* fetch('./test.csv')
  .then(response => response.text())
  .then(data => console.log(processDataRaceChart(data)));

  window.addEventListener("load", transitions);
  console.log(color_of_countries);

*/




/*

This function is used to simulate a click on the start button when the page is displayed, 
followed by a click on the pause button, so that the chart is already displayed by default on the first year of vosualization, 
rather than nothing being displayed at the race chart location. 

*/

window.addEventListener("load", function() {
  loadCSVRaceChart();
  setTimeout(function() {
    stopButton.click();
  }, 3000);   

  setTimeout(function() {
    startButton.click();
  }, 2000);   

    
});
  