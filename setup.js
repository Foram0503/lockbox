const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up LockBox Password Manager...');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node -v').toString().trim();
  console.log(`✅ Node.js ${nodeVersion} is installed`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js and try again.');
  process.exit(1);
}

// Check if npm is installed
try {
  const npmVersion = execSync('npm -v').toString().trim();
  console.log(`✅ npm ${npmVersion} is installed`);
} catch (error) {
  console.error('❌ npm is not installed. Please install npm and try again.');
  process.exit(1);
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies. Please try again.');
  process.exit(1);
}

// Check if PHP is installed
try {
  const phpVersion = execSync('php -v').toString().trim().split('\n')[0];
  console.log(`✅ ${phpVersion} is installed`);
} catch (error) {
  console.warn('⚠️ PHP is not installed or not in PATH. Make sure PHP is installed and configured with your web server.');
}

// Check if MySQL is installed
try {
  const mysqlVersion = execSync('mysql --version').toString().trim();
  console.log(`✅ ${mysqlVersion} is installed`);
} catch (error) {
  console.warn('⚠️ MySQL is not installed or not in PATH. Make sure MySQL is installed and configured.');
}

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `REACT_APP_API_URL=http://localhost/php_project/Lock Box/LockBox.php
REACT_APP_API_KEY=lock123`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully');
}

console.log(`
🎉 Setup completed successfully!

To start the application:
1. Make sure your PHP server (XAMPP, WAMP, etc.) is running
2. Import the database schema from 'Lock Box/drishtiprabha.sql'
3. Run 'npm start' to start the React development server
4. Open http://localhost:3000 in your browser

For more information, please refer to the README.md file.
`); 