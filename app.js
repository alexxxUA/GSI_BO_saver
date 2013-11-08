var express		= require('express'),
	app			= express(),
	fs 			= require('fs'),
	mkpath		= require('mkpath'),
	mime 		= require('mime'),
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

var options = {
		key: fs.readFileSync(__dirname +'\\certificates\\private-key.pem'),
        cert: fs.readFileSync(__dirname +'\\certificates\\certificate.pem')
	},
	errorFilesLog = [],
	boContent = __dirname +'\\downloadedData',
	elementsToDownload = 0,
	downloadedElements = 0;

function complete(){
	if(errorFilesLog.length > 0)
		consoleErrorFiles(errorFilesLog);
	else
		console.log('All "'+ downloadedElements +'" files were downloaded successfully!');
	
	//Resetting variables
	errorFilesLog = [];
	elementsToDownload = 0;
	downloadedElements = 0;

};

function consoleErrorFiles(errorData){
	console.log('FILED to load '+ errorData.length +' files because of network errors:');
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
	        fs.writeFile(boContent + file.path +'/'+ file.name, fileData, 'binary', function(err){
	            if (err) throw err;
				console.log('File: '+ file.name +' saved!');
	        	
	        	downloadedElements += 1;
	        	if(downloadedElements == elementsToDownload)
		    		complete();       	
			});
	    });
	}).on('error', function(){
			errorFilesLog.push(file);
			downloadedElements += 1;
			if(downloadedElements == elementsToDownload)
	    		complete();
	});
};
app.get('/cert', function(req, res){
	res.write('Certificate STORED!');
	res.end();
});

app.get('/mkDir', function(req, res){
	if(req.query.isLastChunk == 'true')
		elementsToDownload = req.query.filesLength;

	mkpath.sync(boContent + req.query.dirPath, 0700);

	console.log('Emty dir: '+ req.query.dirPath +' created!');
	res.header('Access-Control-Allow-Origin', req.headers.origin);
	res.end();
});

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

	if(reqParams.isLastChunk == 'true')
		elementsToDownload = reqParams.filesLength;
	
	mkpath.sync(boContent + reqParams.filesPath, 0700);

	if(reqParams.port !== 'false')
		options.port = reqParams.port;
	
	for(var i=0; i<reqParams.files.length; i++){
		options.path= reqParams.files[i].path;

		var port= options.port ? ':'+ options.port : '',
			url = 'https://'+ options.host + port + options.path,
			file = {
				path: reqParams.filesPath,
				name: reqParams.files[i].name,
				url: url
			};
		saveFile(options, file);
	};

	res.header('Access-Control-Allow-Origin', req.headers.origin);
	res.end();				
});

app.get('/error404', function(req, res){
	res.end('Error 404.');
});

app.get('*', function(req, res){
	var p = __dirname + req.originalUrl;
	fs.stat(p, function(err, stat){
		if(!err && !res.getHeader('Content-Type') ){

			var total = stat.size;
				type = mime.lookup(p),
				charset = mime.charsets.lookup(type);

			res.writeHead(200, {
				'Content-Length': total,
				'Content-Type': type + (charset ? '; charset=' + charset : '')
			});
			fs.createReadStream(p).pipe(res);
		}
		else
			res.redirect('/error404');
    });
});

https.createServer(options, app).listen(911);

console.log('\nServer successfully started!\n\n \
1) Go to page "Content upload" in GSI BO.\n \
2) Copy a script from file "clientJS/consoleJS.js".\n \
3) Run this script in Console on page from point "1"');