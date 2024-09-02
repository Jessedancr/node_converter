import * as mongo from "./loaders/mongo.js"; // This imports all the exports from mongo.js
import * as server from "./loaders/server.js"; // This imports all the exports from server.js
import middlewares from "./api/middlewares/middlewares.js";
import homePage from "./services/businessLogic/show_homepage.js";
import showSignup from "./services/businessLogic/show_signup.js";
import userSignup from "./services/businessLogic/user_signup.js";
import loginUser from "./services/businessLogic/user_login.js";
import showLogin from "./services/businessLogic/show_login.js";

server.startServer(); // Start the server
mongo.connectClient(); // Connect to mongo DB
middlewares(); // This loads all middlewares

const options = ["°C to °F", "M to Cm", "KG to lbs", "inch to Cm"];
let conversion;

/**
 * E N D P O I N T S
 */
server.app.get("/", homePage);

// SIGN UP ENDPOINTS
server.app.get("/signup", showSignup);
server.app.post("/signup", userSignup);

// LOGIN ENDPOINTS
server.app.get("/login", showLogin);
server.app.post("/login", loginUser);

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
