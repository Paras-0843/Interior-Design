'use strict';
var http = require('http');
var port = process.env.PORT || 1337;
const express = require('express');
const app = express();
const init = require('./methods/init');
const designModel = require('./methods/design');
init();
app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.static('css'));
app.use(express.static('uploads'));
app.use(express.static('uploads2'));

const multer = require('multer');
const session = require('express-session');

const sendEmail = require("./methods/sendEmail");

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads');
	},
	filename: function (req, file, cb) {
		return cb(null, file.originalname)
	}
});
const upload = multer({ storage: storage });




const storage2 = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads2');
	},
	filename: function (req, file, cb) {
		return cb(null, file.originalname)
	}
});
const upload2 = multer({ storage: storage2 });





const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({

	name: String,
	password: String,
	profile: String,

	email: String,

	
	
});

const UserModel = mongoose.model('Users', UserSchema);
app.use(express.urlencoded({ extended: true }))

app.set("view engine", "ejs");





app.use(session({
	secret: "keyboard cat",
	resave: false,
	saveUninitialized: true,
}))


app.get("/", function (req, res) {
	req.session.destroy();
	res.render("index");
})

app.get("/login", function (req, res) {
	req.session.destroy();
	res.render("login", { err:""});
})

app.get("/signup", function (req, res) {


	res.render("signup", { err:""});

})
app.get("/blogs", function (req, res) {
	res.render("blog");
})


app.get("/buynow", function (req, res) {

	if (req.session.email)
		res.render("buynow", { err: "", email: req.session.email });
	else
		res.render("login", { err: "Please login to buy a subscription." });

})



app.get("/goback", function (req, res) {

	UserModel.exists({ email: req.session.email }).then(result => {
		if (result) {
			// user exists...
			UserModel.findOne({ email: req.session.email }, function (err, allDetails) {
				if (err) {
					console.log(err);
				} else {

					designModel.findOne({ Email: req.session.email }).then(allDetails2 => {
						if (allDetails2) {
							res.render("index2", { username: req.session.username, prof: allDetails.profile, email: req.session.email, area: allDetails2.Area, design: allDetails2.Design, Pic: allDetails2.Pic, Replypic: allDetails2.Replypic });
						}


						else {
							res.render("index2", { username: req.session.username, prof: allDetails.profile, email: req.session.email, area: "", design: "", Pic: "", Replypic: "" });

						}
					})


				}
			})
		}
		else {

			res.redirect('/');
		}
	})

})




app.get("/delete", function (req, res) {

	designModel.findOne({ Email: req.session.email }).then(user => {
		if (user) {
			user.Replypic ="";

			user.save(function (err) {
				if (err) {
					console.error('ERROR!');
				}
				else {
					res.render("login", { err: "Design Deleted Successfully,Please login again to see changes." });
				}
			})
		}

	})


})
app.get("/deleteSub", function (req, res) {

	designModel.deleteOne({ Email: req.session.email }).then(function () {
		res.render("login", { err: "Your Subscription has been Deleted Successfully,Please login again to see changes." });

	}).catch(function (error) {
		console.log(error); // Failure
		res.render("login", { error: "SOMETHING WENT WRONG.Please try again." });
	});

})

app.get("/pay", function (req, res) {


	res.render("pay");
})



app.post('/login', function (req, res) {

	const { username, password, email } = req.body;
	req.session.username = username;
	req.session.email = email;
	req.session.password = password;
	console.log(req.session.username);

	if (email == "admin@123" && username == "admin" && password == "admin") {

		UserModel.find({}, function (err, allDetails) {
			if (err) {
				console.log(err);
			} else {

				designModel.find({}, function (err, allDetails2) {
					if (err) {
						console.log(err);
					} else {

						res.render("admin", { err: "", users: allDetails, designs: allDetails2 });
					}
				})



			}
		})
	}


	else {
		UserModel.exists({ email: req.body.email, name: req.body.username, password: req.body.password }).then(result => {
			if (result) {
				// user exists...
				UserModel.findOne({ email: req.body.email }, function (err, allDetails) {
					if (err) {
						console.log(err);
					} else {
						req.session.is_logged_in = true;
						designModel.findOne({ Email: req.body.email }).then(allDetails2 => {
							if (allDetails2) {

								res.render("index2", { username: req.session.username, prof: allDetails.profile, email: req.session.email, area: allDetails2.Area, design: allDetails2.Design, Pic: allDetails2.Pic, Replypic: allDetails2.Replypic });
							}


							else {
								res.render("index2", { username: req.session.username, prof: allDetails.profile, email: req.session.email, area: "", design: "", Pic: "", Replypic: "" });

							}
						})

					}
				})
			}
			else {


				res.render("login", { err: "User not found. Please try again." });


			}
		});




	}


})



app.post("/signup", upload.single('profile-pic'), function (req, res) {









	UserModel.find({ email: req.body.email }, function (err, docs) {
		if (docs.length) {
			res.render("signup", { err: "The user already exists. Please try another username or email." });
		} else {

			var use = new UserModel({

				name: req.body.username,
				password: req.body.password,
				profile: req.file.filename,

				email: req.body.email,
				
				question: "",
				reply: ""

			})





			use.save(function (err, result) {

				if (result) {

					/*let link = `http://localhost:1337/verifyMail/${use.mailToken}`;*/


					sendEmail(use.email, use.name, function (err) {
						if (err) {
							res.redirect("/signup");
							return;
						}

						res.render("login", { err: "User Saved" });


					})




				}
			})
		}

	});

})
app.post("/buynow", upload2.single('design-pic'),function (req, res) {

	UserModel.find({ email: req.session.email }, function (err, docs) {
		if (docs.length) {

			designModel.findOne({ Email: req.session.email }).then(user => {
				if (user) {
					res.render("buynow", { email: req.session.email, err: "Seems like your booking already exists.Please delete the older booking and try again." });
				} else {
					var des = new designModel({

						Email: req.body.email,
						Area: req.body.area,
						Design: req.body.designtype,
						Pic: req.file.filename,
						Replypic: "",

					})
					des.save(function (err, result) {

						if (result) {

							res.render("buynow", { email: req.body.email, err: "Congrats!We got your Submission. Please go back to your profile to see your submission details." })
						}
					})
				}
			})

		}
		else {
			res.render("buynow", { err: "Looks like email you entered does not exist with us.Please try again", email: req.session.email });
        }

	})
 
})


app.post("/savedesignAdmin", upload2.single('designrep-pic'),function (req, res) {

	designModel.findOne({ Email: req.body.email }).then(user => {
		if (user) {
			user.Replypic = req.file.filename;

			user.save(function (err) {
				if (err) {
					console.error('ERROR!');
				}
				else {
					UserModel.find({}, function (err, allDetails) {
						if (err) {
							console.log(err);
						}
						else {
							designModel.find({}, function (err, allDetails2) {
								if (err) {
									console.log(err);
								} else {

									res.render("admin", { err: "Reply Saved Successfully!", users: allDetails, designs: allDetails2 });
								}
							})
						}
					});
				}
			});
		}
		else {
			res.render("login", { error: "User not found" });



		}
	});


})


app.listen(port, function () {

	console.log("SERVER AT 1337");
})
