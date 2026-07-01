const https = require('https');

const domain = 'https://haatza.com/_functions';

const tests = [
  'sellerId=HS1482',
  'email=rehanashaik7862%40gmail.com',
  'sellerId=HS1482&email=rehanashaik7862%40gmail.com',
  'sellerId=HS1482&emailId=rehanashaik7862%40gmail.com',
  'sellerId=HS1482&sellerEmail=rehanashaik7862%40gmail.com',
  'emailId=rehanashaik7862%40gmail.com',
  'sellerId=HS1482&email=rehanashaik7862%40gmail.com&emailId=rehanashaik7862%40gmail.com'
];

function request(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data
        });
      });
    }).on('error', (err) => {
      resolve({ status: 'ERROR', error: err.message });
    });
  });
}

async function run() {
  console.log('--- Testing Parameters on sellerpayments ---');
  for (const params of tests) {
    const url = `${domain}/sellerpayments?${params}`;
    const res = await request(url);
    console.log(`- ?${params} => Status: ${res.status}, Body: ${res.body.trim()}`);
  }
}

run();
