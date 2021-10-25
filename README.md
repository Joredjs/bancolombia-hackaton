# Codigotón Bancolombia

![Logo Bancolombia](logo-bc.png "Grupo Bancolombia")

***Tabla de contenido***

- [Codigotón Bancolombia](#codigotón-bancolombia)
  - [Descripción](#descripción)
  - [Instalación y uso](#instalación-y-uso)
  - [Créditos](#créditos)

## Descripción

Codigotón Grupo Bancolombia

## Instalación y uso

*Prerequisitos:*

- Docker

*Herramientas:*

- IDE de su preferencia, recomendado: **vscode**

*Inicialización:*

- Clonar repositorio

```bash
#Utilizando github cli
gh repo clone Joredjs/bancolombia-hackaton

#Con git a través de https
https://github.com/Joredjs/bancolombia-hackaton.git
```
- variables de entorno
  
```bash
#Las llaves debe ser como se especifican a continuación
#Los valores pueden variar según la configuración de entorno local
NODE_PORT=3000
NODE_PORT_LOCAL=13000
NODE_HOST='0.0.0.0'
DB_PORT=3306
DB_PORT_LOCAL=13306
DB_HOST=localhost
DB_USER=root
DB_PASS=test
DB_NAME=evalart_reto
```

- Ejecutar servicios de Docker

```bash
docker-compose build
docker-compose up -d
```

- Inicializar la base de datos de datos
  - Abrir en un navegador web **http://localhost:13000/init**, el puerto *"13000"* puede variar según la configuración de las variables de entorno

## Créditos

**[Jorge Garay](https://github.com/Joredjs)**

![](https://avatars.githubusercontent.com/u/3341088?s=10&v=4)
