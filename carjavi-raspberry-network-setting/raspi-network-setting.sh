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
