// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.database();

const teamRef = db.ref("team_comps");
const teamHighscoresRef = db.ref("team_highscores");
const hackpointRef = db.ref("hackpoints");
const teamRef = db.ref("team_comps");

exports.helloWorld = functions.https.onRequest((request, response) => {
	response.send("Hello from Firebase!");
});

exports.updateDatabase = functions.https.onRequest((request, response) => {

	const currentDate = new Date();

	teamRef.once("value", function(snapshot) {
        	const databaseDate = snapshot.val().date;

	        if (currentDate.getDate() != databaseDate) { // Hugs å skifta tilbake!!
        	        const totalTeams = snapshot.numChildren()-3;
                	var currentIndex = snapshot.val().current_index;
	
        	        if (currentIndex < totalTeams) {
                	        currentIndex++;
                	} else {
                        	currentIndex = 0;
                	};

                	teamRef.update({
                        	'date' : currentDate.getDate(),
                        	'current_index' : currentIndex
                	});

			const maxMinigames = snapshot.val().minigame_amount;

			hackpointRef.once("value", function(snap) {
        			snap.forEach(function(data) {
                			hackpointRef.child(data.key).child("player_highscores").set({});

					hackpointRef.child(data.key).child("team_highscores").update({
						0 : 0,
						1 : 0
					});

					const currentHackpoint = data.val();

					const meanLat = currentHackpoint.distribution.mean.lat;
					const meanLng = currentHackpoint.distribution.mean.lng;
					const variance = currentHackpoint.distribution.variance;
					const newLat = Math.random()*variance + meanLat-(variance/2);
					const newLng = Math.random()*variance + meanLng-(variance/2);

					hackpointRef.child(data.key).child("position").update({
						'lat': newLat,
						'lng': newLng
					});

					const newMinigame = Math.floor(Math.random()*maxMinigames);

					hackpointRef.child(data.key).update({
						'minigame_index': newMinigame
					});

				});

			});

			teamHighscoresRef.once("value", function(poop) {
                        	teamHighscoresRef.child("date_results").child(databaseDate)
					.set(poop.val().current_highscores);

                        	teamHighscoresRef.child("current_highscores").update({
                                	0 : 0,
                                	1 : 0
				});
			});

			db.ref("team_index").set({});

        	};

	});
	response.send("Complete!")
});

exports.onHighscoreChange = functions.database.ref('/hackpoints/{hackId}/player_highscores/{userId}/')
	.onWrite((change, context) => {
		if (context.authType == 'ADMIN') {
			console.log("Admin changed points, not updating.");
			return true;
		};

		const beforeValue = change.before.exists() ? change.before.val() : 0;
		const afterValue = change.after.exists() ? change.after.val() : 0;
		
		const diff = afterValue - beforeValue;
		
		const hackId = context.params.hackId;
		const userId = context.params.userId;
		
		const teamIndexRef = db.ref("team_index").child(userId);

		teamIndexRef.once("value", function(snapshot) {
			const teamIndex = (snapshot.val() || 0);

			const hackpointTeamScoreRef = db.ref('/hackpoints').child(hackId)
				.child('team_highscores').child(teamIndex);

			const highscoresRef = db.ref("team_highscores/current_highscores")
				.child(teamIndex);

			highscoresRef.transaction(function(currentValue) {
				return (currentValue || 0) + diff;
			});

			hackpointTeamScoreRef.transaction(function(snap) {
				return (snap || 0) + diff;
			});
			
		});
		
		return true;

		});
