const express = require('express');
const fetch = require('node-fetch')
const app = express(), bodyParser = require("body-parser");
const {getCurrentCryptoValues} = require("./supportedCryptos.js");
const {apiKeyAlphaVantage} = require("./config.js");
const {SaveCurrentCryptoValues, LoadCurrentCryptoValues} = require('./fileLogger.js');
const port = 3080;

app.use('/resources', express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/supportedcryptos', (req, res) =>
{
    res.set('Access-Control-Allow-Origin', 'http://localhost:4200')
    res.json(supportedCryptos);
});

//TODO Later this need to be cached and the values need to be read from a database
app.get('/BTC/DAILY/USD', async (req, res) =>
{

    const url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=BTC&market=USD&apikey=${apiKeyAlphaVantage}`;
    let data = await fetch(url);
    data = await data.json();
    data = transformData(data);

    res.send(data);
});

app.listen(port, () =>
{
    console.log(`Server listening on the port::${port}`)

    LoadCurrentCryptoValues();

    setCurrentCryptoValues();
    setInterval(setCurrentCryptoValues, 240000)
})

function setCurrentCryptoValues()
{
    getCurrentCryptoValues().then(response =>
    {
        console.log("----------- Derzeitige Werte - Start -----------")

        for (const [key, value] of Object.entries(supportedCryptos))
        {
            console.log(key, value)
        }

        console.log("----------- Derzeitige Werte - Ende -----------")
        console.log()
        //SaveCurrentCryptoValues(); //TODO Ist das der richtige Ort zum speichern?
    });
}

function transformData(data)
{
    let newData = {};
    newData["Meta Data"] = transformMetaData(data["Meta Data"])
    newData["Time Data"] = transformTimeData(data["Time Series (Digital Currency Daily)"])

    return newData;
}

function transformMetaData(metaData)
{
    metaData["Currency Code"] = metaData["2. Digital Currency Code"];
    metaData["Currency Name"] = metaData["3. Digital Currency Name"];

    //Remove every key except the two above
    for (const [key, value] of Object.entries(metaData))
    {
        if (key === "Currency Code" || key === "Currency Name") continue;
        delete metaData[key];
    }
    return metaData;
}

function transformTimeData(timeData)
{
    let newData = {};
    for (const [date, dateData] of Object.entries(timeData))
    {
        for (const [informationType, value] of Object.entries(dateData))
        {
            if (informationType !== "4a. close (USD)") continue
            newData[date] = Number(value);
            break;
        }
    }
    return newData;
}

//TODO Later build feature to switch between EUR & USD
