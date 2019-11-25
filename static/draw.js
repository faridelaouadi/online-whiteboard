
document.addEventListener('DOMContentLoaded', () => {

    // state
    let draw = false;
    // elements
    let points = [];
    let lines = [];
    let svg = null;
    let actions = []; //this is a list of all the actions done by the user wrt drawing, point or line to help with undo function
    let line_start = []; //array of lines indices where the user started drawing lines
    let point_start_of_line = [];

    let line_end = [];
    let point_end_of_line = [];
    var color;
    var thickness;

    function render() {


        // create the selection area
        svg = d3.select('#draw')
                .attr('height', 0.9*(window.innerHeight - $( '#top_bar' ).height()))
                .attr('width', 0.99*window.innerWidth);

        //when the mouse is down in the svg region and the mouse is not moving
        svg.on('mousedown', function() {
            draw = true;
            const coords = d3.mouse(this); //get the coordinates of the mouse
            color = document.querySelector('#color-picker').value;
            thickness = $('#thickness_slider').data('slider').getValue()
            socket.emit("new action", { username:localStorage.getItem("username"), x:coords[0], y:coords[1], connect:false, color:color, thickness:thickness, action:"point"});
            draw_point(coords[0], coords[1], false, color, thickness, "point"); //draw the point
        });


        svg.on('mouseup', () =>{
            draw = false; //if the mouse is up
            if (line_start.length !== line_end.length){
              line_end.push(lines.length - 1);
              point_end_of_line.push(points.length -1);
              // so if we have reached the end pf the line and the user stops drawing, we need to note which line and point this is in the index of the lines and points array.
            }
        });

        //if the user is moving the mouse
        svg.on('mousemove', function() {
          //we need to track when a user just started to draw the line and when they finish.

            if (!draw)
                return; //not drawing, dont do anything
            //the user is drawing and moving the mouse
            if (actions[actions.length -1] !== "line"){
              //they just started drawing the line
              line_start.push(lines.length - 1) // get the index of lines where the line starts
              point_start_of_line.push(points.length - 1)
            }
            const coords = d3.mouse(this); //get the mouse coordinates
            color = document.querySelector('#color-picker').value;
            thickness = $('#thickness_slider').data('slider').getValue()
            socket.emit("new action", { username:localStorage.getItem("username"), x:coords[0], y:coords[1], connect:true, color:color, thickness:thickness, action:"line"});
            draw_point(coords[0], coords[1], true, color, thickness, "line");
            //draw a point that is connected to the previous point
            //we have to do it like this because we cant edit the number of times the getMousePosition event fires
        });

        document.querySelector('#erase').onclick = () => {
          socket.emit("clear canvas");
          clear_canvas();


        }

        document.querySelector('#undo').onclick = () => {
          if (actions.length == 0){
            console.log("lets display the notif now")
            //$('#undo_notif').show();
          }else{
            socket.emit("undo");
          }

        }

    }


    window.draw_point = function draw_point(x, y, connect, color, thickness, action) {
        actions.push(action);
        if (connect) {
            const last_point = points[points.length - 1];
            const line = svg.append('line')
                            .attr('x1', last_point.attr('cx'))
                            .attr('y1', last_point.attr('cy'))
                            .attr('x2', x)
                            .attr('y2', y)
                            .attr('stroke-width', thickness * 2)
                            .style('stroke', color);
            lines.push(line);

        }

        const point = svg.append('circle')
                         .attr('cx', x)
                         .attr('cy', y)
                         .attr('r', thickness)
                         .style('fill', color);
        points.push(point);
    }

    window.clear_canvas = function clear_canvas(){
      for (let i = 0; i < points.length; i++)
          points[i].remove();
      for (let i = 0; i < lines.length; i++)
          lines[i].remove();
      points = [];
      lines = [];
      actions = []; //this is a list of all the actions done by the user wrt drawing, point or line to help with undo function
      line_start = []; //array of lines indices where the user started drawing lines
      point_start_of_line = [];
      line_end = [];
      point_end_of_line = [];
      //we cant just assign them empty lists,we must do the for loop to remove all the SVG objects we have created
      close_sidebar();
    }

    window.undo = function undo(){
      let most_recent_action = actions[actions.length-1]; //retrive last action
      //console.log("We are undo ing stuff")
      if (most_recent_action === "point"){
        //console.log("last action was a point");
        //console.log(points);
        points[points.length - 1].remove();
        points.pop();
        actions.pop()
        //remove the most recent point
      }else{
        //console.log("last action was a line");
        //console.log(lines)
        //it is a line, we want to pop off from
        for (let i = line_start[line_start.length - 1]; i < line_end[line_end.length - 1]; i++){
          lines[lines.length - 1].remove();
          lines.pop();
          actions.pop(); //remove last action done by the user
        }
        line_start.pop(); //the last stroke has now been removed
        line_end.pop();
        //remove all the lines associated with that stroke.

        for (let i = point_start_of_line[point_start_of_line.length - 1]; i < point_end_of_line[point_end_of_line.length - 1]+1; i++){
          points[points.length - 1].remove();
          points.pop();
        }
        point_start_of_line.pop();
        point_end_of_line.pop();

        //console.log("We have removed the line so heres the new array");
        //console.log(lines)

      }
    }

    function close_sidebar() {
        $('#sidebar').removeClass('active');
        $('.overlay').removeClass('active');
    };


    $("#sidebar").mCustomScrollbar({
        theme: "minimal"
    });

    $('#dismiss, .overlay').on('click', close_sidebar);

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').addClass('active');
        $('.overlay').addClass('active');
        $('.collapse.in').toggleClass('in');
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
    });

    $('#thickness_slider').slider({
        formatter: function(value) {
        return 'Current value: ' + value;
        }
        });

    $("#active_users_list_button").on('click',function(){
      if ($('#active_users_list').css("display") === "none"){
        $('#active_users_list').css("display","inline");
      }else{
        $('#active_users_list').css("display","none");
      }

    });

    render();
});
