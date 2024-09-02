export async function findUserWithUsernameAndPassword(req, username, password) {
	try {
		const collection = await req.db.collection("converter_users");
		const user = await collection.findOne({ username, password });
		return user;
	} catch (error) {
		console.log(`Error finding user: ${error}`);
	}
}

export async function insertUser(req, username, password) {
	try {
		const collection = await req.db.collection("converter_users");
		const user = await collection.insertOne({ username, password });
		return user;
	} catch (error) {
		console.log(`Error inserting user: ${error}`);
	}
}
