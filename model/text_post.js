const mongoose = require('mongoose')

// app.post('/text_post')
const textPostSchema = new mongoose.Schema({
	from_email:{
		type:String,
		required:true
	},
	to_email:{

		type:String,
		required:true
	},
	from_id:{

		type:String,
		required:true
	},
	to_id:{

		type:String,
		required:true
	},
	isOur:{
		type:Boolean,
		required:true

	},
	from_image:{
		type:String,
		required:true

	},
	to_image:{
		type:String,
		required:true

	},
	subject:{
		type:String,
		required:true,
	},
	message:{
		type:String,
		required:true,
		
	},
	isText:{
		type:Boolean,
		required:true
	},
	age:{
		type:String,
		require:true
	}

})



module.exports = new mongoose.model('message',textPostSchema)