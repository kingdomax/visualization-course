import * as d3 from "d3";
import cloud from "d3-cloud";

export function wordcloud({ svg, wordsPerGroup, selection }) {
	// fill the select box with the options from the wordsPerGroup
	selection.selectAll("option").data(Array.from(wordsPerGroup.keys()))
								.join("option")
								.text((d) => d);
	
	const width = 600;
	const height = 200;
	svg.attr("viewBox", [0, 0, width, height]);
	const size = d3.scaleLinear().range([10, 50]); // word size scale, you can play around with the range if you like
	const g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"); // group element, translated such that the origin is in the middle of the svg

	// TODO: Task 1: create the layout of the word cloud with d3-cloud.
	// The function you need has been imported for you as "cloud()".
	// Note, that the actual words will be determined in the "update()" function below. 
	const layout = cloud().size([width, height]);

	update();
	selection.on("change", update);

	function update() {
		const group = selection.property("value"); // get the option of the select box
		const selectedWords = wordsPerGroup.get(group).slice(0, 100); // get the 100 most frequent words of the selected group
		size.domain(d3.extent(selectedWords, (d) => d[1])); // adjust the domain of the word size scale

		// TODO: Task 1: adjust the layout accordingly
		// layout. ...
		layout.words(selectedWords)
			.fontSize(selectedWord => size(selectedWord[1]))
			.on('end', (successfulWords) => {
				g.selectAll("text").data(successfulWords)
									.join("text")
									.text(successfulWord => successfulWord[0])
									.attr("font-size", successfulWord => `${successfulWord.size}px`)
									.attr("transform", successfulWord => `translate(${successfulWord.x},${successfulWord.y})`);
			})
			.start();
	}
}
