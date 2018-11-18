var request = require('request');

//the user's access key for the api's usage
const secret_key = "c0447be4cc7c1b53d9c331667fe2850f";
//initial url concatenated with the client's ip which returns the "location" json object
const url_ip = "http://api.ipapi.com/api/";


/*
method responsible for returning the location
from a parametrized ip (json format).
*/
function get_location(ip, callback){

	var query = {
		"access_key" : secret_key,
		"output" : "json",
		"language" : "pt-br"
	}

	request({

		uri : url_ip + ip,
		qs : query

	}, function(err, res, body){
		if(err){ return console.log(err); }
		jObject = JSON.parse(body);
		if (callback) callback(jObject);
	});

}

module.exports = { getLocation : get_location }
