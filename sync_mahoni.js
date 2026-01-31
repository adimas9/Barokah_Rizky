import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mainTablePath = path.join(__dirname, 'src/data/volumeTable.json');
const mahoniTablePath = path.join(__dirname, 'tabel-mahoni-lengkap.json');

try {
    const mainData = JSON.parse(fs.readFileSync(mainTablePath, 'utf8'));
    const mahoniData = JSON.parse(fs.readFileSync(mahoniTablePath, 'utf8'));

    if (mahoniData.mahoni) {
        console.log('Replacing Mahoni data in volumeTable.json with data from tabel-mahoni-lengkap.json');

        // Log some comparisons before replacement
        if (mainData.mahoni && mainData.mahoni['11'] && mainData.mahoni['11']['270']) {
            console.log('Old Value D11 L270:', mainData.mahoni['11']['270']);
        }
        if (mahoniData.mahoni['11'] && mahoniData.mahoni['11']['270']) {
            console.log('New Value D11 L270:', mahoniData.mahoni['11']['270']);
        }

        mainData.mahoni = mahoniData.mahoni;

        fs.writeFileSync(mainTablePath, JSON.stringify(mainData, null, 2));
        console.log('Successfully updated volumeTable.json');
    } else {
        console.error('Error: tabel-mahoni-lengkap.json does not contain "mahoni" key.');
    }

} catch (err) {
    console.error('An error occurred:', err);
}
