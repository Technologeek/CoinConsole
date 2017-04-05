let information = document.getElementById('information'),
    filterbar = document.getElementById('filterbar');
    filter = document.getElementById('filter');

//connect to the websocket server on page load
var socket = io.connect('http://localhost:3004'),
    globalData;

//initiate the page
socket.on('init', function(){
  filter.innerHTML = ''; //clear any HTML in the filter div
  createFilterList(globalData); //create the new list of coins for the filter
});

//listen for refreshed data
socket.on('refresh', function(data){
  globalData = JSON.parse(data);

  updateInformation(displayList);
});

//set up a function to create the filter list
function createFilterList(a){
  let result = new Promise(function(resolve, reject){
    var html = '';
    for (coin in a) {
      html = html + createCheckbox(a[coin].name);
    }
    resolve(html);
  });

  result.then(function(filterList){
    filter.innerHTML = filterList;
  });
}

//make a filter checkbox
function createCheckbox(s){
  var labelHTML = "<label for=" + s + ">" + s + "</label>",
      checkboxHTML = '<input type="checkbox" onClick="toggleCoin(this)" name="' + s + '">',
      result = '<li class="no-margin no-dot"><div>' + checkboxHTML + labelHTML + '</div></li>';

  return result;
}

//toggle the filter list
var toggled = false; //default is untoggled

function toggleFilter(){
  if (toggled == false) {
    //show the filter
    filterbar.style.display = "flex";
    toggled = true;
  } else if (toggled == true) {
    //hide the filter
    filterbar.style.display = "none";
    toggled = false;
  }
}

//toggle coin data on and off
var displayList = [];

function toggleCoin(coin){
  var checked = coin.checked,
      name = coin.name;

  if (coin.checked == true) {
    //update the array and rerender
    displayList.push(name);
    updateInformation(displayList);
  } else {
    //update the array and rerender
    var index = displayList.indexOf(name);
    displayList.splice(index, 1);
    updateInformation(displayList);
  }
}

function toggleAll(){
  //check all checkboxes and update


  updateInformation(displayList);
}

function toggleReset(){
  //uncheck all checkboxes and update


  updateInformation(displayList);
}

function updateInformation(a){
  let result = new Promise(function(resolve, reject){
    var html = '',
    asyncLoop = 0;
    for (coin in a) {
      selectCoinInfo(a[coin]).then(function(coinInfo){
        createInformationList(coinInfo).then(function(informationList){
          asyncLoop += 1;
          html = html + informationList;
          if (asyncLoop == a.length) resolve(html);
        });
      });
    }
  });

  result.then(function(informationList){
    information.innerHTML = informationList;
  });
}

function selectCoinInfo(coin) {
  return new Promise(function(resolve, reject){
    for (index in globalData) {
      if (globalData[index].name === coin){
        resolve(globalData[index]);
        break;
      }
    }
  });
}

function createInformationList(a){
  return new Promise(function(resolve, reject){
    var title = a.symbol,
        priceUsd = parseFloat(a.price_usd),
        priceUsd = ((priceUsd > 1) ? priceUsd.formatMoney(2, ".", ",") : priceUsd = priceUsd.formatMoney(8, ".", ",")),
        priceBtc = parseFloat(a.price_btc).toFixed(8),
        volume = parseFloat(a["24h_volume_usd"]).formatMoney(0, ".", ","),
        marketCap = parseFloat(a.market_cap_usd).formatMoney(0, ".", ","),
        oneHour = parseInt(a["percent_change_1h"]),
        twentyFourHour = parseInt(a["percent_change_24h"]),
        sevenDay = parseInt(a["percent_change_7d"]),
        rank = parseInt(a.rank);

    var oneHourChangeHTML = ((oneHour < 0) ? "<div class='percent-changes no-padding'><h4 class='one-hour negative'>1H: " + oneHour + "%</h4>" : "<div class='percent-changes no-padding'><h4 class='one-hour positive'>1H: " + oneHour + "%</h4>");
    var twentyFourHourChangeHTML = ((twentyFourHour < 0) ? "<h4 class='twenty-four-hour negative' style='padding: 0 7px;'>24H: " + twentyFourHour + "%</h4>" : "<h4 class='twenty-four-hour positive' style='padding: 0 7px;'>24H: " + twentyFourHour + "%</h4>");
    var sevenDayChangeHTML = ((sevenDay < 0) ? "<h4 class='seven-day negative'>7D: " + sevenDay + "%</h4></div>" : "<h4 class='seven-day positive'>7D: " + sevenDay + "%</h4></div>");

    //var twentyFourHourChangeHTML = "<h4 class='twenty-four-hour' style='padding: 0 7px;'>24H: " + twentyFourHour + "%</h4>";
    //var sevenDayChangeHTML = "<h4 class='seven-day'>7D: " + sevenDay + "%</h4></div>";

    var titleHTML = "<h3>" + title + '<small class="rank"> #' + rank + "</small>" + "</h3>",
        priceUsdHTML = "<h4>USD: $" + priceUsd + "</h4>",
        priceBtcHTML = "<h4>BTC: " + priceBtc + "</h4>",
        volumeHTML = "<h4>Volume: $" + volume + "</h4>",
        marketCapHTML = "<h4>Market Cap: $" + marketCap + "</h4>",
        result = '<li class=inline><div id="' + title + '">' + titleHTML + priceUsdHTML + priceBtcHTML + volumeHTML + oneHourChangeHTML + twentyFourHourChangeHTML + sevenDayChangeHTML + marketCapHTML + "</div></li>";

    resolve(result);
  });
}



Number.prototype.formatMoney = function(c, d, t){
var n = this,
    c = isNaN(c = Math.abs(c)) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };
