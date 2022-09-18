<p align="center"><img src="https://raw.githubusercontent.com/carjavi/raspberry-pi-code/master/img/raspberry_pi.jpg" height="250" alt=" " /></p>
<h1 align="center">Streaming WebCam Pi</h1> 
<h4 align="right">Sep 22</h4>

<img src="https://img.shields.io/badge/OS%20-Raspbian%20GNU%2FLinux%2011%20(bulleye)-yellowgreen">
<img src="https://img.shields.io/badge/Hardware-Raspberry%20ver%204-red">
<img src="https://img.shields.io/badge/Hardware-Raspberry%20ver%203-red">
<img src="https://img.shields.io/badge/Node%20-V18.7.0-green">

<br>

***OPTION 1***

## Feature
Streaming video with NODEJS. Funciona tanto para la Camara Raspberry como para una Webcam USB
 <br> <br>


## Previous
```
sudo raspi-config
```
Enabled Camera ```Interfacing Options >> P1 Camera``` <br>
Enabled SSH ```Interfacing Options >> SSH``` <br>
[NodeJs & NPM](https://github.com/carjavi/install-nodejs-ARM)<br>
[Update Raspberry](https://github.com/carjavi/raspberry-pi-code)
 <br> <br>




## Testing Camera
```
raspistill -o testshot.jpg
```
check the root to see photo.
 <br> <br>

## Install Libraries

```
1. sudo apt update

2. sudo apt install snapd -y

3. sudo reboot

4. sudo snap install mjpg-streamer

5. snap connect mjpg-streamer:camera // para tener acceso a /dev/video*.

6. sudo nano /var/snap/mjpg-streamer/current/config // cambiar false por true

7. sudo snap restart mjpg-streamer

8. ip raspberry:8080 // aqui abre con la configuracion default

9. Cambiando la pagina index original por la que deseas
    por SCP UI ir a  /var/snap/mjpg-streamer/current
    * cambiar nombre de www a www_
    * crear una nueva www
    * copiar los archivos de tu GUI 

10. sudo snap restart mjpg-streamer
 
```


[https://snapcraft.io/mjpg-streamer](https://snapcraft.io/mjpg-streamer)

[https://github.com/ogra1/mjpg-streamer](https://github.com/ogra1/mjpg-streamer)

<br>

## Testing 
En el Browser
```
ip raspberry:8080
```
<br>

---

<br>

***OPTION 2***

<img src="https://img.shields.io/badge/Hardware-Raspberry%203B%2B-red">
<img src="https://img.shields.io/badge/Hardware-Raspberry%20Zero-red">
<img src="https://img.shields.io/badge/OS%20-Raspbian%20GNU%2FLinux%2010%20(buster)-yellowgreen">
<img src="https://img.shields.io/badge/Node%20-V18.7.0-green">

## Feature
Streaming video with NODEJS. (solo se probo con la Camara Raspberry).

> :warning: This project is NOT compatible with the latest Raspberry Pi OS 11 (Bullseye). Please use OS 10 (Buster) for now. Support for OS 11+ will be added once general Node support for ```libcamera``` is available.
<br>

## Previous
```
sudo raspi-config
```
Enabled Camera ```Interfacing Options >> P1 Camera``` <br>
Enabled SSH ```Interfacing Options >> SSH``` <br>
[NodeJs & NPM](https://github.com/carjavi/install-nodejs-ARM)<br>
[Update Raspberry](https://github.com/carjavi/raspberry-pi-code)
<br><br>

# Stream a realtime raspberry pi camera feed through an HTML web page
The camera is streamed as a .mjpeg file into a <img /> tag. The implementation is simple yet fully effective.

A simple example project can be installed from git:

Assuming you already have node.js set up, steps to install are:

1. Clone the repository: ```git clone https://github.com/caseymcj/raspberrypi_node_camera_web_streamer```
2. Restore dependencies by running ```npm install``` from within the folder of the repository
3. Start the server by running ```node index.js```
4. Navigate to the site in a web browser by going to ```http://<ip_address>:3000```


Cualquier cosa dentro de la carpeta pública se aloja como contenido estático. La página index.html ofrece un ejemplo de cómo transmitir desde la cámara. La etiqueta clave para esto es:
```
<img src="stream.mjpg" />
```
```stream.mjpg``` is hosted via Express in ```index.js```.

Streaming quality settings can also be modified within the ```index.js``` file.
<br><br>


https://github.com/caseymcj/raspberrypi_node_camera_web_streamer

<br><br>

---
Copyright &copy; 2022 [carjavi](https://github.com/carjavi). <br>
```www.instintodigital.net``` <br>
carjavi@hotmail.com <br>
<p align="center">
    <a href="https://instintodigital.net/" target="_blank"><img src="https://raw.githubusercontent.com/carjavi/raspberry-pi-code/master/img/developer.png" height="100" alt="www.instintodigital.net"></a>
</p>

