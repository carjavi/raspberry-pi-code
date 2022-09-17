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

var font = require('oled-font-5x7');

try {
    var oled = new oled(i2cBus, opts);

    oled.clearDisplay();
    oled.turnOnDisplay();

    oled.setCursor(0, 1);
    oled.writeString(font, 1, 'Hello World...1', 1, true);
    oled.setCursor(1, 1);
    oled.writeString(font, 1, 'Hello World...1', 1, true);
    oled.setCursor(1, 10);
    oled.writeString(font, 1, 'Hello World...2', 1, true);
    oled.setCursor(1, 20);
    oled.writeString(font, 1, 'Hello World...3', 1, true);
    oled.setCursor(1, 30);
    oled.writeString(font, 1, 'Hello World...4', 1, true);
    oled.setCursor(1, 40);
    oled.writeString(font, 1, 'Hello World...5', 1, true);
    oled.setCursor(1, 50);
    oled.writeString(font, 1, 'Hello World...6', 1, true);

}
catch(err) {
  // Print an error message and terminate the application
  console.log(err.message);
  process.exit(1);
}