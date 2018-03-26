var Modelo = require('../models/modelo');
var dateFormat = require('dateformat');
var schedule = require('node-schedule');

var j = schedule.scheduleJob({ hour: 0, minute: 1 }, function () {
    
    var modelo = new Modelo();

            var json = require('./dados-clima.json');

            var totalDias = iniciaModelo(json);

            var data = dateFormat(new Date(), "yyyy-mm-dd");
            console.log('Executa Modelo: ', data);
            modelo.data = data;

            for (i = 0; i < totalDias.length; i++) {
                var cont = new Object();
                cont.data = totalDias[i].data;
                cont.prec = parseInt(totalDias[i].prec);
                cont.ovos = totalDias[i].individuos.ovos;
                cont.larvas = totalDias[i].individuos.larvas;
                cont.pupas = totalDias[i].individuos.pupas;
                cont.adultos = totalDias[i].individuos.adultos;
                modelo.contagem.push(cont);
            }

            modelo.save();
});

exports.executaModelo = function (req, res) {

    var data = dateFormat(new Date(), "yyyy-mm-dd");

    Modelo.find({ data: data }, function (err, retorno) {
        if (err)
            return res.send(err);
        if (retorno.length == 0) {

            var modelo = new Modelo();

            var json = require('./dados-clima.json');

            var totalDias = iniciaModelo(json);

            modelo.data = data;

            for (i = 0; i < totalDias.length; i++) {
                var cont = new Object();
                cont.data = totalDias[i].data;
                cont.prec = parseInt(totalDias[i].prec);
                cont.ovos = totalDias[i].individuos.ovos;
                cont.larvas = totalDias[i].individuos.larvas;
                cont.pupas = totalDias[i].individuos.pupas;
                cont.adultos = totalDias[i].individuos.adultos;
                modelo.contagem.push(cont);
            }

            modelo.save(function (err) {
                if (err)
                    return res.send(err);
                return res.json({ message: 'executaModeloSuccess' });
            });

        } else {
            return res.json({ message: 'rodadaJaExecutada', data: data, modelo: retorno.length });
        }

    });

};

exports.deletaModelo = function (req, res) {

    var data = req.params.data;

    Modelo.find({ data: data }, function (err, modelo) {
        if (err)
            return res.send(err);
        if (modelo.length == 0) {
            return res.json({ message: 'modeloNotFound' });
        } else {
            for (i = 0; i < modelo.length; i++) {
                Modelo.remove({ _id: modelo[i]._id }, function (err) {
                    if (err)
                        return res.send(err);

                    res.json({ message: 'deleteModeloSuccess' });
                });
            }

        }

    });

};

exports.buscaResultadoData = function (req, res) {
    var data = req.params.data;

    Modelo.find({ data: data }, function (err, modelo) {
        if (err)
            return res.send(err);
        if (modelo.length == 0) {
            return res.json({ message: 'modeloNotFound' });
        } else {

            res.json({ modelo: modelo });

        }

    });
};

exports.buscaResultadoDia = function (req, res) {

    var data = dateFormat(new Date(), "yyyy-mm-dd");

    Modelo.find({ data: data }, function (err, modelo) {
        if (err)
            return res.send(err);
        if (modelo.length == 0) {
            return res.json({ message: 'modeloNotFound' });
        } else {

            res.json({ modelo: modelo });

        }

    });
};

var historico = 7;

var taxaMortalidadeOvo = 38;
var taxaMortalidadeLarva = 8;
var taxaMortalidadePupa = 6;
var taxaMortalidadeAdulto = 2;

//limite de idade para mudanÃ§a de fase
var idadeLimiteOvo = 4;
var idadeLimiteLarva = 10;
var idadeLimitePupa = 12;
var idadeMorte = 38;

var totalDias = new Array();

var individuosNovos = [
    new Individuo(2, 2, 0),
    new Individuo(1, 1, 0),
    new Individuo(10, 4, 2),
    new Individuo(11, 4, 3),
    new Individuo(8, 4, 0),
    new Individuo(3, 2, 0),
    new Individuo(5, 3, 0),
    new Individuo(30, 3, 1),
    new Individuo(32, 4, 3),
    new Individuo(26, 4, 0)
];

function Individuo(idade, fase, procuraHumano) {
    this.idade = idade;
    this.fase = fase;
    this.procuraHumano = procuraHumano;
}

var simulacao = new Array();

function iniciaModelo(dadosClima) {

    //percorre o vetor de dados do clima
    for (i = 1; i < dadosClima.length; i++) {
        //salva campo  "med" com a média da temperatura
        dadosClima[i].precbk = dadosClima[i].prec;
        dadosClima[i].med = (dadosClima[i].tMax + dadosClima[i].tMin) / 2;
        if (i > 0) {
            //salva campo "prec" com a precipitação acumulada dos dias anteriores
            dadosClima[i].prec = dadosClima[i].prec + (dadosClima[i - 1].prec - (dadosClima[i - 1].prec * 0.1));
        }
    }
    simulacao.push(JSON.parse(JSON.stringify(individuosNovos)));
    //começa a executar a partir do décimo dia de dados do clima

    for (dia = historico; dia < dadosClima.length; dia++) {

        var retCrescer = crescer(dia, JSON.parse(JSON.stringify(individuosNovos)), dadosClima);
        //console.log("retCrescer " , retCrescer)

        var retCriar = criar(dia, JSON.parse(JSON.stringify(retCrescer)), dadosClima);
        //console.log("retCriar " , retCriar)

        var retMorrer = morrer(JSON.parse(JSON.stringify(retCriar)));
        //console.log("retMorrer " , retMorrer)

        individuosNovos = JSON.parse(JSON.stringify(retMorrer))
        simulacao.push(JSON.parse(JSON.stringify(retMorrer)))

        var ovos = 0;
        var larvas = 0;
        var pupas = 0;
        var adultos = 0;

        for (j = 0; j < individuosNovos.length; j++) {
            if (individuosNovos[j].fase == 1) {
                ovos++;
            }
            if (individuosNovos[j].fase == 2) {
                larvas++;
            }
            if (individuosNovos[j].fase == 3) {
                pupas++;
            }
            if (individuosNovos[j].fase == 4) {
                adultos++;
            }
        }

        totalDias.push({
            data: dadosClima[dia].data,
            prec: dadosClima[dia].precbk,
            individuos: {
                ovos: ovos,
                larvas: larvas,
                pupas: pupas,
                adultos: adultos
            }
        })
    }
    return totalDias;
}

function temperaturaMedia(dia, dadosClima) {
    //soma a temperatura dos 3 ultimos dias
    var acumulada = dadosClima[dia - 3].med + dadosClima[dia - 2].med + dadosClima[dia - 1].med;
    //retorna a mádia
    return acumulada / 3;
}

function crescer(dia, individuos, dadosClima) {
    //laço pelo percorrendo todos os indivíduos
    for (i = 0; i < individuos.length; i++) {
        //soma 1 dia a idade
        individuos[i].idade += 1;
        //testa se fase individuo é ovo e se a idade passou da idade de ovo e a precipitação acumulada for >= a 30mm
        if (individuos[i].fase == 1 && individuos[i].idade > idadeLimiteOvo && dadosClima[dia].prec >= 30) {
            //passa individuo para proxima fase
            individuos[i].fase = 2;
        }
        //testa se fase individuo é larva e se a idade passou da idade limite da larva
        if (individuos[i].fase == 2 && individuos[i].idade > idadeLimiteLarva) {
            //passa individuo para proxima fase
            individuos[i].fase = 3;
        }
        //testa se fase individuo é pupa e se a idade passou da idade limite da larva
        if (individuos[i].fase == 3 && individuos[i].idade > idadeLimitePupa) {
            //passa  individuo para proxima fase
            individuos[i].fase = 4;
        }
        //testa se fase individuo é adulto e se procura humano for < que 3 dias
        if (individuos[i].fase == 4 && individuos[i].procuraHumano < 3) {
            //soma 1 dia
            individuos[i].procuraHumano += 1;
        }
    }

    return individuos;
}

function criar(dia, individuos, dadosClima) {
    //salva o tamanho do vetor de individuos
    var numIndividuos = individuos.length;
    //laço pelo percorrendo todos os indivíduos
    for (i = 0; i < numIndividuos; i++) {
        //testa se fase individuo é adulto
        if (individuos[i].fase == 4) {
            //se encontrou humano
            if (individuos[i].procuraHumano == 3) {
                //calcula temperatura média dos ultimos 3 dias
                var tempMedia = temperaturaMedia(dia, dadosClima);
                //testa temperatura media
                if (tempMedia < 18 || tempMedia > 34) {
                    //se a condição for verdadeira cria 10 individuos novos
                    for (j = 0; j < 10; j++) {
                        //adiciona ao array de individuos
                        individuos.push(new Individuo(0, 1, 0));
                    }
                }
                //testa temperatura media
                if (tempMedia >= 18 && tempMedia <= 21) {
                    //se a condição for verdadeira cria 20 individuos novos
                    for (j = 0; j < 20; j++) {
                        //adiciona ao array de individuos
                        individuos.push(new Individuo(0, 1, 0));
                    }
                }
                //testa temperatura media
                if (tempMedia >= 22 && tempMedia <= 25) {
                    //se a condição for verdadeira cria 30 individuos novos
                    for (j = 0; j < 30; j++) {
                        //adiciona ao array de individuos
                        individuos.push(new Individuo(0, 1, 0));
                    }
                }
                //testa temperatura media
                if (tempMedia == 26) {
                    //se a condição for verdadeira cria 40 individuos novos
                    for (j = 0; j < 40; j++) {
                        //adiciona ao array de individuos
                        individuos.push(new Individuo(0, 1, 0));
                    }
                }
                //testa temperatura media
                if (tempMedia > 26 && tempMedia < 30) {
                    //se a condição for verdadeira cria 50 individuos novos
                    for (j = 0; j < 50; j++) {
                        //adiciona ao array de individuos
                        individuos.push(new Individuo(0, 1, 0));
                    }
                }
                //testa temperatura media
                if (tempMedia >= 30 && tempMedia <= 34) {
                    //se a condição for verdadeira cria 30 individuos novos
                    for (j = 0; j < 30; j++) {
                        //adiciona ao array de individuos
                        individuos.push(new Individuo(0, 1, 0));
                    }
                }
                //zera o numero de dias que encontrou humano
                individuos[i].procuraHumano = 0;
            }
        }
    }

    return individuos;
}

function morrer(individuos) {
    //cria um array temporario para individuos
    var individuosTemp = new Array();
    //percore o array de individuos
    for (i = 0; i < individuos.length; i++) {
        //testa a fase a a probabilidade de morte do ovo
        if (individuos[i].fase == 1 && (Math.floor((Math.random() * 100) + 1) > taxaMortalidadeOvo)) {
            //se nao morre o individuo e adicionado no vetor temporario
            individuosTemp.push(individuos[i]);
        }
        //testa a fase a a probabilidade de morte da larva e se idade menor que a morte da mesma
        if (individuos[i].fase == 2 && (Math.floor((Math.random() * 100) + 1) > taxaMortalidadeLarva)) {
            //se não morre o individuo e adicionado no vetor temporario
            individuosTemp.push(individuos[i]);
        }
        //testa a fase a a probabilidade de morte da pupa e se idade menor que a morte da mesma
        if (individuos[i].fase == 3 && (Math.floor((Math.random() * 100) + 1) > taxaMortalidadePupa)) {
            //se não morre o individuo e adicionado no vetor temporario
            individuosTemp.push(individuos[i]);
        }
        //testa a fase a a probabilidade de morte do adulto e se idade menor que a morte do mesmo
        if (individuos[i].fase == 4 && (Math.floor((Math.random() * 100) + 1) > taxaMortalidadeAdulto) && individuos[i].idade <= idadeMorte) {
            //se não morre o individuo e adicionado no vetor temporario
            individuosTemp.push(individuos[i]);
        }
    }
    //seta individuos com os que sobreviveram
    //individuos = individuosTemp;

    return individuosTemp;
}



