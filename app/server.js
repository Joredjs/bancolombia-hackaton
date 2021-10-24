'use strict'

//Se usan las librerías que se van a usar:
const mysql = require('mysql');
const {body,validatorRequest} = require('express-validator');
const express = require('express');
const app = express();

require('dotenv').config();

app.get('/',function(req,res){
  res.send("Hola");
});

const puerto = process.env.NODE_PORT || 1234; 
app.listen(puerto,function(){
  console.log("Servidor iniciado en el puerto "+puerto);
});

