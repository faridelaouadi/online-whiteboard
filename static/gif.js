var typingTimer; //timer identifier
var doneTypingInterval = 500;  //time in ms, 0.5 second for example
var $input = $('#text'); //get the text from the modal
var image_counter = 0;  // we will use this to know which image is currently clicked
var image_clicked;

//on keyup, start the countdown
$input.on('keyup', function () {
  clearTimeout(typingTimer);
  if($(this).val()!=""){
    typingTimer = setTimeout(searchGifs, doneTypingInterval);
  }else{
    //The user cleared the input field and wants to search for something else
    image_counter = 0;
    document.getElementById("gifModalBody").innerHTML = "";
  }
});

//on keydown, clear the countdown
$input.on('keydown', function () {
  const key = event.key;
    if (key === "Backspace" || key === "Delete") {
        document.getElementById("gifModalBody").innerHTML = "";
    }
    //if they erase something, we clear the current gifs
  clearTimeout(typingTimer);
});

function searchGifs(){
  // Create a request variable and assign a new XMLHttpRequest object to it.
  var request = new XMLHttpRequest()

  // Open a new connection, using the GET request on the URL endpoint
  var query = document.getElementById("text").value //the user wants gifs for ...
  console.log("we are going to make a request for :: "+query);
  request.open('GET', 'https://api.giphy.com/v1/gifs/search?api_key=ZsDhKYMNVtzRxcbGwrOBKhNElDE4ZRDv&q='+query+'&limit=25&offset='+image_counter+'&rating=G&lang=en', true)

  request.onload = function() {
    // Begin accessing JSON data here
    var data = JSON.parse(this.response);
    if (request.status >= 200 && request.status < 400) {
      loadImages(data); //load the images into the modal body
      $("#gifModal").modal(); //show the modal
  }
};

// Send request
request.send()
};

function scrolling(){
  var bod = document.getElementById("gifModalBody")
  var scrollY = bod.scrollHeight - bod.scrollTop;
  var height = bod.offsetHeight;
  var offset = height - scrollY;
  if (offset == 0 || offset == 1) {
      searchGifs();
  };
}


function loadImages(data){


  data["data"].forEach(value => {
    //loop through all the GIF datasets
    var img = document.createElement('img'); //make the image element
    img.setAttribute('data-image_number', image_counter) //add a data attribute to it
    img.src =  value["images"]["fixed_height_downsampled"]["url"]; //get the image source from API response
    img.style.margin = "5px"; // styling
    img.addEventListener("click", () => {
      if (image_clicked){
        document.querySelector("img[data-image_number="+CSS.escape(image_clicked)+"]").style.border = 0;}
        //remove the border from the previously clicked image.
      image_clicked = img.getAttribute('data-image_number') //we need to know which image is clicked
      img.style.border = "4px solid #0000ff"; //create border around the image that was clicked
    });
    document.getElementById("gifModalBody").appendChild(img); //add gif to the modal
    image_counter += 1;
  })


}

function closeGifModal(){
  document.getElementById("gifModalBody").innerHTML = ""; //remove all the gifs from modal
  document.getElementById("text").value = ""; // remove the user input from modal input field
  image_counter = 0;
  $('#gifModal').modal('toggle'); //close the modal
}

function sendGIF(){
  const image_to_send = document.querySelector("img[data-image_number="+CSS.escape(image_clicked)+"]");
  console.log("We are sending the GIF with reference " + image_to_send.src);
  socket.emit("new msg", {
    msg: image_to_send.src,
    channel:localStorage.getItem("channel"),
    type_of_message: "gif",
    username: localStorage.getItem("username")
  });//send the message data to the socket
  closeGifModal();
}
