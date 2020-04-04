// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.database();

const teamRef = db.ref("team_comps");
const hackpointRef = db.ref("hackpoints");

exports.helloWorld = functions.https.onRequest((request, response) => {
	response.send("Hello from Firebase!");
});

exports.updateDatabase = functions.https.onRequest((request, response) => {
	const teamRef = db.ref("team_comps");
	const hackpointRef = db.ref("hackpoints");

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

        	};

	});
	response.send("Complete!")
});

exports.onHighscoreChange = functions.database.ref('/hackpoints/{hackId}/PlayerHighscores/{userId}/')
    .onWrite((change, context) => {
		const beforeValue = change.before.exists() ? change.before.val() : 0;
		const afterValue = change.after.exists() ? change.after.val() : 0;
		const userId = change.after.key;

		const teamIndexRef = db.ref("team_index").child(userId);
		const teamIndex = teamIndexRef.exists() ? teamIndexRef.val() : 0;
		
		const hackpointTeamScoreRef = change.parent.parent.child("TeamHighscores").child(teamIndex);
		const previousTotalScore = hackpointTeamScoreRef.exists() ? hackpointTeamScoreRef.val() : 0;
		const newScore = previousTotalScore + beforeValue - afterValue;

		return hackpointTeamScoreRef.set(newScore);
});

