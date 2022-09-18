<p align="center"><img src="https://raw.githubusercontent.com/carjavi/raspberry-pi-code/master/img/raspberry_pi.jpg" height="250" alt=" " /></p>
<h1 align="center">Display OLED 128x64 0,96" chip SSD1306 I2C</h1> 
<h4 align="right">Sep 22</h4>

<img src="https://img.shields.io/badge/OS%20-Raspbian%20GNU%2FLinux%2011%20(bulleye)-yellowgreen">
<img src="https://img.shields.io/badge/Hardware-Raspberry%20ver%204-red">
<img src="https://img.shields.io/badge/Node%20-V18.7.0-green">

<br>

## Feature

Control Display OLED 128x64 0,96" chip SSD1306 with NODEJS


<p align="center">
  <img src="https://raw.githubusercontent.com/carjavi/raspberry-pi-code/master/img/SH1106.png"
</p>

## Previous
```
sudo raspi-config
```
Enabled I2C ```Interfacing Options >> I2C``` <br>
Enabled SSH ```Interfacing Options >> SSH``` <br>
[NodeJs & NPM](https://github.com/carjavi/install-nodejs-ARM)<br>
[Update Raspberry](https://github.com/carjavi/raspberry-pi-code)
<br>

[Configuring I2C Manually](https://github.com/fivdi/i2c-bus/blob/HEAD/doc/raspberry-pi-i2c.md)
<br> <br>

## Testing bus
```
i2cdetect -y 1
```
<br>


## Install Libraries
```
npm install i2c-bus
npm install oled-i2c-bus
npm install oled-font-5x7
npm install png-to-lcd

npm install temporal // para generar retardos entre pantallas
```
## SetCursor
Sets the x and y position of 'cursor', when about to write text. This effectively helps tell the display where to start typing when writeString() method is called.

Call setCursor just before writeString().

Usage:

```
// sets cursor to x = 1, y = 1
oled.setCursor(1, 1);
```

## Text
***writeString***
Writes a string of text to the display.
Call setCursor() just before, if you need to set starting text position.

writeString (obj font, int size,string text,bool wrapping)

Arguments:

* ***obj font*** - font object in JSON format (see note below on sourcing a font)
* ***int size*** - font size, as multiplier. Eg. 2 would double size, 3 would triple etc.
* ***string text*** - the actual text you want to show on the display.
int color - color of text. Can be specified as either **0 for 'off' or black, and 1 or 255 for 'on' or white**.
* ***bool wrapping*** - true applies word wrapping at the screen limit, false for no wrapping. If a long string without spaces is supplied as the text, just letter wrapping will apply instead.
  
Optional bool as last argument specifies whether screen updates immediately with result. Default is true.

```
var font = require('oled-font-5x7');

// sets cursor to x = 1, y = 1
oled.setCursor(1, 1);
oled.writeString(font, 1, 'Cats and dogs are really cool animals, you know.', 1, true);
```

> :memo: **Note:** Solo 6 lineas entran verticalmente.

## startScroll
Scrolls the current display either left or right. 
Arguments:

* string direction - direction of scrolling. 'left' or 'right'
* int start - starting row of scrolling area
* int stop - end row of scrolling area
* 
Usage:

```
// args: (direction, start, stop)
oled.startscroll('left', 0, 15); // this will scroll an entire 128 x 32 screen
```

## StopScroll
Stops all current scrolling behaviour.

Usage:

```
oled.stopscroll();
```

## DrawBitmap
### Install Libraries
```
sudo npm install png-to-lcd
```
A better way to display images is to use NodeJS package png-to-lcd instead. It's just as easy to use as drawBitmap, but is compatible with all image depths

Example usage:

```
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
```
## ClearDisplay
Fills the buffer with 'off' pixels (0x00). Optional bool argument specifies whether screen updates immediately with result. Default is true.

Usage:
```
oled.clearDisplay();
```

## DimDisplay
Lowers the contrast on the display. This method takes one argument, a boolean. True for dimming, false to restore normal contrast.

Usage:
```
oled.dimDisplay(true|false);
```

## InvertDisplay
Inverts the pixels on the display. Black becomes white, white becomes black. This method takes one argument, a boolean. True for inverted state, false to restore normal pixel colors.

Usage:
```
oled.invertDisplay(true|false);
```

## TurnOffDisplay
Turns the display off.

Usage:
```
oled.turnOffDisplay();
```

## TurnOnDisplay
Turns the display on.

Usage:
```
oled.turnOnDisplay();
```

## Update
Sends the entire buffer in its current state to the oled display, effectively syncing the two. This method generally does not need to be called, unless you're messing around with the framebuffer manually before you're ready to sync with the display. It's also needed if you're choosing not to draw on the screen immediately with the built in methods.

Usage:
```
oled.update();
```

https://github.com/baltazorr/oled-i2c-bus#startscroll


<br>


---
Copyright &copy; 2022 [carjavi](https://github.com/carjavi). <br>
```www.instintodigital.net``` <br>
carjavi@hotmail.com <br>
<p align="center">
    <a href="https://instintodigital.net/" target="_blank"><img src="https://raw.githubusercontent.com/carjavi/raspberry-pi-code/master/img/developer.png" height="100" alt="www.instintodigital.net"></a>
</p>

