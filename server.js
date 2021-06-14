require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
const url = 'mongodb://localhost:27017/quiz';
const quiz = require('./db');
const signup = require('./signupdb');
const bodyparser = require('body-parser');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const auth = require("./auth");

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended : true}));
app.set('view engine', 'ejs');
app.set("views", './views');
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(url, {useUnifiedTopology: true});

const con = mongoose.connection;

con.on("open", function(){
	console.log('connected');
})

app.get('/', auth, (req, res) => {
	res.render('start.ejs');
})

app.get('/quiz', (req, res) => {
	res.render('quiz.ejs');
})

app.get('/end', (req, res) => {
	res.render('end.ejs');
})

app.post('/', (req, res) => {
	res.render('/quiz');
})

// fetch the qus in ejs file

app.get('/qus/all', async(req, res) => {
	try{
		// let rand = Math.random();
		const fetch = await quiz.find({});
		res.json(fetch);
		res.render("/quiz", {
				lists: fetch
		});
	}catch{
		res.send(error);
	}
})

// auth signup/login, also logged out within some time

app.get('/signup', (req, res) => {
	res.render('signup.ejs');
})

app.post('/signup', async(req, res) => {
	try{
		const password = req.body.password;
        const cpassword = req.body.cpassword;

        if(password === cpassword){
            const signupSeller = new signup ({
                fname : req.body.fname,
                lname : req.body.lname,
                email : req.body.email,
                password : req.body.password,
                cpassword: req.body.cpassword,
                description : req.body.description,
                subject : req.body.subject,
                status: req.body.status,
                qus: req.body.qus
            })
            // console.log("the success part" + signupUser);
            const token = await signupSeller.generateAuthToken();
            // console.log("the token part" + token);

            res.cookie("jwt", token, {
                httpOnly:true
            });

            const usersignedup = await signupSeller.save();
            res.redirect('/login');
            }else{
            res.send("password not match");
        }
	}catch(err){
		res.send(err);
	}res.render('/signup');
})

app.get('/login', (req, res) => {
	res.render('login.ejs');
})

app.post('/login', async(req, res) => {
    try{
        const email = req.body.email;
        const password = req.body.password;
        const status = req.body.status;
        
        const useremail = await signup.findOne({email:email});
        const isMatch = await bcrypt.compare(password, useremail.password);
        const userstatus = await signup.findOne({status:status});
        const token = await useremail.generateAuthToken();
        // console.log("the token part" + token);

         res.cookie("jwt", token, { 
            expires: new Date(Date.now() + (4*3600*1000)),
            httpOnly:true
        //     // secure:true
        });
        if(isMatch){
            try{
                const updatedService = await signup.update({},
        
                { $set: { "status": "active" }}
                );
                  res.status(200).json({
                  status: "success",
                  updatedService,
                });
                res.redirect("/in-active");
            }
        catch(error){
            res.send(error);
        }
        }else{
            const updatedService = await signup.update({},
        
                { $set: { "status": "inactive" }}
                );
                  res.status(200).json({
                  status: "success",
                  updatedService,
                });
            res.send("password incoorect");
        }

    }catch{
        // res.redirect('/login');
    }
})

// logout with all devices or last loged in devices

app.get("/logout", auth, async(req, res) => {
    try{
        // logout from one device
        // req.user.tokens = req.user.tokens.filter((currentElement) => {
        //     return currentElement.token !== req.token;
        // })

        // logout from all device 
        req.user.tokens = [];

        res.clearCookie("jwt");
        console.log("log-out");
        await req.user.save();
        res.redirect('/login');
    }catch(error){
        res.status(500).send(error);
    }
})

// post qus

app.patch('/qus', async(req, res) => {
    try{
        const updatedService = await signup.findOneAndUpdate(
      {
        $and: [
          { subject: req.body.subject },
        ],
      },
      { $set: {"qus.qus": req.body.qus, "qus.ans1": req.body.ans1 ,
        "qus.ans2": req.body.ans2, "qus.ans3": req.body.ans3 ,
        "qus.ans4": req.body.ans4 , "qus.wans": req.body.wans }}
    );

    res.status(200).json({
      status: "success",
      updatedService,
    });
    }
    catch(error){
        res.send(error);
    }
})

// here fetch all given qus to some students

app.post('/:id/join', async(req, res) => {
    try{
        		// let rand = Math.random();
        const fetch = await signup.aggregate([{$lookup:{
            from: "quiz",
            localField: "subject",
            foreignField: "sub",
            as: "subject_all"
         }}])
        res.json(fetch);
        console.log(fetch);
        // .toArray(function (err, res) {
        //     if(err) throw err;

        // console.log(JSON.stringify(res));
        //  });
		// res.render("index", {
  //   		lists: fetch
  //   	});
        }
        catch(error){
		    res.send(error);
	    }
});

app.get('/join/qus', (req, res) => {

})

app.listen(9000, function(){
	console.log('stared at 9000');
})