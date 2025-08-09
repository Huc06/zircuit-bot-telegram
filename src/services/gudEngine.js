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
    srcToken,
    destToken,
    amount,
    chainId = 1,
    slippageBps = 50,
    recipient,
  } = params;

  try {
    const { data } = await http.post('/order/estimate', {
      srcToken,
      destToken,
      amount,
      chainId,
      slippageBps,
      recipient,
    });

    return data;
  } catch (err) {
    if (err.response) {
      const { status, data } = err.response;
      const message = (data && (data.message || data.error)) || classifyHttpError(status);
      const e = new Error(message);
      e.status = status;
      e.details = data;
      throw e;
    }
    log.error('GUD estimate request failed:', err.message);
    throw new Error('Network error contacting GUD Engine');
  }
}

module.exports = {
  getEstimate,
}; 