import { MongoClient } from "mongodb";
import config from "../config/config.js";

export const uri = config.Mongo_uri;
export const client = new MongoClient(uri);

export const connectClient = () => {
	client.connect().then(() => console.log("connected to Mongo DB"));
};
