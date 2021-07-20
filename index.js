const express = require("express")
const http = require("http")
const socketIO = require("socket.io")
const mysql = require('mysql2');
const fs=require("fs")
var sha256 = require('js-sha256');
const app = express();
var server = http.Server(app);
var io = socketIO(server); //el general

server.listen(3000,function () {
   console.log("Servidor levantado exitosamente");
});
app.get("/login",function(req,res){
    res.sendFile(__dirname+"/login.html");
});

let conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'efinal_g5'
});

conn.connect(function(err){
    if(err) throw err;
    console.log("Conexión exitosa a base de datos");
});

let nombres=[];
let cantidad=0;
let clienteName="";
let user="";
let pass="";
io.on("connection",function (socket) {
   cantidad++;
   io.emit("cantidad",cantidad);
   console.log("usuario conectado");
   socket.on("disconnect",function () {
       cantidad--;
       io.emit("cantidad",cantidad);
       var index= nombres.indexOf(clienteName);
       if (index != -1) {
           nombres.splice(index, 1);
       }
       io.emit("usuarios",nombres);
       console.log("usuario desconectado");
   });
   socket.on("cliente",function(nombre){
       clienteName=nombre;
       nombres.push(nombre);
       io.emit("usuarios",nombres);
   });
   
   socket.on("textoChat",function(mensaje){
       if(!(mensaje == "cmd-mensajes")){
           if(!(mensaje == "cmd-usuarios-c")){
               if(!((mensaje.includes('cmd-')))){
                   console.log("No es ningun tipo de comando");
                   let info="mensaje de "+clienteName+ ": "+ mensaje;
                   console.log(info);
                   socket.broadcast.emit("mensaje",info);
               }else{
                   console.log("Comando de cmd-palabra");
                   let mensaje_cortado = mensaje.substr(4,mensaje.length);
                   console.log(mensaje_cortado);
                   let sql = "SELECT COUNT(*) FROM MENSAJES WHERE TEXTOMENSAJE LIKE '%" + mensaje_cortado + "%'";
                   console.log(sql);
                   conn.query(sql, function (err,results){
                       if (err) throw err;
                      console.log(results);
                      //ENVIAR RESULTS
                   });
               }
           }else{
               console.log("Comando de cmd-usuarios-c");
               let contra = "login";
               console.log(sha256(contra));
               //TODO ENVIAR cantidad
           }
       }else{
           console.log("Comando de cmd-mensajes");
           let sql = "SELECT COUNT(*) FROM MENSAJES";
           console.log(sql);
           conn.query(sql, function (err,results){
               if (err) throw err;
               console.log(results);
               //ENVIAR RESULTS
           });
       }
   });
   
   socket.on("proceso",function(proceso){
       io.emit("tipeo",proceso);
    });
   socket.on("credenciales",function(creds){
      user=creds.split(",")[0];
      pass=creds.split(",")[1];
      if(user!=""){
          app.get("/chat",function(req,res){
              res.sendFile(__dirname+"/index.html");
          });
          app.use(function(req,res,next) {
              res.redirect("/chat");
          });
      }
   });
});