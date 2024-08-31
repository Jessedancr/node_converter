import dotenv from "dotenv";

dotenv.config({ path: "./config/.env" });

export default {
	Mongo_uri: process.env.MONGO_URI,
	secret_key: process.env.SESSION_SECRET_KEY,
};
