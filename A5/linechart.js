import * as d3 from 'd3';
import { bigMoneyFormat, shortenText } from './src/utils.js';

export function lineChart({
  svg,
  data,
  attribute,
  width = 1000,
  height = 500,
  margin = { top: 20, right: 120, bottom: 30, left: 40 },
}) {
  svg.attr('viewBox', [0, 0, width, height]).style('font', '10px sans-serif');

  // scale for the number of days on the x-axis
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.day))
    .range([margin.left, width - margin.right])
    .clamp(true);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d[attribute]))
    .range([height - margin.bottom, margin.top])
    .nice();

  // group the data by movie title
  const movies = d3
    .groups(data, (d) => d.title)
    .map(([key, values]) => ({ key, values }));

  // draw the x-axis
  svg
    .append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(
      d3
        .axisBottom(xScale)
        .ticks(width / 80)
        .tickSizeOuter(0)
    );

  // draw the y-axis with grid lines
  svg
    .append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale).tickFormat(bigMoneyFormat))
    .call((g) =>
      g
        .selectAll('.tick line')
        .clone()
        .attr('stroke-opacity', (d) => (d === 1 ? null : 0.2))
        .attr('x2', width - margin.left - margin.right)
    );

  // color scale by movie title
  const color = d3.scaleOrdinal(d3.schemeCategory10).domain(movies.keys());

  // TODO: draw a line for each time series as well as labels
  const line = d3.line().curve(d3.curveLinear).x(i => xScale(i.day)).y(i => yScale(i[attribute]));
  svg.append('g').selectAll('path').data(movies)
                                    .join('path')
                                    .attr('fill', 'none')
                                    .attr('stroke-width', 2)
                                    .attr('stroke', ({key}) => color(key))
                                    .attr('d', ({values}) => line(values));
  svg.append('g').selectAll('text').data(movies)
                                    .join('text')
                                    .attr('font-size', 12)
                                    .attr('font-weight', 700)
                                    .attr('fill', ({key}) => color(key))
                                    .text(({key}) => shortenText(key, 17))
                                    .attr('x', ({values}) => xScale(values[values.length-1].day))
                                    .attr('y', ({values}) => yScale(values[values.length-1][attribute]))
                                    .attr('transform', 'translate(5, 5)');
}
