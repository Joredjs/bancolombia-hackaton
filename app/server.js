'use strict'


require('dotenv').config();
//Se inicializan las librerías que se van a usar:  
const {body,validatorRequest} = require('express-validator');
const express = require('express');
const app = express();
app.use(express.text());
//Se incluye el módulo donde se van a manejar las peticiones de la base de datos
const db = require('./db');
//Se incluye el módulo donde se van a manejar los formatos (Entrada y Salida)
const {entrada,salida} = require('./utils')


//Bienvenida del sistema, solo se asigna de forma debug para garantizar que el servidor está ejecutandose correctamente
app.get('/',function(req,res){
  res.send("Bienvenido al app");
});

//Ruta de inicialización de la BD, crea las tablas si no existen ejecutando la consulta facilitada para la prueba
//Si no es posible realizar esta inicialización responde un mensaje de error y muestra el error en la consola del servidor, de lo contrario muestra un texto de respuesta exitosa
app.get('/init',function(req,res){
  db.init().then(objRes => { res.send(objRes); });
});

//Ruta para obtener el listado de grupos
app.post('/grupos',function(req,res){
  //Se recibe el texto de entrada
  if(req && req.body){
    var validEntrada = entrada.validar(req.body);
    if(validEntrada.isError){
      res.send(validEntrada.response);
    }else{
      if(validEntrada?.response?.mesas){
        entrada.filtrarMesa(validEntrada.response.mesas,db)
        .then((mesas)=>{
          //TODO: Almacenarlo en variable de entorno o recibirlo como parámetro
          var maxInvitados=8;
          maxInvitados=maxInvitados-maxInvitados%2;

          entrada.organizar(mesas,maxInvitados)
          .then(invitados=>{
            res.set('Content-Type', 'text/plain');
            res.send(salida.formato(invitados,maxInvitados));
          });
          
        });
      }else{
        res.send("ERROR al validar el formato de entrada");
      }
      
    }

    //db.ordenar().then(objRes => { res.send(objRes); });
  }else{
    res.send("Por favor verifica que el formato de entrada y la petición sean correctos");
  }
});

//Se asigna un puerto por defecto, por si falla el acceso a las variables de entorno
const puerto = process.env.NODE_PORT || 1234; 
app.listen(puerto,function(){
  console.log("Servidor iniciado en el puerto "+puerto);
});

