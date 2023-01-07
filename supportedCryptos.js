const {apiKeyAlphaVantage} = require("./config.js");
const fetch = require('node-fetch')
const {SaveCurrentCryptoValues, SaveLongTermCryptoData} = require("./cryptoLogger");

global.timeIntervals = ['Daily', 'Weekly', 'Monthly'];

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
    /*USDT: { //TODO Not working anymore?
        name: "Tether",
        currentValue: -1,
        rate: 0
    },*/
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
        const value = await getCurrentCrytoValue(key).then(data => {
            if(typeof data['Realtime Currency Exchange Rate'] === 'undefined' ||
                typeof data['Realtime Currency Exchange Rate']['8. Bid Price'] === 'undefined' ||
                data['Realtime Currency Exchange Rate']['8. Bid Price'] === '-')
                    return -1;

            console.log("[DEBUG]");
            console.log(data['Realtime Currency Exchange Rate']);
            console.log(data['Realtime Currency Exchange Rate']['8. Bid Price']);

            return Number(data['Realtime Currency Exchange Rate']['8. Bid Price']);
        });

        if(value === -1) {
            console.log(`[FEHLER] Crypto-Wert von ${value} konnte nicht gelesen werden`);
            await sleep(25000);
            continue;
        }

        console.log("--- " + key + " ---")
        console.log("Wert: " + value + "$");
        console.log("-------------")

        supportedCryptos[key]['rate'] = (value / supportedCryptos[key]['currentValue'] - 1) * 100;
        supportedCryptos[key]['rate'] = Number(supportedCryptos[key]['rate'].toFixed(2));

        supportedCryptos[key]['currentValue'] = value;
        SaveCurrentCryptoValues();
        await sleep(25000);
    }
}

async function getCurrentCrytoValue(cryptoCode)
{
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${cryptoCode}&to_currency=USD&apikey=${apiKeyAlphaVantage}`;

    let response = await fetch(url);
    return await response.json();
}

async function CollectLongTermCryptoData(cryptoType, time)
{
    if (!timeIntervals.includes(time))
    {
        console.error('Long term data could not be collected! Wrong time expression!')
        return;
    }

    const url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_${time}&symbol=${cryptoType}&market=USD&apikey=${apiKeyAlphaVantage}`;
    let data = await fetch(url);
    data = await data.json();
    data = TransformLongTermData(data, cryptoType, time)

    if(data === "ERROR") {
        await sleep(65000);
        return;
    }

    await SaveLongTermCryptoData(data, cryptoType, time)
    await sleep(65000);
}

function TransformLongTermData(data, cryptoType, time)
{
    try {
        let newData = {};

        for (const [key, jsonData] of Object.entries(data[`Time Series (Digital Currency ${time})`]))
        {
            newData[key] = Number(jsonData['4a. close (USD)']);
        }
        return newData;
    }
    catch (err) {
        return 'ERROR';
    }
}

function sleep(ms)
{
    return new Promise((resolve) =>
    {
        setTimeout(resolve, ms);
    });
}

module.exports = {getCurrentCryptoValues, CollectLongTermCryptoData};