const logger = require("./logger");
const express = require("express");
const setupMQTT = require("./controllers/mqttHandler");
const pool = require("./config/db");

const app = express();

app.use(express.json());

const mqttClient = setupMQTT();

app.listen(8080, () => {
  logger.info("App is running on port 8080");
});

process.on("SIGINT", async () => {
  logger.info("Received SIGINT signal. Closing connection pool...");
  try {
    await pool.end();
    logger.info("Connection pool closed.");
    process.exit(0);
  } catch (error) {
    logger.error("Error closing connection pool:", error);
    process.exit(1);
  }
});
