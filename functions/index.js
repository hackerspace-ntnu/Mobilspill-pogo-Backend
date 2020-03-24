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

			// Legg til endring av hackpointane sine posisjonar og
			hackpointRef.once("value", function(snapshot) {
        			snapshot.forEach(function(data) {
                			hackpointRef.child(data.key).child("PlayerHighscores").set({});
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

