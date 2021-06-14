const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var db = require("./db");

const crudSchema = new mongoose.Schema({
	fname: {
		type: String,
		require: true
	},
	lname: {
		type: String,
		require: true
	},
	email: {
		type: String,
		require: true
	},
	subject: {
		type: String,
		require: true
	},
	description: {
		type: String,
		possibleValues: ['teacher', 'student'],
		require: true
	},
	password: {
		type: String,
		require: true
	},
	cpassword: {
		type: String,
		require: true
	},
	status: {
		type: String,
		default: "inactive"
	},
	qus: [db.schema],
    tokens: [{
        token: {
            type:String,
            required:true
        }
    }]
})

crudSchema.methods.generateAuthToken = async function(){
    try{
        const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY_);
        this.tokens = this.tokens.concat({token});
        await this.save();
        // console.log(token);
        return token;
    }catch(error){
        res.send("the error part");
        console.log("the error part");
    }
}

crudSchema.pre("save", async function(next) {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
        this.cpassword = await bcrypt.hash(this.password, 10);
    }
    next();
})

const signup = new mongoose.model('signup', crudSchema);

module.exports = signup;