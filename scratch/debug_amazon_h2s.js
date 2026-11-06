const cheerio = require('cheerio');

async function debugAmazonH2s() {
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
      firstItem.find('h2').each((i, el) => {
        console.log(`H2 ${i}:`, $(el).text().trim(), "HTML:", $(el).html());
      });
      // Also look for any 'a' tag that has class containing 'link-normal' and check its text
      firstItem.find('a.a-link-normal').each((i, el) => {
        const text = $(el).text().trim();
        if (text) {
          console.log(`Link ${i} Text:`, text, "HTML:", $(el).html());
        }
      });
    }
  } catch (err) {
    console.error(err);
  }
}

debugAmazonH2s();
