const cheerio = require('cheerio');

async function testAmazonOnly() {
  try {
    const query = "iphone 15";
    // Using + instead of %20 is standard for query params on Amazon search
    const url = `https://www.amazon.in/s?k=${query.replace(/\s+/g, '+')}`;
    console.log(`[Amazon] Fetching: ${url}`);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    
    console.log(`[Amazon] Status: ${response.status}`);
    const html = await response.text();
    console.log(`[Amazon] HTML Length: ${html.length}`);
    
    const $ = cheerio.load(html);
    const items = $('.s-result-item[data-component-type="s-search-result"]');
    console.log(`[Amazon] Items count: ${items.length}`);
    
    items.slice(0, 3).each((index, el) => {
      const item = $(el);
      const title = item.find('h2.a-size-medium span').first().text().trim() || 
                    item.find('h2.a-size-base span').first().text().trim() || 
                    item.find('h2').last().text().trim();
      const priceWhole = item.find('.a-price-whole').first().text().replace(/[^\d]/g, '');
      const price = parseInt(priceWhole) || 0;
      console.log(`Item ${index}: title="${title}", price=${price}`);
    });
  } catch (err) {
    console.error(err);
  }
}

testAmazonOnly();
