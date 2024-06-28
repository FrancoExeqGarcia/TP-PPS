# README - Levantar el Proyecto

Este README describe los pasos necesarios para clonar y levantar el proyecto en tu entorno de desarrollo. Asegúrate de seguir estos pasos cuidadosamente para poder ejecutar el proyecto sin problemas.

## Paso 1: Clonar el Repositorio

Para comenzar, clona el repositorio en tu máquina local utilizando el siguiente comando en tu terminal:

```bash
git clone https://github.com/FrancoExeqGarcia/TP-PPS.git
```

## Paso 2: Configuracion e instalacion del SqlServer

Descargar el SqlServer Express 2019:

```bash
https://www.microsoft.com/es-ar/download/details.aspx?id=101064
```

Una vez instalado, levantas el servicio en el Administrador de configuración de SQL Server 2019 y

Abres el SqlServer Managment Studio, conectas con tu configuracion definida en la instalacion del SqlServer Express

Te diriges a properties de la bases de datos, database settings y editas las direcciones data, log, backup

data: [donde clonaste el proyecto]\TP-PPS\Base de Datos\MSSQL15.TASKMANAGER\MSSQL\DATA\

log: [donde clonaste el pro
yecto]\TP-PPS\Base de Datos\MSSQL15.TASKMANAGER\MSSQL\Logs\

backup: [donde instalaste Sql server] generalmente C:\Program Files\Microsoft SQL Server\MSSQL15.LOCAL\MSSQL\Backup

## Paso 3: Levantar el Frontend

Una vez que hayas clonado el repositorio, navega a la carpeta Frotend:

Dentro de la carpeta Frotend, instala las dependencias del proyecto con npm:

```bash
npm i
```

Una vez que se hayan instalado las dependencias, inicia el servidor de desarrollo con el siguiente comando:

```bash
npm start
```

Esto pondrá en marcha la parte frontend de la aplicación y podrás acceder a ella en tu navegador visitando [http://localhost:3000](http://localhost:3000).

## Paso 4: Levantar el Backend

Dentro de la carpeta de Backend, inicia el servicio con el siguiente comando:

```bash
dotnet run
```

Esto pondrá en marcha la parte backend de la aplicación.

Ahora puedes probar la aplicación.

PD: Podras acceder al swagger en tu navegador visitando [https://localhost:7165/swagger](http://localhost:7165/swagger)

Si tienes alguna pregunta o enfrentas problemas, no dudes en consultar con el equipo de desarrollo. ¡Feliz codificación!
