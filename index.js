'use strict'; // for debugging in Meteor because it uses Node 4.x

let axios = require("axios").default;
let FarmBot = require( 'farmbot' ).Farmbot;
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
		this._telegram.onText( /\/start[\s]?(.*)/i, ( message, matches ) => this.start( message ) );
		this._telegram.onText( /\/ping/i, () => this.ping() );
		this._telegram.onText( /\/test/i, message => this.test( message.chat.id ) );
	}
	
	/**
	 * Sends a message to chat channel.
	 * @param {string} message Message to send to chat channel.
	 */
	say( message ) {
		this._telegram.sendMessage( this.config.telegram.chatId, message, { parse_mode : 'Markdown' } );
	}
	
	/**
	 * Responds to "Ping" with "Pong".
	 */
	ping() {
		this.say( "Pong" );
	}
	
	/**
	 * Runs a test command through the prime chain.
	 * @param {Number} chatId The chat ID of the channel used to send the command.
	 */
	test( chatId ) {
		this._prime( chatId )
			.then( () => this.say( "Yay!" ) )
			.catch( error => this.say( error.message ) )
		;
	}
	
	/**
	 * Greets the user with welcome message.
	 */
	start( message ) {
		if( this.config.telegram.chatId === 0 ) {
			this._telegram.sendMessage( message.chat.id, "Hi there! \u{1f600} Your chat ID is:\n" + message.chat.id + "\n\nUse this ID in your `config.json` file.", { parse_mode : 'Markdown' } );
		} else {
			if( this.config.telegram.chatId === message.chat.id ) {
				this.say( "Okay. We're all set up! \u{1f44d}\n\nUse /help for some commands." );
			} else {
				this._telegram.sendMessage( message.chat.id, "Hello stranger. My owner has already set me up for their FarmBot. I'm not accepting instructions from anyone else.\n\nDid you know I can listen in group chats too? Change the `chatId` in my `config.json` file to your group's ID and I'll accept commands from anyone in that group.", { parse_mode : 'Markdown' } );
			}
		}
	}
	
	/**
	 * Primes the FarmBot instance for a pending action.
	 * @param {Number} chatId The chat ID of the channel used to send the command.
	 * @return {Promise} _prime
	 */
	_prime( chatId ) {
		return new Promise( ( resolve, reject ) => {
			this._auth( chatId )
				.then( () => this._ensureToken() )
				.then( () => this._ensureConnection() )
				.then( () => resolve() )
				.catch( error => reject( error ) )
			;
		});
	}
	
	/**
	 * Makes sure FarmGram is listening to an authorized chat ID.
	 * @return {Promise} _auth
	 */
	_auth( chatId ) {
		return new Promise( ( resolve, reject ) => {
			if( this.config.telegram.chatId === chatId ) {
				resolve( chatId );
			} else {
				reject( new Error( "You're not authorized to send me instructions on this channel! \u{1f644}" ) )
			}
		});
	}
	
	/**
	 * Requests a new FarmBot token.
	 * @return {Promise} _requestToken
	 */
	_requestToken() {
		return axios.post( this.config.farmbot.url, this.config.farmbot.secret );
	}
	
	/**
	 * Makes sure FarmGram has a valid FarmBot token.
	 * @return {Promise} _ensureToken
	 */
	_ensureToken() {
		return new Promise( ( resolve, reject ) => {
			if( !this.config.farmbot.token ) {
				// No existing token found
				this._requestToken().then( response => {
					this.config.farmbot.token = response.data.token;
					resolve( response.data.token );
				}).catch( response => reject( new Error( request.statusText ) ) );
			} else {
				// Verify existing token
				if( this.config.farmbot.token.unencoded.exp <= Math.floor( Date.now() / 1000 ) ) {
					// Expired
					this._requestToken().then( response => resolve( response.data.token ) ).catch( response => reject( new Error( request.statusText ) ) );
				} else {
					resolve( this.config.farmbot.token );
				}
			}
		});
	}
	
	/**
	 * Makes sure FarmGram is connected to a FarmBot instance.
	 * @return {Promise} _ensureConnection
	 */
	_ensureConnection() {
		return new Promise( ( resolve, reject ) => {
			if( !this._farmbot ) {
				// No FarmBot instance found in FarmGram
				this._farmbot = new FarmBot({ token: this.config.farmbot.token.encoded, secure: true });
			}
			if( this._farmbot.client && this._farmbot.client.connected ) {
				// Connected to the FarmBot instance
				resolve();
			} else {
				this._farmbot.connect().then( () => resolve(), () => reject( new Error( "I can't feel my arms \u{1F62D}" ) ) );
			}
		});
	}
}
