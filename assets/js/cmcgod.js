let charts = document.getElementById('charts'),
    filter = document.getElementById('filter');

var toggled = false;

//connect to the websocket server on page load
var socket = io.connect('http://localhost:3004');

//get coin list on page load
window.onload = socket.emit('refresh');

//refresh data every 5 seconds
setInterval(function(){
  socket.emit('refresh');
} , 1 * 1000);

//listen for refreshed data
socket.on('refresh', function(data){
  filter.innerHTML = data;
});

//toggle the filter list
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

//make a filter checkbox
function createCheckbox(s){
  var labelHTML = "<label for=" + s + ">" + s + "</label>",
      checkboxHTML = '<input type="checkbox" name="' + s + '">',
      result = labelHTML + checkboxHTML;

  return result;
}

//display each of these on the filter

//load all charts with the ticker information

//on filter toggle, update which charts are shown
  //fade out the untoggled charts (css transition)
