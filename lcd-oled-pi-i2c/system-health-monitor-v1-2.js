
/** 
@Autor carjavi@hotmail.com
    Titulo
    ver 0.1 09/2022

@Module_npm
npm i system-health-monitor
npm i oled-font-5x7
npm i child_process
npm i macaddress
npm i i2c-bus
npm i oled-i2c-bus
*/

const SystemHealthMonitor = require('system-health-monitor');
var font = require('oled-font-5x7');
const os = require('os');
var exec = require('child_process').exec;
var macaddress = require('macaddress');

var i2c = require('i2c-bus'),
    i2cBus = i2c.openSync(1),
    oled = require('oled-i2c-bus');

var opts = {
  width: 128,
  height: 64,
  address: 0x3C
};

var oled = new oled(i2cBus, opts);


//************* lee la ip & MAC *****************/
var ip = "";
var mac = "";
try {
  exec("ifconfig wlan0", function(error, out){  // con funtion defino la funcion
      var mt = out.match(/inet (\d+\.\d+\.\d+\.\d+)/); // la palabra de busqueda va al inicio
      ip = mt[1]; // como el resultado es una array es corchete
  });
}
catch(err) {
  console.log(err.message);
  ip = "No IP";
  //process.exit(1);
}

macaddress.one(function (err, macAdr) {
  mac = macAdr.toString();
  //console.log("mac:", mac); 
});
//*************************************************/

const monitorConfig = {
    checkIntervalMsec: 1000,
    mem: {
        thresholdType: 'none'
    },
    cpu: {
        calculationAlgo: 'sma',
        periodPoints: 10,
        thresholdType: 'none'
    }
};

const monitor = new SystemHealthMonitor(monitorConfig);
monitor.start()
    .then(
      setTimeout(updateSystemData,1000)
    )
    .catch(err => {
        console.error(err);
        process.exit(1);
});

const updateRate = 1;
let spacing = 12;

var temp = "";
var i = 0;


oled.clearDisplay();
oled.update();


function updateSystemData(){   


      try {
        exec("cat /sys/class/thermal/thermal_zone0/temp", function(error, out){  
          var oC = (parseFloat(out))/1000; ;
          temp = oC.toFixed(2);
          //console.log(temp); 
        });
      }
      catch(err) {
          console.log(err.message);
          //process.exit(1);
      }  

      // Tiempo transcurrido
      i = i + 1;
      var day = Math.floor (i / (24 * 3600)); // Math.floor () redondea hacia abajo 
      var hour = Math.floor( (i - day*24*3600) / 3600); 
      var minute = Math.floor( (i - day*24*3600 - hour*3600) /60 ); 
      var second = i - day*24*3600 - hour*3600 - minute*60;   
      //console.log(day + "d " + hour + "h " + minute + "m " + second + "s");
      

      let totalMemory = monitor.getMemTotal();
      let freeMemory = monitor.getMemFree();
      let memUsage = ((totalMemory - freeMemory) / totalMemory) * 100;
      var percentage = Math.round(memUsage);

      var d = new Date();
      var date = d.toLocaleString()

      // +++++++++++++++++++++++++++++++++++++++++++++++ show Display ++++++++++++++++ 
      oled.setCursor(0, spacing*0);
      oled.writeString(font, 1, ip , 1, true); 
      
      //oled.setCursor(0, spacing*1);
      //oled.writeString(font, 1, mac, 1, true);

      oled.setCursor(0, spacing*1);
      oled.writeString(font, 1, "CPU temp: "+ temp + " oC", 1, true);
      

      oled.setCursor(0, spacing*2); // ---------------------- Battety ---------------------
      oled.writeString(font, 1, "Baterry:", 1, true);
      //rectangulo del valor battery
      oled.drawLine(52, spacing*2, 100, spacing*2, 1); //recta superior
      oled.drawLine(52, spacing*2+7, 100, spacing*2+7, 1); //recta superior
      oled.drawPixel([ // recta horizontal derecha
        [100, spacing*2, 1],
        [100, spacing*2+1, 1],
        [100, spacing*2+2, 1],
        [100, spacing*2+3, 1],
        [100, spacing*2+4, 1],
        [100, spacing*2+5, 1],
        [100, spacing*2+6, 1]
      ]);
      oled.drawPixel([ // recta horizontal izquierda
        [52, spacing*2, 1],
        [52, spacing*2+1, 1],
        [52, spacing*2+2, 1],
        [52, spacing*2+3, 1],
        [52, spacing*2+4, 1],
        [52, spacing*2+5, 1],
        [52, spacing*2+6, 1]
      ]);
      //barra del valor
      oled.fillRect(52,spacing*2,memUsage,8, 1);
      // % del valor de la batteria
      oled.setCursor(108, spacing*2);
      oled.writeString(font, 1, percentage +"%", 1, true); // ---------------------------------------------

      oled.setCursor(0, spacing*3);
      oled.writeString(font, 1, date, 1, true); // oled.writeString(font, 1, "Date: " + date, 1, true);

      oled.setCursor(0, spacing*4);
      oled.writeString(font, 1, day + "d " + hour + "h " + minute + "m " + second + "s", 1, true);
  

      oled.update();
      
    setTimeout(updateSystemData, updateRate);
}

