import * as d3 from 'd3';
import { onBrushStart, onBrushing, onBrushEnd } from './brush';

export const renderSPLOM = (data,
                            quantAttributes,
                            categorialAttribute,
                            root,
                            { width, height, margin, cell }) => {
    // Prepare data
    const dataRow = quantAttributes.map(atrribute => data.map(d => d[atrribute])); // transform all attribute value into each list
    const dataColumn = [...dataRow];
    console.log('data', data);
    console.log('dataRow', dataRow);
    console.log('dataColumn', dataColumn);

    // Prepare scales
    const xScales = dataRow.map(row => d3.scaleLinear(d3.extent(row), [0, cell.width]));
    const yScales = dataColumn.map(column => d3.scaleLinear(d3.extent(column), [cell.height, 0]));
    const colorScales = d3.scaleOrdinal(d3.schemeAccent);

    // Draw axis and label
    const svg = root.append('svg').attr('viewBox', [-margin.left, -margin.top, width, height]);
    svg.append('g').selectAll('g').data(xScales)
                                    .join('g')
                                    .attr('transform', (xScale, index) => `translate(${index * cell.outerWidth}, ${height - margin.bottom - margin.top})`)
                                    .each(function(xScale) { 
                                        return d3.select(this).call(d3.axisBottom().ticks(5).scale(xScale));
                                    });
    svg.append('g').selectAll('g').data(yScales)
                                    .join('g')
                                    .attr('transform', (yScale, index) => `translate(0,  ${index * cell.outerHeight})`)
                                    .each(function(yScale){ 
                                        return d3.select(this).call(d3.axisLeft().ticks(5).scale(yScale)); 
                                    });
    svg.append('g').selectAll('text').data(quantAttributes)
                                    .join('text')
                                    .attr('font-size', 16)
                                    .attr('transform', (attribute, index) => `translate(${(index*cell.outerWidth)+cell.padding}, ${(index*cell.outerHeight)+cell.padding})`)
                                    .text(attribute => attribute);

    // Construct cell matrix using cross product & Plot mark
    const dimensions = d3.cross(d3.range(dataRow.length), d3.range(dataColumn.length));
    const cellMatrix = svg.append('g').selectAll('g').data(dimensions)
                                                    .join('g')
                                                    .attr('transform', ([row, column]) => `translate(${row * cell.outerWidth}, ${column * cell.outerHeight})`);
    cellMatrix.append('rect')
                .attr('fill', 'none')
                .attr('stroke', 'black')
                .attr('width', cell.width)
                .attr('height', cell.height);
    cellMatrix.each(function([row, column]) {
        d3.select(this).selectAll('circle').data(d3.range(data.length))
                                            .join('circle')
                                            .attr('r', 4)
                                            .attr('cx', dataIndex => xScales[row](dataRow[row][dataIndex]))
                                            .attr('cy', dataIndex => yScales[column](dataColumn[column][dataIndex]))
                                            .attr('fill', dataIndex => colorScales(data[dataIndex][categorialAttribute]));
    });

    // Add interaction
    const brushBehavior = d3.brush()
                            .extent([[0, 0], [cell.width, cell.height]])
                            .on('start', onBrushStart)
                            .on('brush', onBrushing(cellMatrix.selectAll('circle'), xScales, yScales, dataRow, dataColumn))
                            .on('end', onBrushEnd(cellMatrix.selectAll('circle')));
    cellMatrix.call(brushBehavior);
};

export const renderPCP = (data,
                          quantAttributes,
                          categorialAttribute,
                          root,
                          { width, height, margin }) => {

    // Prepare data
    const dataRow = quantAttributes.map(atrribute => data.map(d => d[atrribute]));

    // Prepare scales
    const xScales = d3.scalePoint(quantAttributes, [margin.left, width-margin.left-margin.right]); // using scalePoint() because need only 4 scale in x axis
    const yScales = dataRow.map(column => d3.scaleLinear(d3.extent(column), [height-margin.bottom-margin.top, 0]));
    const colorScales = d3.scaleOrdinal(d3.schemeAccent);

    // Plot mark, first, at the bottom layer because line can occlude axis scale
    const svg = root.append('svg').attr('viewBox', [-margin.left, -margin.top, width, height]);
    svg.append('g').selectAll('path').data(data) 
                    .join('path') 
                    .attr('fill', 'none')
                    .attr('stroke', d => colorScales(d[categorialAttribute]))
                    .attr('d',  d => d3.line()(quantAttributes.map((attribute, index) => {
                        const yValue = d[attribute];
                        return [xScales(attribute), yScales[index](yValue)];
                    })));

    // Draw axis and label
    svg.append('g').selectAll('g').data(quantAttributes)
                .join('g')
                .attr('transform', (attribute) => `translate(${xScales(attribute)}, 0)`)
                .each(function(attribute, index) { 
                    return d3.select(this).call(d3.axisLeft().scale(yScales[index])); 
                });
    svg.append('g').selectAll('text').data(quantAttributes)
                .join('text')
                .attr('font-size', 16)
                .attr('transform', (attribute) => `translate(${xScales(attribute)-50}, -10)`)
                .text(attribute => attribute);

    // TODO: add brush to PCP + link selected state between 2 svg
};

const renderScatterPlot = (data,  attributeX, attributeY, root, { width, height, margin }) => {
    // Prepare scales
    const xScale = d3.scaleLinear()
                    .domain(d3.extent(data, d => d[attributeX]))
                    .range([margin.left, width - margin.right])
                    .nice();
    const yScale = d3.scaleLinear()
                    .domain(d3.extent(data, d => d[attributeY]))
                    .range([height-margin.bottom, margin.top])
                    .nice();
    const colorScale = d3.scaleOrdinal(d3.schemeAccent);
    
    // Draw axis
    root.append('g').attr('transform', `translate(0, ${height - margin.bottom})`).call(d3.axisBottom(xScale));
    root.append('g').attr('transform', `translate(${margin.left}, 0)`).call(d3.axisLeft(yScale));

    // Plot mark
    root.selectAll('circle').data(data)
                            .join('circle')
                            .attr('r', 5)
                            .attr('cx', d => xScale(d[attributeX]))
                            .attr('cy', d => yScale(d[attributeY]))
                            .attr('fill', d => colorScale(d.species));
    
    // Add interaction
    const brushEvent = (xScale, yScale) => (event) => {
        console.log(event);
        console.log(`x: ${xScale.invert(event.selection[0][0])} ${xScale.invert(event.selection[1][0])}`);
        console.log(`y: ${yScale.invert(event.selection[0][1])} ${yScale.invert(event.selection[1][1])}`);
    };
    const brushBehavior = d3.brush()
                            .extent([[margin.left,margin.top], [width-margin.right, height-margin.bottom]])
                            .on('start brush end', brushEvent(xScale, yScale));
    root.call(brushBehavior);
};
