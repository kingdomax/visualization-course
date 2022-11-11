import * as d3 from "d3";
import { lineChart } from "./linechart.js";
import { loadMoviesDataset } from "./src/movies.js";
import { movieFranchises } from "./src/franchises.js";
import { icicle } from "./src/icicle.js";
import { treemap } from "./treemap.js";

d3.csv("/data/boxoffice.csv", d3.autoType).then((data) => {
  lineChart({
    svg: d3.select("svg#linechart"),
    width: 1000,
    data: data,
    attribute: "totalGross",
  });
});

loadMoviesDataset().then((movies) => {
  const franchises = movieFranchises(movies);
  const color = d3.scaleOrdinal(d3.schemeTableau10).domain(new Set(franchises.children, (d) => d.data.name));
  console.log('DATA', franchises);

  icicle({
    svg: d3.select("svg#icicle"),
    data: franchises,
    color: color,
  });
  treemap({
    svg: d3.select("svg#treemap"),
    data: franchises,
    color: color,
  });
});
