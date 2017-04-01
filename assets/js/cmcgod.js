let information = document.getElementById('information'),
    filterbar = document.getElementById('filterbar');
    filter = document.getElementById('filter');

//connect to the websocket server on page load
var socket = io.connect('http://localhost:3004'),
    globalData;

//listen for refreshed data
var init = false;

socket.on('refresh', function(data){
  globalData = JSON.parse(data);

  //set up the filter on the initial page load
  if (init != true) {
    init = true; //don't run the filter initialization again!
    filter.innerHTML = ''; //clear any HTML in the filter div
    createFilterList(globalData); //create the new list of coins for the filter
    return;
  }
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
    console.log("Displaying information for %s...", name);
    displayList.push(name);
    updateInformation(displayList);
  } else {
    //update the array and rerender
    console.log("Removing information for %s...", name);
    var index = displayList.indexOf(name);
    displayList.splice(index, 1);
    updateInformation(displayList);
  }
}

function updateInformation(a){
  let result = new Promise(function(resolve, reject){
    var html = '';
    for (coin in a) {
      html = html + createInformation(a[coin]);
    }
    resolve(html);
  });

  //Put the results on the page
  result.then(function(informationList){
    information.innerHTML = informationList;
  });
}

function createInformation(s){
  var info = new Promise(function(resolve, reject){
    var coinInfo = findCoinInfo(s);
    resolve(coinInfo);
  });

  info.then(function(coinInfo){
    price = coinInfo.price,
    titleHTML = "<h3>" + s + "</h3>",
    priceHTML = "<p>Price: " + price + "</p>";
    result = '<div class="' + s + '">' + titleHTML + priceHTML + "</div>";

    return result;
  });
}

function findCoinInfo(coin) {
  for (obj in globalData) {
    if (globalData[obj].name == coin){
      var coinInfo = globalData[obj];
      return coinInfo;
    } else {
      console.log('Coin not found!');
    }
  }
}

//load all charts with the ticker information

//on filter toggle, update which charts are shown
  //fade out the untoggled charts (css transition)
