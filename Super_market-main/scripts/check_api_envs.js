// Simple verification script for VITE API env normalization
// Usage: node scripts/check_api_envs.js

function normalize(raw) {
  const _raw = raw || '';
  try {
    let u = String(_raw).trim().replace(/\/+$/, '');
    if (!u) return 'http://localhost:8080/api';
    if (!u.endsWith('/api')) u = `${u}/api`;
    return u;
  } catch (e) {
    return 'http://localhost:8080/api';
  }
}

// Show results for current env and example values
const envUrl = process.env.VITE_API_URL;
const envBase = process.env.VITE_API_BASE_URL;

console.log('Current process.env:');
console.log('  VITE_API_URL =', envUrl);
console.log('  VITE_API_BASE_URL =', envBase);
console.log('Resolved API base (priority VITE_API_URL -> VITE_API_BASE_URL -> default):', normalize(envUrl || envBase));

// Examples
const examples = [
  'http://localhost:8080',
  'http://localhost:8080/',
  'http://localhost:8080/api',
  'http://api.example.com/v1',
  'http://api.example.com/v1/'
];

console.log('\nExamples:');
for (const ex of examples) {
  console.log(`  ${ex} -> ${normalize(ex)}`);
}
