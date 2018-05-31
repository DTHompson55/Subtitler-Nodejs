//
// takes a video in, creates an MP3 file.
// takes the MP3 and feeds it to watson
//

require('dotenv').config();
var muteMode = true;
var style = {};

process.env.PATH = process.env.PATH+":"+process.env.FFMPEG_PATH;

var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');

var fs = require('fs');

var speech_to_text= new SpeechToTextV1 ({
	  username: process.env.SPEECH_TO_TEXT_USERNAME,
	  password: process.env.SPEECH_TO_TEXT_PASSWORD
	});

//
//
//
function mp3_to_stt_stream(filename, params, callback){

	if (params == null){
		params = {
	  model: 'en-US_BroadbandModel',
	  content_type: 'audio/mp3',
	  'interim_results': true,
	  'max_alternatives': 3,
	  'word_confidence': true,
	  timestamps: true,
	  objectMode: true,
	  readableObjectMode: true,
	  speaker_labels: true,
	  smart_formatting: true 
	  };
	  console.log("Using default stt params", params);
	}

	
	
//Create the stream.
var recognizeStream = speech_to_text.createRecognizeStream(params);

// Pipe in the audio.
//fs.createReadStream('public/uploads/82b8d710656357c899b55eec159d1efa.mp3').pipe(recognizeStream);
fs.createReadStream(filename).pipe(recognizeStream);

// Pipe out the transcription to a file.
//recognizeStream.pipe(fs.createWriteStream('public/uploads/transcription.txt'));

// Get strings instead of buffers from 'data' events.
recognizeStream.setEncoding('utf8');

// Listen for events.
recognizeStream.on('message', function(event) { onEvent('MESSAGE:', event); });
recognizeStream.on('error', function(event) { onEvent('Error:', event); });
recognizeStream.on('close', function(event) { onEvent('Close:', event); });
recognizeStream.on('end', function(event) { onEvent('Close:', event); });


// Displays events on the console.
function onEvent(name, event) {
  
	//
	// implement end, close and error message handlers here too
	//
	
  if ( name === "MESSAGE:"){
	  var data = event.data;
  var d = JSON.parse(data);
  var newMsg = {payload : JSON.parse(data)};
  if (d) {
    if (d.error) {
    	console.log("Data Error",d.error);
      // Force Expiry of Token, as that is the only Error
      // response from the service that we have seen.
      // report the error for verbose testing

    	//
    	// None of this error recovery is implemented
    	// Let's hope it doesn't happen soon
    	//
    	callback(d.error,name,d); // send it up to be formatted
    	    	
    	if (!muteMode) {
        payloadutils.reportError(node,newMsg,d.error);
      }

      token = null;
      getToken(determineService())
        .then(() => {
          return;
        });
    } else if (d && d.state && 'listening' === d.state) {
      socketListening = true;
      // Added for verbose testing
//      if (!discardMode) {
//    	     console.log(" node.send(newMsg); 2");
//      }
      //resolve();
    } else if (d && d.results ){
    	callback(null,name,d); // send it up to be formatted
    }
  }
  }
  else{
	  callback(null,name,null); // send it up to be formatted
  }
  
   
//  console.log(name, event);
//  console.log(name, JSON.stringify(event, null, 2));  
  };

}

module.exports = {mp3_to_stt_stream: mp3_to_stt_stream};

	

