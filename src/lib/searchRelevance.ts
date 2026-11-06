function normalizeProductTitle(title: string): string {
  return title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}
import { matchesSearchIntent, isPlainMilkQuery } from './searchIntent';

export function calculateTokenOverlap(titleA: string, titleB: string): number {
  const normA = normalizeProductTitle(titleA);
  const normB = normalizeProductTitle(titleB);

  if (!normA || !normB) return 0;

  const tokensA = new Set(normA.split(' '));
  const tokensB = new Set(normB.split(' '));

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersection++;
    }
  }

  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : intersection / union;
}

export function rankProductsByRelevance(products: any[], query: string): any[] {
  const normQuery = query.toLowerCase().trim();
  const queryTokens = normQuery.split(/\s+/).filter(t => t.length > 0);

  // Quick-Commerce Staple Detection
  const isMilkQuery = isPlainMilkQuery(query);

  const isAttaQuery = (normQuery.includes('atta') || normQuery.includes('flour')) &&
                      !normQuery.includes('noodle') && !normQuery.includes('biscuit') && !normQuery.includes('cookie');

  const isEggQuery = (normQuery.includes('egg') || normQuery.includes('anda')) &&
                     !normQuery.includes('boiler') && !normQuery.includes('slicer') && !normQuery.includes('whisk') && !normQuery.includes('kinder');

  const isBreadQuery = (normQuery.includes('bread') || normQuery.includes('pav') || normQuery.includes('bun')) &&
                      !normQuery.includes('crumb') && !normQuery.includes('box') && !normQuery.includes('toaster');

  const isOilGheeQuery = (normQuery.includes('oil') || normQuery.includes('ghee') || normQuery.includes('tel')) &&
                         !normQuery.includes('hair') && !normQuery.includes('face') && !normQuery.includes('diffuser') && !normQuery.includes('essential');

  const isCoffeeTeaQuery = (normQuery.includes('coffee') || normQuery.includes('tea') || normQuery.includes('chai')) &&
                           !normQuery.includes('mug') && !normQuery.includes('maker') && !normQuery.includes('scrub') && !normQuery.includes('coaster') && !normQuery.includes('tree oil');

  const isGroceryQuery = isMilkQuery || isAttaQuery || isEggQuery || isBreadQuery || isOilGheeQuery || isCoffeeTeaQuery || [
    'grocery', 'groceries', 'paneer', 'butter', 'cheese', 'curd', 'dahi', 'sugar', 'salt', 'namak', 'rice', 'basmati', 'maggi', 'dal', 'essential'
  ].some(g => normQuery.includes(g));

  return products.filter(p => matchesSearchIntent(p, query)).map(p => {
    let score = 0;
    const title = p.title.toLowerCase();
    const plat = p.platform.toLowerCase();

    // 1. Token Match Boost
    let matchedTokens = 0;
    for (const token of queryTokens) {
      if (title.includes(token)) {
        matchedTokens++;
        score += 15;
      }
    }
    if (matchedTokens === queryTokens.length) {
      score += 25;
    }

    // Exact word boundary match boost (e.g. \bmilk\b)
    if (new RegExp(`\\b${normQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(title)) {
      score += 30;
    }

    // Quick Commerce Platform Preference for Groceries
    if (isGroceryQuery && (plat.includes('bigbasket') || plat.includes('blinkit') || plat.includes('zepto') || plat.includes('instamart') || plat.includes('jiomart'))) {
      score += 35;
    }

    // 2. Pure Milk / Doodh Intent
    if (isMilkQuery) {
      const cosmeticTerms = [
        'lotion', 'moisturizer', 'moisturiser', 'creme', 'body milk', 'skin', 'face wash',
        'cleanser', 'serum', 'spf', 'sunscreen', 'ceramide', 'hyaluronic', 'peptides',
        'lakme', 'nivea', 'biotique', 'vaseline', 'mamaearth', 'garnier', 'pond\'s', 'ponds',
        'shampoo', 'conditioner', 'beauty', 'cosmetics', 'skincare'
      ];
      const chocolateTerms = [
        'chocolate', 'choco', 'truffle', 'truffles', 'eclair', 'eclairs', 'candy', 'caramel',
        'nougat', 'wafer', 'dark milk', 'compound chocolate', 'gift pack', 'chocwich',
        'bubbly', 'silk', 'cadbury', 'kitkat', 'munch', '5 star', 'perk', 'snickers',
        'mars', 'ferrero', 'toblerone', 'bar gift pack', 'sweetened confectionery',
        'chocominis', 'rock candy', 'heart 5 bar'
      ];
      const nonFoodTerms = [
        'frother', 'steamer', 'warmer', 'boiler', 'shaker', 'mug', 'bottle', 'container',
        'whisk', 'pot', 'pan', 'jug', 'pitcher', 'pump', 'machine', 'maker', 'money',
        'shirt', 'toy', 'corn flakes', 'muesli', 'cereal', 'protein powder', 'whey'
      ];

      if (cosmeticTerms.some(term => title.includes(term))) score -= 200;
      if (chocolateTerms.some(term => title.includes(term))) score -= 200;
      if (nonFoodTerms.some(term => title.includes(term))) score -= 150;

      const milkBrands = ['amul', 'mother dairy', 'nandini', 'nestle', 'britannia', 'country delight', 'doux', 'verka', 'saras', 'vijaya', 'gokul', 'heritage', 'jersey', 'milma', 'gowardhan', 'epigamia', 'milky mist'];
      if (milkBrands.some(brand => title.includes(brand))) score += 35;

      const freshMilkTypes = ['toned', 'full cream', 'cow milk', 'fresh milk', 'pasteurised', 'pasteurized', 'lactose free', 'a2 milk', 'organic milk', 'double toned', 'standardized'];
      if (freshMilkTypes.some(type => title.includes(type))) score += 30;
    }

    // 3. Atta / Flour Intent
    if (isAttaQuery) {
      if (title.includes('biscuit') || title.includes('cookie') || title.includes('noodle')) score -= 150;
      const attaBrands = ['aashirvaad', 'fortune', 'pilsbury', 'nature fresh', 'rajdhani', 'organic tattwa', '24 mantra'];
      if (attaBrands.some(b => title.includes(b))) score += 35;
      if (title.includes('chakki') || title.includes('whole wheat') || title.includes('sharbati')) score += 25;
    }

    // 4. Egg / Anda Intent
    if (isEggQuery) {
      if (title.includes('boiler') || title.includes('slicer') || title.includes('whisk') || title.includes('kinder')) score -= 150;
      const eggBrands = ['eggoz', 'ovofarm', 'suguna', 'keggs', 'hen fruit'];
      if (eggBrands.some(b => title.includes(b))) score += 35;
      if (title.includes('farm fresh') || title.includes('table egg') || title.includes('brown egg') || title.includes('white egg') || title.includes('pack of 6') || title.includes('pack of 10') || title.includes('pack of 30')) score += 25;
    }

    // 5. Bread Intent
    if (isBreadQuery) {
      if (title.includes('crumb') || title.includes('toaster') || title.includes('basket')) score -= 150;
      const breadBrands = ['britannia', 'harvest gold', 'english oven', 'modern', 'bonn'];
      if (breadBrands.some(b => title.includes(b))) score += 35;
      if (title.includes('sandwich') || title.includes('brown bread') || title.includes('white bread') || title.includes('multigrain') || title.includes('pav') || title.includes('bun')) score += 25;
    }

    // 6. Cooking Oil / Ghee Intent
    if (isOilGheeQuery) {
      if (title.includes('hair') || title.includes('face') || title.includes('diffuser') || title.includes('massage') || title.includes('beard') || title.includes('essential')) score -= 200;
      const oilBrands = ['fortune', 'dhara', 'saffola', 'engine', 'gemini', 'amul', 'mother dairy', 'patanjali', 'baba ramdev'];
      if (oilBrands.some(b => title.includes(b))) score += 35;
      if (title.includes('mustard') || title.includes('sunflower') || title.includes('refined') || title.includes('cow ghee') || title.includes('desi ghee') || title.includes('groundnut') || title.includes('kachi ghani')) score += 25;
    }

    // 7. Coffee / Tea Intent
    if (isCoffeeTeaQuery) {
      if (title.includes('mug') || title.includes('maker') || title.includes('scrub') || title.includes('coaster') || title.includes('face') || title.includes('tree oil')) score -= 150;
      const teaCoffeeBrands = ['nescafe', 'bru', 'continental', 'davidoff', 'tata tea', 'red label', 'taj mahal', 'society', 'wagh bakri', 'sleepy owl', 'blue tokai'];
      if (teaCoffeeBrands.some(b => title.includes(b))) score += 35;
      if (title.includes('instant coffee') || title.includes('filter coffee') || title.includes('tea bags') || title.includes('leaf tea') || title.includes('pouch') || title.includes('jar')) score += 25;
    }

    return { product: p, score };
  })
  .sort((a, b) => b.score - a.score)
  .map(item => ({ ...item.product, _score: item.score }));
}
