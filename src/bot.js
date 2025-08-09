const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');
const config = require('./config');
const log = require('./logger');
const zircuit = require('./services/zircuit');
const { handleSwapCommand, handlePairCallback, handleSwapBackCallback } = require('./commands/swap');

// Init EVM provider and optional relayer wallet
zircuit.initEvm();

// Init bot
const bot = new Telegraf(config.botToken);

bot.start((ctx) => ctx.reply('Xin chào! Gõ /swap để thử ước tính hoán đổi trên Mainnet.'));

bot.command('swap', handleSwapCommand);

// Callback handler for swap selections
bot.on('callback_query', (ctx) => {
  const data = ctx.callbackQuery.data;

  if (data.startsWith('pair:')) {
    return handlePairCallback(ctx);
  } else if (data === 'swap:back') {
    return handleSwapBackCallback(ctx);
  }

  // Handle other callbacks if needed
  return ctx.answerCbQuery('Unknown callback');
});

// Optional echo for text messages
bot.on(message('text'), (ctx) => {
  if (!ctx.message.text.startsWith('/')) {
    return ctx.reply('Gõ /swap để chọn cặp hoán đổi trên Mainnet.');
  }
});

bot.catch((err, ctx) => {
  log.error(`Bot error for update ${ctx.update?.update_id}:`, err);
});

bot.launch().then(() => {
  log.info('Bot launched with mainnet-only support');
}).catch((e) => {
  log.error('Failed to launch bot:', e);
  process.exit(1);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 