import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import config from "./config/config.js";
import * as mongo from "./loaders/mongo.js"; // This imports all the exports from mongo.js
import * as server from "./loaders/server.js"; // This imports all the exports from server.js

server.startServer(); // Start the server
mongo.connectClient();

server.app.use(bodyParser.urlencoded({ extended: true })); // To parse bodies from HTML forms
server.app.use(bodyParser.json());
server.app.use(express.static("public"));
server.app.use((req, res, next) => {
	req.db = mongo.client.db("users");
	next();
}); // Middleware to attach DB to all request bodies

// USER SESSION MIDDLEWARE CONFIG
server.app.use(
	session({
		secret: config.secret_key,
		resave: false,
		saveUninitialized: true,
		store: MongoStore.create({
			client: mongo.client,
			dbName: "users",
			collectionName: "history",
		}),
		cookie: { secure: false },
	}),
);

const options = ["°C to °F", "M to Cm", "KG to lbs", "inch to Cm"];
let conversion;

server.app.set("view engine", "ejs");
server.app.get("/", (req, res) => {
	res.send("H O M E P A G E");
});

// SIGN UP ENDPOINTS
server.app.get("/signup", async (req, res) => {
	console.log("/signup by GET has been hit");
	res.render("signup");
});
server.app.post("/signup", async (req, res) => {
	console.log("/signup by POST has been hit");
	const newUser = req.body;
	try {
		if (newUser.username && newUser.password) {
			// Add new user to DB
			const usersCollection = await req.db.collection("converter_users");
			const insertUser = await usersCollection.insertOne(newUser);
			console.log("New User", insertUser);
			res.render("on_signup");
		}
	} catch (error) {
		console.log(error);
	}
});

// LOGIN ENDPOINTS
server.app.get("/login", async (req, res) => {
	res.render("login");
});
server.app.post("/login", async (req, res) => {
	try {
		const { username, password } = req.body; // Business logic
		const collection = await req.db.collection("converter_users"); // DB query
		const user = await collection.findOne({ username, password }); // DB query

		// BUSINESS LOGIC
		if (user) {
			req.session.user = { username: user.username, id: user._id }; // Adding the user prop to the session object and the id from mongo DB
			console.log(req.session); // To confirm the user object has been inserted into the session object
			console.log("Logged in as", user);
			res.render("convert", { options, conversion });
		} else {
			res.send("INVALID USER");
		}
	} catch (error) {
		console.log(error);
	}
});

// CONVERT ENDPOINTS
server.app.get("/convert", (req, res) => {
	if (req.session.user) {
		res.render("convert", { options, conversion });
	} else {
		res.redirect("/login");
	}
});
server.app.post("/convert", async (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
	}

	const collection = req.db.collection("history");
	const conversionType = req.body.conversionType;
	const numberInput = parseFloat(req.body.numberInput);
	const userID = req.session.user.id;

	if (conversionType === "°C to °F") {
		conversion = (numberInput * 9) / 5 + 32;
		res.render("convert", { conversion, options });
	} else if (conversionType === "M to Cm") {
		conversion = numberInput * 100;
		res.render("convert", { conversion, options });
	} else if (conversionType === "KG to lbs") {
		conversion = numberInput * 2.20462;
		res.render("convert", { conversion, options });
	} else if (conversionType === "inch to Cm") {
		conversion = numberInput * 2.54;
		res.render("convert", { conversion, options });
	}

	// STORE CONVERSION HISTORY IN DB
	collection.insertOne({
		userID,
		conversionType,
		numberInput,
		conversion,
		timeStamp: new Date(),
	});
});

// HISTORY ENDPOINT
server.app.get("/history", async (req, res) => {
	const userID = req.session.user.id;
	const collection = await req.db.collection("history");
	const conversionHistory = await collection.find({ userID }).toArray(); // Finding by user ID
	console.log("From /history:", conversionHistory);
	res.render("history", { history: conversionHistory });
});
