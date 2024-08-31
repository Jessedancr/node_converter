import express from "express";

export const app = express();
const port = 8080;
export async function startServer() {
	app.listen(port, () => {
		console.log(`Server started on http://localhost:${port}`);
	});
}
