'use strict'


require('dotenv').config();
//Se inicializan las librerías que se van a usar:  
const {body,validatorRequest} = require('express-validator');
const express = require('express');
const app = express();
//Se incluye el módulo donde se van a manejar las peticiones de la base de datos
const db = require('./db');


//Bienvenida del sistema, solo se asigna de forma debug para garantizar que el servidor está ejecutandose correctamente
app.get('/',function(req,res){
  res.send("Bienvenido al app");
});

//Ruta de inicialización de la BD, crea las tablas si no existen ejecutando la consulta facilitada para la prueba
//Si no es posible realizar esta inicialización responde un mensaje de error y muestra el error en la consola del servidor, de lo contrario muestra un texto de respuesta exitosa
app.get('/init',function(req,res){
  db.init().then((objRes)=>{
    res.send(objRes);
  })
});

//Se asigna un puerto por defecto, por si falla el acceso a las variables de entorno
const puerto = process.env.NODE_PORT || 1234; 
app.listen(puerto,function(){
  console.log("Servidor iniciado en el puerto "+puerto);
});

