document.addEventListener("DOMContentLoaded", () => {
  get_username(); //when the user first logs in, they are prompted to enter their username
});

let bootstrap_colours = ["primary","secondary", "success", "danger", "warning", "info"];

const init = username => {

  //after the username is entered, lets start the socket
  socket = io.connect(
    location.protocol + "//" + document.domain + ":" + location.port
  );


  socket.on("connect", () => {

    socket.emit("userdata", { username }); // let the server know what the user's name is

    socket.on("new user", data => {
        var colour = bootstrap_colours[Math.floor(Math.random()*bootstrap_colours.length)];
        $("#active_users_list").append( `<span class=\"badge badge-pill badge-${colour}\">${data.username}</span>`); //this line isnt working
        console.log("new user called " + data.username + " has just joined the server");

    });
  });
};








//function to get the username from the user through using a modal
const get_username = () => {

  let username = localStorage.getItem("username");

  if (!username) {
    //if the user has no username in local storage, then lets get it.
    $("#usernameModal").modal({ show: true, backdrop: "static" });

    document.querySelector("#username-form").addEventListener("submit", e => {
      e.preventDefault(); //prevents the default action from happening

      username = document.querySelector("#username-text").value; //get the username from the modal

      console.log(username);

      if (typeof username == "string") {
        username = username.trim(); //removes whitespace from the string
        if (username == "") {
          username = null;
          $('#usernameModal-title-1').text("Please enter your username below");
          //add text on the modal to let the user know they need to enter someting in the modal
        } else {
          localStorage.setItem("username", username);

          $("#usernameModal").modal("hide");
          //set the username in local storage to make it like sessions


          init(username);
          //call the init function to start the app
        }
      }
    });
  } else {
    init(username);
  };
};

function openChat() {
  document.getElementById("chatRoom").style.width = "50%";
}

function closeChat() {
  document.getElementById("chatRoom").style.width = "0";
}
