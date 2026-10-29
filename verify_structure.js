const fs = require('fs');
const path = require('path');

// Verify key files exist
const requiredFiles = [
  'frontend/package.json',
  'frontend/tsconfig.json',
  'frontend/vite.config.ts',
  'frontend/src/App.tsx',
  'frontend/src/main.tsx',
  'frontend/src/index.html',
  'backend/package.json',
  'backend/tsconfig.json',
  'backend/src/server.ts',
  'backend/prisma/schema.prisma',
  'docker-compose.yml',
  '.env.example',
  'README.md'
];

console.log('Verifying project structure...\n');

let missingFiles = [];

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log('❌ Missing files:');
  missingFiles.forEach(file => {
    console.log(`  - ${file}`);
  });
  process.exit(1);
} else {
  console.log('✅ All required files are present!');
  console.log('\nProject structure verified successfully.');
  console.log('\nTo run the application:');
  console.log('1. Copy .env.example to .env and configure environment variables');
  console.log('2. Install dependencies: npm install in both frontend and backend directories');
  console.log('3. Set up database: npx prisma migrate dev in backend directory');
  console.log('4. Seed database: npx prisma seed in backend directory');
  console.log('5. Start development:');
  console.log('   - Backend: npm run dev in backend directory');
  console.log('   - Frontend: npm run dev in frontend directory');
  console.log('\nOr use Docker:');
  console.log('   docker-compose up --build');
}