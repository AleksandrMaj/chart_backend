const fs = require('fs');

function SaveCurrentCryptoValues()
{
    let data = JSON.stringify(supportedCryptos, null, 2);
    fs.writeFile('current-crypto-values-cache.json', data, (err) =>
    {
        if (err) throw err;
        console.log('Current crypto value cache was updated!')
    })
}

function LoadCurrentCryptoValues() {
    console.log('Load crypto values from' + '\n');
    let rawData = fs.readFileSync('current-crypto-values-cache.json');
    global.supportedCryptos = JSON.parse(rawData);
}

module.exports = {SaveCurrentCryptoValues,LoadCurrentCryptoValues};