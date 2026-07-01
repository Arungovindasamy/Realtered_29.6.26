const axios = require('axios');

async function checkSeller(contact) {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const contactType = isEmail ? "email" : "phone";
  const param = `${contactType}=${encodeURIComponent(contact)}`;
  const url = `https://haatzaseller.com/_functions/checkseller?${param}`;
  console.log('\n[CheckSeller] Fetching:', url);
  const response = await axios.get(url);
  console.log('Response:', JSON.stringify(response.data, null, 2));
  return response.data;
}

async function checkOnboardStatus(contact) {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const contactType = isEmail ? "email" : "phone";
  const param = `${contactType}=${encodeURIComponent(contact)}`;
  const url = `https://haatzaseller.com/_functions/onboardStatus?${param}`;
  console.log('\n[OnboardStatus] Fetching:', url);
  const response = await axios.get(url);
  console.log('Response:', JSON.stringify(response.data, null, 2));
  return response.data;
}

async function run() {
  const email = 'teezaastyleyourtees@gmail.com';
  try {
    await checkSeller(email);
    await checkOnboardStatus(email);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
  }
}

run();
