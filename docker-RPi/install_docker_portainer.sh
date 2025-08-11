#!/bin/bash
set -e

LOG_FILE="$HOME/install_docker_portainer.log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== [$(date)] Iniciando instalación y RESET de Docker y Portainer ==="

# 1. Verificación de hardware
echo "=== Verificando si es Raspberry Pi ==="
if ! grep -q "Raspberry Pi" /proc/device-tree/model 2>/dev/null; then
  echo "❌ Este script solo debe ejecutarse en una Raspberry Pi."
  exit 1
fi

# 2. Actualización de sistema
echo "=== Actualizando sistema ==="
sudo apt update && sudo apt upgrade -y

# 3. Detener y eliminar todos los contenedores
echo "=== Deteniendo y eliminando todos los contenedores ==="
docker stop $(docker ps -a -q) || true
docker rm $(docker ps -a -q) || true

# 4. Limpiar imágenes, volúmenes, redes no usados
echo "=== Limpiando Docker completamente ==="
docker system prune -a --volumes -f

# 5. Instalar o actualizar Docker
if ! command -v docker &> /dev/null; then
  echo "=== Instalando Docker ==="
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  rm get-docker.sh
else
  echo "Docker instalado. Actualizando componentes esenciales..."
  sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

echo "=== Agregando usuarios al grupo docker ==="
sudo usermod -aG docker $USER
sudo usermod -aG docker carjavi

# 6. Instalar o actualizar Docker Compose
if ! docker compose version &> /dev/null; then
  echo "=== Instalar Docker Compose (plugin oficial) ==="
  sudo apt install -y docker-compose-plugin
else
  echo "Docker Compose ya instalado. Asegurando actualización..."
  sudo apt install -y docker-compose-plugin
fi

# 7. Instalar o actualizar Portainer
PORTAINER_IMAGE="portainer/portainer-ce:latest"
if docker ps -a --format '{{.Names}}' | grep -q '^portainer$'; then
  echo "Portainer detectado. Actualizando imagen..."
  docker pull $PORTAINER_IMAGE
  docker rm -f portainer
else
  echo "Portainer no encontrado. Instalando..."
  docker volume create portainer_data
fi
docker run -d -p 9000:9000 --name portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data $PORTAINER_IMAGE

# 8. Verificar estado de Portainer
if docker ps | grep -q portainer; then
    echo "✅ Portainer está corriendo correctamente."
else
    echo "⚠️ Portainer NO está corriendo."
fi

# 9. Mostrar IPs disponibles
echo
echo "🎉 Instalación y reset completados."
echo "Accede a Portainer desde las siguientes direcciones:"
for IFACE in $(ip -o link show | awk -F': ' '{print $2}'); do
    [[ "$IFACE" == lo ]] && continue
    IP=$(ip -4 addr show "$IFACE" 2>/dev/null | awk '/inet /{print $2}' | cut -d/ -f1)
    [[ -n "$IP" ]] && echo " - $IFACE: http://$IP:9000"
done

# 10. Ejecutar newgrp docker
echo
echo "Ejecutando 'newgrp docker' para aplicar sin reiniciar..."
newgrp docker <<EOF
echo " ¡Listo! Ya puedes usar Docker sin sudo en esta sesión."
EOF

echo
echo "ℹ Archivo de log: $LOG_FILE"
echo "🔧 Usa 'docker ps' y 'docker compose logs -f' para verificar contenedores."
