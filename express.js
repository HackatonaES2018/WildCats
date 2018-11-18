var express = require('express');
var app = express();

var request = require('request');
var querystring = require('querystring');

//client id to acess the the api and the base url used in the api
var idc = {'client_id' : '8f60318d-95ba-36e9-bd29-525501339b4d'}
var base_url = 'https://sb-api.portocred.com.br/credito-pessoal-demo/v1';

// Dictionaries to store the location of multiple steps of the process
var location_propostas  = [];
var location_documentos  = [];
var location_seleciona_ofer  = [];
var location_efetiva  = [];

// Get Location
function findLocation(callback) {

    var result = {
        location : "Brazil"
    };

    callback(result);

}

// Routes
app.get("/", function(req, res) {

    res.send("Oi Conrado!");

});

/*
route to create the proposal
need all information about the client to be in a JSON string in the body
*/
app.post("/criarProposta", function (req, res) {

    var obj = querystring.stringify(req.body);
    request({
        headers : idc ,
        url : base_url + "/propostas",
        body: obj,
        method: 'POST'
        },
        function (error, response, body) {
            if(error) {
                res.status(404);
                res.send();
            }
            else {
                if (response.statusCode == 200) {
                    res.status(200);
                    res.send(body);
                    res.end();

                    var time = Date.now();
                    findLocation(function (location) {
                        location.time = time;
                        // Adiciona no dicionario
                        location_propostas.push({
                            key: body.proposta,
                            value: location
                        });
                    })
                }
                else {
                    res.status(response.statusCode);
                    res.send(body);
                }
            }
        }
    );

});

/*
route to post the documents
need the document photo in base64 and its type to be in a JSON string in the body
*/
app.post("/postDocumento/:prop", function (req, res) {

    var obj = querystring.stringify(req.body);
    request({
        headers : idc ,
        url : base_url + "/propostas/" + req.params.prop + "/documentos" ,
        body: obj,
        method: 'POST'
        },
        function (error, response, body) {
            if(error) {
                res.status(404);
                res.send();
            }
            else {
                if (response.statusCode == 200) {
                    res.status(200);
                    res.send(body);
                    res.end();

                    var time = Data.now();
                    findLocation(function (location) {
                        location.time = time;
                        // Adiciona no dicionario
                        location_documentos.push({
                            key: req.params.prop,
                            value: location
                        });
                    })
                }
                else {
                    res.status(response.statusCode);
                    res.send(body);
                }
            }
        }
    );

});

/*
route to get the current status for the proposal informed
*/
app.get("/status/:prop", function(req, res){

    console.log(req.params.prop);

    request({
        headers : idc,
        url: base_url + "/propostas/" + req.params.prop +"/status",
        method: 'GET'
        },
        function(error, response, body){
            if(error){
                res.status(500);
                res.send();
            }
            else {
                if(response.statusCode == 200){
                    res.status(200);
                    res.send(body);
                }
                else{
                    res.status(response.statusCode);
                    res.send(response.body);
                }
            }
        }
    );
});

/*
route to select an offer (ofer) for the proposal(prop)
*/
app.put("/seleciona_ofertas/:prop/:ofer", function(req, res){
    request({
        headers : idc,
        url: base_url + "/propostas/" + req.params.prop +"/ofertas/" + req.params.ofer + "/selecao",
        method: 'PUT'
        },
        function(error, response, body){
            if(error){
                res.status(500);
                res.send();
            }
            else {
                if(response.statusCode == 200){
                    res.status(200);
                    res.send(body);
                    res.end();

                    var time = Date.now();
                    findLocation(function (location) {
                        // Adiciona no dicionario
                        location.time = time;
                        location.oferta = req.param.ofer;
                        location_seleciona_ofer.push({
                            key: req.params.prop,
                            value: location
                        });
                    })
                }
                else{
                    res.status(response.statusCode);
                    res.send(response.body);
                }
            }
        }
    );
});

/*
route to effectively finalize the proposal after all the others steps are complete
*/
app.patch("/efetiva/:prop", function(req,res){
    request({
        headers : idc,
        url: base_url + "/propostas/" + req.params.prop +"/efetivacao",
        method: 'PATCH'
        },
        function(error, response, body){
            if(error){
                res.status(500);
                res.send();
            }
            else {
                if(response.statusCode == 200){
                    res.status(200);
                    res.send(body);
                    res.end();

                    var time = Date.now();
                    findLocation(function (location) {
                        location.time = time;
                        // Adiciona no dicionario
                        location_efetiva.push({
                            key: req.params.prop,
                            value: location
                        });
                    })
                }
                else{
                    res.status(response.statusCode);
                    res.send(response.body);
                }
            }
        }
    );
});


var server = app.listen(4000, function() {
    console.log("Rodando!");
});
