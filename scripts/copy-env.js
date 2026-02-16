const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const destPath = path.join(__dirname, '..', 'dist', '.env');

// Create dist directory if it doesn't exist
if (!fs.existsSync(path.dirname(destPath))) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
}

// Copy the .env.local file to dist/.env
fs.copyFileSync(envPath, destPath);

console.log('Environment file copied successfully');
