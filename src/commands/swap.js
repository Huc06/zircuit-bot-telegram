const { Markup } = require('telegraf');
const gudEngine = require('../services/gudEngine');
const log = require('../logger');
const config = require('../config');

const TOKENS = {
  // Mainnet tokens
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
  
  // Testnet tokens
  ETH_SEPOLIA: {
    symbol: 'ETH',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Native ETH on Sepolia
    decimals: 18,
    chainId: config.chains.sepolia,
    network: 'testnet'
  },
  USDC_SEPOLIA: {
    symbol: 'USDC',
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Sepolia
    decimals: 6,
    chainId: config.chains.sepolia,
    network: 'testnet'
  },
  ETH_BASE_SEPOLIA: {
    symbol: 'ETH',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Native ETH on Base Sepolia
    decimals: 18,
    chainId: config.chains.baseSepolia,
    network: 'testnet'
  },
  USDC_BASE_SEPOLIA: {
    symbol: 'USDC',
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7c', // USDC on Base Sepolia
    decimals: 6,
    chainId: config.chains.baseSepolia,
    network: 'testnet'
  },
  ETH_OPTIMISM_SEPOLIA: {
    symbol: 'ETH',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Native ETH on Optimism Sepolia
    decimals: 18,
    chainId: config.chains.optimismSepolia,
    network: 'testnet'
  },
  USDC_OPTIMISM_SEPOLIA: {
    symbol: 'USDC',
    address: '0x5fd84259d66Cd461235407665Be79390954e9Eb6', // USDC on Optimism Sepolia
    decimals: 6,
    chainId: config.chains.optimismSepolia,
    network: 'testnet'
  },
  ETH_ARBITRUM_SEPOLIA: {
    symbol: 'ETH',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Native ETH on Arbitrum Sepolia
    decimals: 18,
    chainId: config.chains.arbitrumSepolia,
    network: 'testnet'
  },
  USDC_ARBITRUM_SEPOLIA: {
    symbol: 'USDC',
    address: '0x75faf114eafb1BDbe2F0316EeBfd1c6AADd4b326', // USDC on Arbitrum Sepolia
    decimals: 6,
    chainId: config.chains.arbitrumSepolia,
    network: 'testnet'
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
    // Mainnet pairs
    [Markup.button.callback('🟢 Mainnet', 'network:mainnet')],
    [Markup.button.callback('🧪 Testnet', 'network:testnet')],
  ]);
}

function buildMainnetPairsKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('ETH → USDC (Ethereum)', 'pair:ETH-USDC-mainnet')],
    [Markup.button.callback('USDC → ETH (Ethereum)', 'pair:USDC-ETH-mainnet')],
    [Markup.button.callback('USDC → USDT (Ethereum)', 'pair:USDC-USDT-mainnet')],
    [Markup.button.callback('USDC → ETH (Base)', 'pair:USDC_BASE-ETH-mainnet')],
    [Markup.button.callback('🔙 Back to Networks', 'network:back')],
  ]);
}

function buildTestnetPairsKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('ETH → USDC (Sepolia)', 'pair:ETH_SEPOLIA-USDC_SEPOLIA-sepolia')],
    [Markup.button.callback('USDC → ETH (Sepolia)', 'pair:USDC_SEPOLIA-ETH_SEPOLIA-sepolia')],
    [Markup.button.callback('ETH → USDC (Base Sepolia)', 'pair:ETH_BASE_SEPOLIA-USDC_BASE_SEPOLIA-baseSepolia')],
    [Markup.button.callback('USDC → ETH (Base Sepolia)', 'pair:USDC_BASE_SEPOLIA-ETH_BASE_SEPOLIA-baseSepolia')],
    [Markup.button.callback('ETH → USDC (Optimism Sepolia)', 'pair:ETH_OPTIMISM_SEPOLIA-USDC_OPTIMISM_SEPOLIA-optimismSepolia')],
    [Markup.button.callback('ETH → USDC (Arbitrum Sepolia)', 'pair:ETH_ARBITRUM_SEPOLIA-USDC_ARBITRUM_SEPOLIA-arbitrumSepolia')],
    [Markup.button.callback('🔙 Back to Networks', 'network:back')],
  ]);
}

async function handleSwapCommand(ctx) {
  await ctx.reply('Chọn mạng để swap:', buildPairsKeyboard());
}

async function handleNetworkCallback(ctx) {
  try {
    const data = ctx.callbackQuery.data;
    if (!data.startsWith('network:')) return;
    
    const network = data.replace('network:', '');
    
    if (network === 'mainnet') {
      await ctx.editMessageText('Chọn cặp swap trên Mainnet:', buildMainnetPairsKeyboard());
    } else if (network === 'testnet') {
      await ctx.editMessageText('Chọn cặp swap trên Testnet:', buildTestnetPairsKeyboard());
    } else if (network === 'back') {
      await ctx.editMessageText('Chọn mạng để swap:', buildPairsKeyboard());
    }
    
    await ctx.answerCbQuery();
  } catch (e) {
    log.error('Network callback error:', e);
    await ctx.answerCbQuery('❌ Lỗi khi chọn mạng');
  }
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

    // Example amounts based on token type and network
    const defaultAmounts = { 
      ETH: 0.01, 
      USDC: 10, 
      USDC_BASE: 10,
      USDT: 10,
      // Testnet amounts (smaller for testing)
      ETH_SEPOLIA: 0.001,
      USDC_SEPOLIA: 1,
      ETH_BASE_SEPOLIA: 0.001,
      USDC_BASE_SEPOLIA: 1,
      ETH_OPTIMISM_SEPOLIA: 0.001,
      USDC_OPTIMISM_SEPOLIA: 1,
      ETH_ARBITRUM_SEPOLIA: 0.001,
      USDC_ARBITRUM_SEPOLIA: 1,
    };
    const amount = defaultAmounts[srcSym] || 1;

    const networkType = src.network === 'testnet' ? '🧪 Testnet' : '🟢 Mainnet';
    await ctx.answerCbQuery(`Đang ước tính ${srcSym} → ${dstSym} trên ${chainName} (${networkType})...`, { show_alert: false });

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

    // Extract data from the new API response structure
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
      `${networkType} 🔄 Ước tính hoán đổi ${amount} ${src.symbol} → ${dst.symbol}`,
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
      [Markup.button.callback('🔙 Quay lại', `network:${src.network}`)]
    ]);

    return ctx.reply(lines.join('\n'), backKeyboard);
  } catch (e) {
    log.error('Estimate error:', e);
    const msg = e && e.message ? e.message : 'Đã xảy ra lỗi khi lấy estimate';
    return ctx.reply(`❌ Lỗi: ${msg}`);
  }
}

module.exports = {
  handleSwapCommand,
  handleNetworkCallback,
  handlePairCallback,
}; 