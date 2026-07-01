const https = require('https');

const domains = [
  'https://haatza.com/_functions',
  'https://haatzaseller.com/_functions'
];

const endpoints = [
  'Campaignsummery?sellerId=HS1482',
  'notifications?sellerId=HS1482',
  'checkWalletBalance?sellerId=HS1482',
  'sellernewOrders?sellerId=HS1482',
  'sellertickets?sellerId=HS1482&emailId=rehanashaik7862%40gmail.com',
  'sellerproductInventory?sellerId=HS1482'
];

function request(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data.substring(0, 200)
        });
      });
    }).on('error', (err) => {
      resolve({ status: 'ERROR', error: err.message });
    });
  });
}

async function run() {
  console.log('--- Testing API Endpoints ---');
  for (const domain of domains) {
    console.log(`\nDomain: ${domain}`);
    for (const endpoint of endpoints) {
      const url = `${domain}/${endpoint}`;
      const res = await request(url);
      console.log(`  - ${endpoint.split('?')[0]}:`);
      console.log(`    Status: ${res.status}`);
      if (res.headers) {
        console.log(`    CORS Origin: ${res.headers['access-control-allow-origin'] || 'NONE'}`);
        console.log(`    CORS Headers: ${res.headers['access-control-allow-headers'] || 'NONE'}`);
      }
      if (res.body) {
        console.log(`    Body: ${res.body}`);
      }
      if (res.error) {
        console.log(`    Error: ${res.error}`);
      }
    }
  }
}

run();
