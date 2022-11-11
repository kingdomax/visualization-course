import * as d3 from 'd3';
import { renderSPLOM, renderPCP } from './plots';

const data = await d3.csv('/data/iris.csv');
const categorialAttribute = 'species';
const quantAttributes = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width'];

const root = d3.select('div#visualization');
const style = {
    width: 900,
    height: 900,
    margin: { top: 30, right: 30, bottom: 30, left: 30 },
    cell: { padding: 20, width: 195, height: 195, outerWidth: 215, outerHeight: 215 }
};

renderSPLOM(data, quantAttributes, categorialAttribute, root, style); // fully brushable and linkable :)
renderPCP(data, quantAttributes, categorialAttribute, root, style); // interaction is not finished yet ;(
