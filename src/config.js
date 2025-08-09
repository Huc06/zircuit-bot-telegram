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
  chains: {
    mainnet: 1,
    base: 8453,
    optimism: 10,
    arbitrum: 42161,
    zircuit: 48900,
    sepolia: 11155111,
    baseSepolia: 84532,
    optimismSepolia: 11155420,
    arbitrumSepolia: 421614,
  },
};

module.exports = config; 