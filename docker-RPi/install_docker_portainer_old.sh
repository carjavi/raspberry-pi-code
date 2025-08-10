#!/bin/bash

# Script para instalar Docker, Docker Compose v2 y Portainer en Raspberry Pi 4
# Compatible con Raspberry Pi OS Bookworm (64-bit recomendado)
# Ejecutar como: bash install_docker_portainer.sh

set -e  # Salir si hay error

echo "=== Instalando Docker, Docker Compose v2 y Portainer en RPi 4 ==="

# Verificar si es Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo; then
    echo "⚠️  Advertencia: No se detectó Raspberry Pi"
fi

# 1) Actualizar sistema
echo "📦 Actualizando sistema..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg

# 2) Agregar repositorio oficial de Docker
echo "🔑 Configurando repositorio de Docker..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/debian bookworm stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update

# 3) Instalar Docker + Docker Compose plugin
echo "🐳 Instalando Docker y Docker Compose v2..."
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4) Habilitar Docker y agregar usuario al grupo
echo "⚙️  Configurando Docker..."
sudo systemctl enable --now docker
sudo usermod -aG docker $USER

# 5) Verificar instalación
echo "✅ Verificando instalación..."
docker version
docker compose version

# 6) Crear directorio para Portainer
echo "📁 Creando configuración de Portainer..."
mkdir -p ~/portainer && cd ~/portainer

# 7) Crear docker-compose.yml para Portainer
cat > docker-compose.yml <<'EOF'
services:
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    ports:
      - "9443:9443"   # HTTPS (recomendado)
      - "8000:8000"   # Edge Agent
      - "9000:9000"   # HTTP (opcional)
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    restart: always
    
volumes:
  portainer_data:
EOF

# 8) Levantar Portainer
echo "🚀 Iniciando Portainer..."
docker compose up -d

# 9) Mostrar información final
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
echo "   • Cierra sesión y vuelve a entrar para usar Docker sin sudo"
echo "   • En el primer acceso a Portainer, crea el usuario admin"
echo "   • Se recomienda usar HTTPS (puerto 9443)"
echo ""
echo "🔧 Comandos útiles:"
echo "   • Ver contenedores: docker ps"
echo "   • Ver logs Portainer: docker compose logs -f"
echo "   • Parar Portainer: docker compose down"
echo "   • Actualizar Portainer: docker compose pull && docker compose up -d"