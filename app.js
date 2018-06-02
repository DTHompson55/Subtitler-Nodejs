'use strict';
// express
var dotenv = require('dotenv').config();
var express = require('express');
var app = express();
var port = process.env.SPEECH_TO_TEXT_PORT || 8888;
var fileName = "";
var path = __dirname + '/public/';
var uploadPath = path+"uploads/";
var request = require('request');
var fs = require('fs');


var envError = false;
if ( process.env.SPEECH_TO_TEXT_USERNAME == null || process.env.SPEECH_TO_TEXT_USERNAME === "" ){
	console.log("Please specify SPEECH_TO_TEXT_USERNAME in .env file. See Watson Speech to Text Credentials documentation.");
	envError = true;
}

if ( process.env.SPEECH_TO_TEXT_PASSWORD == null || process.env.SPEECH_TO_TEXT_PASSWORD === "" ){
	console.log("Please specify SPEECH_TO_TEXT_PASSWORD in .env file. See Watson Speech to Text Credentials documentation.");
	envError = true;
}

var video_to_mp3 = require('./Video_to_MP3.js').video_to_mp3;
var mp3_to_stt_stream = require('./MP3_to_STT_Stream.js').mp3_to_stt_stream;
var stt_stream_to_cc = require('./STT_to_CC_Format.js').toClosedCaption;


var cc_style = {
		verbose:false,
		saveInput:true,
		timePerLine:2.5,
		suppressHesitations:true,
		suppressSpeakerLabels:false,
		outputStyle:'VTT'
};

var stt_params = {
	  model: 'en-US_BroadbandModel',
	  content_type: 'audio/mp3',
	  'interim_results': false,
	  'max_alternatives': 3,
	  'word_confidence': true,
	  timestamps: true,
	  objectMode: true,
	  readableObjectMode: true,
    speaker_labels: true,
    smart_formatting: true 
	   };


var bodyParser = require("body-parser");
// create a new express server
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(bodyParser.raw({type: function(){return true;}, limit: '5mb'}));

// get the fileupload capabilities
var multer = require('multer');
var upload = multer({ dest: uploadPath });

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));


// start server on the specified port and binding host
var server = app.listen(port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + port);  
});


var io = require('socket.io').listen(server);

io.on('connection', function(client){
	console.log("Socket Client Connected");
    client.on('disconnect', function() {
		console.log("Socket Client Disconnected");
    });
});

/**
 * var count = 0; setInterval(function(){ count+=1; if (io) {
 * io.emit('status',count); console.log("emitted ",count); } else {
 * console.log("count ",count); }} , 1000);
 */

function unlinkAllFilesBut(keep){
	
	keep = keep || "XXX";
	
	fs.readdir(uploadPath, (err, files) => {
		if (err) {
			console.log("READ DIR Error",err);
			return;
		}
	    files.forEach(file => {
		   if (file.startsWith('.') || file.startsWith(keep) || file.startsWith("blank")){
		    } else {
		    	fs.unlinkSync(uploadPath+file);
		    	console.log("unlinked uploads/"+file);
		    }
		  });
	  }); 
}


var ccData;
unlinkAllFilesBut();

function saveCCdata(content){
	console.log("Savecc data ");
	  fs.open(uploadPath+appState.filename+'.vtt', 'a+', (err, fd) => {
		  if (err) {
		    if (err.code === 'EEXIST') {
		      console.error(appState.filename+'.vtt'+' already exists');
		      return;
		    }
		    else {console.error("FS OPEN Error", err)}
		    throw err;
		  }
		  fs.write(fd, content, function(err, written, string){
			  ccData = string;
			  if (err) {
				  console.error('Error on write',err);
				  return;
			  }
			  fs.close(fd, function(err){
				  if (err) {
					  console.error('Error on close',err);
					  return;
				  }  
				  console.log("Closed vtt file");
				  io.emit('goToStep4');
			  });
		  });
		});
}


function saveRawData(content){
	  fs.open(uploadPath+appState.filename+'.raw', 'a+', (err, fd) => {
		  if (err) {
		    if (err.code === 'EEXIST') {
		      console.error(appState.filename+'.raw'+' already exists');
		      return;
		    }
		    else {console.error("FS OPEN Error", err)}
		    throw err;
		  }
		  fs.write(fd, JSON.stringify(content), function(err, written, string){
			  if (err) {
				  console.error('Error on write',err);
				  return;
			  }
			  fs.close(fd, function(err){
				  if (err) {
					  console.error('Error on close',err);
					  return;
				  }  
				  console.log("Closed raw file");
			  });
		  });
		});
}




var appState = {filename: "e9150e7f694f8ccdd4b9afeca8306556", filesizeMB: 0};


app.post('/api/getFilename', function (req, res) {
// console.log("getFilename",appState);
	res.send(appState);
});

app.post('/api/getCCData', function (req, res) {
// console.log("Calling getCCData -->",ccData);
	res.send(ccData);
});

app.post('/api/updateCCData', function (req, res) {
	
	// console.log("Updating CC data ",req.body.data);
	if (req.body.data)		
	saveCCdata(req.body.data);
});


app.post('/api/finishCC', function (req, res) {

// console.log("Finishing CC data ",req.body.data);
    if (req.body.data)
	saveCCdata(req.body.data);
	res.redirect('../step5.html');

});


app.post('/step1', function (req, res) {
// console.log("Index --> Step 1");
	res.redirect('step1.html');
});


app.post('/uploadmp4', upload.single('mp4'), function (req, res, next) {
	//
	// Fhow does appstate filename get used?
	//
	appState.filename = req.file.filename;
	
// console.log("Uploading file "+req.file.filename);
	
	const fs = require("fs"); // Load the filesystem module
	const stats = fs.statSync(uploadPath+req.file.filename);
	const fileSizeInBytes = stats.size
	appState.filesizeMB = fileSizeInBytes / 1000000.0;
// console.log(appState);
	
	unlinkAllFilesBut(req.file.filename);
	
	res.redirect('step2.html');
});

app.post('/submitCCRequest', function (req, res) {

	console.log("at Submit CC Request1 ",req.body);
	console.log("at Submit CC Request2 ",stt_params);
	console.log("at Submit CC Request3 ",cc_style);
	
	
	stt_params.language =  req.body.language;
	stt_params.speaker_labels =  req.body.speakers === 'true';
	stt_params.model =  req.body.language+'_'+req.body.model;
	stt_params.smart_formatting = req.body.smartformatting  === 'true';
	
	cc_style.timePerLine =  req.body.timePerLine;
	cc_style.outputStyle =  req.body.outputStyle;
	cc_style.hesitations =  req.body.hesitations  === 'true';
	cc_style.labels =  req.body.labels  === 'true';
	cc_style.verbose = req.body.verbose  === 'true';
	
	console.log("at Submit CC Request4 ",stt_params);
	console.log("at Submit CC Request5 ",cc_style);
	
	
	video_to_mp3(appState.filename, function(err, mp3_filename){
		if (!err){
			mp3_to_stt_stream(mp3_filename, stt_params, function(err, msg_type, stt){
			if (!err){
				if (msg_type === "MESSAGE" ){
					saveRawData(stt);
					io.emit('vstatus',msg_type);
					saveCCdata(stt_stream_to_cc(stt,cc_style));
				} else { 
				if (msg_type === "ERROR") {
					io.emit('status',msg_type);
				} else {
					io.emit('astatus',msg_type);
				}
			}} else {
				io.emit('status',err);
				console.log("Trouble with STT Stream ",err);
			}
			});

		} else {
			console.log("Trouble with convert to mp3 ",err);
			console.log("Emitted error status ",err, mp3_filename);
			io.emit('status',err);
			throw (err);
		}
	});
	
	res.sendFile(path+"waiting.html");
});

app.post('/CC', function (req, res) {
// console.log("requestCC");
	res.redirect('step3.html');
});

app.post('/requestCCback', function (req, res) {
// console.log("requestCCback");
	res.status(204).end();
});

app.post('/CCcomplete', function (req, res) {
// console.log("CCcomplete");
	res.status(204).end();
});

app.post('/CCreload', function (req, res) {
// console.log("CCreload");
	res.status(204).end();
});
