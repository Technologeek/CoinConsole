"use strict";

var QueryString = function() {
 // This function is anonymous, is executed immediately and
 // the return value is assigned to QueryString!
 var query_string = {};
 //window.location.search for "?x=y" url params -- this requires us to refresh the page when changed, though
 var query = window.location.hash.substring(1);
 var vars = query.split("&");
 for (var i=0;i<vars.length;i++) {
   var pair = vars[i].split("=");
       // If first entry with this name
   if (typeof query_string[pair[0]] === "undefined") {
     query_string[pair[0]] = decodeURIComponent(pair[1]);
       // If second entry with this name
   } else if (typeof query_string[pair[0]] === "string") {
     var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
     query_string[pair[0]] = arr;
       // If third or later entry with this name
   } else {
     query_string[pair[0]].push(decodeURIComponent(pair[1]));
   }
 }
 return query_string;
}();

var information = document.getElementById('information'),
    filterbar = document.getElementById('filterbar'),
    filter = document.getElementById('filter'),

    welcomeMessage = '<div class="get-started"><h2 class="hidden-mobile no-margin">Click on the filter icon to get started!</h2><h3>Select which coins you want to display on your dashboard.</h3></div>';

//connect to the websocket server on page load
var socket = io.connect('http://localhost:3004'),
    globalData;

//initiate the page
socket.on('init', function(){
  createFilterList(globalData); //create the new list of coins for the filter
});

//listen for refreshed data
socket.on('refresh', function(data){
  globalData = JSON.parse(data);

  updateInformation(displayList);
});

//set up a function to create the filter list
function createFilterList(a){
  filter.innerHTML = '';

  var result = new Promise(function(resolve, reject){
    var html = '';
    for (var coin in a) {
      var coinName = a[coin].name;
      html = html + createFilterItem(coinName);
    }
    resolve(html);
  });

  result.then(function(filterList){
    filter.innerHTML = filterList;

    //check for active coins and style them
  });
}

function activeCheck(s){
  searchArray(displayList, s).then(function(result){
    for (coin in globalData){

    }
  });
}

function filterSearch(term){
  if (term == ''){
    //reset the filter if the search term is empty
    createFilterList(globalData);
  } else {
    //search the available coins for the term and rerender the filter
    searchArray(globalData, term, "name").then(function(result){
      createFilterList(result);
    });
  }
}

function searchArray(a, s, k){
  return new Promise(function(resolve, reject){
    if (k) {
      //if an object key value is passed in
      resolve(a.filter(function(element) {
        return element[k].toString().toLowerCase().indexOf(s.toLowerCase()) > -1;
      }));
    } else {
      //if we're searching through a simple array
      resolve(a.filter(function(element) {
        return element.toString().toLowerCase().indexOf(s.toLowerCase()) > -1;
      }));
    }
  });
}

//make a filter checkbox
function createFilterItem(s){
  var result = '<li class="no-margin no-dot btn btn-blue" onClick="toggleCoin(this.innerHTML.toLowerCase())">' + s + '</li>';

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
if (QueryString.display) {
  var displayList = QueryString.display.split(",");
} else {
  var displayList = [];
}

function toggleCoin(coin){
  //check if the coin is currently on the display
  searchArray(displayList, coin).then(function(result){
    if (result == false) {
      //if it's not, add it and rerender
      displayList.push(coin);
      updateInformation(displayList);
    } else {
      //if it is, remove it and rerender
      var index = displayList.indexOf(coin);
      displayList.splice(index, 1);
      updateInformation(displayList);
    }
  });
}

function toggleAll(){
  var populateList = new Promise(function(resolve, reject){
    displayList = [];
    for (coin in globalData){
      displayList.push(globalData[coin].name);
    }
    resolve();
  });
  populateList.then(function(){
    updateInformation(displayList)
  });
}

function toggleReset(){
  displayList = [];
  updateInformation(displayList);
}

function updateURL(a){
  if (a && a.length && a.length > 0) {
    //create the new string
    var newParams = a.toString();
    //put it up in the URL bar
    window.history.replaceState(newParams, newParams, "/#display=" + newParams);
  } else {
    //if there aren't any coins being displayed, the url should be set to root
    window.history.replaceState("", "initial page", "/");
  }
}

function updateInformation(a){
  updateURL(a);

  if (a.length == 0){
    information.innerHTML = welcomeMessage;
  } else {
    var result = new Promise(function(resolve, reject){
      var html = '',
      asyncLoop = 0;
      for (var coin in a) {
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
}

function selectCoinInfo(coin) {
  return new Promise(function(resolve, reject){
    for (var index in globalData) {
      if (globalData[index].name.toLowerCase() === coin){
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

    var oneHourChangeHTML = ((oneHour < 0) ? '<h4 class="no-margin one-hour negative">1H: ' + oneHour + "%</h4>" : '<h4 class="no-margin one-hour positive">1H: ' + oneHour + '%</h4>');
    var twentyFourHourChangeHTML = ((twentyFourHour < 0) ? '<h4 class="no-margin twenty-four-hour negative" style="padding: 0 7px;">24H: ' + twentyFourHour + '%</h4>' : '<h4 class="no-margin twenty-four-hour positive" style="padding: 0 7px;">24H: ' + twentyFourHour + '%</h4>');
    var sevenDayChangeHTML = ((sevenDay < 0) ? '<h4 class="no-margin seven-day negative">7D: ' + sevenDay + '%</h4></div>' : "<h4 class='no-margin seven-day positive'>7D: " + sevenDay + '%</h4>');

    //var twentyFourHourChangeHTML = "<h4 class='twenty-four-hour' style='padding: 0 7px;'>24H: " + twentyFourHour + "%</h4>";
    //var sevenDayChangeHTML = "<h4 class='seven-day'>7D: " + sevenDay + "%</h4></div>";

    var titleHTML = '<h3 class="no-margin">' + title + '<small class="rank"> #' + rank + '</small>' + '</h3>',
        priceUsdHTML = '<h4 class="no-margin">USD: $' + priceUsd + '</h4>',
        priceBtcHTML = '<h4 class="no-margin">BTC: ' + priceBtc + '</h4>',
        volumeHTML = '<h4 class="no-margin">Volume: $' + volume + '</h4>',
        marketCapHTML = '<h4 class="no-margin">Market Cap: $' + marketCap + '</h4>',
        result = '<li class="inline information-item"><div id=' + title + '">' + titleHTML + priceUsdHTML + priceBtcHTML + volumeHTML + marketCapHTML + '<div class="percent-changes no-padding">' + oneHourChangeHTML + twentyFourHourChangeHTML + sevenDayChangeHTML + '</div>' + '</div></li>';

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
