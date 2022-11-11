import * as d3 from 'd3';

let displayBrush;

// Make sure there is only 1 displayed brush at a time
export function onBrushStart(event, data) {
    if (displayBrush === this) { return; }

    d3.select(displayBrush).call(d3.brush().move, null); 
    displayBrush = this;
};

// Fade marks that are outside brushed area
export const onBrushing = (mark, xScales, yScales, dataRow, dataColumn) => 
    (event, [row, column]) => {
        if (event?.selection == null) { return; }
        
        const [firstPointX, firstPointY] = event.selection[0];
        const [secondPointX, secondPointY] = event.selection[1];
        mark.classed('blur', index =>  firstPointX > xScales[row](dataRow[row][index]) || firstPointY > yScales[column](dataColumn[column][index])
                                    || secondPointX < xScales[row](dataRow[row][index]) || secondPointY < yScales[column](dataColumn[column][index]));
    };

export const onBrushEnd = (mark) => (event, data) => event.selection == null && mark.classed('blur', false);
