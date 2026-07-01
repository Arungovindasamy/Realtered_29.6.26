const axios = require('axios');

async function test() {
  try {
    const email = 'teezaastyleyourtees@gmail.com';
    const url = `https://haatzaseller.com/_functions/sellerdata?email=${encodeURIComponent(email)}`;
    console.log('Fetching:', url);
    const response = await axios.get(url);
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error('Error fetching sellerdata:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
  }
}

test();
