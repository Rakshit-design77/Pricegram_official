const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const ts = require(root + '/node_modules/typescript');
function load(file) {
  const mod = {exports:{}};
  const js = ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  new Function('require','exports',js)(p => load(path.resolve(path.dirname(file),p + '.ts')),mod.exports);
  return mod.exports;
}
const {matchesSearchIntent: match} = load(root + '/src/lib/searchIntent.ts');
const {rankProductsByRelevance: rank} = load(root + '/src/lib/searchRelevance.ts');
const cases = [
 ['phone','Apple iPhone 15 128GB',true],
 ['smartphone','Samsung Galaxy S24 256GB',true],
 ['phone','Samsung Galaxy Tab S9',false],
 ['laptop','HP Pavilion Laptop 16GB Backlit Keyboard',true],
 ['laptop','Keyboard for HP Pavilion Laptop',false],
 ['laptop','Apple MacBook Air M3',true],
 ['milk','Amul Toned Milk Bottle 1L',true],
 ['milk','Glass Milk Bottle 1L',false],
 ['milk','Amul Milk Feeding Bottle',false],
 ['rice','Rice Cooker',false],
 ['rice cooker','Electric Rice Cooker',true],
 ['egg','Egg Cooker',false],
 ['milk','Amul Taaza Toned Milk 1 L',true],['milk','Karikku Coconut Milk 400 ml',false],
 ['milk','Bless MILK WITH ADDED PISTACHIO',false],['milk','Sunbay Coconut Milk',false],
 ['coconut milk','Sunbay Coconut Milk',true],['milk powder','Amul Milk Powder',true],
 ['doodh','Mother Dairy Milk',true],['atta','Aashirvaad Whole Wheat Flour',true],
 ['eggs','Farm Fresh Egg pack of 6',true],['milk','Milk frother',false],
 ['iphone 15','Case for Apple iPhone 15',false],['iphone 15','Apple iPhone 15 128GB',true],
 ['iphone 15 pro','Apple iPhone 15 128GB',false],['iphone 15 pro','Apple iPhone 15 Pro 128GB',true],
 ['iphone 15 case','Case for Apple iPhone 15',true],['laptop','Laptop Stand',false],
 ['laptop stand','Adjustable Laptop Stand',true],['samsung 256gb','Samsung Galaxy 128GB',false],
 ['samsung 256 gb','Samsung Galaxy 256GB',true],['rice','Price labels',false],
 ['tea','Teak wood table',false],['oil','Foil wrap',false],['bread','Bread toaster',false],
 ['Amul butter','Generic Butter',false],['Amul butter','Amul Salted Butter',true],
 ['headphones under 2k','Wireless Headphones',true,1500],['headphones under 2k','Wireless Headphones',false,2500],
 ['show me best shoes under 2000','Running Shoes',true,1200],
];
for (const [q,title,expected,price=100] of cases) assert.equal(match({title,price},q),expected,q + ': ' + title);
const products=['Coconut Milk','Amul Milk','Milk frother','Bless milk pistachio'].map((title,id)=>({title,id:String(id),price:100,platform:'Flipkart'}));
assert.deepEqual(rank(products,'milk').map(p=>p.title),['Amul Milk']);
assert.deepEqual(rank(products.filter(p=>p.title!=='Amul Milk'),'milk'),[]);
console.log(`Passed ${cases.length+2} search regression checks.`);
