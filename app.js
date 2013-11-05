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

var errorFilesLog = [],
	__dirname = __dirname +'\\downloadedData',
	elementsToDownload = 0,
	downloadedElements = 0,
	isAllElements = false;

function consoleErrorFiles(errorData){
	console.log('Filed to load '+ errorData.length +' files because of network errors:');
	for (var i=0; i < errorData.length; i++) {
		console.log((i+1) +') File Name: '+ errorData[i].name +'\n   File Path: '+ errorData[i].path +'\n   File URL: '+ errorData[i].url);
	};
	console.log('POSSIBLE SOLUTIONS:\n\t1) Download these files manually;\n\t2) Restart download process.');
};

function saveFile( options, file ){
	 
	https.get(options, function(res){
	    var fileData = ''
		res.setEncoding('binary');

		res.on('data', function(chunk){
	        fileData += chunk;
	    });

	    res.on('end', function(){
	        fs.writeFile(__dirname + file.path +'/'+ file.name, fileData, 'binary', function(err){
	            if (err) throw err
				console.log('File: '+ file.name +' saved!');
	        	
	        	downloadedElements += 1;
	        	
	        	if(isAllElements && downloadedElements == elementsToDownload){
					console.log(downloadedElements);
					console.log(elementsToDownload);
		    		complete();
				}	        	
			});
	    });
	}).on('error', function(){
		var port= options.port ? ':'+ options.port : '',
			url = options.host + port + options.path; 

		errorFilesLog.push[{
			path: file.path,
			url:  url, 
			name: file.name
		}];
		downloadedElements += 1;
		
		if(isAllElements && downloadedElements == elementsToDownload){
			console.log(downloadedElements);
			console.log(elementsToDownload);
    		complete();
		}

	});
};

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
	if(reqParams.isLastChunk == 'true'){
		isAllElements = true;
		elementsToDownload = reqParams.filesLength;
		console.log('last element');
	}

	
	mkpath.sync(__dirname + reqParams.filesPath, 0700);

	if(reqParams.port !== 'false')
		options.port = reqParams.port;

	for(var i=0; i<reqParams.files.length; i++){
		var file = {
			path: reqParams.filesPath,
			name: reqParams.files[i].name
		};
		options.path= reqParams.files[i].path;

		saveFile(options, file);
	}
	res.header('Access-Control-Allow-Origin', req.headers.origin);
	res.end();		

});

function complete(){
	var errorData = errorFilesLog;
	errorFilesLog = [];
	elementsToDownload = 0;
	downloadedElements = 0;
	isAllElements = false;

	if(errorData.length > 0)
		consoleErrorFiles(errorData);
	else
		console.log('All files were downloaded successfully!');
}

app.get('/completeLoad', function(req, res){
	var errorData = errorFilesLog;
	errorFilesLog = [];

	res.header('Access-Control-Allow-Origin', req.headers.origin);
	if(errorData.length > 0){
		consoleErrorFiles(errorData);
		res.send(errorData);		
	}
	else{
		console.log('All files were downloaded successfully!');
		res.send();
	}
});


app.listen(911);
console.log('\nServer successfully started!\n\n \
1) Go to page "Content upload" in GSI BO.\n \
2) Copy a script from file "clientJS/consoleJS.js".\n \
3) Run this script in Console on page from point "1"');