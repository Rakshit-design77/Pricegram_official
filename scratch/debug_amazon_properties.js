const cheerio = require('cheerio');

async function debugAmazonProperties() {
  try {
    const response = await fetch("https://www.amazon.in/s?k=iphone+15", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const items = $('.s-result-item[data-component-type="s-search-result"]');
    console.log("Total items found on Amazon:", items.length);
    
    items.slice(0, 5).each((index, el) => {
      const item = $(el);
      
      const titleEl1 = item.find('h2 a span').first();
      const titleEl2 = item.find('h2 span').first();
      const titleEl3 = item.find('h2 a').first();
      
      const priceWholeEl = item.find('.a-price-whole').first();
      const priceWhole = priceWholeEl.text().replace(/[^\d]/g, '');
      const price = parseInt(priceWhole) || 0;
      
      const linkEl = item.find('a.a-link-normal').first();
      const link = linkEl.attr('href');
      
      console.log(`Item ${index}:`);
      console.log(`  titleEl1 (h2 a span):`, titleEl1.text().trim());
      console.log(`  titleEl2 (h2 span):`, titleEl2.text().trim());
      console.log(`  titleEl3 (h2 a):`, titleEl3.text().trim());
      console.log(`  priceWhole text:`, priceWholeEl.text());
      console.log(`  price parsed:`, price);
      console.log(`  link:`, link);
    });
  } catch (err) {
    console.error(err);
  }
}

debugAmazonProperties();
