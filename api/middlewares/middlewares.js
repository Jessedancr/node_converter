import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import * as server from "../../loaders/server.js";
import * as mongo from "../../loaders/mongo.js";
import config from "../../config/config.js";

const middlewares = () => {
	server.app.use(bodyParser.urlencoded({ extended: true }));
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
	server.app.set("view engine", "ejs");
};

export default middlewares;
