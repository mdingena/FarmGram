'use strict'; // for debugging in Meteor because it uses Node 4.x

let Telegram = require( 'node-telegram-bot-api' );
let config = require( './config.json' );

// Node JS workaround:
// SEE https://github.com/FarmBot/farmbot-js/issues/33
global.atob = require( 'atob' );

/**
 * Creates a new interface between a FarmBot and Telegram APIs.
 * @class FarmGram
 */
module.exports = class FarmGram {
	constructor() {
		this.config = require( './config.json' );
		if( this.config.telegram.token == 'REPLACE_WITH_BOTFATHER_TOKEN' ) { // 370108440:AAGu_3xmb1aw2W8U_F5McCdJkVbA2As8oWc
			throw "You must set your Telegram bot's token in config.json";
		}
		this._telegram = new Telegram( config.telegram.token, { polling : true } );
		this.say( "FarmGram launched! \u{1F680}" );
	}
	
	/**
	 * Sends a message to chat channel.
	 * @param {string} message Message to send to chat channel.
	 */
	say( message ) {
		this._telegram.sendMessage( this.config.telegram.chatId, message, { parse_mode : 'Markdown' } );
	}
}
