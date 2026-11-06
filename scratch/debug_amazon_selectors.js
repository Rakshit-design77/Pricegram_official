const cheerio = require('cheerio');

async function debugAmazon() {
  try {
    const response = await fetch("https://www.amazon.in/s?k=iphone", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Find all result items
    const items = $('.s-result-item[data-component-type="s-search-result"]');
    console.log("Total items found on Amazon:", items.length);
    
    if (items.length > 0) {
      const firstItem = $(items[0]);
      console.log("Item 0 TextContent:", firstItem.text().replace(/\s+/g, ' ').trim());
      
      firstItem.find('*').each((i, child) => {
        const c = $(child);
        const className = c.attr('class');
        const text = c.text().trim();
        if (text && className) {
          console.log(`Tag: ${child.tagName}, Class: ${className}, Text: ${text.substring(0, 50)}`);
        }
      });
    }
  } catch (err) {
    console.error(err);
  }
}

debugAmazon();
