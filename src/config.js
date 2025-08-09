require('dotenv').config();

module.exports = {
  botToken: process.env.BOT_TOKEN,
  rpcUrl: process.env.RPC_URL,
  gudApiKey: process.env.GUD_API_KEY,
  relayerPrivateKey: process.env.RELAYER_PRIVATE_KEY,
  
  chains: {
    mainnet: 1,        // Ethereum Mainnet
    base: 8453,        // Base
    optimism: 10,      // Optimism
    arbitrum: 42161,   // Arbitrum
    zircuit: 48900,    // Zircuit
  }
}; 