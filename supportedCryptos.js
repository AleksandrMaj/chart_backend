const request = require("request");
const {apiKeyAlphaVantage} = require("./config.js");
const {response} = require("express");
const fetch = require('node-fetch')
const {SaveCurrentCryptoValues} = require("./fileLogger");

//Template
global.supportedCryptos = {
    BTC: {
        name: "Bitcoin",
        currentValue: -1,
        rate: 0
    },
    ETH: {
        name: "Ethereum",
        currentValue: -1,
        rate: 0
    },
    QTUM: {
        name: "Qtum",
        currentValue: -1,
        rate: 0
    },
    SOL: {
        name: "Solana",
        currentValue: -1,
        rate: 0
    },
    MATIC: {
        name: "Polygon",
        currentValue: -1,
        rate: 0
    },
    DOGE: {
        name: "DogeCoin",
        currentValue: -1,
        rate: 0
    },
    USDT: {
        name: "Tether",
        currentValue: -1,
        rate: 0
    },
    XRP: {
        name: "Ripple",
        currentValue: -1,
        rate: 0
    },
    ADA: {
        name: "Cardano",
        currentValue: -1,
        rate: 0
    },
    SHIB: {
        name: "SHIBA-INU",
        currentValue: -1,
        rate: 0
    }
};

async function getCurrentCryptoValues()
{
    for (const [key, _] of Object.entries(supportedCryptos))
    {
        const value = await getCurrentCrytoValue(key).then(data => Number(data['Realtime Currency Exchange Rate']['8. Bid Price']));
        console.log("--- " + key + " ---")
        console.log("Wert: " + value + "$");
        console.log("-------------")
        console.log()

        supportedCryptos[key]['rate'] = (value / supportedCryptos[key]['currentValue'] - 1) * 100;
        supportedCryptos[key]['rate'] = Number(supportedCryptos[key]['rate'].toFixed(2));

        supportedCryptos[key]['currentValue'] = value;
        SaveCurrentCryptoValues();
        await sleep(15000);
    }
}

function sleep(ms)
{
    return new Promise((resolve) =>
    {
        setTimeout(resolve, ms);
    });
}

async function getCurrentCrytoValue(cryptoCode)
{
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${cryptoCode}&to_currency=USD&apikey=${apiKeyAlphaVantage}`;

    let response = await fetch(url);
    return await response.json();
}

module.exports = {getCurrentCryptoValues};