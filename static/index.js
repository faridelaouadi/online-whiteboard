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
        console.log("new user called " + data.username + " has just joined the server");
    });


    socket.on("users", data => {
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
      //see how youre going to do the color and thickeness
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



const get_session_room = () => {
  let room_id = localStorage.getItem("room_id");

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
            init(username,room_id);
          }
        }
      });
  }else{
    init(username,room_id);
  }
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

function create_room(){
  console.log("We are now creating your new room!!!");
}
