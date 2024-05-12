let myChart;
let myChart2;
	


function loadCSV() {
   
    fetch('../../data/dataset_bar_chart.csv')
        .then(response => response.text())
        .then(data => processData(data));
}


function processData(csvData) {
    const dataRows = csvData.split('\n').map(row => row.split(','));
    const countries = [];
   
    for (let i = 1; i < dataRows.length; i++) {
        const row = dataRows[i];
        countries.push(row[6]); 
    }
    // Supprimer les doublons de la liste des pays
    const uniqueCountries = [...new Set(countries)];
    // Mettre à jour le sélecteur de pays avec les options
    const countrySelect = document.getElementById('countrySelect');
	uniqueCountries.forEach(country => {
        if (!countrySelect.querySelector(`option[value="${country}"]`)) {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    }
    });
    
    // Mettre à jour le graphique une fois les données traitées
    updateChart(dataRows);
	
}

// Fonction pour mettre à jour le graphique en fonction du pays sélectionné
function updateChart(data) {
    const selectedCountry = document.getElementById('countrySelect').value;
    const filteredData = data.filter(row => row[6] === selectedCountry); 
    
    let newData = {
        labels: filteredData.map(row => row[1]), 
        datasets: [{
            label: 'Nombre de médailles',
            data: filteredData.map(row => row[2]), 
            backgroundColor: 'rgba(253, 240, 9, 0.8)', 
            borderColor: 'rgba(253, 240, 9, 0.8)',
            borderWidth: 1
        }]
    };

	let newData2 = {
			labels: filteredData.map(row => row[1]), 
			datasets: [{
				label: 'GDP per capita',
				data: filteredData.map(row => row[5]), 
				backgroundColor: 'rgba(2, 61, 244, 0.8)',
				borderColor: 'rgba(2, 61, 244, 0.8)',
				borderWidth: 1
			}]
		};

    // Mettre à jour les données du graphique
    myChart.data = newData;
    myChart.update();

	myChart2.data = newData2;
	myChart2.update();

	const correlation = ss.sampleCorrelation(newData.datasets[0].data.map(element => parseInt(element)), newData2.datasets[0].data.map(element => parseInt(element)));
	const correlationParagraph = document.querySelector('.correlation');
	correlationParagraph.textContent = 'Valeur de la correlation : ';
	correlationParagraph.textContent += correlation;
	console.log(correlation);
}



	

// Appeler la fonction pour charger les données CSV lorsque la page est chargée
window.addEventListener('load', () => {
    loadCSV();
    const ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {},
        options: {
			
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
	const ctx2 = document.getElementById('myChart2').getContext('2d');
    myChart2 = new Chart(ctx2, {
        type: 'bar',
        data: {},
        options: {
			
            scales: {
                y: {
                    beginAtZero: true
				}
			}
		}
	});
});


document.getElementById('countrySelect').addEventListener('change', function() {
    // Appelez la fonction pour mettre à jour le graphique lorsque le pays est sélectionné
    loadCSV();
});	
