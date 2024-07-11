var N = 50; // the fluid is subdivided into NxN cells
var NUM_PARTICLES = 30; // number of particles
var hasFriction = true;


// Creates a 2D array filled with zeros
var create2DArray = function( numColumns, numRows ) {
   var array = [];
   for ( var c = 0; c < numColumns; c++ ) {
      array.push([]); // adds an empty 1D array at the end of "array"
      for ( var r = 0; r < numRows; r++ ) {
         array[c].push(0); // add zero at end of the 1D array "array[c]"
      }
   }
   return array;
}


var Particle = {
   x: 0, y : 0,  // real number coordinates in grid_units.
                 // x increases right and is in the interval [0,N-1].
                 // y increases down and is in the interval [0,N-1].
                 // Coordinates (0,0) are the center of the upper-left-most cell;
                 // and (N-1,N-1) are the center of the lower-right-most cell.

   // Call this to give a random position to the particle.
   chooseRandomPosition : function() {
      this.x = Math.random() * (N-1); // random number between 0 and N-1
      this.y = Math.random() * (N-1); // random number between 0 and N-1
   }
};

var Fluid = {
   vx : [], vy : [], // vx and vy are 2D arrays that store the velocity,
                     // in grid_units/time_step, for each cell center.
                     // For a given position (X,Y) in the grid,
                     // where X,Y are integers in [0,N-1],
                     // vx[X][Y] and vy[X][Y] store the velocity vector.
                     // If vx[X][Y] and vy[X][Y] are both zero,
                     // the fluid at position (X,Y) is not moving.
                     // A positive vx[X][Y] means the fluid is moving to the right.
                     // A positive vy[X][Y] means downward movement.

   p : []            // p is a 2D array storing the pressure of the fluid
                     // at each cell center.
                     // For a given position (X,Y) in the grid,
                     // where X,Y are integers in [0,N-1],
                     // p[X][Y] stores the pressure.
};

var shrooms = [];
var found_shrooms = [];

Fluid.vx = create2DArray(N, N);
Fluid.vy = create2DArray(N, N);
Fluid.p = create2DArray(N, N);

// fill the array with particles
for ( var i = 0; i < NUM_PARTICLES; i++ ) {
   var p = Object.create( Particle );
   p.chooseRandomPosition();
   shrooms.push( p );  // add the new shroom to the end of the array
}

// advances the simulation by one time step
var advanceOneIteration = function() {

   // update the pressure values
   for ( var X = 1; X < N-1; X++ ) {
      for ( var Y = 1; Y < N-1; Y++ ) {
         var pressureX = Fluid.vx[X-1][Y] - Fluid.vx[X+1][Y];
         var pressureY = Fluid.vy[X][Y-1] - Fluid.vy[X][Y+1];
         Fluid.p[X][Y] = (pressureX+pressureY) * 0.5;
      }
   }

   // update the velocity vectors
   for ( var X = 1; X < N-1; X++ ) {
      for ( var Y = 1; Y < N-1; Y++ ) {
         Fluid.vx[X][Y] += ( Fluid.p[X-1][Y  ]-Fluid.p[X+1][Y  ] )*0.5;
         Fluid.vy[X][Y] += ( Fluid.p[X  ][Y-1]-Fluid.p[X  ][Y+1] )*0.5;
         if ( hasFriction ) {
            Fluid.vx[X][Y] *= 0.95;
            Fluid.vy[X][Y] *= 0.95;
         }
      }
   }
}

var canvas = document.getElementById("myCanvas");
var C = canvas.getContext("2d");
var WIDTH_IN_PIXELS = canvas.width;
var HEIGHT_IN_PIXELS = canvas.height;
var sizeOfCellInPixels
   = ( WIDTH_IN_PIXELS >= HEIGHT_IN_PIXELS ? WIDTH_IN_PIXELS : HEIGHT_IN_PIXELS ) / N;
var x0 = ( WIDTH_IN_PIXELS - sizeOfCellInPixels * N )/2;
var y0 = ( HEIGHT_IN_PIXELS - sizeOfCellInPixels * N )/2;

var mouse_x = 0; // in pixels
var mouse_y = 0; // in pixels
var leftButtonPressed = false; // true if the left mouse button is pressed
var rightButtonPressed = false;
var spoonRadius = 8; // in pixels

var drawLine = function( x1, y1, x2, y2 ) {
   C.beginPath();
   C.moveTo(x1,y1);
   C.lineTo(x2,y2);
   C.stroke();
}
var drawCircle = function( x, y, radius ) {
   C.beginPath();
   C.arc(x, y, radius, 0, 2 * Math.PI, false);
   C.stroke();
}

var draw = function() {
   C.clearRect( 0, 0, canvas.width, canvas.height );

   C.strokeStyle = 'white';
   for ( var X = 0; X < N; X++ ) {
      for ( var Y = 0; Y < N; Y++ ) {
         var dx = Fluid.vx[X][Y] * sizeOfCellInPixels;
         var dy = Fluid.vy[X][Y] * sizeOfCellInPixels;
         var x = x0 + (X+0.5)*sizeOfCellInPixels;
         var y = y0 + (Y+0.5)*sizeOfCellInPixels;
         drawLine( x, y, x+dx, y+dy );
      }
   }

    C.strokeStyle = 'red';
    for ( var i = 0; i < shrooms.length; i++ ) {
        var p = shrooms[i];

        var m_center_x =  Math.floor(mouse_x);
        var m_center_y = Math.floor(mouse_y);

        var s_center_x = Math.floor(p.x*sizeOfCellInPixels);
        var s_center_y = Math.floor(p.y*sizeOfCellInPixels);

        if( m_center_x <= s_center_x + 5 + spoonRadius && m_center_x >= s_center_x - 5 -spoonRadius && m_center_y <= s_center_y + 5 + spoonRadius && m_center_y >= s_center_y - 5 - spoonRadius){
         if(found_shrooms.indexOf(p) === -1){
            found_shrooms.push(p);
         }
         
        }
    }

    for (var i = 0; i < found_shrooms.length; i++){
      var shroom = found_shrooms[i];
      drawCircle( shroom.x*sizeOfCellInPixels, shroom.y*sizeOfCellInPixels, 5 );
    }

   C.strokeStyle = 'white';
   drawCircle(mouse_x,mouse_y,spoonRadius);
}


function mouseDownHandler(e) {
   if (e.button===2) rightButtonPressed = true;
   else leftButtonPressed = true;
   var canvas_rectangle = canvas.getBoundingClientRect();
   mouse_x = e.clientX - canvas_rectangle.left;
   mouse_y = e.clientY - canvas_rectangle.top;
}
function mouseUpHandler(e) {
   if (e.button===2) rightButtonPressed = false;
   else leftButtonPressed = false;
   var canvas_rectangle = canvas.getBoundingClientRect();
   mouse_x = e.clientX - canvas_rectangle.left;
   mouse_y = e.clientY - canvas_rectangle.top;
}
function mouseMoveHandler(e) {
   var canvas_rectangle = canvas.getBoundingClientRect();
   var event_x = e.clientX - canvas_rectangle.left;
   var event_y = e.clientY - canvas_rectangle.top;
   var spoon_vx = (event_x - mouse_x)/sizeOfCellInPixels;
   var spoon_vy = (event_y - mouse_y)/sizeOfCellInPixels;
   mouse_x = event_x;
   mouse_y = event_y;

   spoon_center_x = (mouse_x - x0)/sizeOfCellInPixels - 0.5;
   spoon_center_y = (mouse_y - y0)/sizeOfCellInPixels - 0.5;

   for ( var X = 1; X < N-1; X++ ) {
      for ( var Y = 1; Y < N-1; Y++ ) {
         var dx = X - spoon_center_x;
         var dy = Y - spoon_center_y;
         var distance = Math.sqrt(dx*dx+dy*dy);
         if ( distance <= spoonRadius/sizeOfCellInPixels ) {
            Fluid.vx[X][Y] += spoon_vx;
            Fluid.vy[X][Y] += spoon_vy;
         }
      }
   }
}

canvas.addEventListener('mousedown',mouseDownHandler);
canvas.addEventListener('mouseup',mouseUpHandler);
canvas.addEventListener('mousemove',mouseMoveHandler);
canvas.oncontextmenu = function(e){ return false; }; // disable the right-click menu

setInterval( function() { advanceOneIteration(); draw(); }, 100 /*milliseconds*/ );