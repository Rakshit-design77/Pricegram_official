const cheerio = require('cheerio');

async function scrapeAmazonDirect(query) {
  try {
    const url = `https://www.amazon.in/s?k=${query.replace(/\s+/g, '+')}`;
    console.log(`[Amazon] Fetching: ${url}`);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    
    if (response.status !== 200) {
      console.log(`[Amazon] Status error: ${response.status}`);
      return [];
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const items = $('.s-result-item[data-component-type="s-search-result"]');
    const products = [];
    
    items.each((index, el) => {
      const item = $(el);
      const title = item.find('h2.a-size-medium span').first().text().trim() || 
                    item.find('h2.a-size-base span').first().text().trim() || 
                    item.find('h2').last().text().trim();
      
      const priceWhole = item.find('.a-price-whole').first().text().replace(/[^\d]/g, '');
      const price = parseInt(priceWhole) || 0;
      
      const mrpText = item.find('.a-price.a-text-price span.a-offscreen').first().text().replace(/[^\d]/g, '');
      const mrp = parseInt(mrpText) || price;
      
      const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
      
      const imgEl = item.find('img.s-image').first();
      const image = imgEl.attr('src') || '';
      
      const linkEl = item.find('a.a-link-normal').first();
      let link = linkEl.attr('href') || '';
      if (link && !link.startsWith('http')) {
        link = `https://www.amazon.in${link}`;
      }
      
      const ratingText = item.find('.a-icon-alt').first().text().split(' ')[0];
      const rating = parseFloat(ratingText) || 4.2;
      
      if (title && price > 0 && link) {
        products.push({
          id: `amazon-${index}-${Math.random()}`,
          title,
          price,
          mrp,
          discount,
          image,
          platform: 'Amazon',
          deliveryTime: '2-3 Days',
          deliveryFee: 0,
          stockStatus: 'In stock',
          rating,
          url: link,
          category: 'Electronics',
          isMock: false,
          lastUpdated: new Date().toISOString()
        });
      }
    });
    
    return products.slice(0, 10);
  } catch (err) {
    console.error("[Amazon Scraper Error]", err);
    return [];
  }
}

async function scrapeFlipkartDirect(query) {
  try {
    const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
    console.log(`[Flipkart] Fetching: ${url}`);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    
    if (response.status !== 200) {
      console.log(`[Flipkart] Status error: ${response.status}`);
      return [];
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const items = $('div[data-id]');
    const products = [];
    
    items.each((index, el) => {
      const item = $(el);
      
      // Determine layout based on classes present
      let title = '';
      const listTitleEl = item.find('.RG5Slk').first();
      const gridTitleEl = item.find('a.atJtCj').first();
      const brandEl = item.find('.Fo1I0b').first();
      
      if (listTitleEl.length > 0) {
        title = listTitleEl.text().trim();
      } else if (gridTitleEl.length > 0) {
        const brand = brandEl.text().trim();
        title = brand ? `${brand} ${gridTitleEl.text().trim()}` : gridTitleEl.text().trim();
      } else {
        title = item.find('a[title]').attr('title') || 
                item.find('.wSRVsn').text().trim() ||
                item.find('.s1Q9sB').text().trim() ||
                item.find('[class*="title"]').first().text().trim();
      }
      
      const priceText = item.find('.hZ3P6w').first().text().replace(/[^\d]/g, '') ||
                        item.find('.Nx9Z5j').first().text().replace(/[^\d]/g, '');
      const price = parseInt(priceText) || 0;
      
      const mrpText = item.find('.kRYCnD').first().text().replace(/[^\d]/g, '') ||
                      item.find('[class*="mrp"]').first().text().replace(/[^\d]/g, '');
      const mrp = parseInt(mrpText) || price;
      
      const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
      
      const imgEl = item.find('img').first();
      const image = imgEl.attr('src') || '';
      
      const linkEl = item.find('a').first();
      let link = linkEl.attr('href') || '';
      if (link && !link.startsWith('http')) {
        link = `https://www.flipkart.com${link}`;
      }
      
      const ratingText = item.find('span.CjyrHS').first().text().trim() ||
                        item.find('[class*="rating"]').first().text().trim();
      const rating = parseFloat(ratingText) || 4.1;
      
      if (title && price > 0 && link) {
        products.push({
          id: `flipkart-${index}-${Math.random()}`,
          title,
          price,
          mrp,
          discount,
          image,
          platform: 'Flipkart',
          deliveryTime: '2-3 Days',
          deliveryFee: 40,
          stockStatus: 'In stock',
          rating,
          url: link,
          category: 'General',
          isMock: false,
          lastUpdated: new Date().toISOString()
        });
      }
    });
    
    return products.slice(0, 10);
  } catch (err) {
    console.error("[Flipkart Scraper Error]", err);
    return [];
  }
}

async function run() {
  const query = "iphone 15";
  console.log(`Running search for "${query}"...`);
  const [amazon, flipkart] = await Promise.all([
    scrapeAmazonDirect(query),
    scrapeFlipkartDirect(query)
  ]);
  
  console.log(`\nAmazon products found: ${amazon.length}`);
  if (amazon.length > 0) {
    console.log("First Amazon:", amazon[0]);
  }
  
  console.log(`\nFlipkart products found: ${flipkart.length}`);
  if (flipkart.length > 0) {
    console.log("First Flipkart:", flipkart[0]);
  }
  
  const merged = [...amazon, ...flipkart].sort((a, b) => a.price - b.price);
  console.log(`\nTotal merged and sorted: ${merged.length}`);
}

run();
