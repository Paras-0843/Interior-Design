const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DesignSchema = new Schema({

	
	Email: String,
	Area: String,
	Design: String,
	Pic: String,
	Replypic:String,

});

const designModel = mongoose.model('DesignBookings', DesignSchema);

module.exports = designModel;