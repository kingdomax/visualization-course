import * as d3 from "d3";

export function tagCloud(svg, wordvectors) {
    const width = 1000;
    const height = 600;
    const margin = { top: 100, right: 50, bottom: 30, left: 50 };
    const numWords = 15;
  
    svg.attr("viewBox", [0, 0, width, height]);
  
    const x = d3
      .scalePoint()
      .domain(wordvectors.map((d) => d.title))
      .range([margin.left, width - margin.right]);
  
    const y = d3
      .scalePoint()
      .domain(
        Array(numWords)
          .fill(0)
          .map((d, i) => i)
      )
      .range([margin.top, height - margin.bottom]);
  
    svg
      .append("g")
      .attr("transform", `translate(0, ${margin.top})`)
      .call(d3.axisTop(x))
      .call((g) =>
        g
          .selectAll("text")
          .style("transform", "rotate(-45deg)")
          .style("text-anchor", "start")
      );
  
    svg
      .append("g")
      .selectAll("g")
      .data(wordvectors)
      .join("g")
      .attr("transform", (d) => `translate(${x(d.title)},0)`)
      .selectAll("text")
      .data((d) => d.wordvector.slice(0, numWords))
      .join("text")
      .attr("x", 0)
      .attr("y", (d, i) => y(i))
      .attr("dy", "1em")
      .attr("text-anchor", "middle")
      .text((d) => d[0]);
  }
  