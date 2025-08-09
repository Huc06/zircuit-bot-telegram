# Zircuit Telegraf Bot

Telegram bot using Telegraf + Ethers with GUD Trading Engine integration for multi-chain swaps on both Mainnet and Testnet.

## Features

- **Multi-chain Support**: Ethereum, Base, Optimism, Arbitrum, Zircuit, and testnets
- **Dual Network Support**: Both Mainnet and Testnet networks
- **GUD Trading Engine Integration**: Get swap estimates across different chains
- **Interactive Swap Interface**: Hierarchical inline keyboard for network and pair selection
- **EVM Integration**: Support for multiple chains with ethers.js
- **Optional Transaction Execution**: Send transactions if `RELAYER_PRIVATE_KEY` is configured
- **Testnet Testing**: Safe environment for testing swap functionality

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
The bot now provides a hierarchical interface:

1. **Network Selection**: Choose between Mainnet or Testnet
2. **Pair Selection**: Select specific swap pairs for the chosen network

#### Mainnet Options
- **ETH → USDC (Ethereum)**: Native ETH to USDC on Ethereum mainnet
- **USDC → ETH (Ethereum)**: USDC to native ETH on Ethereum mainnet  
- **USDC → USDT (Ethereum)**: USDC to USDT on Ethereum mainnet
- **USDC → ETH (Base)**: USDC to native ETH on Base mainnet

#### Testnet Options
- **ETH → USDC (Sepolia)**: Native ETH to USDC on Ethereum Sepolia testnet
- **USDC → ETH (Sepolia)**: USDC to native ETH on Ethereum Sepolia testnet
- **ETH → USDC (Base Sepolia)**: Native ETH to USDC on Base Sepolia testnet
- **USDC → ETH (Base Sepolia)**: USDC to native ETH on Base Sepolia testnet
- **ETH → USDC (Optimism Sepolia)**: Native ETH to USDC on Optimism Sepolia testnet
- **ETH → USDC (Arbitrum Sepolia)**: Native ETH to USDC on Arbitrum Sepolia testnet

When you select a pair:
1. Bot calls GUD Trading Engine `/order/estimate` API
2. Returns estimated destination amount, minimum amount, fees, and trade ID
3. Shows chain information, network type, and slippage settings
4. Provides navigation back to network selection

## Supported Chains

### Mainnet Networks
| Chain | ID | Status |
|-------|----|---------|
| Ethereum Mainnet | 1 | ✅ |
| Base | 8453 | ✅ |
| Optimism | 10 | ✅ |
| Arbitrum | 42161 | ✅ |
| Zircuit | 48900 | ✅ |

### Testnet Networks
| Chain | ID | Status |
|-------|----|---------|
| Sepolia | 11155111 | ✅ |
| Base Sepolia | 84532 | ✅ |
| Optimism Sepolia | 11155420 | ✅ |
| Arbitrum Sepolia | 421614 | ✅ |

## Testnet Benefits

- **Safe Testing**: Test swap functionality without real funds
- **Development**: Perfect for developers testing integrations
- **User Experience**: Users can learn the bot interface safely
- **Cost Effective**: No gas fees on testnet transactions
- **Multiple Networks**: Test across different L2 solutions

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
    network: 'mainnet' // or 'testnet'
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
- **UI flow**: Update keyboard builders and callback handlers

## Project Structure

```
src/
├── bot.js              # Main bot entry point with callback routing
├── config.js           # Configuration and environment variables
├── logger.js           # Console logging utility
├── commands/
│   └── swap.js        # Swap command handlers with network selection
└── services/
    ├── gudEngine.js    # GUD Trading Engine API client
    └── zircuit.js      # EVM provider and wallet management
```

## Development

### Adding New Features
1. Create new command files in `src/commands/`
2. Add new services in `src/services/`
3. Update `src/bot.js` to register new commands and callbacks
4. Test with different chain and network configurations

### UI Flow
The bot now uses a hierarchical callback system:
- `network:mainnet` → Shows mainnet pairs
- `network:testnet` → Shows testnet pairs  
- `pair:TOKEN1-TOKEN2-CHAIN` → Executes swap estimate
- `network:back` → Returns to network selection

### Error Handling
The bot includes comprehensive error handling for:
- HTTP errors (400, 401, 404, 429, 500)
- Invalid private keys
- Network failures
- API rate limits
- Callback routing errors

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

**Callback not working**
- Ensure the bot is handling the correct callback types
- Check callback data format in the swap command
- Verify the bot has proper permissions

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
3. Test on testnet networks first
4. Open an issue on GitHub

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both mainnet and testnet
5. Add tests if applicable
6. Submit a pull request 