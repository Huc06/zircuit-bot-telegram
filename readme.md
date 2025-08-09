## Zircuit Telegraf Bot

Telegram bot using Telegraf + Ethers with GUD Trading Engine integration.

### Getting Started

1. Clone this repo
2. Install dependencies:

```bash
npm install
```

3. Create `.env` from `.env.example` and fill values:

```
BOT_TOKEN=123456:abcdef...
RPC_URL=https://your.rpc.url
GUD_API_KEY=your_gud_api_key
RELAYER_PRIVATE_KEY=optional_0x_private_key
```

- `BOT_TOKEN`: Telegram bot token from BotFather
- `RPC_URL`: EVM RPC URL
- `GUD_API_KEY`: API key for GUD Trading Engine
- `RELAYER_PRIVATE_KEY` (optional): If provided, a relayer wallet will be initialized to send transactions

4. Start the bot:

```bash
npm start
```

### Commands

- `/swap`: Shows an inline keyboard to pick a swap pair (ETH ↔ USDC).
  - After you select a pair, the bot calls GUD Trading Engine `/order/estimate`.
  - The bot replies with the estimated destination amount and deadline if provided.

### Customize

- Token pairs can be adjusted in `src/commands/swap.js` (`TOKENS` map and keyboard).
- GUD Engine client: `src/services/gudEngine.js`
- Zircuit SDK stub: `src/services/zircuit.js` (contains `sendTx` using ethers Wallet if `RELAYER_PRIVATE_KEY` is set)
- EVM provider and wallet are initialized in `src/services/zircuit.js` using `RPC_URL` and `RELAYER_PRIVATE_KEY`.

### Project Structure

```
src/
  bot.js
  config.js
  logger.js
  commands/
    swap.js
  services/
    gudEngine.js
    zircuit.js
.env.example
```

### Notes

- Telegraf framework docs: [telegraf/telegraf on GitHub](https://github.com/telegraf/telegraf.git)
- This is a minimal example. Integrate additional chains/tokens and full swap flows as needed. 