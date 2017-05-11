# FarmGram
A Node.js interface between FarmBot.io and Telegram.

## Setup

1. Talk to @BotFather on Telegram and create a new Telegram Bot.
1. On Node.js, `npm install farmgram`
1. In the package directory, copy `example.config.json` to `config.json`.
1. Change FarmBot `email` and `password` in `config.json`.
1. Replace `REPLACE_WITH_BOTFATHER_TOKEN` with the token @BotFather gave your for your Telegram Bot.
1. Change `chatId` with your chat ID in `config.json`. **This can also be a group chat ID!**
1. `import FarmGram from 'farmgram';`
1. `let fg = new FarmGram;`

## Usage

1. Open a chat with your Telegram Bot, say `/start`.
1. Test response by saying `/ping`.
1. Test FarmBot connection by saying `/test`.
