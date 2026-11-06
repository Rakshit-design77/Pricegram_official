const https = require('https');

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: headers,
      method: 'GET'
    };
    
    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, html: data });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function run() {
  const url = "https://www.amazon.in/s?k=iphone+15";
  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
  };
  
  console.log("Fetching using https.get...");
  const res = await httpsGet(url, headers);
  console.log("Status:", res.status);
  console.log("HTML Length:", res.html.length);
  console.log("Contains captcha/robot?", res.html.toLowerCase().includes("captcha") || res.html.toLowerCase().includes("robot"));
}

run();
