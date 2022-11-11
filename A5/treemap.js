import * as d3 from 'd3';
import { bigMoneyFormat } from './src/utils.js';

// naive function to heuristically determine font size based on the rectangle size
function fontSize(d) { return Math.min(12, Math.max(8, d.x1 - d.x0 - 4)); }

export function treemap({
  svg,
  data,
  width = 1000,
  height = 600,
  color = d3.scaleOrdinal(d3.schemeTableau10),
}) {
  svg.attr('viewBox', [0, 0, width, height]).style('font', '10px sans-serif');

  // setup the combobox for the selection of a tiling algorithm
  const tilings = [
    'treemapSquarify',
    'treemapBinary',
    'treemapSlice',
    'treemapDice',
    'treemapSliceDice',
  ];
  const selectTile = d3.select('select#treemapTile');
  selectTile.selectAll('option').data(tilings).join('option').text(text => text);
  selectTile.on('change', function(event){ update(this.value); });
  
  function update(tiling) {
    // remove all previous elements
    console.log('[Treemap]', tiling);
    svg.selectAll('*').remove();

    // TODO: prepare the treemap using d3.treemap and d3.hierarchy with the selected tiling algorithm. 
    const hierarchy = d3.hierarchy(data)
                        .sum((d) => d.revenue)
                        .sort((a, b) => b.height - a.height || b.value - a.value);
    d3.treemap().tile(d3[tiling]).size([width, height]).padding(1)(hierarchy); 
    
    draw();
    function draw() {
      // TODO: create a group for each leaf node
      const leaves = hierarchy.leaves();
      console.log('[Treemap] leaves', leaves);
      
      // TODO: draw a rectangle
      const cell = svg.selectAll('g').data(leaves)
                                      .join('g')
                                      .attr('transform', leave => `translate(${leave.x0},${leave.y0})`);
      cell.append('rect')
          .attr('fill-opacity', .6)
          .attr('fill', (leave => {
            if (!leave.depth) return '#ccc';
            while (leave.depth > 1) leave = leave.parent;
            return color(leave.data.name);
          }))
          .attr('width', leave => leave.x1 - leave.x0)
          .attr('height', leave => leave.y1 - leave.y0);

      // TODO: draw label
      const uid = `O-${Math.random().toString(16).slice(2)}`; // Prevent text out of bound
      const uidBinder = (leave, i) => `url(${new URL(`#${uid}-clip-${i}`, location)})`;
      cell.append("clipPath")
          .attr("id", (leave, i) => `${uid}-clip-${i}`)
          .append("rect")
          .attr("width", leave => leave.x1 - leave.x0)
          .attr("height", leave => leave.y1 - leave.y0);
      cell.append('text')
          .attr("clip-path", uidBinder)
          .attr('x', 2)
          .attr('y', '0.9em')
          .attr('font-size', fontSize)
          .text(leave => leave.data.title);
      cell.append('text')
          .attr("clip-path", uidBinder)
          .attr('x', 2)
          .attr('y', '2em')
          .attr('fill-opacity', .6)
          .attr('font-size', fontSize)
          .text(leave => bigMoneyFormat(leave.value));

      // TODO: tooltip
      cell.append('title')
          .text(leave => `${leave.ancestors().reverse().slice(1).map(leave => leave.children ? leave.data.name : leave.data.title).join(' → ')}
                          \n${bigMoneyFormat(leave.value)}`
      );
    }
  }
  
  update(tilings[0]);
}
