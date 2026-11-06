const cheerio = require('cheerio');

async function debugAmazonHTML() {
  try {
    const response = await fetch("https://www.amazon.in/s?k=iphone+15", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    const items = $('.s-result-item[data-component-type="s-search-result"]');
    
    if (items.length > 0) {
      const firstItem = $(items[0]);
      console.log("Title container HTML:");
      console.log(firstItem.find('h2').parent().html());
    }
  } catch (err) {
    console.error(err);
  }
}

debugAmazonHTML();
