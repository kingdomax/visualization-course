import * as vega from "vega"
import * as vl from "vega-lite-api"
import * as vegaLite from "vega-lite"

vl.register(vega, vegaLite, {})
const data = vl.csv("./data/reduced_daily_climate_summary.csv")

// Base construct of chart, please adjust to match your questions
const example = () => {
    vl.markPoint().data(data).encode(
        vl.y().fieldN("STATION_NAME"),
        vl.x().fieldT("DATE")
    ).render().then(chart => document.getElementById("example").appendChild(chart));
};

// Q1) Is there a trend in TEMPERATURE_AIR within a year ?
const question1 = () => {
    const tempMinMax = vl.markArea({opacity: 0.3}).encode(
        vl.x().month("DATE").title(null),
        vl.y().average("TEMPERATURE_AIR_MAX").title("Avg. Temperature"),
        vl.y2().average("TEMPERATURE_AIR_MIN")
    );
    
    const tempAverage = vl.markLine({strokeWidth: 3}).encode(
        vl.x().month("DATE"),
        vl.y().average("TEMPERATURE_AIR")
    );
    
    vl.layer(tempMinMax, tempAverage).data(data).width(500).height(300).render().then(chart => document.getElementById("q1").appendChild(chart));
};

// Q2) Do these SUNSHINE_DURATION, PRESSURE_AIR and HUMIDITY affect TEMPERATURE_AIR within a year ?
const question2 = () => {
    const temp = vl.markLine({strokeWidth: 3}).encode(
        vl.x().month("DATE").title(null),
        vl.y().average("TEMPERATURE_AIR").title("Avg. Temperature"),
    );
    
    const sunDuration = vl.layer(temp, vl.markLine({strokeWidth: 3, color: "red"}).encode(
        vl.x().month("DATE").title(null),
        vl.y().average("SUNSHINE_DURATION").title("Avg. Sun duration")
    )).data(data).resolve({scale: {y: "independent"}}).width(400).height(300);
    
    const airPressure = vl.layer(temp, vl.markLine({strokeWidth: 3, color: "orange"}).encode(
        vl.x().month("DATE").title(null),
        vl.y().average("PRESSURE_AIR").title("Avg. Air pressure")
    )).data(data).resolve({scale: {y: "independent"}}).width(400).height(300);
    
    const humidity = vl.layer(temp, vl.markLine({strokeWidth: 3, color: "green"}).encode(
        vl.x().month("DATE").title(null),
        vl.y().average("HUMIDITY").title("Avg. Humidity")
    )).data(data).resolve({scale: {y: "independent"}}).width(400).height(300);
    
    vl.hconcat(sunDuration, airPressure, humidity).render().then(chart => document.getElementById("q2").appendChild(chart));
};

// Q3) What is the average TEMPERATURE_AIR for each station ?
const question3 = () => {
    var tempHistogram = vl.markBar().encode(
        vl.x().fieldN("STATION_NAME").title("Station").sort(vl.average("TEMPERATURE_AIR")),
        vl.y().average("TEMPERATURE_AIR").title("Avg. Temperature"),
        vl.color().fieldN("STATION_NAME")
    );
    
    var averageLine = vl.markRule({stroke: "red"}).encode(
        vl.y().average("TEMPERATURE_AIR")
    );
    
    vl.layer(tempHistogram, averageLine).data(data).width(500).height(300).render().then(chart => document.getElementById("q3").appendChild(chart));
};

// Q4) View compositions algebra
const question4 = () => {
    const scatterPlot = vl.markCircle().encode(
        vl.x().fieldQ(vl.repeat("column")),
        vl.y().fieldQ(vl.repeat("row")),
    ).repeat({
        row: ["TEMPERATURE_AIR", "SUNSHINE_DURATION", "PRESSURE_AIR", "HUMIDITY", "SNOW_DEPTH"],
        column: ["TEMPERATURE_AIR", "SUNSHINE_DURATION", "PRESSURE_AIR", "HUMIDITY", "SNOW_DEPTH"]
    });

    const histogram = vl.layer(
        vl.markBar().encode(
            vl.x().month("DATE").title(null),
            vl.y().average(vl.repeat("row"))
        ),
        vl.markRule({stroke: "red"}).encode(
            vl.y().average(vl.repeat("row"))
        )
    ).repeat({
        row: ["TEMPERATURE_AIR", "SUNSHINE_DURATION", "PRESSURE_AIR", "HUMIDITY", "SNOW_DEPTH"]
    });

    const stationHist = vl.markBar().encode(
        vl.x().month("DATE").title(null),
        vl.y().average("TEMPERATURE_AIR").title("Avg. Temperature"),
        vl.color().fieldN("STATION_NAME")
    ).facet({
        column: vl.field("STATION_NAME")
    });

    vl.data(data).title({text: "Germany Weather Dashboard", fontSize: "24"}).vconcat(
        vl.hconcat(scatterPlot, histogram),
        stationHist
    ).resolve({legend: {color: "independent"}}).config({axis: {labelAngle: 0}}).render().then(chart => document.getElementById("composite").appendChild(chart));
};

example();
question1();
question2();
question3();
question4();
