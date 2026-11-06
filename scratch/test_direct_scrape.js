const cheerio = require('cheerio');

async function testFlipkart() {
  console.log("Testing Flipkart Scraping...");
  try {
    const response = await fetch("https://www.flipkart.com/search?q=iphone", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    console.log("Flipkart status:", response.status);
    const html = await response.text();
    const $ = cheerio.load(html);
    const products = [];
    
    // Flipkart usually has class `_75iagw` or `yKfDkY` or `cPHK3Z` for products, let's check title text
    console.log("Page title:", $("title").text());
    
    // Let's print some text from the body to see if we got blocked or not
    console.log("Sample text length:", html.length);
    console.log("Does page contain 'iPhone'?", html.toLowerCase().includes("iphone"));
  } catch (err) {
    console.error("Flipkart Error:", err);
  }
}

async function testAmazon() {
  console.log("Testing Amazon Scraping...");
  try {
    const response = await fetch("https://www.amazon.in/s?k=iphone", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    console.log("Amazon status:", response.status);
    const html = await response.text();
    console.log("Does page contain 'Amazon'?", html.toLowerCase().includes("amazon"));
    console.log("Does page contain 'iPhone'?", html.toLowerCase().includes("iphone"));
    console.log("Does page contain 'robot' (bot block)?", html.toLowerCase().includes("robot") || html.toLowerCase().includes("captcha"));
  } catch (err) {
    console.error("Amazon Error:", err);
  }
}

async function run() {
  await testFlipkart();
  console.log("------------------------");
  await testAmazon();
}

run();
