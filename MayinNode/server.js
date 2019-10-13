var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3001, function () {
    console.log('listening on *:3001');
});
var x;
var tutar;
io.on('connection', function (socket) {
    var mayinlar = [];
    var oranlar = [];
    socket.on('startgame', function (game) {
        tutar = game.tutar;
        var satirmayin = [];
        var oran = 1;
        for (i = 0; i < 10; i++) {
            for (j = 0; j < game.level; j++) {
                var mayin = Math.floor(Math.random() * 4) + 1;
                if (!satirmayin.includes(mayin)) {
                    satirmayin.push(mayin);
                }
                else {
                    j--
                }
            }
            mayinlar.push(satirmayin);
            satirmayin = [];
            oran = oran * 1.17 *game.level;
            oranlar.push(oran);
        }
        socket.emit("sendmayin", mayinlar);
        socket.emit("oranlarigoster", oranlar);
    })

    socket.on('oyna', function (oyundata) {
        x = oyundata.linenumber;
        var tiklananmayin = Number(oyundata.tiklanan);
        var mayinvarmi = false;
        for (i = 0; i < 2; i++) {
            if (mayinlar[x][i] == tiklananmayin) {
                mayinvarmi = true;
                socket.emit('crash');
            }
        }
        if (!mayinvarmi) {
            x++;
            socket.emit('continue', x);
        }
    })

    socket.on('cek',function(){
        var result = oranlar[x-2] * Number(tutar);
        console.log(x + "- " + tutar);
        socket.emit("endgame",result);
    })
});