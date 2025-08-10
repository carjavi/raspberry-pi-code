#!/bin/bash

set -e

echo "Verificando si es Raspberry Pi..."

if ! grep -q "Raspberry Pi" /proc/device-tree/model 2>/dev/null; then
  echo "Este script solo se debe ejecutar en una Raspberry Pi."
  exit 1
fi

echo "Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

echo "Instalando Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

echo "Agregando usuario $USER al grupo docker..."
sudo usermod -aG docker $USER

echo "Instalando dependencias para Docker Compose..."
sudo apt install -y libffi-dev libssl-dev python3 python3-pip

echo "Instalando Docker Compose..."
sudo pip3 install docker-compose

echo "Creando volumen para Portainer..."
docker volume create portainer_data

echo "Ejecutando Portainer..."
docker rm -f portainer 2>/dev/null || true
docker run -d -p 9000:9000 --name portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data portainer/portainer-ce:latest


echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📋 Información importante:"
echo "   • Docker version: $(docker --version)"
echo "   • Docker Compose version: $(docker compose version --short)"
echo "   • Portainer ejecutándose en:"
echo "     - HTTPS: https://$(hostname -I | awk '{print $1}'):9443"
echo "     - HTTP:  http://$(hostname -I | awk '{print $1}'):9000"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   • Cierra sesión y vuelve a entrar para usar Docker sin sudo o ejecuta: newgrp docker"
echo "   • En el primer acceso a Portainer, crea el usuario admin"
echo "   • Se recomienda usar HTTPS (puerto 9443)"
echo ""
echo "🔧 Comandos útiles:"
echo "   • Ver contenedores: docker ps"
echo "   • Ver logs Portainer: docker compose logs -f"
echo "   • Parar Portainer: docker compose down"
echo "   • Actualizar Portainer: docker compose pull && docker compose up -d"
