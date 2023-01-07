const fs = require('fs');

function SaveCurrentCryptoValues()
{
    let data = JSON.stringify(supportedCryptos, null, 2);
    fs.writeFile('current-crypto-values-cache.json', data, (err) =>
    {
        if (err) throw err;
        console.log('Current crypto value cache was updated!')
        console.log()
    })
}

function LoadCurrentCryptoValues()
{
    console.log('Load crypto values!');
    let rawData = fs.readFileSync('current-crypto-values-cache.json');
    global.supportedCryptos = JSON.parse(rawData);
}

function SaveLongTermCryptoData(data, cryptoType, time)
{
    data = JSON.stringify(data, null, 2);
    fs.writeFileSync(`crypto-cache/long-term-data/${cryptoType}-${time}.json`, data);
    console.log('[' + cryptoType + ' ' + time +  '] ' + 'Long-term data was saved!')
}

function GetLongTermCryptoData(cryptoType, time)
{
    const fileName = `crypto-cache/long-term-data/${cryptoType}-${time}.json`;
    if (!fs.existsSync(fileName)) return '[' + cryptoType + '] ' + 'No long term data available! Check crypto shortcut and time!';
    let rawData = fs.readFileSync(fileName)
    return JSON.parse(rawData);
}

module.exports = {SaveCurrentCryptoValues, LoadCurrentCryptoValues, SaveLongTermCryptoData,GetLongTermCryptoData};