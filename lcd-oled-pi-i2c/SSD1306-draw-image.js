var bus = 1; 

var i2c = require('i2c-bus'),
    i2cBus = i2c.openSync(bus),
    oled = require('oled-i2c-bus');

const SIZE_X=128,
      SIZE_Y=64;

var opts = {
  width: SIZE_X,
  height: SIZE_Y,
  address: 0x3C
};

var pngtolcd = require('png-to-lcd');

try {
    var oled = new oled(i2cBus, opts);

    oled.clearDisplay();
    oled.turnOnDisplay();

    pngtolcd('cat-128x64.png', true, function(err, bitmap) {
        oled.buffer = bitmap;
        oled.update();
    });

}
catch(err) {
  // Print an error message and terminate the application
  console.log(err.message);
  process.exit(1);
}