import * as cheerio from 'cheerio';

async function testBB() {
  const url = `https://www.bigbasket.com/ps/?q=milk`;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    const nextData = $('#__NEXT_DATA__');
    console.log("NEXT DATA tag exists:", nextData.length);
    if (nextData.length > 0) {
      const json = JSON.parse(nextData.text());
      console.log("Keys of NEXT_DATA:", Object.keys(json));
      // Write JSON to file to inspect
      import('fs').then(fs => {
        fs.writeFileSync('scratch/next_data.json', JSON.stringify(json, null, 2));
        console.log("Wrote next_data.json");
      });
    }
  } catch (e) {
    console.error("ERROR:", e);
  }
}
testBB();
