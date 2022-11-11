import { stopwords } from "./stopwords";

export function documentToWords(text) {
	return 	text.replace(/\W/g, " ")
				.split(" ")
				.map((word) => word.toLowerCase()) // transform to lower case
				.filter((word) => !stopwords.includes(word) && word.length > 0); // filter stopwords
}

//TODO: Task 2: implement the inverse document frequency
// wordsPerDocument: array of documents, which are arrays of single words => [[word, word, ...], [word, word, ...], ...]
// RETURN: Map of words matching their idf score
export function inverseDocumentFrequency(corpus) {	
	const idf = new Map(); 

	corpus.forEach(doc => {		
		doc.forEach(word => {		
			if (idf.has(word)) { return; }

			var occursIn = countDocsPerWord(word, corpus); 
			var score = Math.log(corpus.length / occursIn);
			idf.set(word, score);
		});
	});
	
	return idf;
}

const countDocsPerWord = (specificWord, corpus) => { // [[word, word, ...], [word, word, ...], ...]
	let count = 0;
	corpus.forEach(doc => { count += doc.includes(specificWord) ? 1 : 0; });
	return count;
};

//TODO: Task 2: transform document to word vector using the tf-idf score
// words: array of single words => [word, word, word,...]
// idf: Map of words and their idf scores
// RETURN: array of form [[word, score], [word, score], ...]
//        -> sorted in descending order of score (best score first)
export function tfidf(doc, idfMap) {	
	var uniqueWords = new Set();
	
	var wordVector = doc.map(word => {
		if (uniqueWords.has(word)) { return; } // don't map same word ib the same document, because it is going to get the same calculation result
		
		var tf = doc.filter(w => w == word).length / doc.length;
		var idf = idfMap.get(word);
		var tfIdf = tf * idf; // Math.round(tfIdf * 100) / 100

		uniqueWords.add(word);
		return [word, tfIdf];
	});

	return wordVector.filter(w => w).sort((a, b) => b[1] - a[1]);
}
