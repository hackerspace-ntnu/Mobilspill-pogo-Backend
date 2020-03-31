const admin = require("firebase-admin");

const serviceAccount = require("../../pogo-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pogo-65145.firebaseio.com"
});

const db = admin.database();

const teamRef = db.ref("team_comps");
const hackpointRef = db.ref("hackpoints");

const currentDate = new Date();

teamRef.once("value", function(snapshot) {
	databaseDate = snapshot.val().Date;
	
	if (currentDate.getDate() == databaseDate) { // Hugs å skifta tilbake!!

		const totalTeams = snapshot.numChildren()-4;	
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
		
		const maxMinigames = snapshot.val().minigame_amount;
/* 
		// Vil implementera at kvart hacpoint har forskjellig minigame, 
		// men då treng me fleire minigames og hackpoints
		
		var minigameList = [];
		
		for (let x = 0; x < maxMinigames; x++){
			minigameList.push(x)
		};

		console.table(minigameList);
*/		
		hackpointRef.once("value", function(snap) {
			snap.forEach(function(data) {
				hackpointRef.child(data.key).child("PlayerHighscores").set({});

				const currentHackpoint = data.val();

				const meanLat = currentHackpoint.Distribution.Mean.lat;
				const meanLng = currentHackpoint.Distribution.Mean.lng;
				const variance = currentHackpoint.Distribution.Variance;
				const newLat = Math.random()*variance + meanLat-(variance/2);
				const newLng = Math.random()*variance + meanLng-(variance/2);

				hackpointRef.child(data.key).child("Position").update({
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


