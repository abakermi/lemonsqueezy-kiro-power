# Lemon Squeezy Power 🍋

A [Kiro](https://kiro.dev) Power for managing Lemon Squeezy stores via MCP.

## Features
- **List Stores**: View all your stores.
- **List Products**: Fetch product catalog.
- **Get Product**: View details.

## Setup

### Environment Variables
This power requires your Lemon Squeezy API Key.

```bash
export LEMONSQUEEZY_API_KEY="your_api_key"
```

### Installation (MCP)

Add this to your `kiro_config.json` (or MCP client config):

```json
{
  "mcpServers": {
    "lemonsqueezy": {
      "command": "node",
      "args": ["/path/to/lemonsqueezy-kiro-power/dist/index.js"],
      "env": {
        "LEMONSQUEEZY_API_KEY": "your_key"
      }
    }
  }
}
```

## Development

```bash
npm install
npm run build
npm start
```
