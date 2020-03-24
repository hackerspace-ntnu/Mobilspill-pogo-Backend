// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

var db = admin.database();

var teamRef = db.ref("team_comps");
var hackpointRef = db.ref("hackpoints");

exports.helloWorld = functions.https.onRequest((request, response) => {
	response.send("Hello from Firebase!");
});

exports.updateDatabase = functions.https.onRequest((request, response) => {
	var teamRef = db.ref("team_comps");
	var hackpointRef = db.ref("hackpoints");

	var currentDate = new Date();

	teamRef.once("value", function(snapshot) {
        	databaseDate = snapshot.val().Date;

	        if (currentDate.getDate() != databaseDate) { // Hugs å skifta tilbake!!
        	        var totalTeams = snapshot.numChildren()-3;
                	var currentIndex = snapshot.val().current_index;
	
        	        if (currentIndex < totalTeams) {
                	        currentIndex++;
                	} else {
                        	currentIndex = 0;
                	};

                	teamRef.update({
                        	'Date' : currentDate.getDate(),
                        	'current_index' : currentIndex

                	});

			var maxMinigames = snapshot.val().minigame_amount;

			hackpointRef.once("value", function(snapshot) {
        			snapshot.forEach(function(data) {
                			hackpointRef.child(data.key).child("PlayerHighscores").set({});
        			});

				var currentHackpoint = data.val();

				var meanLat = currentHackpoint.Distribution.Mean.lat;
				var meanLng = currentHackpoint.Distribution.Mean.lng;
				var variance = currentHackpoint.Distribution.Variance;
				var newLat = Math.random()*variance + meanLat-(variance/2);
				var newLng = Math.random()*variance + meanLng-(variance/2);

				hackpointRef.child(data.key).child("Position").update({
					'lat': newLat,
					'lng': newLng
				});

				var newMinigame = Math.floor(Math.random()*maxMinigames);

				hackpointRef.child(data.key).update({
					'minigame_index': newMinigame
				});

			});	

        	};

	});
	response.send("Complete!")
});
