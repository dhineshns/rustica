var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;


/* GET home page. */
router.post('/createEvent', function(req, res, next) {
	inputParams = req.query;
	var newEventName = inputParams.eventName
	mongo.connect('mongodb://localhost:27017/rustica', function(err, db){
		if(err){
			console.error("err.message")
		}else{
			var collection = db.collection('events');
			collection.insert({
				eventName : newEventName
			}, function(err, objectId){
				res.send({
				eventId : objectId[0]._id
				});				
				console.log("New event inserted!");
			});
			
		}
	})

});

module.exports = router;
