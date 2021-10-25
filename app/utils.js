//Módulo  donde se van a manejar los formatos (Entrada y Salida)

var filtrosPermitidos={
  "TC":"type=",
  "UG":"location=",
  "RI":"total>",
  "RF":"total<"
}

var _validarEntrada = function(data){

  var objResponse={
    "isError":true,
    "response":"ok"
  };

  //Se conveirte el texto plano en una lista para poder operar sobre esta
  var entrada = data.split("");
  const initCabecera = "<";
  const finCabecera = ">";
  
  var indices = {
    "ini":[],
    "fin":[]
  };
  
  //Recorremos las lista para separar el texto en las diferetes mesas a llenar
  entrada.forEach((v,k)=>{
    if(v==initCabecera){
      indices.ini.push(k);
    }
    if(v==finCabecera){
      indices.fin.push(k);
    }
  });

  //Obtenemos la cantidad de mesas a llenar
  if(indices.ini.length == indices.fin.length){
    var mesas = [];
    //Recorremos cada una de las mesas para obtener los filtros de los invitados
    Array(indices.ini.length).fill("").forEach((v,k)=>{
      var miMesa = {};
      var nombre = data.substring(indices.ini[k]+1,indices.fin[k]);
      var filtrosValid=true;
      var filtrosTxt=data.substring(indices.fin[k]+1,indices.ini[k+1]).replace(/\n\n/g,"\n").replace(/\t/g," ");
      var filtrosList=filtrosTxt.split("\n").map((f)=>{
        return f.trim();
      });
      filtrosList=filtrosList.filter((f)=>{
        return f!="";
      });
      
      var filtros={};
      var where="1=1 ";
      filtrosList.forEach((v2,k2)=>{
        var cond = v2.split(":");
        if(cond.length==2){
          var condK = cond[0].trim();
          var condV = cond[1].trim();
          if(condK != "" && condV != "" && filtrosPermitidos[condK]){
            filtros[cond[0].trim()]=cond[1].trim();
            where+="and "+filtrosPermitidos[condK]+condV+" ";
          }else{
            console.log(condK);
            console.log(filtrosPermitidos[condK]);
            filtrosValid=false;
          }
        }else{
          filtrosValid=false;
        }
      });

      miMesa.nombre = nombre;
      miMesa.filtrosTxt = filtrosTxt;
      miMesa.filtrosList = filtrosList;
      miMesa.filtros = filtros;
      miMesa.filtrosValid = filtrosValid;
      miMesa.where = where;
      mesas.push(miMesa);
    });

    var isOK=true;
    var msg = "ok";
    mesas.forEach((v,k)=>{
      if(!v.nombre || !v.filtrosValid){
        isOK=false;
        msg="Por favor verifica los filtros del grupo número "+(k+1)+" ("+(v.nombre?v.nombre:'')+").";
      }
    });
    
    if(isOK){
      objResponse.isError=false;
      objResponse.response={"mesas":mesas};
    }else{
      objResponse.response=msg;
    }
  }else{
    objResponse.response="Por favor verifica que las cabeceras del formato de entrada esté en formato correcto";
  }

  return objResponse;
}

async function _filtrarClientes(mesas,db){

  const mesasFiltrado = await Promise.all(
    mesas.map(async (mesa)=>{
      var cl = await db.obtener(mesa.where);
      mesa.disponibles = cl.isError?[]:cl.response; 
      return mesa;
    })
  );
    
  return mesasFiltrado;
}

async function decrypt(mesas){
  
  var axios = require('axios');

  
  mesas.map(async (mesa)=>{
    const clDecrypt = await Promise.all(
      mesa.disponibles.map(async (cl)=>{
        if(cl.encrypt){
          cl.code = await axios.get("https://test.evalartapp.com/extapiquest/code_decrypt/"+cl.code);
          //cl.code = new Buffer.from(cl.code, 'base64').toString('utf-8');
        }
        return cl;
      })
    );
    return clDecrypt;
  });
  

  return mesas;
}

function getInfoMesa(mesas){
  var invitados={};
  var mesas = mesas.map((mesa)=>{
    if(mesa.invitados==undefined){
      mesa.invitados={
        "clientes":[],
        "filtrados":0,
        "empresas":[],
        "total":0,
        "mujeres":0,
        "hombres":0
      };
    }

    mesa.cantDisponibles = mesa.disponibles.length;
    mesa.disponibles.forEach((v,k)=>{
      mesa.invitados.total+=1;

      if(mesa.invitados.empresas.indexOf(v.company)==-1 && invitados[v.code]==undefined){

        mesa.invitados.filtrados+=1;
        if(v.male==1){
          mesa.invitados.hombres+=1;
        }else{
          mesa.invitados.mujeres+=1;
        }

        var countGenders=[mesa.invitados.mujeres,mesa.invitados.hombres];
        var min = Math.min.apply(null,countGenders);
        var max = Math.max.apply(null,countGenders);
        var gender = {
          "min":min,
          "typeMin":countGenders.indexOf(min),
          "max":max,
          "typeMax":countGenders.indexOf(max)
        };
        mesa.invitados.genero = gender;

        mesa.invitados.empresas.push(v.company);
        mesa.invitados.clientes.push(v);

        invitados[v.code]=[];
        invitados[v.code].push(mesa.nombre);
      }
    });
    
    return mesa;
  });

  return mesas;
}

function filtroGrl(mesas,maxInvitados){
  var mesas = mesas.map((mesa)=>{
    if(mesa.invitados.filtrados>maxInvitados){
      if(mesa.invitados.genero.min>maxInvitados/2){
        mesa.invitados.clientesOld = mesa.invitados.clientes.map((x)=>{return x;})
        mesa.invitados.clientes=equalizeGender(mesa.invitados.clientes,maxInvitados);
      }else{
        mesa.invitados.clientes.sort((a,b)=>{
          if (a.male > b.male) {
            return mesa.invitados?.genero?.typeMin?-1:1;
          }
          if (a.male < b.male) {
            return mesa?.invitados?.genero?.typeMin?1:-1;
          }
          return 0;
        });
      }
    }
    return mesa;
  });

  return mesas;
}

function getInvitados(mesas,maxInvitados){
  
  var mesas = mesas.map((mesa)=>{
    
    if(mesa.invitadosFinales==undefined){
      mesa.invitadosFinales=[];
    }
    
    mesa.invitados.clientes.forEach((v,k)=>{
      if(mesa.invitadosFinales.length < maxInvitados){
          mesa.invitadosFinales.push(v);
      }
    });
    return mesa;
  });

  return mesas;
}

async function _organizar(mesas){
  
  return new Promise(function(resolve){
    //TODO: Almacenarlo en variable de entorno o recibirlo como parámetro
    var maxInvitados=8;

    maxInvitados=maxInvitados-maxInvitados%2;
    decrypt(mesas)
    .then((mesas)=>{
      mesas=getInfoMesa(mesas);
      mesas=filtroGrl(mesas,maxInvitados);
      resolve(getInvitados(mesas,maxInvitados));
    });
  });
}


function equalizeGender(clientes,max){
  var h = [];
  var m = [];
  //var clientes = cl.map(x=>{return x;})
  var i = clientes.length;
  while(i--){
    if(clientes[i].male){
      h.unshift(clientes[i]);
    }else{
      m.unshift(clientes[i]);
    }
    clientes.splice(i, 1);
  }

 
  var ch=h.slice(0,max/2);
  h.splice(0,max/2);
  var cm=m.slice(0,max/2);
  m.splice(0,max/2);

  var sobrantes = [].concat(h).concat(m);
  sobrantes.sort((a,b) => {
    if (a.total > b.total) {
      return -1;
    }
    if (a.total < b.total) {
      return 1;
    }
    return 0;
  });

  clientes=clientes.concat(ch).concat(cm).concat(sobrantes);
  return clientes;

}


exports.entrada = {
  validar:_validarEntrada,
  filtrarMesa:_filtrarClientes,
  organizar:_organizar
};

exports.salida = {
  
};