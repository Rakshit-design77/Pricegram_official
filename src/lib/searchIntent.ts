// Keep generic dairy searches separate from explicitly requested milk alternatives.
const milkWord = /\b(milk|doodh)\b/i;
const otherMilkIntent = /\b(coconut|almond|oat|soy|soya|cashew|plant|vegan|powder|condensed|evaporated|flavou?red|pistachio|pista|badam|chocolate|choco|strawberry|rose|vanilla|shake|milkshake|lotion|body|soap|cleanser|frother|boiler|pump|bottle|tea|coffee|cadbury)\b/i;

export function isPlainMilkQuery(query: string): boolean {
  return milkWord.test(query) && !otherMilkIntent.test(query);
}

export function matchesMilkIntent(title: string, query: string): boolean {
  if (!isPlainMilkQuery(query)) return true;
  // A bottle can be dairy packaging, but an empty/feeding bottle is an accessory.
  const dairyPackaging = /\b(toned|full cream|cow|buffalo|pasteuri[sz]ed|dairy|amul|nandini|verka|milma)\b/i.test(title) &&
    !/\b(empty|feeding|storage|glass|plastic|steel|insulated)\b/i.test(title);
  const milkTitle = dairyPackaging ? title.replace(/\bbottle\b/gi, '') : title;
  return milkWord.test(title) && !otherMilkIntent.test(milkTitle) &&
    !/\b(creamers?|whitener|sweets?|candy|toffee|biscuits?|cookies?|cereal|muesli|protein|whey|skin|shampoo|conditioner|moisturi[sz]er|serum|sunscreen|machine|warmer|steamer|container|whisk|jug|mug|pan|pot|shirt|toy)\b/i.test(title);
}

export function milkSearchQuery(query: string): string {
  if (!isPlainMilkQuery(query)) return query;
  return `${query.replace(/\bdoodh\b/gi, 'milk')} fresh dairy toned -coconut -almond -oat -soy -powder -condensed -flavoured -pistachio`;
}

const aliases: Record<string, string> = {
  doodh: 'milk', anda: 'egg', eggs: 'egg', atta: 'flour', namak: 'salt',
  tel: 'oil', chai: 'tea', mobiles: 'phone', mobile: 'phone', smartphone: 'phone',
  smartphones: 'phone', phones: 'phone', laptops: 'laptop', headphones: 'headphone',
  earbuds: 'earbud', shoes: 'shoe', cookies: 'cookie', biscuits: 'biscuit',
};
const filler = new Set(['a', 'an', 'the', 'for', 'of', 'and', 'with', 'in', 'me', 'i', 'want', 'need', 'buy', 'find', 'show', 'please', 'best', 'cheap', 'cheapest', 'price', 'online', 'india']);

export function searchTokens(text: string): string[] {
  return text.toLowerCase()
    .replace(/(\d)\s+(ml|kg|gb|tb|mah|hz)\b/g, '$1$2')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(/\s+/)
    .filter(Boolean).map(t => aliases[t] || t);
}

export function searchConstraints(query: string): { tokens: string[]; maxPrice?: number } {
  let maxPrice: number | undefined;
  const text = query.replace(/\b(?:under|below|less than|up to)\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d+)?)\s*(k|thousand)?\b/gi,
    (_, amount, suffix) => { maxPrice = Number(amount.replace(/,/g, '')) * (suffix ? 1000 : 1); return ''; });
  return { tokens: [...new Set(searchTokens(text).filter(t => !filler.has(t)))], maxPrice };
}

// Accessories must be explicitly requested, even when their titles repeat the full model name.
const accessoryWords = new Set(['case', 'cover', 'protector', 'charger', 'cable', 'adapter', 'stand', 'holder', 'sleeve', 'keyboard', 'replacement', 'strap', 'frother', 'toaster', 'boiler', 'dispenser', 'cooker']);
const devices = new Set(['bread', 'milk', 'egg', 'rice', 'oil', 'phone', 'iphone', 'samsung', 'pixel', 'oneplus', 'laptop', 'macbook', 'ipad', 'tablet', 'watch']);

export function matchesSearchIntent(product: {title: string; price: number}, query: string): boolean {
  if (!matchesMilkIntent(product.title, query)) return false;
  const { tokens, maxPrice } = searchConstraints(query);
  if (!tokens.length || (maxPrice !== undefined && product.price > maxPrice)) return false;
  const titleTokens = new Set(searchTokens(product.title));
  if (/\b(iphone|smartphone|mobile phone|google pixel \d+|(?:samsung )?galaxy (?:[samf]\d+\w*|z (?:fold|flip)))\b/i.test(product.title)) titleTokens.add('phone');
  if (/\b(macbook|chromebook)\b/i.test(product.title)) titleTokens.add('laptop');
  // A requested brand/model/variant must not disappear during ranking.
  if (!tokens.every(t => titleTokens.has(t))) return false;
  if (tokens.some(t => devices.has(t)) && !tokens.some(t => accessoryWords.has(t))) {
    const accessoryTitle = product.title
      .replace(/\b(backlit|built[- ]in|integrated)\s+keyboard\b/gi, '')
      .replace(/\b(charger|adapter)\s+(included|in (?:the )?box)\b/gi, '');
    if (searchTokens(accessoryTitle).some(t => accessoryWords.has(t))) return false;
  }
  return true;
}
