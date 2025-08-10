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

