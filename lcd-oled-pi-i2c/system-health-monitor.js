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



//const checkDiskSpace = require('check-disk-space');
const SystemHealthMonitor = require('system-health-monitor');
const os = require('os');
var font = require('oled-font-5x7');
var i2c = require('i2c-bus'),
    i2cBus = i2c.openSync(1),
    oled = require('oled-i2c-bus');

var opts = {
  width: 128,
  height: 64,
  address: 0x3C
};

var oled = new oled(i2cBus, opts);


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

oled.clearDisplay();
oled.update();



function updateSystemData(){
      
      let totalMemory = monitor.getMemTotal();
      let freeMemory = monitor.getMemFree();
      let memUsage = ((totalMemory - freeMemory) / totalMemory) * 100;
      let cpuCores = monitor.getCpuCount();
      let cpuUsage = monitor.getCpuUsage();
      let hostname = os.hostname();
      let uptime = os.uptime();
      let upDate = new Date(uptime).toISOString().slice(11, -1);
      //let diskUsage = ((diskSpace.size - diskSpace.free) / diskSpace.size) * 100;
      let diskUsage = 50;
      
  
      oled.setCursor(0, spacing*0);
      oled.writeString(font, 1, hostname , 1, true); //hostname
      oled.setCursor(0, spacing*1);
      oled.writeString(font, 1, "CPU", 1, true);
      oled.setCursor(0, spacing*2);
      oled.writeString(font, 1, "MEM", 1, true);
      oled.setCursor(0, spacing*3);
      oled.writeString(font, 1, "DSK", 1, true);
      oled.setCursor(0, spacing*4);
      oled.writeString(font, 1, upDate, 1, true);
    
      oled.fillRect(27,spacing*1,100        ,8, 1);
      oled.fillRect(27,spacing*1,cpuUsage   ,8, 1);
      oled.fillRect(27,spacing*2,100        ,8, 0);
      oled.fillRect(27,spacing*2,memUsage   ,8, 1);
      oled.fillRect(27,spacing*3,100        ,8, 0);
      oled.fillRect(27,spacing*3,diskUsage   ,8, 1);
      
  
      oled.update();
      
    setTimeout(updateSystemData, updateRate);
  }

