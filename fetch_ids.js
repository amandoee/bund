const fs = require('fs');
const ytSearch = require('yt-search');
const csv = require('csv-parser');

const results = [];
let rules = "";
let isRulesSection = false;

fs.createReadStream('Bundesange2026.csv')
  .pipe(csv(['Navn', 'Sang', 'Kunstner']))
  .on('data', (data) => {
    if (data.Navn === 'Regler:') {
        isRulesSection = true;
        return;
    }
    
    if (isRulesSection) {
        if (data.Navn) rules += data.Navn + "\n";
        return;
    }

    if (data.Navn && data.Navn !== 'Navn' && data.Sang && data.Kunstner) {
        // Exclude empty ones marked with x in the original csv if they exist, but the csv snippet shows Cilas,,,,x
        // The parser maps them to Navn, Sang, Kunstner
        // If it's just 'Cilas', Sang and Kunstner might be empty.
        results.push({
            name: data.Navn.trim(),
            song: data.Sang.trim(),
            artist: data.Kunstner.trim()
        });
    }
  })
  .on('end', async () => {
    console.log(`Found ${results.length} valid entries. Fetching YouTube IDs...`);
    
    for (let i = 0; i < results.length; i++) {
        const entry = results[i];
        const query = `${entry.artist} ${entry.song} audio`;
        try {
            const r = await ytSearch(query);
            const videos = r.videos;
            if (videos.length > 0) {
                entry.id = videos[0].videoId;
                console.log(`[${i+1}/${results.length}] ${entry.name}: ${entry.id} (${videos[0].title})`);
            } else {
                entry.id = "";
                console.log(`[${i+1}/${results.length}] ${entry.name}: NO VIDEO FOUND`);
            }
        } catch (e) {
            console.error(`Error searching for ${query}:`, e.message);
            entry.id = "";
        }
        // small delay to avoid rate limits
        await new Promise(res => setTimeout(res, 500));
    }

    fs.writeFileSync('data.json', JSON.stringify({ participants: results, rules: rules.trim() }, null, 2));
    console.log('Finished writing to data.json');
  });
