var admin = require("firebase-admin");

var serviceAccount = require("../../pogo-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pogo-65145.firebaseio.com"
});

var db = admin.database();

var teamRef = db.ref("team_comps");
var hackpointRef = db.ref("hackpoints");

var currentDate = new Date();

teamRef.once("value", function(snapshot) {
	databaseDate = snapshot.val().Date;
	
	if (currentDate.getDate() == databaseDate) { // Hugs å skifta tilbake!!
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


