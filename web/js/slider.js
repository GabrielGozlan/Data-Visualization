let header = ["Index","Name","Team","IMO","Fields_Medal","Wolf_Prize","AMS_Prize","AMS_research_prizes","Clay_Award","Abel_Prize","Person_Image","Country_Flag"];

let csvUrl = "../../data/notables_with_urls.csv"
let defaultImgUrl = "../../images/default_image.jpg"

function transformMedals(medalsString) {

    if (typeof medalsString !== 'string') {
      return "IMO Results: <br>No data available";
    }

    // Mapping des abréviations vers les descriptions complètes
    const medalDescriptions = {
        'G': 'Gold medal',
        'S': 'Silver medal',
        'B': 'Bronze medal',
        'P': 'Perfect score',
        'R': 'Participant'
    };

    let cleanString = medalsString.replace(/[\[\]'"]/g, '');  
    let medalsArray = cleanString.split(':');
    let transformedArray = medalsArray.map(medal => {
        let trimmedMedal = medal.trim();
        let [medalType, year] = trimmedMedal.split(' ').map(element => element.replace(/"/g, '').trim());  

        if (medalDescriptions[medalType]) {
            return `${medalDescriptions[medalType]} in ${year}`;
        } else {
            
            return trimmedMedal;
        }
    });

    return "IMO Results :" + "<br>" + transformedArray.join(', <br>');
}

/*
function formatPrizes(rowList) {
    let description = "Major prizes won : " 
    let prizes = [];

    // Assumer que les informations de prix commencent à l'index 4 et se terminent avant les deux dernières colonnes
    for (let i = 4; i < rowList.length - 2; i++) {
        let data = rowList[i];
        if (data && data.trim() !== "") { // Vérifie que la donnée n'est pas vide
            if (header[i] === "Fields_Medal" || header[i] === "Wolf_Prize" || header[i] === "AMS_Prize" || header[i] === "AMS_research_prizes" || header[i] === "Clay_Award" || header[i] === "Abel_Prize"){
            prizes.push(`\n ${header[i]} in ${data.trim()}`);
            }
        
    }
}

    if (prizes.length > 0) {
        description += prizes.join(', ');
    } else {
        description += "No major prizes";
    }

    return description;
}
*/


function loadDataFromCSV() {
    fetch(csvUrl) 
      .then(response => response.text())
      .then(data => {
        const rows = data.split('\n').slice(1); 
        const container = document.querySelector('.slide');
       
        rows.forEach(row => {
          let rowList = row.split(',');
          const Person_Image_Index = rowList.length - 3;
          const Name_Index = 1;
          const Team_Index = 2;
          const Country_Image_Index = rowList.length - 2;
          const wiki_Link_Index = rowList.length - 1;

         
        const medalsString  = rowList[3];
        const imoDescription = transformMedals(medalsString);

          let [imageUrl, name, team, src, wikiLink] = [rowList[Person_Image_Index], rowList[Name_Index], rowList[Team_Index], rowList[Country_Image_Index], rowList[wiki_Link_Index]];
          if (!imageUrl || imageUrl.trim() === '') {
            imageUrl = defaultImgUrl;
          }

          
          const item = document.createElement('div');
          item.classList.add('item');
          item.style.backgroundImage = `url(${imageUrl})`;
          item.innerHTML = `
            <div class="content">

              <div class="name">${name}</div>
            
              <div class="medals">
              <div class="imo">${imoDescription}</div>
              
              </div>

              <div class="Flag_container">
              <div class="des">${team}</div>
              <img class="country" src="${src}">
              </div>

              <button class="btn" onclick="window.open('${wikiLink}', '_blank')">See More</button>


            </div>
          `;
          container.appendChild(item);

        
        });
      })
  }

  // Appel de la fonction pour charger et afficher les données
  loadDataFromCSV();






let next = document.querySelector('.next')
let prev = document.querySelector('.prev')

next.addEventListener('click', function(){
    let items = document.querySelectorAll('.item')
    document.querySelector('.slide').appendChild(items[0])
})

prev.addEventListener('click', function(){
    let items = document.querySelectorAll('.item')
    document.querySelector('.slide').prepend(items[items.length - 1]) // here the length of items = 6
})


