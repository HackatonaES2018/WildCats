/*
1 - RG Frente
2 - RG Verso
6 - CNH
7 - CPF
*/

var request = require('request');
var fs = require('fs');

//the user's acess key for the api's usage
const api_key = "53C8D9A5-0C9C-494B-A4E2-DB089E73CC3B";
//the api's general-purpose endpoint 
const endpoint = "https://biodevelopment.acesso.io/Crediario/Desenvolvimento3/services/v2/CredService.svc";

/*
method responsible for securing a document's photo fidelity
*/
function secure_document(image_file, type_of_document, token){

	var encoded_image = encode_image(image_file);

	var header = {
		"X-AcessoBio-APIKEY" : api_key,
		"Authentication" : token,
		"Content-Type" : "application/json"
	};

	var body = JSON.stringify({

		"imageBase64" : encoded_image
	});

	var url = endpoint + "/document/confirmation/" + type_of_document; 

	request.post({url : url, body : body, headers : header}, function(err, res, body){
			if(err) { return console.log(err); }
			
			jObject = JSON.parse(body);
			console.log(jObject);
	});

}

/*
method responsible for generating a user token for the api's usage
*/
function ask_token(callback){

	request({

			headers : {
				
				"X-AcessoBio-APIKEY" : api_key,
				
				"X-Login" : "integracao.portocred",
				
				"X-Password" : "Integracao!2018"
			},

			uri : endpoint + "/user/authToken"

		}, function(err, res, body){

			if(err) { return console.log(err); }
			let jObject = JSON.parse(body);
			callback(jObject);
	});

}

/*
the encoder to send a document photo to the api,
translating a image to a string in base64
*/
function encode_image(file){
	var bitmap = fs.readFileSync(file);
	return new Buffer(bitmap).toString("base64");
}

/*
the token generator callback function
*/
function get_token(jObject) {
	//var tokens = [];
	//tokens.push();
	//tokens.push(jObject.GetAuthTokenResult.RenewAuthToken);
	secure_document("rg_teste.jpg", "2", jObject.GetAuthTokenResult.AuthToken);
}

//main
ask_token(get_token);