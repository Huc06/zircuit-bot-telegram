const { ethers } = require('ethers');
const config = require('../config');
const log = require('../logger');

let provider;
let wallet;

function isValidPrivateKeyHex(pk) {
  if (!pk) return false;
  const hex = pk.startsWith('0x') ? pk.slice(2) : pk;
  return /^[0-9a-fA-F]{64}$/.test(hex);
}

function initEvm() {
  provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const pk = (config.relayerPrivateKey || '').trim();

  if (isValidPrivateKeyHex(pk)) {
    try {
      wallet = new ethers.Wallet(pk, provider);
      log.info('Relayer wallet initialized');
    } catch (e) {
      wallet = null;
      log.warn('Failed to initialize relayer wallet; starting in read-only mode:', e.message);
    }
  } else if (pk.length > 0) {
    wallet = null;
    log.warn('RELAYER_PRIVATE_KEY provided but invalid. Expected 0x + 64 hex chars. Running in read-only mode.');
  } else {
    wallet = null;
    log.info('No relayer private key provided; running in read-only mode');
  }
  return { provider, wallet };
}

async function sendTx(txRequest) {
  if (!wallet) {
    throw new Error('Relayer wallet not configured. Set a valid RELAYER_PRIVATE_KEY to enable sendTx');
  }
  const tx = await wallet.sendTransaction(txRequest);
  log.info('Submitted tx', tx.hash);
  return tx;
}

module.exports = {
  initEvm,
  sendTx,
  get provider() { return provider; },
  get wallet() { return wallet; },
}; 