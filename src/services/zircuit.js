const { ethers } = require('ethers');
const config = require('../config');
const log = require('../logger');

let providers = {};
let wallets = {};

function isValidPrivateKeyHex(privateKey) {
  if (!privateKey || typeof privateKey !== 'string') return false;
  if (!privateKey.startsWith('0x')) return false;
  if (privateKey.length !== 66) return false; // 0x + 64 hex chars
  return /^0x[0-9a-fA-F]{64}$/.test(privateKey);
}

function initEvm() {
  try {
    // Initialize providers for mainnet chains only
    const mainnetChains = [
      { id: config.chains.mainnet, name: 'mainnet' },
      { id: config.chains.base, name: 'base' },
      { id: config.chains.optimism, name: 'optimism' },
      { id: config.chains.arbitrum, name: 'arbitrum' },
      { id: config.chains.zircuit, name: 'zircuit' },
    ];

    mainnetChains.forEach(chain => {
      // Create provider
      providers[chain.id] = new ethers.JsonRpcProvider(config.rpcUrl, chain.id);
      
      // Create wallet if private key is provided
      if (config.relayerPrivateKey && isValidPrivateKeyHex(config.relayerPrivateKey)) {
        wallets[chain.id] = new ethers.Wallet(config.relayerPrivateKey, providers[chain.id]);
        log.info(`Relayer wallet initialized for ${chain.name} (${chain.id})`);
      } else {
        log.warn(`Relayer wallet not configured for ${chain.name} (${chain.id})`);
      }
    });

    log.info('EVM providers and wallets initialized for mainnet chains');
  } catch (error) {
    log.error('Failed to initialize EVM:', error);
    throw error;
  }
}

function getProvider(chainId) {
  return providers[chainId];
}

function getWallet(chainId) {
  return wallets[chainId];
}

async function sendTx(chainId, txData) {
  const wallet = getWallet(chainId);
  if (!wallet) {
    throw new Error('Relayer wallet not configured for this chain');
  }

  try {
    const tx = await wallet.sendTransaction(txData);
    log.info(`Transaction sent on chain ${chainId}:`, tx.hash);
    return tx;
  } catch (error) {
    log.error(`Failed to send transaction on chain ${chainId}:`, error);
    throw error;
  }
}

module.exports = {
  initEvm,
  getProvider,
  getWallet,
  sendTx,
}; 