import * as dbService from "../db/dbService.js";

export default async function createUser(req, res) {
	try {
		const { username, password } = req.body;
		if (username && password) {
			const user = await dbService.insertUser(req, username, password);
			console.log("Signed up as", user);
			res.render("on_signup");
		}
	} catch (error) {
		console.log(`Error creating user: ${error}`);
	}
}
