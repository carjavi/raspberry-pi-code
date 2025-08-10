#!/bin/bash
set -e

LOG_FILE="$HOME/install_docker_portainer.log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== [$(date)] Iniciando instalación de Docker, Docker Compose y Portainer ==="

# -------------------
# 1. Verificación de hardware
# -------------------
echo "=== Verificando si es Raspberry Pi ==="
if ! grep -q "Raspberry Pi" /proc/device-tree/model 2>/dev/null; then
  echo "❌ Este script solo se debe ejecutar en una Raspberry Pi."
  exit 1
fi

# -------------------
# 2. Actualización del sistema
# -------------------
echo "=== Actualizando sistema ==="
sudo apt update && sudo apt upgrade -y

# -------------------
# 3. Instalación / actualización de Docker
# -------------------
if ! command -v docker &> /dev/null; then
  echo "=== Instalando Docker ==="
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  rm get-docker.sh
else
  echo "Docker ya está instalado. Verificando si hay actualización..."
  docker stop $(docker ps -q) # detener todos los contenedores
  sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

echo "=== Agregando usuario $USER al grupo docker ==="
sudo usermod -aG docker $USER
echo "=== Agregando usuario carjavi al grupo docker ==="
sudo usermod -aG docker carjavi

# -------------------
# 4. Instalación / actualización de Docker Compose
# -------------------
if ! docker compose version &> /dev/null; then
  echo "=== Instalando Docker Compose (plugin oficial) ==="
  sudo apt install -y docker-compose-plugin
else
  echo "Docker Compose ya está instalado. Verificando actualizaciones..."
  sudo apt install -y docker-compose-plugin
fi

# -------------------
# 5. Instalación / actualización de Portainer
# -------------------
PORTAINER_IMAGE="portainer/portainer-ce:latest"

if docker ps -a --format '{{.Names}}' | grep -q '^portainer$'; then
  echo "Portainer ya está instalado. Verificando si hay nueva versión..."
  docker pull $PORTAINER_IMAGE
  LOCAL_IMAGE_ID=$(docker images -q portainer/portainer-ce:latest)
  REMOTE_IMAGE_ID=$(docker inspect --format='{{.Id}}' portainer/portainer-ce:latest)

  if [ "$LOCAL_IMAGE_ID" != "$REMOTE_IMAGE_ID" ]; then
    echo "Actualizando Portainer..."
    docker rm -f portainer
    docker run -d -p 9000:9000 --name portainer --restart=always \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -v portainer_data:/data $PORTAINER_IMAGE
  else
    echo "Portainer ya está en la última versión."
  fi
else
  echo "Instalando Portainer..."
  docker volume create portainer_data
  docker run -d -p 9000:9000 --name portainer --restart=always \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v portainer_data:/data $PORTAINER_IMAGE
fi

echo "=== Verificando estado del contenedor Portainer ==="
if docker ps | grep -q portainer; then
    echo "Portainer está corriendo correctamente."
else
    echo "Atención: Portainer NO está corriendo."
fi

# -------------------
# 6. Verifica Interfaces de red y muestra IP
# -------------------

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📋 Información importante:"
echo "   • Docker version: $(docker version --format '{{.Server.Version}}')"
echo "   • Docker Compose version: $(docker compose version --short)"
echo "   • Portainer ejecutándose en:"

# Buscar interfaces Ethernet y WiFi con IP asignada
for IFACE in $(ip -o link show | awk -F': ' '{print $2}'); do
    # Saltar interfaces de loopback
    [[ "$IFACE" == "lo" ]] && continue

    # Obtener IP
    IP=$(ip -4 addr show "$IFACE" 2>/dev/null | awk '/inet / {print $2}' | cut -d/ -f1)

    # Mostrar solo si tiene IP
    if [[ -n "$IP" ]]; then
        if [[ "$IFACE" == e* ]]; then
            echo "    Accede a Portainer en Ethernet: http://$IP:9000"
        elif [[ "$IFACE" == w* ]]; then
            echo "    Accede a Portainer en WiFi: http://$IP:9000"
        fi
    fi
done

echo ""
echo "⚠️  IMPORTANTE:"
echo "   • Cierra sesión y vuelve a entrar para usar Docker sin sudo o ejecuta: newgrp docker"
echo "   • En el primer acceso a Portainer, crea el usuario admin"
echo "   • Archivo de log: $LOG_FILE"
echo ""
echo "🔧 Comandos útiles:"
echo "   • Ver contenedores: docker ps"
echo "   • Ver logs Portainer: docker compose logs -f"
echo "   • STOP Portainer: docker compose down"

