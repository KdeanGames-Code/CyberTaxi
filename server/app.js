/**
 * @file app.js
 * @description Main Express application for CyberTaxi backend server
 * @author CyberTaxi Team
 * @version 0.1.0
 */

const express = require("express");
const app = express();
const port = 3000;

/**
 * Mount API routes from the routes directory
 * @type {express.Router}
 */
const routes = require("./routes/index");
app.use("/api", routes);

/**
 * Start the Express server and log the port
 * @function
 * @listens port 3000
 * @returns {void}
 */
app.listen(port, () => {
    console.log(`CyberTaxi server running on port ${port}`);
});

module.exports = app; // For potential testing
