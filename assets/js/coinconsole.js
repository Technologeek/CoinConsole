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
      result = '<div>' + checkboxHTML + labelHTML + '</div>';

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
    console.log("Adding information for %s to the dashboard...", name);
    displayList.push(name);
    updateInformation(displayList);
  } else {
    //update the array and rerender
    console.log("Removing information for %s from the dashboard...", name);
    var index = displayList.indexOf(name);
    displayList.splice(index, 1);
    updateInformation(displayList);
  }
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
        priceUsd = a.price_usd,
        priceBtc = a.price_usd,

        titleHTML = "<h3>" + title + "</h3>",
        priceUsdHTML = "<h4>USD => " + priceUsd + "</h4>",
        priceBtcHTML = "<h4>BTC => " + priceBtc + "</h4>",
        result = '<div class="' + title + '">' + titleHTML + priceUsdHTML + priceBtcHTML + "</div>";

    resolve(result);
  });
}

//load all charts with the ticker information

//on filter toggle, update which charts are shown
  //fade out the untoggled charts (css transition)
