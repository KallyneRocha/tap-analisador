const fs = require('fs');
const path = require('path');
const directoryPath = path.join(__dirname, '../data/vikings-first-season');
const resultsPath = path.join(__dirname, '../data/resultados');

if (!fs.existsSync(resultsPath)) {
  fs.mkdirSync(resultsPath);
}

const episodes = fs.readdirSync(directoryPath).filter(file => file.endsWith('.srt'));

const seasonWordCount = {};

const isWord = word => {
  return /^[a-zA-Z']+$/i.test(word);
};

const processFile = filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const cleanedContent = content.replace(/<*?>/g, '').toLowerCase();
  const words = cleanedContent.split(/\s+/);

  const episodeWordCount = {};

  words.forEach(word => {
    word = word.replace(/[?.,!@♪\-:0-9]+/g, '');
    word = word.toLowerCase();

    if (isWord(word)) {
      if (!episodeWordCount[word]) {
        episodeWordCount[word] = 1;
      } else {
        episodeWordCount[word]++;
      }

      if (!seasonWordCount[word]) {
        seasonWordCount[word] = 1;
      } else {
        seasonWordCount[word]++;
      }
    }
  });

  return episodeWordCount;
};

episodes.forEach(episode => {
  const episodePath = path.join(directoryPath, episode);
  const episodeWordCount = processFile(episodePath);

  const sortedWords = Object.keys(episodeWordCount).map(word => ({
    palavra: word,
    frequencia: episodeWordCount[word],
  }));
  sortedWords.sort((a, b) => b.frequencia - a.frequencia);

  const episodeName = episode.replace('.srt', '');
  const episodeResultPath = path.join(resultsPath, `episodio-${episodeName}.json`);
  fs.writeFileSync(episodeResultPath, JSON.stringify(sortedWords, null, 2));
  console.log(`Resultados do episódio ${episodeName} salvos em ${episodeResultPath}`);
});

const sortedSeasonWords = Object.keys(seasonWordCount).map(word => ({
  palavra: word,
  frequencia: seasonWordCount[word],
}));
sortedSeasonWords.sort((a, b) => b.frequencia - a.frequencia);

const seasonName = path.basename(directoryPath);
const seasonResultPath = path.join(resultsPath, `temporada-${seasonName}.json`);
fs.writeFileSync(seasonResultPath, JSON.stringify(sortedSeasonWords, null, 2));
console.log(`Resultados da temporada salvos em ${seasonResultPath}`);