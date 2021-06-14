const mongoose = require('mongoose');

const crudSchema = new mongoose.Schema({
	qus: {
		type: String,
		require: true
	},
	ans1: {
		type: String,
		require: true
	},
	ans2: {
		type: String,
		require: true
	},
	ans3: {
		type: String,
		require: true
	},
	ans4: {
		type: String,
		require: true
	},
	wans: {
		type: String,
		require: true
	}
})

module.exports = mongoose.model('quiz', crudSchema);