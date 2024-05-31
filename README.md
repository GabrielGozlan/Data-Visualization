# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Gabriel Yehouda Gozlan | 385168 |
| Qian Hui Sim | 384851|
| Luca Mouchel | 324748|

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Accessing our website
To access our website locally, you can first clone our project
`git clone https://github.com/com-480-data-visualization/project-2024-Maths-Olympiviz.git`
Then, change directory into the folder `./web`.
Run the following command `python -m http.server`
You can now access our website lcaolly by keying `http://0.0.0.0:8000/` into the browser.

## Milestone 1 (29th March, 5pm)

**10% of the final grade**

### Dataset

> The dataset that we have chosen is the International Mathematics Olympiad (IMO) scores from Kaggle. 

The dataset contains scores of the IMO participants from 1984 to 2017, with breakdown of the individual scores for each problem. The dataset has been cleaned, as the records for the years where the scores for the individual problems are not recorded are omitted. This ensures completeness of the dataset and hence, no data-cleaning needs to be done. 

However, the amount of information that we can gather from this one particular dataset is rather limited, as it only focuses on the participants and their scores. We have decided to take another similar dataset, which is on the ranking of each country every year. This way, we are able to relate both datasets, to analyse the performance of the participants, and their relationship with their respective countries’ overall standing for the year.

The dataset represents the countries in country code (e.g. FRA for France), and we have found a Github repository that provides the mapping of the country code to its name: https://github.com/arthurberg/IMO.

### Problematic

> Frame the general topic of your visualization and the main axis that you want to develop.
> - What am I trying to show with my visualization?

GDP is a measure that partially represents the economic state of a country, which has an influence on many aspects of the lives of the country's citizens, including education. Both outside of school (less stress, more fulfillment with a stable decent income) and at school (the better the economy is, the more the state can invest in education), even if GDP measures the first category less well, because it does not represent the distribution of money between populations. Countries that are doing well economically will also have more resources to put in place systems to promote gender equality, so GDP has an influence on the proportion of women in science in particular.
So with our visualization, we want to show the impact of GDP on the performance of students at the International Mathematics Olympiads on different parameters: percentage of women participants, number of medals, progression and regression in the country ranking and so on.



> - Think of an overview for the project, your motivation, and the target audience.

The main visualization of our project will be an interactive world map which will allow visualization according to several characteristics already mentioned. It will also be possible to choose the desired country(ies), and a time axis will allow you to choose the desired year(s), with manual progress or by letting the program scroll the years.
The other visualizations will allow us to give another point of view of the data, such as a visualization in the form of a “race” between countries according to different parameters such as GDP or the number of medals, to highlight the variations and possible correlations between the parameters. .
We are engineering students, and we find great satisfaction in solving problems, particularly involving mathematics, and also when it is possible to express originality. As a result, the International Mathematics Olympiads arouse our curiosity, and respect for the brilliant students who take it. In addition, education is an important subject for us, and we understand the importance of good working conditions, particularly because EPFL has invested a lot in this area. This is why we find it interesting to look at 
the links that may exist between GDP and results in the international mathematics Olympics.
In this sense, our target audience corresponds to all people who are interested in sociological influences on education and/or mathematics enthusiasts who would like to learn more about the very famous international mathematics Olympics.



### Exploratory Data Analysis

> - Pre-processing of the data set you chose

The dataset we have picked is already sanitized and clean, in the sense where we have the raw scores recorded per participant per country.

Our data includes 
`year`, `country`, `firstname`,`lastname`, `problem1`, `problem2`,`problem3`, `problem4`, `problem5`, `problem6`, `total`, `rank`, `award`.

The math olympiads consists of 6 problems (7 points each) individuals need to complete in a given time-frame. Countries have several participants representing the nation at the olympiads. 

Our data consists of scores per participant and their country from the years 1984 to 2017. 

Our data does not contain any `NaN` values and no missing entries.
> - Show some basic statistics and get insights about the data

Here are some very basic statistics we extracted from the data which will be useful for our final visualizations. The first one consists of the total number of points of the top 5 countries in hand-picked years: 1990, 2010, 2015, 2017. 

![image](https://github.com/com-480-data-visualization/project-2024-Maths-Olympiviz/blob/master/image-1.png)

We can see some pretty surprising results with countries we would not necessarily expect to make it to the top 10.

The following pie-chart depicts the total number of gold medals in the years __1984-2017 (left)__ and __2010-2017 (right)__
![image](https://github.com/com-480-data-visualization/project-2024-Maths-Olympiviz/blob/master/image-2.png)


Some other basic analysis we did was look at some countries who were awarded the "Honorable mention":

| 2010 | 2017 |
| ---- | ------- |
| Belgium | Finland
| Cambodia | Colombia
| Sri-Lanka | Macau
| Tajikistan | Switzerland
| Austria | Syria


Average points per participant in 2017 for the top 5 countries out of 6 problems, each worth 7 points

| Country | Average points per participant |
| ---------- | ------ |
| Korea | 28.33 |
| China | 26.5 |
| Vietnam | 25.83 |
| USA | 24.66 |
| Iran | 23.66 |

We also looked into the percentage of female participants per country as well as some visual representation of countries' GDP.
![image](https://github.com/com-480-data-visualization/project-2024-Maths-Olympiviz/assets/73081373/acd936d6-b67b-46f1-9eaf-50c6a9fc93e0)

![image](https://github.com/com-480-data-visualization/project-2024-Maths-Olympiviz/assets/73081373/7bb6ff1f-179a-42fe-81d8-506e8463115e)



### Related work


> - What others have already done with the data?

The paper Statistical Analysis of the IMO (Berg, 2021) analyses key areas of interest - e.g., identifying top performers throughout the years, if there is home-field advantage in hosting the IMO, and the gender differences The paper focuses mainly on statistical tests, such as exploring gender differences in participation rates by country. Furthermore, the paper focuses only on the top 6 countries in their analysis and visualisation.

The second paper (Eric et. al., 2015) analyses the relationship between mathematics performance and GDP per capita. The paper measures mathematics performance through PISA 2012 mathematics scores.The findings was that nations with stronger performance on STEM related PISA tests were in fact more likely to show greater economic strength as measured by each nation’s GDP per capita.

On Wikipedia, you can access a table showing the major prizes won by IMO participants. It is therefore possible to gather this data by web scraping, and perhaps study a little more the relationship between success at the Olympics and future success in mathematics.



> - Why is your approach original?

With regards to the first paper, we are providing users with a more interactive experience in the data visualisation process. We are proposing to centralise the data more effectively, with the percentage of women taking part, information on the medals won, the GDP per country and the total points collected by the participants all on the same map, with the possibility of varying the timeframe. Furthermore, rather than just restricting to the top few countries in the analysis and visualisation (due to space constraint), we would provide users the flexibility to choose the countries for their analysis. We have also found the gender analysis to be rather concrete, and since there are many other papers that research on gender differences in IMO, we decide to focus on another problem.
The problem that we are analysing is how a country’s GDP affects the performance of their participants in the IMO (rather than how the performance of the participants affects the country’s GDP, as analysed in the second paper).


> - What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).

Since we are comparing the number of participants from each country, a visualisation with the world map would definitely help. An inspiration that we took was from the Covid article from The New York Times (The New York Times, 2020), where they illustrated the average daily Covid cases in the United States using the choropleth map. We were inspired to do the same, but with the entire world map. We would separate the map according to countries, and then fill each resulting section with a different colour or shade. Each colour or shade represents a range for the number of participants representing the country. This makes it easy to visualise clusters of data across a geographic area while maintaining the context of regional boundaries. 
In addition to the visual representation, readers can also hover on the map to see actual average daily Covid cases. Drawing inspiration from this, we would have our choropleth map to be interactive, where users can click to reveal more information about the participants representing the country, such as proportion of male and female, age range, etc.
To further improve on the visualisation, we would provide a timeline feature at the bottom, where users can scroll along the timeline to see how the number of participants representing each country changes.



>>>> Extra 
Other source of inspiration :
Youtube visualization (top 20 country, « race » format) :  https://www.youtube.com/watch?v=38xeYPAUPd0
Websites from another year (COM-480) (with interactive maps)
https://github.com/com-480-data-visualization/com-480-project-story-tellers?tab=readme-ov-file
https://github.com/com-480-data-visualization/datavis-project-2022-datawiz?tab=readme-ov-file
Other Websites : (race form visualization)
https://flourish.studio/blog/line-chart-race/


## Milestone 2 (26th April, 5pm)
**10% of the final grade**


The report can be found here: [Report](data_viz.pdf)

The website can be accessed by opening `web/index.html`

To access our website locally, you can first clone our project git clone https://github.com/com-480-data-visualization/project-2024-Maths-Olympiviz.git Then, change directory into the folder ./web. Run the following command python -m http.server You can now access our website lcaolly by keying http://0.0.0.0:8000/ into the browser.


## Milestone 3 (31st May, 5pm)

**80% of the final grade**
The report can be found here: [Report](com-480_process_book.pdf)

The website can be accessed by opening `web/html/index.html`

To access our website locally, you can first clone our project git clone https://github.com/com-480-data-visualization/project-2024-Maths-Olympiviz.git Then, change directory into the folder web/html/. Run the following command python -m http.server 8000 You can now access our website locally by typing http://0.0.0.0:8000/ into the browser.

You can see our screen cast here: [Video](screencast.mp4)
## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

