<p align="center"><img src="https://raw.githubusercontent.com/carjavi/raspberry-pi-code/master/img/raspberry_pi_logo.jpg" height="250" alt=" " /></p>
<br>
<h1 align="center">Setting Raspberry Pi Wi-Fi (console)</h1> 
<h4 align="right">Sep 22</h4>

<img src="https://img.shields.io/badge/OS%20-Raspbian%20GNU%2FLinux%2011%20(bulleye)-yellowgreen">
<img src="https://img.shields.io/badge/Hardware-Raspberry%20ver%204-red">


Una vez que sepamos la red y contraseña a la que nos queremos conectar, debemos editar el fichero /etc/wpa_supplicant/wpa_supplicant.conf
```
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf
```
En este fichero, añadimos lo siguiente al final del archivo, cambiando los datos por los de nuestra wifi.
```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=ES
network={
        ssid="nombre-de-tu-wifi"
        psk="password-de-tu-wifi"
        key_mgmt=WPA-PSK
}
```
```
sudo reboot
```
## Comprobacion conexión 
```
ifconfig wlan0
```

# En versiones Anteriores de Raspberry
```
sudo nano /etc/network/interfaces
```
El contenido del fichero tras la modificación quedaba parecido a este:
```
auto lo
iface lo inet loopback
iface eth0 inet dhcp
allow-hotplug wlan0
auto wlan0
iface wlan0 inet dhcp
        wpa-ssid "nombre-de-tu-wifi"
        wpa-psk "password-de-tu-wifi"
```
En las versiones actuales de Raspbian no se realiza con este método. De hecho, si lo abrías veras que prácticamente está vacio, porque la forma de trabajar de los ficheros de configuración.
```
# interfaces(5) file used by ifup(8) and ifdown(8)
# Please note that this file is written to be used with dhcpcd
# For static IP, consult /etc/dhcpcd.conf and 'man dhcpcd.conf'
# Include files from /etc/network/interfaces.d:
source-directory /etc/network/interfaces.d
```



---
Copyright &copy; 2022 [carjavi](https://github.com/carjavi). <br>
```www.instintodigital.net``` <br>
carjavi@hotmail.com <br>
<p align="center">
    <a href="https://instintodigital.net/" target="_blank"><img src="https://raw.githubusercontent.com/carjavi/raspberry-pi-code/master/img/developer.png" height="100" alt="www.instintodigital.net"></a>
</p>

