import * as vega from "vega";
import * as vegaLite from "vega-lite";
import * as vl from "vega-lite-api";

// Find a positive and a negative correlation in the data (Hint: scatterplots are useful here).
const question1 = () => {
    const positiveCorrelation = vl.markPoint().data("/data/cars.csv").encode(
        vl.x().fieldQ("horsepower").scale({zero:false}),
        vl.y().fieldQ("weight").scale({zero:false}),
    );
    
    const negativeCorrelation = vl.markPoint().data("/data/cars.csv").encode(
        vl.x().fieldQ("horsepower").scale({zero:false}),
        vl.y().fieldQ("mpg").scale({zero:false}),
    );

    return vl.hconcat(positiveCorrelation, negativeCorrelation);
};

// Is there a trend in miles per gallon over time? (Hint: line charts help with trends over time)
const question2 = () => {
    const point = vl.markPoint({filled: true}).data("/data/cars.csv").encode(
        vl.x().fieldO("year"),
        vl.y().fieldQ("mpg")
    );
    
    const line = vl.markLine({strokeWidth: 3}).data("/data/cars.csv").encode(
        vl.x().fieldO("year"),
        vl.y().median("mpg")
    );

    return vl.layer(point, line).width(500).height(300);
};

// What is the average horsepower per country? (Hint: usually a bar chart helps with these tasks)
const question3 = () => {
    return  vl.markBar().data(vl.csv("/data/cars.csv")).encode(
                vl.x().fieldN("origin").sort(vl.average("horsepower").order("ascending")),
                vl.y().average("horsepower")
            ).width(500).height(300);
};

// Is there a trend in the number of cars build per year and country?
const question4 = () => {
    return  vl.markLine({strokeWidth: 3}).data("/data/cars.csv").encode(
                vl.x().fieldO("year"),
                vl.y().median("displacement"),
                vl.color().fieldN("origin")
            ).width(500).height(300);
};

vl.register(vega, vegaLite, {});
const render = (chart) => chart().render().then(chart => document.getElementById("assignment1").append(chart));
render(question1);
render(question2);
render(question3);
render(question4);
