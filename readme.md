# Zircuit Telegraf Bot

Telegram bot using Telegraf + Ethers with GUD Trading Engine integration for multi-chain swaps.

## Features

- **Multi-chain Support**: Ethereum, Base, Optimism, Arbitrum, Zircuit, and testnets
- **GUD Trading Engine Integration**: Get swap estimates across different chains
- **Interactive Swap Interface**: Inline keyboard for selecting swap pairs
- **EVM Integration**: Support for multiple chains with ethers.js
- **Optional Transaction Execution**: Send transactions if `RELAYER_PRIVATE_KEY` is configured

## Getting Started

### 1. Clone this repo
```bash
git clone https://github.com/Huc06/zircuit-bot-telegram.git
cd zircuit-bot-telegram
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create `.env` from `.env.example` and fill values:

```bash
# Telegram Bot Configuration
BOT_TOKEN=123456:abcdef...

# EVM Configuration  
RPC_URL=https://your.rpc.url

# GUD Trading Engine Configuration
GUD_API_KEY=your_gud_api_key_here

# Optional: Relayer Wallet for Transaction Execution
RELAYER_PRIVATE_KEY=0xoptional_private_key_here
```

**Required Variables:**
- `BOT_TOKEN`: Telegram bot token from [@BotFather](https://t.me/BotFather)
- `RPC_URL`: EVM RPC URL (used for all chains)
- `GUD_API_KEY`: API key for GUD Trading Engine

**Optional Variables:**
- `RELAYER_PRIVATE_KEY`: If provided, enables transaction execution across all supported chains

### 4. Start the bot
```bash
npm start
```

## Commands

### `/swap` - Multi-chain Swap Estimates
Shows an inline keyboard with swap pairs across different chains:

- **ETH → USDC (Ethereum)**: Native ETH to USDC on Ethereum mainnet
- **USDC → ETH (Ethereum)**: USDC to native ETH on Ethereum mainnet  
- **USDC → USDT (Ethereum)**: USDC to USDT on Ethereum mainnet
- **USDC → ETH (Base)**: USDC to native ETH on Base mainnet

When you select a pair:
1. Bot calls GUD Trading Engine `/order/estimate` API
2. Returns estimated destination amount, minimum amount, fees, and trade ID
3. Shows chain information and slippage settings

## Supported Chains

| Chain | ID | Status |
|-------|----|---------|
| Ethereum Mainnet | 1 | ✅ |
| Base | 8453 | ✅ |
| Optimism | 10 | ✅ |
| Arbitrum | 42161 | ✅ |
| Zircuit | 48900 | ✅ |
| Sepolia | 11155111 | ✅ |
| Base Sepolia | 84532 | ✅ |
| Optimism Sepolia | 11155420 | ✅ |
| Arbitrum Sepolia | 421614 | ✅ |

## API Integration

### GUD Trading Engine
- **Base URL**: `https://trading.ai.zircuit.com/api/engine/v1`
- **Authentication**: Bearer token via `GUD_API_KEY`
- **Endpoints**:
  - `POST /order/estimate` - Get swap estimates
  - `GET /order/status?txHash={hash}` - Check trade status

### Request Format
```javascript
{
  srcChainId: 8453,        // Source chain ID
  srcToken: "0x...",       // Source token address
  srcAmountWei: "1000000", // Amount in wei
  destToken: "0x...",      // Destination token address
  destChainId: 48900,      // Destination chain ID
  slippageBps: 100,        // Slippage tolerance (1% = 100)
  userAccount: "0x...",    // User wallet address
  destReceiver: "0x..."    // Destination receiver
}
```

## Customization

### Adding New Token Pairs
Edit `src/commands/swap.js`:

```javascript
const TOKENS = {
  NEW_TOKEN: {
    symbol: 'NEW',
    address: '0x...',
    decimals: 18,
    chainId: config.chains.mainnet,
  },
  // ... existing tokens
};
```

### Adding New Chains
Edit `src/config.js`:

```javascript
chains: {
  // ... existing chains
  newChain: 12345,
}
```

### Modifying Swap Logic
- **Estimate handling**: `src/services/gudEngine.js`
- **EVM operations**: `src/services/zircuit.js`
- **Bot commands**: `src/commands/swap.js`

## Project Structure

```
src/
├── bot.js              # Main bot entry point
├── config.js           # Configuration and environment variables
├── logger.js           # Console logging utility
├── commands/
│   └── swap.js        # Swap command handlers
└── services/
    ├── gudEngine.js    # GUD Trading Engine API client
    └── zircuit.js      # EVM provider and wallet management
```

## Development

### Adding New Features
1. Create new command files in `src/commands/`
2. Add new services in `src/services/`
3. Update `src/bot.js` to register new commands
4. Test with different chain configurations

### Error Handling
The bot includes comprehensive error handling for:
- HTTP errors (400, 401, 404, 429, 500)
- Invalid private keys
- Network failures
- API rate limits

### Logging
All operations are logged with timestamps:
- `[INFO]` - General information
- `[WARN]` - Non-critical warnings
- `[ERROR]` - Error conditions
- `[DEBUG]` - Debug information

## Troubleshooting

### Common Issues

**"Unauthorized (401)" Error**
- Check your `GUD_API_KEY` is correct
- Ensure the API key has proper permissions
- Verify the key format (no quotes needed)

**"Relayer wallet not configured" Error**
- Set `RELAYER_PRIVATE_KEY` in `.env`
- Ensure the private key is valid (0x + 64 hex chars)
- Check RPC URL connectivity

**"Unsupported chain" Error**
- Verify the chain ID is in the supported list
- Check chain configuration in `config.js`

## Dependencies

- **telegraf**: Telegram Bot Framework
- **ethers**: Ethereum library for EVM interactions
- **axios**: HTTP client for API requests
- **dotenv**: Environment variable management

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the GUD Trading Engine API documentation
3. Open an issue on GitHub

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request 