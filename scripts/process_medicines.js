const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const inputPath = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\03c27b50-3da6-4a60-aacf-e02c1eedfa25\\scratch\\Indian-Medicine-Dataset\\DATA\\updated_indian_medicine_data.csv';
const outputDir = path.join(__dirname, '../public/data');
const outputPath = path.join(outputDir, 'medicines.json');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const results = [];
let count = 0;

fs.createReadStream(inputPath)
  .pipe(csv())
  .on('data', (data) => {
    // Only keep required fields
    const medicine = {
      id: data.id || count.toString(),
      name: data.name || '',
      price: data.price ? parseFloat(data.price) : 0,
      type: data.type || '',
      medicine_desc: data.medicine_desc || '',
      side_effects: data.side_effects || '',
      manufacturer_name: data.manufacturer_name || ''
    };
    results.push(medicine);
    count++;
  })
  .on('end', () => {
    fs.writeFileSync(outputPath, JSON.stringify(results));
    const stats = fs.statSync(outputPath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    console.log(`Processed ${count} medicines.`);
    console.log(`Output file size: ${fileSizeInMB.toFixed(2)} MB`);
  })
  .on('error', (error) => {
    console.error('Error parsing CSV:', error);
  });
