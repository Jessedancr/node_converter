import * as dbService from "../db/dbService.js";
/**
 * FUNCTION TO LOG USER IN
 */
const options = ["°C to °F", "M to Cm", "KG to lbs", "inch to Cm"];
let conversion;
export default async function loginUser(req, res) {
	try {
		const { username, password } = req.body;
		const user = await dbService.findUserWithUsernameAndPassword(req, username, password);

		if (user) {
			req.session.user = { username: user.username, id: user._id }; // Adding the user prop to the session object and the id from mongo DB
			console.log(req.session); // To confirm the user object has been inserted into the session object
			console.log("Logged in as", user);
			res.render("convert", { options, conversion });
		} else {
			res.send("INVALID USER");
		}
	} catch (error) {
		console.log(`Error logging user in: ${error}`);
	}
}
