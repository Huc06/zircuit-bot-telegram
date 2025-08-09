const { ethers } = require('ethers');
const config = require('../config');
const log = require('../logger');

let providers = {};
let wallets = {};

function isValidPrivateKeyHex(pk) {
  if (!pk) return false;
  const hex = pk.startsWith('0x') ? pk.slice(2) : pk;
  return /^[0-9a-fA-F]{64}$/.test(hex);
}

function getChainRpcUrl(chainId) {
  // For now, use the same RPC_URL for all chains
  // In production, you might want to have different RPC URLs for different chains
  return config.rpcUrl;
}

function initEvm() {
  const pk = (config.relayerPrivateKey || '').trim();

  if (isValidPrivateKeyHex(pk)) {
    try {
      // Initialize providers and wallets for all supported chains
      Object.entries(config.chains).forEach(([chainName, chainId]) => {
        const rpcUrl = getChainRpcUrl(chainId);
        providers[chainId] = new ethers.JsonRpcProvider(rpcUrl);
        
        try {
          wallets[chainId] = new ethers.Wallet(pk, providers[chainId]);
          log.info(`Relayer wallet initialized for ${chainName} (${chainId})`);
        } catch (e) {
          wallets[chainId] = null;
          log.warn(`Failed to initialize relayer wallet for ${chainName} (${chainId}):`, e.message);
        }
      });
      
      log.info('EVM providers and wallets initialized for all supported chains');
    } catch (e) {
      log.error('Failed to initialize EVM infrastructure:', e.message);
      throw e;
    }
  } else if (pk.length > 0) {
    log.warn('RELAYER_PRIVATE_KEY provided but invalid. Expected 0x + 64 hex chars. Running in read-only mode.');
  } else {
    log.info('No relayer private key provided; running in read-only mode');
  }

  return { providers, wallets };
}

async function sendTx(txRequest, chainId = 1) {
  const wallet = wallets[chainId];
  if (!wallet) {
    throw new Error(`Relayer wallet not configured for chain ${chainId}. Set a valid RELAYER_PRIVATE_KEY to enable sendTx`);
  }
  
  const tx = await wallet.sendTransaction(txRequest);
  log.info(`Submitted tx on chain ${chainId}:`, tx.hash);
  return tx;
}

function getProvider(chainId = 1) {
  return providers[chainId] || null;
}

function getWallet(chainId = 1) {
  return wallets[chainId] || null;
}

function isChainSupported(chainId) {
  return Object.values(config.chains).includes(chainId);
}

module.exports = {
  initEvm,
  sendTx,
  getProvider,
  getWallet,
  isChainSupported,
  get providers() { return providers; },
  get wallets() { return wallets; },
}; 