const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Read the manifest template
const manifestPath = path.join(__dirname, '../manifest.json');
let manifestContent = fs.readFileSync(manifestPath, 'utf8');

// Replace the placeholder with the actual client ID
manifestContent = manifestContent.replace('__GOOGLE_CLIENT_ID__', process.env.GOOGLE_CLIENT_ID);

// Write the updated manifest
fs.writeFileSync(manifestPath, manifestContent);

console.log('Manifest file updated with environment variables'); 