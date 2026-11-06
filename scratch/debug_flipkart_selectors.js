const cheerio = require('cheerio');

async function debugFlipkart() {
  try {
    const response = await fetch("https://www.flipkart.com/search?q=iphone", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const items = $('div[data-id]');
    
    // Let's print the entire text content of Item 0 to see what it contains
    if (items.length > 0) {
      const firstItem = $(items[0]);
      console.log("Item 0 TextContent:", firstItem.text().replace(/\s+/g, ' ').trim());
      
      // Let's print all child classes/tags
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

debugFlipkart();
