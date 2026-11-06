const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../valueserp_test.json');
const rawData = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(rawData);

console.log('Keys in valueserp_test.json:', Object.keys(data));
console.log('Search parameters in valueserp_test.json:', data.search_parameters);
if (data.shopping_results) {
  console.log('Number of shopping results:', data.shopping_results.length);
  console.log('First shopping result merchant & title:', data.shopping_results[0].merchant, '-', data.shopping_results[0].title);
  
  // Let's count unique merchants
  const merchants = new Set(data.shopping_results.map(item => item.merchant));
  console.log('Unique merchants in sample:', Array.from(merchants));
}
