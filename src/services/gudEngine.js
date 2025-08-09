const axios = require('axios');
const config = require('../config');
const log = require('../logger');

const http = axios.create({
  baseURL: config.gud.baseURL,
  timeout: config.gud.timeoutMs,
});

http.interceptors.request.use((req) => {
  req.headers = req.headers || {};
  req.headers['Authorization'] = `Bearer ${config.gudApiKey}`;
  req.headers['Content-Type'] = 'application/json';
  return req;
});

const classifyHttpError = (status) => {
  switch (status) {
    case 400:
      return 'Bad request to GUD Engine (400). Please check parameters.';
    case 401:
      return 'Unauthorized (401). Invalid or missing GUD_API_KEY.';
    case 404:
      return 'Endpoint or resource not found (404).';
    case 429:
      return 'Rate limited (429). Please retry later.';
    case 500:
      return 'GUD Engine internal error (500). Try again later.';
    default:
      return `HTTP error ${status}`;
  }
};

async function getEstimate(params) {
  const {
    srcChainId = 1, // Default to Ethereum mainnet
    srcToken,
    srcAmountWei,
    destToken,
    destChainId,
    slippageBps = 100,
    userAccount,
    destReceiver,
  } = params;

  try {
    const requestBody = {
      srcChainId,
      srcToken,
      srcAmountWei,
      destToken,
      destChainId: destChainId || srcChainId, // Same chain if not specified
      slippageBps,
      ...(userAccount && { userAccount }),
      ...(destReceiver && { destReceiver }),
    };

    log.info('GUD estimate request:', requestBody);

    const { data } = await http.post('/order/estimate', requestBody);

    log.info('GUD estimate response:', data);

    return data;
  } catch (err) {
    if (err.response) {
      const { status, data } = err.response;
      const message = (data && (data.error || data.message)) || classifyHttpError(status);
      const e = new Error(message);
      e.status = status;
      e.details = data;
      throw e;
    }
    log.error('GUD estimate request failed:', err.message);
    throw new Error('Network error contacting GUD Engine');
  }
}

async function getTradeStatus(txHash) {
  try {
    const { data } = await http.get(`/order/status?txHash=${txHash}`);
    return data;
  } catch (err) {
    if (err.response) {
      const { status, data } = err.response;
      const message = (data && (data.error || data.message)) || classifyHttpError(status);
      const e = new Error(message);
      e.status = status;
      e.details = data;
      throw e;
    }
    log.error('GUD trade status request failed:', err.message);
    throw new Error('Network error contacting GUD Engine');
  }
}

async function waitUntilTradeIsCompleted(txHash, maxWaitTime = 60000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const response = await getTradeStatus(txHash);
      
      if (['SUCCESS', 'FAILED', 'REFUNDED', 'UNKNOWN'].includes(response.status)) {
        return response;
      }
      
      // Wait 1 second before next check
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      log.warn('Error checking trade status:', error.message);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error('Trade status check timeout');
}

module.exports = {
  getEstimate,
  getTradeStatus,
  waitUntilTradeIsCompleted,
}; 