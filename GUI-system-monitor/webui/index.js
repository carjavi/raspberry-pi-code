/**  
@Autor carjavi@hotmail.com
    Titulo
    ver 0.1 09/2022
@Module_npm
npm init
npm i express --save
npm i http --save
npm i child_process --save
npm i socket.io --save
npm i --save onoff

//LCD
npm install i2c-bus
npm install oled-i2c-bus
npm install oled-font-5x7
npm install png-to-lcd


npm i tracer 
npm i socket.io-file // subir archivos por socket

npm i 
*/




/* -------------------------- SERVER -------------------------- */

var express = require('express');
var app = express();


const http = require('http');
const child_process = require('child_process');
var fs = require('fs');
//const SocketIOFile = require('socket.io-file');
//var logger = require('tracer').console();
//var os = require("os");
var home_dir = process.env.HOME
app.use('/webui.log', express.static(home_dir +'/.webui.log'));
// __dirname  = /home/pi/webui
// home_dir = /home/pi
//logger.log('carjavi webgui');
//logger.log('ENVIRONMENT', process.env);

//------- Oled -------------------------------
var font = require('oled-font-5x7');

var i2c = require('i2c-bus'),
    i2cBus = i2c.openSync(1),
    oled = require('oled-i2c-bus');

var opts = {
  width: 128,
  height: 64,
  address: 0x3C
};

var pngtolcd = require('png-to-lcd');

// buttom menu
const Gpio = require('onoff').Gpio;
const button_menu = new Gpio(27, "in", "both", { debounceTimeout: 100 });

var oled = new oled(i2cBus, opts);
var page = 1;
var linea1;
var linea2;
var linea3;
var linea4;
var linea5;
var status_wifi = "Disconnected";
var ip = "< not-ip >";
var internet = "< not >";
var SL = "-dBm";
var QA= "0%";
let spacing = 12;
var y = 0;
//---------------------------------------------


app.use(express.static(__dirname + '/public/'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/img', express.static(__dirname + '/public/images'));
app.use('/js', express.static(__dirname + '/public/jquery/dist')); // redirect JS jQuery
app.use('/js', express.static(__dirname + '/public/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/public/bootstrap-switch/dist/js'));
app.use('/js', express.static(__dirname + '/public/bootstrap-select/dist/js'));
app.use('/js', express.static(__dirname + '/public/bootstrap-slider/dist'));
app.use('/font-awesome', express.static(__dirname + '/public/font-awesome')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/public/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/css', express.static(__dirname + '/public/bootstrap-select/dist/css'));
app.use('/css', express.static(__dirname + '/public/bootstrap-slider/dist/css'));
app.use('/css', express.static(__dirname + '/public/bootstrap-switch/dist/css/bootstrap2'));


// root
app.get('/', function(req, res) {
	return res.sendFile(__dirname + '/views/index.html', {});                
});

// corre el server
const server = http.createServer(app);
server.listen(8888, function listening() { // 8080 ocupado al parecer
    console.log("Server running at http://localhost:" + server.address().port);  
});



/* -------------------------------------------   socket   ------------------------------------------------ */

var io = require('socket.io')(server);
var networking = io.of('/networking');


// Network setup
networking.on('connection', function(socket) {

	// Network setup 
	socket.on('get wifi aps', function() {

		// scane net wifi
		try {
			// The regex here matches bytes escaped by a backslash, such as \xf3 or \x23 and replaces them
			// with the char resulting of encoding the byte. The extra backslashes are for escaping (string in a string)
			cmd = child_process.execSync("sudo wpa_cli scan_results | grep PSK | cut -f5 | perl -pe 's/\\\\x([\\\da-f]{2})/chr(hex($1))/gie' |  grep .");
			//console.log("wpa_cli scan_results: ", cmd.toString());
			socket.emit('wifi aps', cmd.toString().trim().split("\n"));
		} catch (e) {
			console.error("wpa_cli scan_results failed!", e.stderr.toString(), e);
		}



		socket.on('join network', function(data) {
			//console.log('join network');
			//console.log("data:", data);
			var bool_flag = true; // bandera para motrar un solo dato en consola
			
			try {
				
				var passphrase = child_process.execSync("wpa_passphrase '" + data.ssid + "' '" + data.password + "'");
				
				var str_passphrase = passphrase.toString();
				str_passphrase = str_passphrase.replace('#psk', 'psk'); // descomenta la clave comentada por el comando wpa_passphrase
				str_passphrase = str_passphrase.replace(/psk=\w.*\n/g, 'key_mgmt=WPA-PSK\n'); // quita la clave encriptada y coloque otro parametro que fucniona cuando la red no tiene clave
												
				var networkString = "ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev\nupdate_config=1\ncountry=CL\n";
					networkString +=  str_passphrase;
				
				//console.log(networkString);

				child_process.execSync("sudo chmod 0666 /etc/wpa_supplicant/wpa_supplicant.conf"); // le da permiso para modificarlo

				fs.writeFile('/home/pi/webui/wpa_supplicant.conf', networkString , function (err) { // crea un duplicado del archivo de configuracion, este conserva las comillas en SSID y PSK, directo se borran las comillas
					if (err) throw err;
					child_process.exec("cat /home/pi/webui/wpa_supplicant.conf > /etc/wpa_supplicant/wpa_supplicant.conf",function (err) {
						if (err) throw err;
						//console.log('Goto save!');
						child_process.exec("rm /home/pi/webui/wpa_supplicant.conf"); // se necesita borrar porque sino da problemas de permiso cuando se quiera crear de nuevo
						child_process.exec("sudo wpa_cli -i wlan0 reconfigure",function (err) { // aplica los cambios 
							if (err) throw err;
							if(bool_flag){
								console.log("join complete network");
								bool_flag = false;
							}
							
							socket.emit('join complete');
						});
					});
				});


			} catch (e) {
				
				console.log("password error "); //console.log("error:", e);
			}
		});



	});




	/** -----------------------------------  WiFi Status ------------------------------------------------------ */

	function wifiStatus() {
		// The regex here matches bytes escaped by a backslash, such as \xf3 or \x23 and replaces them
		// with the char resulting of encoding the byte. The extra backslashes are for escaping (string in a string)
		//sudo wpa_cli status | perl -pe 's/\\\\x([\\\da-f]{2})/chr(hex($1))/gie'
		cmd = child_process.exec("wpa_cli -i wlan0 status", function (error, stdout, stderr) {
			//logger.log("sudo wpa_cli status : ", error + stdout + stderr);
			if (error) {
				socket.emit('wifi status', '<h4 style="color:red;">Error: ' + stderr + '</h1>');
			} else {
				if (stdout.indexOf("DISCONNECTED") > -1) {
					status_wifi = "Disconnected";

					socket.emit('wifi status', '<h4 style="color:red;">Disconnected</h1>');
				} else if (stdout.indexOf("SCANNING") > -1) {
					// -------- oled animation puntos
					status_wifi = "Network scan"
					if(y >= 0 && y < 3){status_wifi = "Network scan";}
					if(y >= 3 && y < 6){status_wifi = "Network scan.";}
					if(y >= 6 && y < 9){status_wifi = "Network scan..";}
					if(y >= 9 && y < 12){status_wifi = "Network scan...";}
					//console.log ("y: " + y);
					y = y + 1;
					if(y > 12){y = 0;}
					// --------------------
					socket.emit('wifi status', '<h4 style="color:red;">Scanning</h1>');
				} else if (stdout.indexOf("INACTIVE") > -1) {
					status_wifi = "Inactive";
					socket.emit('wifi status', '<h4 style="color:red;">Inactive</h1>');
				} else {
					var fields = stdout.split("\n");
					for (var i in fields) {
						var line = fields[i].split("=");
						if (line[0] == "ssid") {
							var ssid = line[1];
						} else if (line[0] == "ip_address") {
							var ip = " (" + line[1] + ")";
						}
					}
					
					if (stdout.indexOf("HANDSHAKE") > -1) {
						socket.emit('wifi status', '<h4>Connecting: ' + ssid + '</h1>');
						status_wifi = "Connecting...";
					} else {
						var ipString = ""
						if (ip != undefined) {
							ipString = ip
						}
						
						var ssidString = ""
						if (ssid != undefined) {
							ssidString = ssid
						}
						status_wifi = "Connected";
						y = 0;
						socket.emit('wifi status', '<h4 style="color:green;">Connected: ' + ssidString + ipString + '</h4>');
					}
				}
			}
		});

	}
	setInterval(wifiStatus, 1000);
	/** ----------------------------------- end  WiFi Status ------------------------------------------------------ */


}); /** ----------------------------------- end  socket------------------------------------------------------ */







/* -------------------------------------------   OLED   ------------------------------------------------ */

function update_Oled(){  	

			//verifica que se estrableca la conexion con la red para mostrar datos
			if (status_wifi == "Connected" ){
				updateIp();
			}else{
				//ip = "< not-ip >";
				internet = "< not >";
				SL = "-dBm";
				QA= "0%";
			}
			// cambia lo que va a mostrar el OLED
			if (page == 1){
				linea1 = status_wifi;
				linea2 = "WLAN: " + ip;
				linea3 = "WWW: " + internet;
				linea4 = "QA: " + QA + " SL: " + SL;
				linea5 = "ETH: 192.168.2.2";
			}
			if (page == 2){

				var temp_cpu = 10;
				var memUsage = 10;
				var diskUsage = 10;
				var battlevel = 10;

				oled.clearDisplay();
				linea1 = "hostname:";
				linea2 = "Temx:";
				linea3 = "Mem:";
				linea4 = "Disc:";
				linea5 = "Batt:";

				oled.setCursor(0, spacing*0);
				oled.writeString(font, 1, linea1 , 1, true); 

				oled.setCursor(0, spacing*1);
				oled.writeString(font, 1,linea2 , 1, true); 

				oled.setCursor(0, spacing*2);
				oled.writeString(font, 1, linea3 , 1, true);

				oled.setCursor(0, spacing*3);
				oled.writeString(font, 1, linea4 , 1, true);

				oled.setCursor(0, spacing*4);
				oled.writeString(font, 1, linea5 , 1, true);

				
				// rectangulos
				//oled.fillRect(30,spacing*1,100        ,8, 1);
				///oled.fillRect(30,spacing*1,memUsage   ,8, 1);
				oled.fillRect(30,spacing*2,100        ,8, 0);
				oled.fillRect(30,spacing*2,temp_cpu   ,8, 1);
				oled.fillRect(30,spacing*3,100        ,8, 0);
				oled.fillRect(30,spacing*3,diskUsage  ,8, 1);

				//Page
				oled.setCursor(109, 57);
				oled.writeString(font, 1, page + "/4" , 1, true);

				oled.update();

			}
			if (page == 3){
				linea1 = "mac:";
				linea2 = "AWS:";
				linea3 = "Azure:";
				linea4 = "Google:";
				linea5 = "";
			}
			if (page == 4){
				oled.clearDisplay();
			
				pngtolcd('carjavi128x64_new.png', true, function(err, bitmap) {
					oled.buffer = bitmap;
					oled.update();
				});

				page = 5;

			}
			
			if (page != 4 && page != 5 && page != 2){
				oled.clearDisplay();
				oled.update();

				oled.setCursor(0, spacing*0);
				oled.writeString(font, 1, linea1 , 1, true); 

				oled.setCursor(0, spacing*1);
				oled.writeString(font, 1,linea2 , 1, true); 

				oled.setCursor(0, spacing*2);
				oled.writeString(font, 1, linea3 , 1, true);

				oled.setCursor(0, spacing*3);
				oled.writeString(font, 1, linea4 , 1, true);

				oled.setCursor(0, spacing*4);
				oled.writeString(font, 1, linea5 , 1, true);
				
				//Page
				oled.setCursor(109, 57);
				oled.writeString(font, 1, page + "/4" , 1, true);

				oled.update(); 
			}

}
setInterval(update_Oled, 1000);





//Buttom menu Oled
button_menu.watch((err, value) => {
	if (err) {
	  throw err;
	}
  
	if (value == 0) {
		//console.log("page: ", page);
		page = page + 1;
		if(page>4) {page = 1;}
	}
});




function updateIp() {
	child_process.exec("ifconfig wlan0", function(err, out){  // con funtion defino la funcion
		if(err){
			console.log(err.message);
		}

		// valida que si existe una iP
		if(out.match(/inet (\d+\.\d+\.\d+\.\d+)/) === null){   
			//hacemos lo que se requiera en caso de que la variable contenga null 
			ip = "< not-ip >";
			SL = "-dBm";
			QA= "0%";  
		}else{
			var mt = out.match(/inet (\d+\.\d+\.\d+\.\d+)/);
			ip = mt[1]; // como el resultado es una array es corchete
			wifi_rssi();
			status_wifi = "Connected";	
		}

	});
}
setInterval(updateIp, 1000);


function wifi_rssi() {
	child_process.exec("iwconfig wlan0 | grep 'Link Quality'", function(err, stdout){
		if(!err) {
			if(stdout.match(/Quality=(\d+)/) === null){ 
				QA = "0%";
				io.emit('QA', QA);
			}else{
				QA = stdout.match(/Quality=(\d+)/);
				QA = Math.round((QA[1]*100)/70)  + "%";
				io.emit('QA', QA);
				//console.log('rssid: ', QA);
			}
			
			if(stdout.match(/level=-(\d+)/) === null){ 
				SL = "-dBm";
				io.emit('SL', SL);
			}else{
				SL = stdout.match(/level=-(\d+)/);
				SL = "-" + SL[1] + "dBm";
				io.emit('SL', SL);
				//console.log('level: ', SL);
			}
		};
	});
}



/* -------------------------------------------   end OLED   ------------------------------------------------ */


/* -------------------------------------   chequeo del internet -----------------------------------------------*/
function updateInternetStatus(flag_Bool) {
	var _internet_connected;
	 cmd = child_process.exec('ping -c1 fast.com', function (error, stdout, stderr) {
		if (flag_Bool) {
			//console.log("ping -c1 fast.com : ", error + stdout + stderr); // solo se va a mostrar una vez
		}
		_internet_connected = true;
		internet = "< ok >"; // oled 
		if (error) {
			_internet_connected = false;
			internet = "< not >"; // oled 
		}
		io.emit('internet status', _internet_connected);
	});
}
updateInternetStatus(true);
setInterval(updateInternetStatus, 2500, false); // el true y false es para que lo muestre una sola vez

/* ---------------------------------------  end chequeo del internet -----------------------------------------------------*/






io.on('connection', function(socket) {

	/** reboot */
	socket.on('reboot', function(data) {
		console.log('reboot');
		child_process.exec('sudo reboot now', function (error, stdout, stderr) {
			console.log(stdout + stderr);
		});
	});


	/** shutdown */
	socket.on('shutdown', function(data) {
		console.log('shutdown');
		child_process.exec('sudo shutdown -h now', function (error, stdout, stderr) {
			console.log(stdout + stderr);
		});
	});

	/** ip  no se esta usando
	socket.on('get current ip', function() {
		//console.log("get current ip");
		child_process.exec("ifconfig |grep 'inet 192'|cut -d' ' -f10", function (error, stdout, stderr) {
			if(!error) {
				io.emit('current ip', stdout);
				//console.log(stdout);
			};
		});
	});
	*/


});









