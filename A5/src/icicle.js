import * as d3 from "d3";
import { bigMoneyFormat, shortenText } from "./utils.js";

export function icicle({
  svg,
  data,
  width = 1000,
  height = 600,
  color = d3.scaleOrdinal(d3.schemeTableau10),
}) {
  // Build hierarchy data structure with contains node, children, depth, coordinate
  const hierarchy = d3
    .hierarchy(data)
    .sum((d) => d.revenue)
    .sort((a, b) => b.height - a.height || b.value - a.value);
  console.log('[Icicle] hierarchy', hierarchy);
  
  // Define root node of hierarchy data
  const root = d3.partition().size([height, width]).padding(1)(hierarchy);
  console.log('[Icicle] root', root);

  const maxDepth = d3.max(root.descendants(), (d) => d.depth);
  const x = d3.scaleBand().domain(d3.range(1, maxDepth + 1)).range([0, width]);

  // build g container
  svg.attr("viewBox", [0, 0, width, height]).attr("font-family", "sans-serif");
  
  
  
  const cell = svg 
    .selectAll("g")
    .data(root.descendants().filter((d) => d.depth > 0))
    .join("g")
    .attr("transform", (d) => `translate(${x(d.depth)},${d.x0})`);

  // append rectangle to each g
  cell 
    .append("rect")
    .attr("width", x.bandwidth() - 1)
    .attr("height", (d) => d.x1 - d.x0)
    .attr("fill-opacity", 0.6)
    .attr("fill", (d) => {
      if (!d.depth) return "#ccc";
      while (d.depth > 1) d = d.parent;
      return color(d.data.name);
    });




  const minFontSize = 6;

  function fontSize(d) {
    return Math.min(12, Math.max(minFontSize, d.x1 - d.x0 - 2));
  }

  // <text></text>
  const text = cell
    .filter((d) => d.x1 - d.x0 > minFontSize)
    .append("text")
    .style("user-select", "none")
    .attr("pointer-events", "none")
    .attr("font-size", fontSize)
    .attr("x", 2)
    .attr("y", "0.9em");

  // <text><tspan>title</tspan></text>
  text
    .append("tspan")
    .text((d) =>
      shortenText(
        d.children ? d.data.name : d.data.title,
        Math.floor((x.bandwidth() / fontSize(d)) * 1.4)
      )
    );
  // <text><tspan>title</tspan><tspan>money value</tspan></text>
  text
    .append("tspan")
    .attr("fill-opacity", 0.7)
    .text((d) => ` ${bigMoneyFormat(d.value)}`);

  cell.append("title").text(
    (d) =>
      `${d
        .ancestors()
        .reverse()
        .slice(1)
        .map((d) => (d.children ? d.data.name : d.data.title))
        .join(" → ")}\n${bigMoneyFormat(d.value)}`
  );

  return svg.node();
}
