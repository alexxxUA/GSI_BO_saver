var express		= require('express'),
	app			= express(),
	fs 			= require('fs'),
	mkpath		= require('mkpath')
	https = require('https'),
	http = require('http');

//POST
app.use(express.bodyParser());

//Increase pool size
https.globalAgent.maxSockets = 100;

//Handle errors
app.use(function (error, req, res, next) {
  if (!error) {
    next();
  } else {
    console.error(error.stack);
    res.send(500);
  }
});

function saveFile(options, filePath, fileName){
	https.get(options, function(res){
	    var fileData = ''
		res.setEncoding('binary');

		res.on('error', function(){
			console.log('----------------------------------------\n \
				FILED to load file: "'+ fileName +'" From path: '+ filePath);
		});

	    res.on('data', function(chunk){
	        fileData += chunk;
	    });

	    res.on('end', function(){
	        fs.writeFile(__dirname + filePath +'/'+ fileName, fileData, 'binary', function(err){
	            if (err) throw err
	            console.log('File: '+ fileName +' saved!');
	        });
	    });
	}).on('error', function(){
		console.log('----------------------------------------\n \
			FILED to load file: "'+ fileName +'" From path: '+ filePath);
	});
}

app.get('/saveFile', function(req, res){
	var reqParams = req.query,
		options = {	
			host: reqParams.host,
			agent : false,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
				'Access-Control-Max-Age': '1000',
				'Access-Control-Allow-Headers': 'Content-Type'
			}
		};

	if(reqParams.port !== 'false')
		options.port = reqParams.port;
		
	mkpath.sync(__dirname + reqParams.filesPath, 0700);

	for(var i=0; i<reqParams.files.length; i++){
		options.path = reqParams.files[i].path;
		var fileName = reqParams.files[i].name;

		saveFile(options, reqParams.filesPath, fileName);
	}
	res.writeHead(200, options.headers);

	res.end('SAVED');	
});

// app.get('/completeLoad', function(req, res){
// 	console.log('Completed loading files!');
// });

/*EXAMPLE of object which should be sended to "http:localhost:911/saveFileTest"
var reqParams = {
    host: 'spxna-secdevapp02.us.gspt.net',
  	port: 1444,
  	filesPath: '/Product Images/BraFitGuide/InTheNews',
  	files: [
		{
			name: 'size-charts.css',
			path: '/gsi/static/WFS/SPXNA-Site/-/SPXNA/en_US/css/size-charts.css'
		},
		{
			name: 'bra-fit-guide.css',
			path: '/gsi/static/WFS/SPXNA-Site/-/SPXNA/en_US/css/bra-fit-guide.css'
		}
	]
};
End of example*/

app.listen(911);
console.log('\nServer successfully started!\n\n \
1) Go to page "Content upload" in GSI BO.\n \
2) Copy a script from file "clientJS/consoleJS.js".\n \
3) Run this script in Console on page from point "1"');