import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const volumeTablePath = path.join(__dirname, 'src/data/volumeTable.json');

try {
    const data = JSON.parse(fs.readFileSync(volumeTablePath, 'utf8'));

    console.log('Normalizing Mahoni values to 3 decimal places...');

    if (data.mahoni) {
        for (const diameter in data.mahoni) {
            for (const length in data.mahoni[diameter]) {
                const originalValue = data.mahoni[diameter][length];
                // Convert to 3 decimal precision
                const normalizedValue = parseFloat(originalValue.toFixed(3));
                data.mahoni[diameter][length] = normalizedValue;
            }
        }

        console.log('Sample check:');
        console.log('Mahoni D30 L200:', data.mahoni['30']['200']);
        console.log('Mahoni D38 L200:', data.mahoni['38']['200']);

        fs.writeFileSync(volumeTablePath, JSON.stringify(data, null, 2));
        console.log('✓ Successfully normalized Mahoni data!');
    } else {
        console.error('Error: No Mahoni data found in volumeTable.json');
    }
} catch (err) {
    console.error('Error:', err);
}
