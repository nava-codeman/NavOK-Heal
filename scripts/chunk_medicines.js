const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../public/data');
const inputFile = path.join(dataDir, 'medicines.json');

console.log('Loading medicines.json...');
const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
console.log(`Loaded ${data.length} records.`);

const CHUNK_SIZE = 10000;
let chunkIndex = 0;

for (let i = 0; i < data.length; i += CHUNK_SIZE) {
  const chunk = data.slice(i, i + CHUNK_SIZE);
  const chunkFile = path.join(dataDir, `medicines_chunk_${chunkIndex}.json`);
  fs.writeFileSync(chunkFile, JSON.stringify(chunk));
  console.log(`Written chunk ${chunkIndex} with ${chunk.length} records.`);
  chunkIndex++;
}

// Write a metadata file so the frontend knows how many chunks exist
const metadata = { totalChunks: chunkIndex, totalRecords: data.length };
fs.writeFileSync(path.join(dataDir, 'medicines_meta.json'), JSON.stringify(metadata));
console.log(`Written metadata: ${JSON.stringify(metadata)}`);

// Optional: remove original 49MB file to save space if desired, but we can leave it or remove it.
fs.unlinkSync(inputFile);
console.log('Deleted original medicines.json to save repo space.');
