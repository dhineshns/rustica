var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;


/* GET home page. */
router.post('/createEvent', function(req, res, next) {
	var inputParams = req.query;

	mongo.connect('mongodb://localhost:27017/rustica', function(err, db){
		if(err){
			console.error("err.message")
		}else{
			var collection = db.collection('events');
			collection.insert({
				eventName : inputParams.eventName,
				eventCreator : inputParams.eventCreator,
				currentToken : {personId : null, token : 0},
				eventAttendees  : [],
			}, function(err, newEvents){
				res.send({
					eventId : newEvents[0]._id
				});				
				console.log("New event inserted!");
			});
			
		}
	})

});

router.post('/joinEvent', function(req, res){
	var inputParams = req.query;

	mongo.connect('mongodb://localhost:27017/rustica', function(err, db){
		if(err){
			console.error("err.message")
		}else{
			var people = db.collection('people');
			var events = db.collection('events');


			people.insert({
				androidSeqNum : inputParams.androidSeqNum,
				personName : inputParams.personName
			}, function(err, newEvents){
				var newPersonId = newEvents[0]._id;
				console.log(newPersonId);

				events.findOne({ _id:ObjectID(inputParams.eventId)}, function(err, doc){
					if(err){
						console.error(err.message)
					}else{
						attendeesCount = doc.eventAttendees.length;
						console.log(attendeesCount)
						var currentEvent = events.update({ _id:ObjectID(inputParams.eventId)}, {
							$push : {eventAttendees : {
								personId : newPersonId, 
								token : attendeesCount+1
							}}
						}, function(err, count, obj){
							if(err){
								console.error(err.message);
							}else{
								console.log(obj);
								res.send({
									personId : newPersonId
								});
								console.log('A person joined the queue')

							}
						});
					}
				});
				// console.log(attendeesCount)



				

			})

		}
	})
})

router.post('/nextPerson', function(req, res){
	inputParams = req.query;
	mongo.connect('mongodb://localhost:27017/rustica', function(err, db){
		var events = db.collection('events');
		events.findOne({_id:ObjectID(inputParams.eventId)}, function(err, doc){
			console.log(doc);
			// if there is a next person in line
			if(doc.eventAttendees[doc.eventAttendees.length-1].token > doc.currentToken.token){
				var nextAttendee;
				for(var i =0; i< doc.eventAttendees.length; i++){
					if(doc.currentToken.token == 0){
						nextAttendee = doc.eventAttendees[0];
						break;
					}
					if(doc.eventAttendees[i].token == doc.currentToken.token ){
						nextAttendee = doc.eventAttendees[i+1];
						break;
					}
				}
				events.update({_id:ObjectID(inputParams.eventId)}, {$set :{currentToken : nextAttendee}}, function(err, count, obj){
					if(err){
						console.error(err.message);
					}else{
						res.send({
							nextToken : nextAttendee
						});
					}
				});

			}else{ // if there are no next people
				res.send({
					nextToken : null
				})
			}
		})

	})
})
module.exports = router;
