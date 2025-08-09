require('dotenv').config();

const required = (name, allowEmpty = false) => {
  const v = process.env[name];
  if (!allowEmpty && (!v || v.trim() === '')) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
};

const config = {
  botToken: required('BOT_TOKEN'),
  rpcUrl: required('RPC_URL'),
  gudApiKey: required('GUD_API_KEY'),
  relayerPrivateKey: process.env.RELAYER_PRIVATE_KEY || '',
  gud: {
    baseURL: 'https://trading.ai.zircuit.com/api/engine/v1',
    timeoutMs: 15_000,
  },
};

module.exports = config; 