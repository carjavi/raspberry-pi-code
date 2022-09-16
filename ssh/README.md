<p align="center"><img src="https://raw.githubusercontent.com/carjavi/raspberry-pi-code/master/img/raspberry_pi.jpg" height="250" alt=" " /></p>
<br>
<h1 align="center">Enable SSH (console)</h1> 
<h4 align="right">Sep 22</h4>

<img src="https://img.shields.io/badge/OS%20-Raspbian%20GNU%2FLinux%2011%20(bulleye)-yellowgreen">
<img src="https://img.shields.io/badge/Hardware-Raspberry%20ver%204-red">



```
1. sudo raspi-config
```
2. Seleccionamos **interface options**
3. Navegamos y elegimos **SSH**
4. Escogemos la opción «Yes»
5. Ahora pulsamos «OK»
6. Finalmente, le damos a «Finish»
```
7. sudo systemctl enable ssh 
8. sudo systemctl start ssh

```

# Habilitar SSH sin conexión

No es necesario que la Raspberry Pi esté conectada para la habilitación del SSH. Podemos hacerlo colocando un archivo de nombre «ssh», sin extensión alguna, en la partición de arranque de una tarjeta SD desde otro dispositivo. Cuando se inicie la Raspberry Pi realiza una búsqueda del archivo «ssh». Si encuentra el archivo, el SSH pasará a habilitarse y el archivo se suprimirá. Lo que haya dentro del archivo no importa en absoluto, pudiendo estar completamente vacío.

Si instalamos el sistema operativo Raspberry Pi OS en una tarjeta SD en blanco, veremos que existen dos particiones. La más pequeña de ambas es la partición de arranque. Debemos añadir el archivo «ssh» a esta partición.

# Configuración del cliente

desde el terminal
```
ssh pi@<IP>
```
El usuario predeterminado para una Raspberry Pi es pi y la contraseña predefinida es raspberry.

# Acceso SSH sin contraseña
Podemos configurar el acceso a la Raspberry Pi de manera remota sin necesidad de introducir un usuario y contraseña. Esto es posible mediante la creación de una clave asimétrica para SSH en vez de usar un login tradicional.

Si no sabes lo que es una clave asimétrica, se basa en una clave privada y una clave pública. Este sistema se basa en una clave pública para firmar mensajes o acceso que se genera a partir de una clave privada. Obtener la clave pública a partir de la clave privada es algo muy sencillo, pero el proceso inverso requiere una potencia de cómputo descomunal. Es tan alta la potencia de cómputo necesaria, que se considera un proceso imposible.

## Verficacación de las claves SSH existentes
```
ls ~/.ssh
```
Si nos aparecen archivos de nombre ***id_rsa.pub*** o bien ***id_dsa.pub***, quiere decir que ya hay claves configuradas. Esto nos permite omitir el paso de «Generar nuevas claves SSH».

## Como generar una clave SSH
```
ssh-keygen
```
Cuando introducimos este comando nos preguntara donde queremos almacenar la nueva clave. Lo ideal es la ubicación predeterminada para esto (~/.ssh/id_rsa). Si no la modificamos, pulsamos en enter.

Se nos pedirá también que ingresemos una frase como contraseña, algo que es opcional. La frase de contraseña se utiliza para el cifrado de la clave SSH privada, de modo que si alguien la copia, nadie pueda hacerse pasar por nosotros para tener acceso al sistema. Si decidimos introducir una frase de contraseña diferente, la deberemos escribir y luego presionar enter. Luego nos la vuelve a pedir, por eso es importante que la memoricemos o al menos la anotemos en un papel. Si no hemos puesto frase, dejamos el campo vacío y le damos a siguiente.

Vamos ahora a mirar dentro de nuestro directorio .ssh el contenido:
```
ls ~/.ssh
```

Ahora debería devolvernos los archivos id_rsa e id_rsa.pub: authorized_keys id_rsa id_rsa.pub known_hosts

***id_rsa***: Es el nuevo archivo de clave privada y debemos guardarlo en nuestro ordenador

***id_rsa.pub***: Es el nuevo archivo de clave pública. Dicho archivo es el que debemos compartir con el resto de máquinas a las que nos queremos conectar. Para nuestro caso, la maquina a la que nos queremos conectar es una Raspberry Pi. Cuando nos intentemos conectar a la Raspberry Pi, al coincidir la clave pública y privada, nos permitirá la conexión.

## Copiar la clave pública en la Raspberry Pi
Ahora utilizando el equipo desde el cual nos conectaremos, debemos agregar el archivo de clave pública authorized_keys en la Raspberry Pi mandandola mediante SSH:

```
ssh-copy-id <USERNAME>@<IP-ADRSS>
```
**Para este paso debemos realizar una autenticación con nuestra contraseña**

Como alternativa, si ssh-copy-id no esta disponible en el sistema, podemos hacer una copia manual mediante SSH:
```
cat ~/.ssh/id_rsa.pub | ssh <USERNAME>@<IP-ADDRESS> 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys'
```

Si nos aparece el mensaje ***ssh: connect to host {IP-ADDRESS} port 22: Connection refused*** y estamos seguros que la dirección IP es correcta, puede darse el caso que no hayamos habilitado SSH en la Raspberry Pi. Debemos ejecutar **sudo raspi-config** en la ventana termina de la Raspberry y habilitar SSH. Ahora debemos copiar de nuevo el archivo.

Ahora debemos intentar conectarnos con ssh \<USER\>@ \<IP-ADDRESS \>  pudiendo hacerlo ahora sin problemas.

En caso que aparezca el mensaje «El agente admitió que no pudo firmar con la clave», debemos agregar las identidades RSA o DSA al agente de autenticación y ssh-agentet, y luego ejecutar el siguiente comando:
```
ssh-add
```
## Ajuste de permisos en los directores de inicio y .ssh

Puede darse el caso que aun siguiendo los pasos anteriores, no exista un problema al intentar conectarnos. Lo primero que debemos hacer es verificar los registros en busca de errores:
```
tail -f /var/log/secure
# might return:
Nov 23 12:31:26 raspberrypi sshd[9146]: Authentication refused: bad ownership or modes for directory /home/pi
```
Si el registro indica que Authentication refused: bad ownership or modes for directory /home/pi es prueba de que existe un problema de permisos en el directorio de inicio. SSH requiere que el home y ~/.ssh no tengan acceso de escritura grupal. Podemos ajustar estos permisos mediante chmod:
```
chmod g-w $HOME
chmod 700 $HOME/.ssh
chmod 600 $HOME/.ssh/authorized_keys
```
Ahora unicamente el propio usuario tiene acceso a .ssh y .ssh/authorized_keys en el cual se almacenan las claves publicas.


([Fuente](https://www.profesionalreview.com/2021/08/15/activar-ssh-raspberry-pi/#:~:text=Habilitar%20SSH,-El%20sistema%20operativo&text=Vamos%20a%20la%20%C2%ABConfiguraci%C3%B3n%20de,Hacemos%20clic%20en%20%C2%ABOK%C2%BB))

---
Copyright &copy; 2022 [carjavi](https://github.com/carjavi). <br>
```www.instintodigital.net``` <br>
carjavi@hotmail.com <br>
<p align="center">
    <a href="https://instintodigital.net/" target="_blank"><img src="https://raw.githubusercontent.com/carjavi/raspberry-pi-code/master/img/developer.png" height="100" alt="www.instintodigital.net"></a>
</p>

