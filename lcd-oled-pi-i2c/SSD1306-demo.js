var i2c = require('i2c-bus'),
    i2cBus = i2c.openSync(1),
    oled = require('oled-i2c-bus');

var opts = {
  width: 128,
  height: 64,
  address: 0x3C
};

var font = require('oled-font-5x7');
var temporal = require('temporal');
var pngtolcd = require('png-to-lcd');


var oled = new oled(i2cBus, opts);

oled.clearDisplay();

demo(oled);

// sequence of test displays
function demo(oled) {

    
    oled.turnOnDisplay();

    // if it was already scrolling, stop
    oled.stopScroll();

    // clear first just in case
    oled.update();

     // make it prettier 
    oled.dimDisplay(true);

    temporal.queue([
        {
          delay: 500,
          task: function() {
            console.log("draw some test pixels");
            // draw some test pixels
            oled.drawPixel([
              [127, 0, 1],
              [127, 31, 1],
              [127, 16, 1],
              [64, 16, 1]
            ]);
          }
        },
        {
          delay: 3000,
          task: function() {
            console.log("display a bitmap");
            oled.clearDisplay();
            // display a bitmap
            pngtolcd(__dirname + '/cat-128x64.png', true, function(err, bitmapbuf) {
              oled.buffer = bitmapbuf;
              oled.update();
            });
            
          }
        },
        {
          delay: 3000,
          task: function() {
            oled.clearDisplay();
            console.log("display text");
            // display text
            oled.setCursor(0, 0);
            oled.writeString(font, 1, 'Cats and dogs are really cool animals, you know.', 1, true, 2);
          }
        },
        {
          delay: 3000,
          task: function() {
            oled.clearDisplay();
            console.log("draw some lines");
            // draw some lines
            oled.drawLine(0, 0, 127, 31, 1);
            oled.drawLine(64, 16, 127, 16, 1);
            oled.drawLine(0, 10, 40, 10, 1);
          }
        },
        {
          delay: 3000,
          task: function() {
            oled.clearDisplay();
            console.log("draw a rectangle");
            // draw a rectangle
            oled.fillRect(0, 0, 10, 20, 1);
          }
        },
        {
          delay: 3000,
          task: function() {
            oled.clearDisplay();
            console.log("display text1");
            // display text
            oled.setCursor(0, 7);
            oled.writeString(font, 2, 'Left SCROLL!', 1, true, 1);
            oled.startScroll('left', 0, 12);
          }
        },
        {
          delay: 10000,
          task: function() {
            console.log("display text2");
            oled.stopScroll();
            oled.clearDisplay();
            oled.update();
            oled.setCursor(0, 7);
            oled.writeString(font, 2, 'Right SCROLL!', 1, true, 1);
            oled.startScroll('right', 0, 13);
            console.log("end");
          }
        }
        
      ]);

    console.log("lo que se ponga aca no va hacer afectado por los retardos");

}