
document.addEventListener('DOMContentLoaded', () => {

    // state
    let draw = false;
    // elements
    let points = [];
    let lines = [];
    let svg = null;
    let actions = []; //this is a list of all the actions done by the user wrt drawing, point or line to help with undo function
    let line_start = [] //array of lines indices where the user started drawing lines

    let redo_stack = [];

    function render() {

        // create the selection area
        svg = d3.select('#draw')
                .attr('height', 0.9*(window.innerHeight - $( '#top_bar' ).height()))
                .attr('width', 0.99*window.innerWidth);

        //when the mouse is down in the svg region and the mouse is not moving
        svg.on('mousedown', function() {
            draw = true;
            const coords = d3.mouse(this); //get the coordinates of the mouse
            actions.push("point");
            draw_point(coords[0], coords[1], false); //draw the point
        });


        svg.on('mouseup', () =>{
            draw = false; //if the mouse is up
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
            }
            const coords = d3.mouse(this); //get the mouse coordinates
            actions.push("line");
            draw_point(coords[0], coords[1], true);
            //draw a point that is connected to the previous point
            //we have to do it like this because we cant edit the number of times the getMousePosition event fires
        });

        document.querySelector('#erase').onclick = () => {
            for (let i = 0; i < points.length; i++)
                points[i].remove();
            for (let i = 0; i < lines.length; i++)
                lines[i].remove();
            points = [];
            lines = [];
            //we cant just assign them empty lists,we must do the for loop to remove all the SVG objects we have created
            close_sidebar();
        }

        document.querySelector('#undo').onclick = () => {
          let most_recent_action = actions[actions.length-1]; //retrive last action
          if (most_recent_action === "point"){
            points[points.length - 1].remove();
            points.pop();
            //remove the most recent point
          }else{
            //it is a line, we want to pop off from
            for (let i = line_start[line_start.length - 1]; i < lines.length; i++){
              lines[lines.length - 1].remove();
              lines.pop();
              actions.pop(); //remove last action done by the user
            }
            line_start.pop(); //the last stroke has now been removed
          }


        }

    }

    function draw_point(x, y, connect) {

        const color = document.querySelector('#color-picker').value;
        const thickness = $('#thickness_slider').data('slider').getValue()



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
                         .style('fill', "red");
        points.push(point);
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

    render();
});

function openChat() {
  document.getElementById("chatRoom").style.width = "50%";
}

function closeChat() {
  document.getElementById("chatRoom").style.width = "0";
}
