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

let isPaused = false; // Drapeau pour savoir si l'exécution est en pause ou non
let currentYear = null; // Année courante où l'exécution est en pause
let startYear = null; // Année de départ de l'exécution


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

    // Supprimer les doublons de la liste des pays
    const uniqueCountries = [...new Set(countries)];
    uniqueCountries.forEach((country, i) => {
      color_of_countries[country] = color(i);
    });

    for (let year in dataByYear) {
      for (let i = 0; i < dataByYear[year].length; i++) {
         (dataByYear[year][i].total > maxTotal) 
          maxTotal = dataByYear[year][i].total;
      }
    }


    const selectionYear = document.getElementById('start_year');
    years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    selectionYear.appendChild(option);
    });

    selectionYear.addEventListener("change", () => {
        currentYear = selectionYear.value;
        isPaused = false;
        transitions(data, currentYear);
    });

    let hitButton = 0;

    startButton.addEventListener("click", function(){
    hitButton += 1;
    if (isPaused === false && hitButton === 1) {
      transitions(data, startYear);
    }

    else if (isPaused === true) {
      if (currentYear !== null) {
        isPaused = false;
        transitions(data, currentYear);
      }

    }
  });
    
  });
   
};

 
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
    
    
    

    // Supprimer les anciens axes avant l'update
  svg.selectAll(".x-axis").remove();
  svg.selectAll(".y-axis").remove();

  
  /*const xAxis = d3.axisBottom(xScale);*/
  svg.append("g")
   .attr("transform", "translate(0," + height + ")")
   .attr("class", "x-axis")
   .call(xAxis);


  /*const yAxis = d3.axisLeft(yScale);*/
  svg.append("g")
   .attr("class", "y-axis")
   .call(yAxis);

     

}


let timeouts = []; // Tableau pour stocker les timeouts en cours

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
      if (!isPaused) { // Vérifier si l'exécution est en pause avant d'exécuter updateRaceChart
        updateRaceChart(dataByYear[year], 2000);
        currentYear = year;
        displayYear.textContent = currentYear;
      }
    }, delay);
    delay += 2000;
    timeouts.push(timeoutId); // Stocker le timeout en cours dans le tableau timeouts
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



window.addEventListener("load", function() {
  loadCSVRaceChart();
  setTimeout(function() {
    stopButton.click();
  }, 3000);   

  setTimeout(function() {
    startButton.click();
  }, 2000);   

    
});
  