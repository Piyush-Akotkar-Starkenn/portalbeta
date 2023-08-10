const pool = require("../config/db");
const logger = require("../logger");
const { client } = require("../config/mqtt");

const setupMQTT = () => {
  client.on("connect", () => {
    logger.info("Connected to MQTT broker");
    client.subscribe("#");
  });

  client.on("message", (topic, message) => {
    // console.log(`${message.toString()}`);
    try {
      const validatedJson = JSON.parse(message.toString());
      // Store valid JSON in DB
      storeJsonInDatabase(validatedJson);
    } catch (error) {
      logger.error(
        `MQTT send invalid JSON from Topic : ${topic} Error: ${error.message}`
      );
      // Call the function to store in DB
      storeInvalidJsonInDatabase(topic, message.toString());
    }
  });

  return client;
};

// Function to store valid JSON in the database
async function storeJsonInDatabase(validatedJson) {
  try {
    const connection = await pool.getConnection();
    const tripdata = [
      validatedJson.trip_id,
      validatedJson.device_id,
      validatedJson.event,
      validatedJson.message,
      validatedJson.timestamp,
      validatedJson.ignition,
      validatedJson.td.lat,
      validatedJson.td.lng,
      validatedJson.td.spd,
      JSON.stringify(validatedJson),
    ];

    await connection.query(
      "INSERT INTO tripdata (trip_id, device_id, event, message, timestamp, igs, lat, lng, spd, jsondata, created_at) VALUES (?, NOW())",
      [tripdata]
    );
    connection.release();
    logger.info("Stored Tripdata in the database");
  } catch (error) {
    logger.error(`Error storing Tripdata in database: ${error.message}`);
  }
}

// Function to store invalid JSON in the database
async function storeInvalidJsonInDatabase(topic, message) {
  try {
    const connection = await pool.getConnection();
    await connection.query(
      "INSERT INTO invalid_tripdata (topic, message) VALUES (?, ?, NOW())",
      [topic, message]
    );
    connection.release();
    logger.info("Stored invalid Tripdata in the database");
  } catch (error) {
    logger.error(
      `Error storing invalid Tripdata in database: ${error.message}`
    );
  }
}

module.exports = setupMQTT;
