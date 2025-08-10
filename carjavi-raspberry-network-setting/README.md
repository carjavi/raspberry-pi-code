<p align="center"><img src="./img/raspberry_pi.jpg" width="500"  alt=" " /></p>
<h1 align="center"> carjavi raspi-network-setting </h1> 
<h4 align="right">Ago 25</h4>

<p>
<img src="https://img.shields.io/badge/OS%20-Raspbian%20GNU%2FLinux%20(Bookworm)-yellowgreen">
<img src="https://img.shields.io/badge/Hardware-Raspberry%20ver%204-red">
</p>

<br>

# Configuración IP estática Eth0 para SSH y prioriza Wlan0 para internet

Probado en OS Bookworm. Pone IP fija en Ethernet (eth0) a 192.168.2.2 para SSH y poner predeterminado Wi-Fi (wlan0) por defecto a internet. Usando el paquete ```nmcli```  (el CLI de NetworkManager), este gestiona las interfaces de red.

<br>

# Install
## Automatic:
```bash
sudo su -c 'curl -fsSL https://raw.githubusercontent.com/carjavi/raspberry-pi-code/main/carjavi-raspberry-network-setting/raspi-network-setting.sh| bash'

```
## Manually:
Download:
```bash
curl -O https://raw.githubusercontent.com/carjavi/raspberry-pi-code/main/carjavi-raspberry-network-setting/raspi-network-setting.sh
```

Install:
```bash
# Install
chmod +x raspi-network-setting.sh && sudo ./raspi-network-setting.sh
```

Testing:
```bash
ip route
```
Debes ver que la ruta default apunta a la puerta de enlace del Wi-Fi y que la interfaz eth0 solo está en su subred local.

## Troubleshooting
> :warning: **Warning:**
> * Si las interfaces estén gestionadas por otro sistema (como dhcpcd o ifupdown) y NetworkManager no las controla hay problemas. Debes asegurarte que NetworkManager gestione ambas interfaces.
> * Si usas dhcpcd u otro gestor, deshabilítalo para esas interfaces y habilita NetworkManager.

<br>

# Seleccionar Red WIFI mediante comando .sh

Descargar:
```bash
curl -O https://raw.githubusercontent.com/carjavi/raspberry-pi-code/main/carjavi-raspberry-network-setting/find_wifi-rpi.sh
```
Install:
```bash
chmod +x find_wifi-rpi.sh && sudo ./find_wifi-rpi.sh
```

## Configuración manual (sin el archivo .sh)
```bash
nmcli device wifi list # Ver redes disponibles
sudo nmcli device wifi connect <SSID> password <contraseña> # Conectar a una red
nmcli connection show --active # Ver estado de la conexión
```


<br>

# Archivos


raspi-network-setting:
```bash
#!/bin/bash
# raspi-network-setting
# Configura Ethernet (IP fija 192.168.2.2) solo para SSH y Wi-Fi como internet

# 1. Verificar si nmtui (NetworkManager) está instalado
if ! command -v nmtui &> /dev/null; then
    echo "📦 Instalando NetworkManager..."
    sudo apt update && sudo apt install -y network-manager
else
    echo "✅ NetworkManager ya está instalado."
fi

# 2. Detectar conexiones Ethernet y Wi-Fi correctamente según tipo real
ETH_CON=$(nmcli -t -f NAME,TYPE con show | awk -F: '$2=="802-3-ethernet"{print $1; exit}')
WIFI_CON=$(nmcli -t -f NAME,TYPE con show | awk -F: '$2=="802-11-wireless"{print $1; exit}')

if [ -z "$ETH_CON" ] || [ -z "$WIFI_CON" ]; then
    echo "❌ No se detectaron conexiones Ethernet o Wi-Fi."
    exit 1
fi

echo "🔍 Ethernet detectada: $ETH_CON"
echo "🔍 Wi-Fi detectada: $WIFI_CON"

# 3. Configurar Ethernet con IP fija, sin gateway
nmcli con mod "$ETH_CON" ipv4.method manual \
    ipv4.addresses 192.168.2.2/24 \
    ipv4.gateway "" \
    ipv4.dns "8.8.8.8,1.1.1.1" \
    connection.autoconnect yes \
    connection.autoconnect-priority -100

# 4. Configurar Wi-Fi DHCP con prioridad para internet
nmcli con mod "$WIFI_CON" ipv4.method auto \
    connection.autoconnect yes \
    connection.autoconnect-priority 100

# 5. Reiniciar las conexiones para aplicar cambios
nmcli con down "$ETH_CON" && nmcli con up "$ETH_CON"
nmcli con down "$WIFI_CON" && nmcli con up "$WIFI_CON"

echo "✅ Configuración aplicada correctamente."
echo "   - $ETH_CON → IP fija 192.168.2.2, sin gateway (solo SSH/local)"
echo "   - $WIFI_CON → DHCP con prioridad para internet"

```



<br>



find_wifi-rpi.sh:

```bash
#!/bin/bash

# Escanear redes WiFi
echo "Escaneando redes WiFi disponibles..."
sudo nmcli device wifi rescan
sleep 2
networks=$(nmcli -f SSID,SECURITY device wifi list | sed '1d' | awk '{$1=$1;print}')

if [ -z "$networks" ]; then
  echo "No se encontraron redes WiFi."
  exit 1
fi

echo "Redes disponibles:"
mapfile -t lines <<< "$networks"
for i in "${!lines[@]}"; do
  echo "$((i+1)). ${lines[$i]}"
done

# Seleccionar red
read -p "Selecciona el número de la red a conectar: " choice
if ! [[ "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -le 0 ] || [ "$choice" -gt "${#lines[@]}" ]; then
  echo "Selección inválida."
  exit 1
fi

ssid=$(echo "${lines[$((choice-1))]}" | awk '{print $1}')

# Pedir password si la red está protegida
security=$(echo "${lines[$((choice-1))]}" | awk '{print $2}')
if [[ "$security" != "--" ]]; then
  read -s -p "Ingresa la contraseña para $ssid: " password
  echo
  cmd="sudo nmcli device wifi connect \"$ssid\" password \"$password\""
else
  cmd="sudo nmcli device wifi connect \"$ssid\""
fi

# Ejecutar conexión
echo "Conectando a $ssid..."
eval $cmd

if [ $? -ne 0 ]; then
  echo "Error al conectar."
  exit 1
fi

# Mostrar nueva IP
echo "Nueva IP asignada:"
nmcli device show wlan0 | grep 'IP4.ADDRESS'


```

<br>

---

<div>
  <p>
    <img  align="top" width="42" style="padding:0px 0px 0px 0px;" src="./img/carjavi.png"/> Copyright &nbsp;&copy; 2023 Instinto Digital <a href="https://carjavi.github.io/" title="carjavi.github">carjavi</a>
  </p>
</div>

<p align="center">
    <a href="https://instintodigital.net/" target="_blank"><img src="./img/developer.png" height="100" alt="www.instintodigital.net"></a>
</p>