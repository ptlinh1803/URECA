const cryptoContainer = document.getElementById("table_coin");
console.log(cryptoContainer);

let btc_latest, eth_latest, ada_latest, sol_latest, zil_latest, dot_latest;

fetch('/latest_prices')
  .then(response => response.json())
  .then(data => {
    btc_latest = data['BTC-USD'];
    eth_latest = data['ETH-USD'];
    ada_latest = data['ADA-USD'];
    sol_latest = data['SOL-USD'];
    zil_latest = data['ZIL-USD'];
    dot_latest = data['DOT-USD'];
    //loadAllCoinsPrediction();


    // Use the variables as needed
    console.log('BTC latest price:', btc_latest);
    console.log('ETH latest price:', eth_latest);
    console.log('ADA latest price:', ada_latest);
    console.log('SOL latest price:', sol_latest);
    console.log('ZIL latest price:', zil_latest);
    console.log('DOT latest price:', dot_latest);
  })
  .catch(error => {
    console.error('Error:', error);
  });


function loadAllCoinsPrediction() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'data/all');
  xhr.onload = function() {
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      renderHTML(data);
    } else {
      console.log('Request failed. Returned status of ' + xhr.status);
    }
  };
  xhr.send();
}

function renderHTML(data) {
    var htmlString = "";
    htmlString += "<thead><tr><th>Coin</th><th>Current</th><th>1 day</th><th>3 days</th><th>7 days</th><th>30 days</th><th>50 days</th></tr></thead><tbody>";

    let list_of_coin, list_of_latest, list_of_name, list_of_full_name;
    list_of_coin = ["BTC-USD","ADA-USD","ETH-USD","DOT-USD","SOL-USD","ZIL-USD"]
    list_of_latest = [btc_latest, ada_latest, eth_latest, dot_latest, sol_latest, zil_latest]
    list_of_name = ["BTC","ADA","ETH","DOT","SOL","ZIL"]
    list_of_full_name = ["Bitcoin", "Cardano", "Ethereum", "Polkadot", "Solana", "Zilliqa"]

    for (i = 0; i < list_of_coin.length; i++) {
      var ticker = list_of_coin[i];
      var name = list_of_name[i];
      var full_name = list_of_full_name[i];
      var latest_price = list_of_latest[i];

      let coin, coin_price;
      coin = data[i][ticker];
      var day1 = coin[0];
      var day3 = coin[2];
      var day7 = coin[6];
      var day30 = coin[29];
      var day50 = coin[49];
      coin_price = [latest_price, day1, day3, day7, day30, day50]

      htmlString += '<td><img src="../static/images/'+ name.toLowerCase() + '-logo.png" alt="'+ name + ' Logo" height="20px" width="20px">&nbsp;<a href="'+ full_name.toLowerCase() + '.html">'+ name + ' ' + full_name + '</a></td>';
      for (j = 0; j < coin_price.length; j++) {
        var color;
        if (coin_price[j] >= coin_price[0]) {
            color = 'green';
        }
        else {
            color = 'red';
        }
        htmlString += '<td class=' + color + '>' + coin_price[j].toFixed(5) + '</td>';
      }
      htmlString += "</tr>";
    }
    htmlString += "</tbody>";


    cryptoContainer.innerHTML = htmlString;
}

loadAllCoinsPrediction();

//window.onload = loadAllCoinsPrediction;