const { Markup } = require('telegraf');
const gudEngine = require('../services/gudEngine');
const log = require('../logger');

const TOKENS = {
  ETH: {
    symbol: 'ETH',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH on Ethereum mainnet
    decimals: 18,
  },
  USDC: {
    symbol: 'USDC',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606EB48',
    decimals: 6,
  },
};

function toBaseUnits(amountFloat, decimals) {
  const { ethers } = require('ethers');
  return ethers.parseUnits(String(amountFloat), decimals).toString();
}

function formatAmount(amountStr, decimals) {
  const { ethers } = require('ethers');
  try {
    return ethers.formatUnits(amountStr, decimals);
  } catch {
    return amountStr;
  }
}

function buildPairsKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('ETH → USDC', 'pair:ETH-USDC')],
    [Markup.button.callback('USDC → ETH', 'pair:USDC-ETH')],
  ]);
}

async function handleSwapCommand(ctx) {
  await ctx.reply('Chọn cặp swap:', buildPairsKeyboard());
}

async function handlePairCallback(ctx) {
  try {
    const data = ctx.callbackQuery.data;
    if (!data.startsWith('pair:')) return;
    const pair = data.replace('pair:', '');
    const [srcSym, dstSym] = pair.split('-');

    const src = TOKENS[srcSym];
    const dst = TOKENS[dstSym];

    if (!src || !dst) {
      return ctx.answerCbQuery('Cặp token không hợp lệ');
    }

    // Example amount: 0.01 for ETH, 10 for USDC
    const defaultAmounts = { ETH: 0.01, USDC: 10 };
    const amount = defaultAmounts[srcSym] || 1;

    await ctx.answerCbQuery(`Đang ước tính ${srcSym} → ${dstSym}...`, { show_alert: false });

    const estimate = await gudEngine.getEstimate({
      srcToken: src.address,
      destToken: dst.address,
      amount: toBaseUnits(amount, src.decimals),
      chainId: 1,
      slippageBps: 50,
      recipient: undefined,
    });

    const destAmount = estimate.destAmount || estimate.toAmount || estimate.amountOut;
    const deadline = estimate.deadline || estimate.expiry || estimate.expiresAt;

    const destAmountFormatted = destAmount ? formatAmount(String(destAmount), dst.decimals) : 'N/A';

    const lines = [
      `Ước tính hoán đổi ${amount} ${src.symbol} → ${dst.symbol}`,
      `- Số lượng nhận (ước tính): ${destAmountFormatted} ${dst.symbol}`,
      deadline ? `- Deadline: ${deadline}` : null,
    ].filter(Boolean);

    return ctx.reply(lines.join('\n'));
  } catch (e) {
    log.error('Estimate error:', e);
    const msg = e && e.message ? e.message : 'Đã xảy ra lỗi khi lấy estimate';
    return ctx.reply(`Lỗi: ${msg}`);
  }
}

module.exports = {
  handleSwapCommand,
  handlePairCallback,
}; 