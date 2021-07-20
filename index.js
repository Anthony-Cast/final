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
    res.sendFile(__dirname+"/index.html");
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

let nombres=["Mario","Luis"];
let cantidad=0;
let clienteName="Mario";
let user="";
let pass="";
io.on("connection",function (socket) {
   cantidad++;
   io.emit("cantidad",cantidad);
   console.log("usuario conectado");

    var index= nombres.indexOf(clienteName);
    if (index != -1) {
        nombres.splice(index, 0);
    }
    io.emit("usuarios",nombres);

   socket.on("disconnect",function () {
       cantidad--;
       io.emit("cantidad",cantidad);
       console.log("usuario desconectado");
   });

   socket.on("ultimos5mensajes", function(mensaje){
       
    });
   
   socket.on("textoChat",function(mensaje){
       if(!(mensaje == "cmd-mensajes")){
           if(!(mensaje == "cmd-usuarios-c")){
               if(!((mensaje.includes('cmd-')))){
                   console.log("No es ningun tipo de comando");
                    let date_ob = new Date();
                    let date = ("0" + date_ob.getDate()).slice(-2);
                    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                    let year = date_ob.getFullYear();
                    let hours = date_ob.getHours();
                    let minutes = date_ob.getMinutes();
                    let seconds = date_ob.getSeconds();
                   let fechayhora = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
                   var sql = "INSERT INTO `efinal_g5`.`mensajes` (`textomensaje`, `hora`, `usuarios_idusuarios`) VALUES (?, ?, ?)";
                   var params = [mensaje,fechayhora, 2];
                   conn.query(sql,params, function (err,results){
                       if (err) throw err;
                       console.log("Guardado exitoso");
                   });
                   console.log(fechayhora);
                   let mensajechat="Usuario:" + clienteName+ "/" + "Fecha y hora del mensaje: " + fechayhora + "/" + "Texto del mensaje: " + mensaje;
                   console.log(mensajechat);
                   io.emit("mensajechat",mensajechat);
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
        user=creds.split(",")[0].trim();
        pass=creds.split(",")[1].trim();
        console.log(user);
        console.log(pass);
        let sql = "SELECT idusuarios FROM usuarios where nombre = ? and contrasenia= ?";
        let params = [user,pass];
        conn.query(sql, params, function (err,results){
            if (err) throw err;
            console.log(results);
            if(results!=""){
                //redireccion al chat
                app.use(function (req,res,next) {
                    nombres.push(user);
                    //io.emit("usuarios",nombres);
                    res.redirect("/chat");
                });
            }
            else{
                console.log("no existe");
            }

        });
    });

});