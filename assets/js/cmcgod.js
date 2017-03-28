let charts = document.getElementById('charts'),
    filter = document.getElementById('filter');

var data;

//on page load, get all of the coin tickers (with ajax)
/*window.onready({
  get('/get');
});*/

//set up a get function
function get(url, callback){
  xhr = new XMLHttpRequest();

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      console.log(this.responseText);
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
