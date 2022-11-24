const express = require('express');
const app = express(), bodyParser = require("body-parser");
const {getCurrentCryptoValues, CollectLongTermCryptoData} = require("./supportedCryptos.js");
const {accessAddress} = require("./config.js");
const {LoadCurrentCryptoValues} = require('./cryptoLogger.js');
const {GetLongTermCryptoData} = require("./cryptoLogger");
const port = 3080;

app.use('/resources', express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/supportedcryptos', (req, res) =>
{
    res.set('Access-Control-Allow-Origin', accessAddress)
    res.json(supportedCryptos);
});

app.get('/USD/:cryptoType/:time', (req, res) =>
{
    let params = req.params;
    console.log(params['cryptoType'], params['time']);
    let cryptoData = GetLongTermCryptoData(params['cryptoType'], params['time']);

    res.send(cryptoData)
});

app.listen(port, () =>
{
    console.log(`Server listening on the port::${port}`)

    LoadCurrentCryptoValues();

    setCurrentCryptoValues();
    setInterval(StartCollectionLongTermData, 65000)

    setInterval(setCurrentCryptoValues, 240000);
})

async function StartCollectionLongTermData()
{
    console.log('Start collection long term data')
    for (const [cryptoType, value] of Object.entries(supportedCryptos))
    {
        for (const time of timeIntervals)
        {
            console.log('[DEBUG] Getting ' + cryptoType)
            await CollectLongTermCryptoData(cryptoType, time);
        }
    }
}

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
