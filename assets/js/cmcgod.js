let charts = document.getElementById('charts'),
    filter = document.getElementById('filter');

var data,
    toggled = false;

//on page load, get all of the coin tickers (with ajax)
window.onload = refresh();

function refresh(){
  console.log("refreshing data...");
  get('/get', function(coins){
    filter.innerHTML = null;
    for (coin in coins){
      var name = coins[coin].name;
      //console.log(coins[coin]);
      filter.innerHTML = filter.innerHTML + createCheckbox(name);
    }
  });
}

function toggleFilter(){
  if (toggled == false) {
    //show the filter
    filter.style.display = "block";
    toggled = true;
  } else if (toggled == true) {
    //hide the filter
    filter.style.display = "none";
    toggled = false;
  }
}

//refresh every 10 seconds
//setInterval(refresh(), 10000);

//make those filter boxes
function createCheckbox(s){
  var labelHTML = "<label for=" + s + ">" + s + "</label>",
      checkboxHTML = '<input type="checkbox" name="' + s + '">',
      result = labelHTML + checkboxHTML;

  return result;
}

//set up a GET function
function get(url, callback){
  if (! url) {
    console.log('No url was passed in...');
    return;
  }

  xhr = new XMLHttpRequest();

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      data = JSON.parse(this.responseText);
      console.log('Got the data...');
      //console.log(this.responseText);
      callback(data);
    }
  });

  xhr.open("GET", url);
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.send();
}


//display each of these on the filter

//load all charts with the ticker information

//on filter toggle, update which charts are shown
  //fade out the untoggled charts (css transition)
