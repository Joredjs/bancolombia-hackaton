//Módulo donde se realzian las peticionees a la base de datos

//Se inicializa la librería para conectarse a la base de datos
var  mysql = require('mysql');

//Se crea la conexión a la base de datos
const database = mysql.createConnection({
  host:process.env.DB_HOST,
  port:process.env.DB_PORT_LOCAL,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

//Función que ejecuta la consulta en la base de datos
function doQuery(q){
  return new Promise(function(resolve){
    database.query(q, (err,result) => {
      if (err){
        console.log(err);
        resolve(false);
      }else{
        resolve(result);
      }
    });
  });
}


//Función que obtiene la consulta facilitada en la prueba
async function getInitQuery(){
  var fs = require('fs').promises;
  var data = await fs.readFile("INFO/bd.txt","utf8");
  //data = data.replace(/[\r\n\t]/g, '');
  return data;
}



//Función que inicializa la base de datos
//obtiene la consulta facilitada en la prueba y la envía a la base de datos
var _init = async function(){
  var objResponse = {
    "isError":true,
    "response":"ok"
  };
  
  const query = await getInitQuery();
  if(query){
    const result = await doQuery(query);
    if(result?.affectedRows && result?.insertId && result?.affectedRows > 0){
      objResponse.isError = false;
      objResponse.response = "La base de datos se ha inicializado correctamente";
    }else{
      objResponse.response = "No ha sido posible inicializar la base de datos";
    }
  }else{
    objResponse.response = "No ha sido posible obtener la consulta";
  }

  return objResponse;
}

var _ordenarClientes = async function(wh){

  var objResponse = {
    "isError":true,
    "response":"ok"
  };

  var query = "SELECT * FROM client AS c INNER JOIN ( SELECT client_id,SUM(balance) AS total FROM account group BY client_id ) AS b ON c.id = b.client_id "+(wh?"WHERE "+wh:'')+" ORDER BY b.total desc,c.code asc";

  const result = await doQuery(query);

  if(result){
    objResponse.isError = false;
  }
  objResponse.response = result;

  return objResponse;
}


module.exports = {
  init:_init,
  obtener:_ordenarClientes
}