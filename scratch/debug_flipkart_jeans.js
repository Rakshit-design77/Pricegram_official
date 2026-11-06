const cheerio = require('cheerio');

async function debugJeans() {
  try {
    const response = await fetch("https://www.flipkart.com/search?q=jeans", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const items = $('div[data-id]');
    console.log("Total items found with div[data-id] for 'jeans':", items.length);
    
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

debugJeans();
