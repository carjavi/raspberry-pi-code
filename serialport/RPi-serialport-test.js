
//npm i serialport
//npm i @serialport/parser-readline
//sudo chmod 666 /dev/ttyS0

//scan port USB
//ls /dev/*USB*
//all port serial
//ls /dev/tty*

// error puerto
//https://devicetests.com/fix-permission-denied-error-xubuntu-serial-port
//https://serialport.io/docs/api-serialport


// envia data cada 3 seg y cuando recibe lo muestra en la consola

const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const port = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 115200 }) // /dev/ttyUSB1   /dev/ttyS0

const parser = port.pipe(new ReadlineParser())
//parser.on('data', console.log)

parser.on("data", (data) => {
 // var str = data.String(data);
  console.log("raw: " ,data);
 // console.log("str: ",str);
});

port.on('open',function() {
  console.log('Port open');
});

port.on("error", function(err) {
  console.log("Error: ", err.message);
});

setInterval(function() {

  port.write('qwerty\r\n', (err) => {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
      console.log('message written');
    });

  //port.write("Hello world!\r\n");

}, 3000)

