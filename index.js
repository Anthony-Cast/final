const express = require("express")
const http = require("http")
const socketIO = require("socket.io")

var app = express();
var server = http.Server(app);
var io = socketIO(server); //el general

server.listen(3000,function () {
   console.log("Servidor levantado exitosamente");
});

app.get("/",function (req,res) {
    res.sendFile(__dirname+"/index.html");
});
let nombres=[];
let cantidad=0;
let clienteName="";
io.on("connection",function (socket) {
   cantidad++;
   io.emit("cantidad",cantidad);
   console.log("usuario conectado");
   socket.on("disconnect",function () {
       cantidad--;
       io.emit("cantidad",cantidad);
       console.log(cantidad);
       console.log(clienteName);
       var index= nombres.indexOf(clienteName);
       console.log(index);
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
               }
           }else{
               console.log("Comando de cmd-usuarios-c");
           }
       }else{
           console.log("Comando de cmd-mensajes");
       }
   });
   socket.on("proceso",function(proceso){
       io.emit("tipeo",proceso);
    });
});




