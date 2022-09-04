const { createServer } = require("net");
const { request } = require("https");

//! Server

const server = createServer(async function (socket) {
	const ip = socket.remoteAddress
		.replace("::ffff:", "")
		.replace("::1", "localhost");

	await log(
		`Connection: \x1b[1m${ip}${
			(await isUptimeRobot(ip)) ? ` \x1b[0m(UptimeRobot)\x1b[0m` : ""
		}`
	);

	socket.on("error", err);
	socket.end();
}).listen(getRequestedPort(), function () {
	log(`Port \x1b[1m${server.address().port}\x1b[0m on listen !`);
	return true;
});

//! Functions

/**
 * If the user has specified a port, use it, otherwise use 8875.
 *
 * @returns {Number} Port number that the user has requested.
 */
function getRequestedPort() {
	const indexPort = process.argv.findIndex(
		(arg) => arg.includes("--port") || arg.includes("-p")
	);
	const port = Number(process.argv[indexPort + 1]);

	if (indexPort === -1 || Number.isNaN(port)) return 8875; // by default
	else return Math.round(port);
}

/**
 * It logs a message to the console with a timestamp
 *
 * @param {String} msg Message to display on the console
 */
function log(msg) {
	console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

/**
 * It logs an error message to the console with a timestamp
 *
 * @param {String} msg Error to display on the console
 */
function err(msg) {
	console.error(`[${new Date().toLocaleTimeString()}] \x1b[31mERR: ${msg}`);
}

/**
 * It checks if the IP is in the list of IPs that UptimeRobot uses
 *
 * @param {String} ip IP address to check
 * @returns {Boolean}
 */
async function isUptimeRobot(ip) {
	return String(
		await new Promise((resolve, reject) => {
			request(
				{
					method: "GET",
					host: "uptimerobot.com",
					path: "/inc/files/ips/IPv4andIPv6.txt",
					headers: {
						"User-Agent": `ValentinKhmerListener/1.0.0`,
					},
				},
				(res) => {
					let chunks = [];

					res.on("data", function (chunk) {
						chunks.push(chunk);
					});

					res.on("end", () => {
						resolve(Buffer.concat(chunks).toString("utf-8"));
					});

					res.on("error", function (error) {
						reject(error);
					});
				}
			).end();
		})
	)
		.split(/\r?\n/)
		.includes(ip);
}
