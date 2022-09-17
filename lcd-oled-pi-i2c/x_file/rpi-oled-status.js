#!/usr/bin/env node
const Oled = require('./oled.js');
const commandLineArgs = require('command-line-args')
const checkDiskSpace = require('check-disk-space')
const SystemHealthMonitor = require('system-health-monitor')
const os = require('os')
const font = require('oled-font-5x7')

const optionDefinitions = [
{ name: 'width', alias: 'w', type: Number },
{ name: 'height', alias: 'h', type: Number },
{ name: 'address', alias: 'a', type: Number },
{ name: 'bus', alias: 'b', type: String },
{ name: 'microview', type: Boolean },
{ name: 'datasize', type: Number },
{ name: 'updaterate', alias: 'u', type: Number },
{ name: 'install-service', type: Boolean },
{ name: 'remove-service', type: Boolean }
]
const options = commandLineArgs(optionDefinitions, { camelCase: true })
const updateRate = options.updaterate || 5000
const opts = {
  width: options.width || 128,
  height: options.height || 64,
  address: options.address || 0x3C,
  device: options.bus || '/dev/i2c-1',
  microview: options.microview,
  datasize: options.datasize || 16
};
const oled = new Oled(opts);
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

oled.clearDisplay();
oled.update();

function updateSystemData(){
  checkDiskSpace('/').then((diskSpace) => {
    let spacing = 12;
    let totalMemory = monitor.getMemTotal();
    let freeMemory = monitor.getMemFree();
    let memUsage = ((totalMemory - freeMemory) / totalMemory) * 100;
    let cpuCores = monitor.getCpuCount();
    let cpuUsage = monitor.getCpuUsage();
    let hostname = os.hostname();
    let uptime = os.uptime();
    let upDate = new Date(uptime).toISOString().slice(11, -1);
    let diskUsage = ((diskSpace.size - diskSpace.free) / diskSpace.size) * 100;

    oled.setCursor(0, spacing*0);
    oled.writeString(font, 1, hostname , 1, sync=false);
    oled.setCursor(0, spacing*1);
    oled.writeString(font, 1, "CPU", 1, sync=false);
    oled.setCursor(0, spacing*2);
    oled.writeString(font, 1, "MEM", 1, sync=false);
    oled.setCursor(0, spacing*3);
    oled.writeString(font, 1, "DSK", 1, sync=false);
    oled.setCursor(0, spacing*4);
    oled.writeString(font, 1, upDate, 1, sync=false);

    oled.fillRect(27,spacing*1,100        ,8, 0, false);
    oled.drawRect(27,spacing*1,100        ,8, 1, false);
    oled.fillRect(27,spacing*1,cpuUsage   ,8, 1, false);

    oled.fillRect(27,spacing*2,100        ,8, 0, false);
    oled.drawRect(27,spacing*2,100        ,8, 1, false);
    oled.fillRect(27,spacing*2,memUsage   ,8, 1, false);

    oled.fillRect(27,spacing*3,100        ,8, 0, false);
    oled.drawRect(27,spacing*3,100        ,8, 1, false);
    oled.fillRect(27,spacing*3,diskUsage   ,8, 1, false);

    oled.update();
  });
  setTimeout(updateSystemData, updateRate);
}
