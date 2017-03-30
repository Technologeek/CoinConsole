let information = document.getElementById('information'),
    filterbar = document.getElementById('filterbar');
    filter = document.getElementById('filter');

//connect to the websocket server on page load
var socket = io.connect('http://localhost:3004');

//get coin list on page load
window.onload = socket.emit('refresh');

//refresh data every 5 seconds
setInterval(function(){
  socket.emit('refresh');
} , 5 * 1000);

//listen for refreshed data
var init = false;

socket.on('refresh', function(data){
  var json = JSON.parse(data);

  //set up the filter on the initial page load
  if (init == false) {
    init = true; //don't run the initialization again!
    filter.innerHTML = ''; //clear any HTML in the filter div
    createFilterList(json); //create the new list of coins for the filter
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

  result.then(function(informationList){
    information.innerHTML = informationList;
  });
}

function createInformation(s){
  var titleHTML = "<h3>" + s + "</h3>",
      result = titleHTML;

  return result;
}

//make a filter checkbox
function createCheckbox(s){
  var labelHTML = "<label for=" + s + ">" + s + "</label>",
      checkboxHTML = '<input type="checkbox" onClick="toggleCoin(this)" name="' + s + '">',
      result = '<div>' + checkboxHTML + labelHTML + '</div>';

  return result;
}

//load all charts with the ticker information

//on filter toggle, update which charts are shown
  //fade out the untoggled charts (css transition)
