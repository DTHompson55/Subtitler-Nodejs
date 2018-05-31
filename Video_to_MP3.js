//
// takes a video in, creates an MP3 file.
//
var ffmpeg = require('ffmpeg');
require('dotenv').config();

var video_to_mp3 = function(filename, callback){
process.env.PATH = process.env.PATH + ":" + process.env.FFMPEG_PATH;

try {
	new ffmpeg('./public/uploads/' + filename, function(err, video) {
		if (!err) {
			video.fnExtractSoundToMP3('./public/uploads/' + filename + '.mp3', callback);
		} else {
			callback(error);
		}
	});
} catch (e) {
	console.log("exception ",e);
	console.log("exception code ",e.code);
	console.log("exception msg",e.msg);
}
};

var tester = function(){
	console.log("TESTER");
	video_to_mp3("82b8d710656357c899b55eec159d1efa",console.log);
}

//tester();
module.exports = {video_to_mp3: video_to_mp3};

