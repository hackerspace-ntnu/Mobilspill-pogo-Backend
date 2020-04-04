const admin = require("firebase-admin");

const serviceAccount = require("../../pogo-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pogo-65145.firebaseio.com"
});

const db = admin.database();

const teamCompsRef = db.ref("team_comps");
const teamHighscoresRef = db.ref("team_highscores");
const hackpointRef = db.ref("hackpoints");

const currentDate = new Date();

teamCompsRef.once("value", function(snapshot) {
	const databaseDate = snapshot.val().date;
	
	if (currentDate.getDate() == databaseDate) { // Hugs å skifta tilbake!!

		const totalTeams = snapshot.numChildren()-4;	
		var currentIndex = snapshot.val().current_index;
		
		if (currentIndex < totalTeams) {
			currentIndex++;
		} else {
			currentIndex = 0;
		};
		
		teamCompsRef.update({
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

		teamHighscoresRef.once("value", function(poop) {
			teamHighscoresRef.child("date_results").child(databaseDate).set(poop.val().current_highscores)

			teamHighscoresRef.child("current_highscores").update({
                        	0 : 0,
                        	1 : 0
                	});
		});

	};

});


