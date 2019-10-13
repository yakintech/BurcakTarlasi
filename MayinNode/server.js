var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const Pool = require('pg').Pool
const db = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'MayinTarlasiDB',
    password: '123',
    port: 5432,
});


server.listen(3001, function () {
    console.log('listening on *:3001');
});
var x;
var tutar;
io.on('connection', function (socket) {
    var mayinlar = [];
    var oranlar = [];
    var activegameid;
    socket.on('startgame', function (game) {
        tutar = game.tutar;


        var kullaniciparadurum = 0;

        db.query('select totalpoint from public."User" where id = 1', (error, results) => {
            if (error) {

            }
            else {
                var total = results.rows[0].totalpoint;
                if (Number(tutar) <= Number(total)) {
                    kullaniciparadurum = 1;
                }
                if(kullaniciparadurum == 1)
                {
                    db.query(`INSERT INTO public."Game"(adddate, levelid) VALUES ( now(), ` + game.level + `) RETURNING id;`, (error, results) => {
                        if (error) {
            
                        }
                        else {
                            activegameid = results.rows[0].id;
                        }
                    });
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
                        oran = oran * 1.17 * game.level;
                        oranlar.push(oran);
                    }
            
            
                    db.query('update public."User" set totalpoint = totalpoint -' + tutar + 'where id = 1', (error, results) => {
                        if (error) {
            
                        }
                        else {
                            console.log("Kullanıcı parası bende!!");
                        }
            
                    });
            
                    socket.emit("sendmayin", mayinlar);
                    socket.emit("oranlarigoster", oranlar);
            
                }
                else{
                    socket.emit("parayok");
                }
            }
        });
        console.log(kullaniciparadurum)
 
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

    socket.on('cek', function () {
        var result = oranlar[x - 2] * Number(tutar);
        socket.emit("endgame", result);
        //gamuser tablosuna insert işlemi yap. userid sallayabilirsin
        db.query(`INSERT INTO public."GameUser"( gameid, point, bet,userid)
           VALUES (`+ activegameid + `, ` + oranlar[x - 2] + `, ` + tutar + `,1);`, (error, results) => {
            if (error) {

            }
            else {
                db.query('update public."User" set totalpoint = totalpoint +' + result + 'where id = 1', (error, results) => {
                    if (error) {

                    }
                    else {
                        console.log("Kullanıcı parası güncellendi!");
                    }

                });
            }
        });


    })
});