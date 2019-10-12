var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3001, function () {
    console.log('listening on *:3001');
});

io.on('connection', function (socket) {
    var mayinlar = [];
    socket.on('startgame', function (data) {
        var satirmayin = [];
        for (i = 0; i < 10; i++) {
            var mayinnumara1 = Math.floor(Math.random() * 4) + 1;
            var mayinnumara2 = Math.floor(Math.random() * 4) + 1;

            if (mayinnumara2 == mayinnumara1) {
                i--;
            }
            else {
                satirmayin.push(mayinnumara1);
                satirmayin.push(mayinnumara2);

                mayinlar.push(satirmayin);
                satirmayin = [];
            }
        }
        socket.emit("sendmayin", mayinlar);

    })

    socket.on('oyna',function(oyundata){
        var x =  oyundata.linenumber;
        var tiklananmayin = Number(oyundata.tiklanan);
        var mayinvarmi = false;
        for(i=0; i<2 ;i++){
            if(mayinlar[x][i] == tiklananmayin){
                mayinvarmi = true;
                socket.emit('crash');
            }
        }
        if(!mayinvarmi){
            x++;
            socket.emit('continue',x);
        }
    })
});