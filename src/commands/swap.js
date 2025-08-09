const { Markup } = require('telegraf');
const gudEngine = require('../services/gudEngine');
const config = require('../config');
const log = require('../logger');

// Mainnet tokens only
const TOKENS = {
  ETH: {
    symbol: 'ETH',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Native ETH
    decimals: 18,
    chainId: config.chains.mainnet,
    network: 'mainnet'
  },
  USDC: {
    symbol: 'USDC',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606EB48', // USDC on Ethereum
    decimals: 6,
    chainId: config.chains.mainnet,
    network: 'mainnet'
  },
  USDC_BASE: {
    symbol: 'USDC',
    address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC on Base
    decimals: 6,
    chainId: config.chains.base,
    network: 'mainnet'
  },
  USDT: {
    symbol: 'USDT',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT on Ethereum
    decimals: 6,
    chainId: config.chains.mainnet,
    network: 'mainnet'
  },
};

function toWei(amountFloat, decimals) {
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
    [Markup.button.callback('ETH → USDC (Ethereum)', 'pair:ETH-USDC-mainnet')],
    [Markup.button.callback('USDC → ETH (Ethereum)', 'pair:USDC-ETH-mainnet')],
    [Markup.button.callback('USDC → USDT (Ethereum)', 'pair:USDC-USDT-mainnet')],
    [Markup.button.callback('USDC → ETH (Base)', 'pair:USDC_BASE-ETH-base')],
  ]);
}

async function handleSwapCommand(ctx) {
  await ctx.reply('Chọn cặp swap trên Mainnet:', buildPairsKeyboard());
}

async function handlePairCallback(ctx) {
  try {
    const data = ctx.callbackQuery.data;
    if (!data.startsWith('pair:')) return;
    const pair = data.replace('pair:', '');
    const [srcSym, dstSym, chainName] = pair.split('-');

    const src = TOKENS[srcSym];
    const dst = TOKENS[dstSym];

    if (!src || !dst) {
      return ctx.answerCbQuery('Cặp token không hợp lệ');
    }

    // Example amounts based on token type
    const defaultAmounts = { 
      ETH: 0.01, 
      USDC: 10, 
      USDC_BASE: 10,
      USDT: 10,
    };
    const amount = defaultAmounts[srcSym] || 1;

    await ctx.answerCbQuery(`Đang ước tính ${srcSym} → ${dstSym} trên ${chainName}...`, { show_alert: false });

    const estimate = await gudEngine.getEstimate({
      srcChainId: src.chainId,
      srcToken: src.address,
      srcAmountWei: toWei(amount, src.decimals),
      destToken: dst.address,
      destChainId: dst.chainId,
      slippageBps: 100,
      userAccount: '0x0000000000000000000000000000000000000000', // Default address for estimates
      destReceiver: '0x0000000000000000000000000000000000000000', // Default address for estimates
    });

    // Extract data from the API response structure
    const trade = estimate.data?.trade || estimate.trade;
    const tx = estimate.data?.tx || estimate.tx;

    if (!trade) {
      return ctx.reply('Không thể lấy thông tin estimate từ GUD Engine');
    }

    const destAmount = trade.destTokenAmount;
    const minExpectedAmount = trade.destTokenMinAmount;
    const fees = trade.fees;
    const tradeId = trade.tradeId;

    const destAmountFormatted = destAmount ? formatAmount(String(destAmount), dst.decimals) : 'N/A';
    const minAmountFormatted = minExpectedAmount ? formatAmount(String(minExpectedAmount), dst.decimals) : 'N/A';

    const lines = [
      `🟢 Mainnet 🔄 Ước tính hoán đổi ${amount} ${src.symbol} → ${dst.symbol}`,
      `📍 Chain: ${chainName} (ID: ${src.chainId})`,
      `💰 Số lượng nhận (ước tính): ${destAmountFormatted} ${dst.symbol}`,
      `⚠️ Số lượng tối thiểu: ${minAmountFormatted} ${dst.symbol}`,
      `🆔 Trade ID: ${tradeId || 'N/A'}`,
    ];

    if (fees) {
      lines.push(`💸 Phí: ${JSON.stringify(fees)}`);
    }

    // Add back button
    const backKeyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Quay lại', 'swap:back')]
    ]);

    return ctx.reply(lines.join('\n'), backKeyboard);
  } catch (e) {
    log.error('Estimate error:', e);
    const msg = e && e.message ? e.message : 'Đã xảy ra lỗi khi lấy estimate';
    return ctx.reply(`❌ Lỗi: ${msg}`);
  }
}

async function handleSwapBackCallback(ctx) {
  try {
    const data = ctx.callbackQuery.data;
    if (data === 'swap:back') {
      await ctx.editMessageText('Chọn cặp swap trên Mainnet:', buildPairsKeyboard());
      await ctx.answerCbQuery();
    }
  } catch (e) {
    log.error('Swap back callback error:', e);
    await ctx.answerCbQuery('❌ Lỗi khi quay lại');
  }
}

module.exports = {
  handleSwapCommand,
  handlePairCallback,
  handleSwapBackCallback,
}; 