var tessel = require('tessel');
var ambientlib = require('ambient-attx4');

var ambient = ambientlib.use(tessel.port['A']);

var lightsOn = 0;
var talking = 0;

var lightTriggerThreshold = 0.017;
var soundTriggerThreshold = 0.0186;

var roomState = 'unk';

var sounds = [];
var lights = [];


ambient.on('ready', function () {

	console.log('Sensor initialized...');
	ambient.setLightTrigger(lightTriggerThreshold);
	ambient.setSoundTrigger(soundTriggerThreshold);

	setInterval(function () {
		ambient.getLightLevel(function(err, ldata) {
			if (err) throw err;
			ambient.getSoundLevel(function(err, sdata) {
				if (err) throw err;

				var roomChanged = 0;

				//Push light and sound data into the array for the monitor function
				lights.push(ldata);
				sounds.push(sdata);
				
				if (roomChanged) {
					updateRoomState();
				}
			})
		})
	}, 500);

	//Go through light and sound data every ten seconds, and if they have less than 
	//a certain number of activations, then mark that feature off
	setInterval(function () {

		var roomChanged = 0;

		if (talking) {
			var threshBreaks = 0;
			for (var s = 0; s <= sounds.length - 1; s++) {
				if (sounds[s] > soundTriggerThreshold) {
					threshBreaks++;
				}
			}

			if (threshBreaks < 9) {
					talking = 0
					ambient.setSoundTrigger(soundTriggerThreshold);
					console.log("People stopped talking");
					roomChanged = 1;
			}

		} 
		
		if (lightsOn) {
			var threshBreaks = 0;
			for (var l = 0; l <= lights.length - 1; l++) {
				if (lights[l] > lightTriggerThreshold) {
					threshBreaks++;
				}

			}


			if (threshBreaks < 15) {
				lightsOn = 0
				ambient.setLightTrigger(lightTriggerThreshold);
				console.log("Lights turned off.");
				roomChanged = 1; 
			}

		} 

		sounds = [];
		lights = [];

		if (roomChanged) { updateRoomState(); }
		
	}, 10000);

	ambient.on('light-trigger', function(data) {
		console.log("Lights are on: ", data);
		lightsOn = 1;
		updateRoomState();
		ambient.clearLightTrigger();
	});

	
	ambient.on('sound-trigger', function(data) {
		console.log("People started talking: ", data);
		talking = 1;
		updateRoomState();
		ambient.clearSoundTrigger();
	});
	
} );

ambient.on('error', function(err) {
	console.log(err)
});

function updateRoomState() {
	if (lightsOn && talking) {
		roomState = 'occupied';
	} else if ((lightsOn && !talking) || (!lightsOn && talking)) {
		roomState = 'uncertain';
	} else if (!lightsOn && !talking) {
		roomState = 'free';
	}

	//Insert code to send room status to web service along with device id
	console.log("The room is now", roomState, ". Tessel Device ID:", tessel.deviceId());

	var details = {
		state: roomState,
		id: tessel.deviceId().toString()
	};

	//sendUpdatetoServer(details);

}

function sendUpdatetoServer(update) {
	var http = require('http');
	var jsonText = JSON.stringify(update);

	console.log(jsonText);

	var header = {
		'Content-Type': 'application/json',
		'Content-Length': jsonText.length
	};

	var options = {
		host: '172.17.72.242',
		port: 5000,
		path: 'path/to/post',
		method: 'POST',
		headers: headers
	};

	var req = http.request(options, function(res) {
		res.setEncoding('utf-8');

		var responseString = '';

		res.on('data', function(data) {
			responseString += data;
		});

		res.on('end', function() {
			var resultObject = JSON.parse(responseString);
		});
	});

	req.on('error', function(err) {
		console.log("Error posting data.", err);
	});

	//req.write(jsonText);
	req.end();
}

