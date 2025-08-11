<p align="center"><img src="./img/docker_RPi.jpg" width="600"   alt=" " /></p>
<h1 align="center"> Docker on a Raspberry Pi </h1> 
<h4 align="right">Ago 25</h4>

<p>
  <img src="https://img.shields.io/badge/OS-Linux%20GNU-yellowgreen">
  <img src="https://img.shields.io/badge/Hardware-Raspberry%20ver%204-red">
</p>

<br>

# Table of contents
- [Table of contents](#table-of-contents)
- [Benefits of using Docker](#benefits-of-using-docker)
- [Install](#install)
  - [Automatic:](#automatic)
  - [Manually](#manually)
- [Troubleshooting](#troubleshooting)
- [Running a test container](#running-a-test-container)
- [Creating Our Own Images](#creating-our-own-images)

<br>

# Benefits of using Docker
Algunos de los beneficios de usar Docker son:

* Portabilidad : los contenedores Docker pueden ejecutarse en cualquier entorno compatible, desde una computadora local hasta un servidor en la nube.

* Coherencia : al contener todas las dependencias necesarias, Docker garantiza que la aplicación se ejecute de la misma manera en cualquier lugar.

* Escalabilidad : Docker permite una fácil implementación y gestión de aplicaciones a escala.

# Install
Descarga, instala o actualiza Docker, Docker Compose y Portainer en Raspberry Pi 4 OS Bookworm 64-bit ```(ARMv8 64Bit Bookworm)```. Agrega el usuario root  y carjavi al grupo Docker, muestran las IP para acceder a Portainer desde Ethernet y WiFi.

## Automatic:
```bash
sudo su -c 'curl -fsSL https://raw.githubusercontent.com/carjavi/raspberry-pi-code/main/docker-RPi/install_docker_portainer.sh| bash' 

```
## Manually
Download:
```bash
curl -O https://raw.githubusercontent.com/carjavi/raspberry-pi-code/main/docker-RPi/install_docker_portainer.sh
```
Install:
```bash
chmod +x install_docker_portainer.sh && sudo ./install_docker_portainer.sh
```


<br>

# Troubleshooting
> :warning: **Warning:** Aun no se reportan problemas.

<br>

# Running a test container
```bash
docker run hello-world
```

# Creating Our Own Images

---

<div>
  <p>
    <img  align="top" width="42" style="padding:0px 0px 0px 0px;" src="./img/carjavi.png"/> Copyright &nbsp;&copy; 2023 Instinto Digital <a href="https://carjavi.github.io/" title="carjavi.github">carjavi</a>
  </p>
</div>

<p align="center">
    <a href="https://instintodigital.net/" target="_blank"><img src="./img/developer.png" height="100" alt="www.instintodigital.net"></a>
</p>


