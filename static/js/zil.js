var cryptoContainer = document.getElementById("zilliqa");

let zil_latest;
fetch('/latest_prices')
  .then(response => response.json())
  .then(data => {
    zil_latest = data['ZIL-USD'];
    loadZilliqaPrediction();
    // Use the variables as needed
    console.log('ZIL latest price:', zil_latest);
  })
  .catch(error => {
    console.error('Error:', error);
  });

function loadZilliqaPrediction() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'data/zil_forecast');
  xhr.onload = function() {
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      renderHTML(data);
      createChart(data);
    } else {
      console.log('Request failed. Returned status of ' + xhr.status);
    }
  };
  xhr.send();
}


function renderHTML(data) {
    var htmlString = "";
    htmlString += "<thead><tr><th>Coin</th><th>Current</th><th>1 day</th><th>3 days</th><th>7 days</th><th>30 days</th><th>50 days</th></tr></thead><tbody><tr>";

    var day1 = data[0]
    var day3 = data[2]
    var day7 = data[6]
    var day30 = data[29]
    var day50 = data[49]
    price = [zil_latest, day1, day3, day7, day30, day50]

    htmlString += '<td><img src="../static/images/zil-logo.png" alt="ZIL Logo" height="20px" width="20px">&nbsp;<a href="zilliqa.html">ZIL (Zilliqa)</a></td>';

    for (i = 0; i < price.length; i++) {
      var color;
      if (price[i] >= price[0]) {
          color = 'green';
      }
      else {
          color = 'red';
      }
      htmlString += '<td class=' + color + '>' + price[i].toFixed(5) + '</td>';
      console.log(i + ": " + price[i])
  }
  htmlString += "</tr></tbody>";
  
  cryptoContainer.innerHTML = htmlString;
}

//loadEthereumPrediction();

//window.onload = loadEthereumPrediction;
// Get the canvas element
const canvas = document.getElementById('lineGraph');
// Get the 2D context of the canvas
const ctx = canvas.getContext('2d');

// Generate 50 labels for the x-axis
const labels = Array.from({ length: 50 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() + index + 1);
  return date.toISOString().slice(0, 10);
});

// Create the chart
function createChart(predictedPrices) {
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Predicted Price',
          data: predictedPrices,
          borderColor: 'blue',
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Date',
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Predicted Price (USD)',
          },
        },
      },
    },
  })
}

