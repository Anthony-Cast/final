const express = require("express")
const http = require("http")
const socketIO = require("socket.io")
const fs=require("fs")
var app = express();
var server = http.Server(app);
var io = socketIO(server); //el general

server.listen(3000,function () {
   console.log("Servidor levantado exitosamente");
});
app.get("/login",function(req,res){
    res.sendFile(__dirname+"/login.html");
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
       let info="mensaje de "+clienteName+ ": "+ mensaje;
       console.log(info);
       socket.broadcast.emit("mensaje",info);
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




