import * as d3 from "d3";
import { loadMoviesDataset } from "./src/movies.js";
import {
	tfidf,
	inverseDocumentFrequency,
	documentToWords,
} from "./wordvector.js";
import { wordcloud } from "./wordcloud.js";
import {tagCloud} from "./tagcloud";

loadMoviesDataset().then((movies) => {	
	let textcorpus = movies.map((d) => ({ title: d.title, description: d.overview }));
	let wordsPerDocument = textcorpus.map((document) => documentToWords(document.description));
	const idfForAll = inverseDocumentFrequency(wordsPerDocument); // calcuate tfidf scores for all single movie descriptions
	const wordVectorsForAll = textcorpus.map((d, i) => ({
		title: d.title,
		description: d.description,
		wordvector: tfidf(wordsPerDocument[i], idfForAll),
	}));
	tagCloud(d3.select("#dots"), wordVectorsForAll.slice(0, 10));
	console.log('wordVectorsForAll', wordVectorsForAll);

	// TODO: Task 3: calculate the tfidf scores for all genres
	const genres = Array.from(new Set(movies.map((movie) => movie.genres).flat()));
	const wordsPerGenre = genres.map(genre => {
		var movie = movies.filter(movie => movie.genres.includes(genre));

		let words = [];
		movie.forEach((movie) => { words = words.concat(documentToWords(movie.overview)); });

		return words;
	});
	const idfForGenre = inverseDocumentFrequency(wordsPerGenre);
	const wordVectorsForGenre = genres.map((genre, index) => [genre, tfidf(wordsPerGenre[index], idfForGenre)]);
	console.log('wordVectorsForGenre', wordVectorsForGenre);

	// TODO: Task 3: replace the fakeData with your tfidf per genre
	const notFakeData = new Map(wordVectorsForGenre);
	const fakeData = new Map([[ "category 1", [["fake", 0.5], ["unfinished", 0.2], ["dataless", 0.1], ["artificial", 0.9]] ]]);
	wordcloud({
		svg: d3.select("#wordcloud"),
		wordsPerGroup: notFakeData,
		selection: d3.select("#genre"),
	});
});
