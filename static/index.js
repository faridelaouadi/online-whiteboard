document.addEventListener("DOMContentLoaded", () => {
  get_username(); //when the user first logs in, they are prompted to enter their username
});


var socket;

let bootstrap_colours = ["primary","secondary", "success", "danger", "warning", "info"];

const init = (username,room_id) => {

  //after the username is entered, lets start the socket
  socket = io.connect(
    location.protocol + "//" + document.domain + ":" + location.port
  );


  socket.on("connect", () => {

    socket.emit("userdata", { username,room_id }); // let the server know what the user's name is
    socket.emit("get users");

    socket.on("new user", data => {
        show_user_in_list(data.username)
    });

    socket.on("user left", () => {
        socket.emit("get users");
        //if the server tells us someone who left, we want to know who left and therefore update the user list
    });

    socket.on("users", data => {
      clear_users();
      for (let name of data) {
        if (name !== localStorage.getItem("username")){
          show_user_in_list(name);
        }
      }
    });


    socket.on("new paint", data => {
      //see how youre going to do the color and thickeness
      if (data.username !== localStorage.getItem("username")){
        draw_point(data.x,data.y,data.connect, data.color, data.thickness, data.action);
      }
    })

    socket.on("clear canvas", () => {
      clear_canvas();
    })

    socket.on("undo", () => {
      //see how youre going to do the color and thickeness
      undo();
    })




  });

  function show_user_in_list(name){
    var colour = bootstrap_colours[Math.floor(Math.random()*bootstrap_colours.length)];
    $("#active_users_list").append( `<span class=\"badge badge-pill badge-${colour}\">${name}</span>`);
  }

};

function create_room(){
  //  random hex string generator of length 16 chars
  let room_id = randHex(16);
  let username = localStorage.getItem("username");
  localStorage.setItem("room_id", room_id);
  try {
    document.getElementById('navbar_header').innerHTML = "Room "+ room_id;
    socket.emit("userdata", { username,room_id })
  }
  catch(err) {
    document.getElementById('navbar_header').innerHTML = "Room "+ room_id;
    init(username,room_id);
  }
}

//function to get the room_id from the user through using a modal
const get_session_room = () => {
  let room_id = localStorage.getItem("room_id");
  let username = localStorage.getItem("username");

  if (!room_id){
    //open the modal for the user to enter the room id or just to practise solo.
    //if they choose room id, they will go to it
    //if they choose to practise solo, then they will have a canvas to themselves with no other users
    $("#room_id_Modal").modal({ show: true, backdrop: "static" });
    document.querySelector("#room_id-form").addEventListener("submit", e => {
        e.preventDefault(); //prevents the default action from happening which is reloading the page etc
        room_id = document.querySelector("#room_id-text").value;
        if (typeof room_id == "string") {
          room_id = room_id.trim(); //removes whitespace from the string
          if (room_id == "") {
            room_id = null;
            $('#room_id-title-1').text("Please enter a valid Room ID");
            $('#room_id-title-1').css('color','red');
            //add text on the modal to let the user know they need to enter someting in the modal
          } else {
            localStorage.setItem("room_id", room_id);
            $("#room_id_Modal").modal("hide");
            try {
              document.getElementById('navbar_header').innerHTML = "Room "+ room_id;
              socket.emit("userdata", { username,room_id })
            }
            catch(err) {
              document.getElementById('navbar_header').innerHTML = "Room "+ room_id;
              init(username,room_id);
            }
          }
        }
      });
  }else{
    //the user will not reach here if they have left a room.
    document.getElementById('navbar_header').innerHTML = "Room "+ room_id;
    init(username,room_id);
  }
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
          $('#usernameModal-title-1').css('color','red');
          //add text on the modal to let the user know they need to enter someting in the modal
        } else {
          localStorage.setItem("username", username);

          $("#usernameModal").modal("hide");
          //set the username in local storage to make it like sessions
          get_session_room();
          //call the init function to start the app
        }
      }
    });
  } else {
    get_session_room();
  };
};

function openChat() {
  document.getElementById("chatRoom").style.width = "50%";
}

function closeChat() {
  document.getElementById("chatRoom").style.width = "0";
}

//generate a string of hex characters of desired length
var randHex = function(len) {
  var maxlen = 8,
      min = Math.pow(16,Math.min(len,maxlen)-1)
      max = Math.pow(16,Math.min(len,maxlen)) - 1,
      n   = Math.floor( Math.random() * (max-min+1) ) + min,
      r   = n.toString(16);
  while ( r.length < len ) {
     r = r + randHex( len - maxlen );
  }
  return r;
};

const clear_users = () => {
  let ul = document.querySelector("#active_users_list");
  ul.innerHTML = "";
};

function leaveRoom(){
  localStorage.removeItem("room_id");
  clear_canvas();
  socket.emit("leave room");
  get_session_room()
}
