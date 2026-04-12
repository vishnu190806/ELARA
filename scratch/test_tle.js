const TLE_URL = "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE";

async function testFetch() {
  try {
    const response = await fetch(TLE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    console.log("Status:", response.status);
    console.log("Headers:", response.headers);
    const body = await response.text();
    console.log("Body length:", body.length);
    console.log("Body start:", body.substring(0, 100));
  } catch (err) {
    console.error("Error:", err);
  }
}

testFetch();
