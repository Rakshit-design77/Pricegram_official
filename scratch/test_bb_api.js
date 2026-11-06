async function testBBApi() {
  const url = `https://www.bigbasket.com/doc/v1/s/?q=milk`;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept": "application/json"
      }
    });
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response Snippet:", text.substring(0, 1000));
  } catch (e) {
    console.error("ERROR:", e);
  }
}
testBBApi();
