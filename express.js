var locationModule = require('./location.js')
var express = require('express');
var app = express();

var request = require('request');
var querystring = require('querystring');

//client id to acess the the api and the base url used in the api
var idc = {'client_id' : '8f60318d-95ba-36e9-bd29-525501339b4d'}
var base_url = 'https://sb-api.portocred.com.br/credito-pessoal-demo/v1';

// Dictionaries to store the location of multiple steps of the process
var location_propostas  = {};
var location_documentos  = {};
var location_seleciona_ofer  = {};
var location_efetiva  = {};

// Routes
var ip = "1.1.1.1";

/*
route to generate the location report
returns objects with the location of each step of the flow for a given key
*/
app.get("/report", function(req, res){

    var report = {}
    for(var key in location_propostas){

        var item = {};

        item.location_propostas = location_propostas[key];
        item.location_documents = location_documentos[key];
        item.location_seleciona_ofer = location_seleciona_ofer[key];
        item.location_efetiva = location_efetiva[key]; 
        
        report[key] = item;

    }

    res.send(JSON.stringify(report));
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
                if (response.statusCode == 201) {
                    res.status(200);
                    res.send(body);
                    res.end();

                    var time = Date.now();
                    var body_obj = JSON.parse(body);

                    locationModule.getLocation(ip, function (location) {
                        location.time = time;
                        location_propostas[body_obj.proposta + ""] = {value: location};
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
                if (response.statusCode == 201) {
                    res.status(200);
                    res.send(body);
                    res.end();

                    var time = Date.now();

                    locationModule.getLocation(ip, function (location) {
                        location.time = time;
                        // Adiciona no dicionario
                        location_documentos[req.params.prop] = {value: location};
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
                    locationModule.getLocation(ip, function (location) {
                        // Adiciona no dicionario
                        location.time = time;
                        location.oferta = req.param.ofer;
                        location_seleciona_ofer[req.params.prop] = {value: location};
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
                    locationModule.getLocation(ip, function (location) {
                        location.time = time;
                        location_efetiva[req.params.prop] = {value: location};
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
