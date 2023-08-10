const { client } = require("../config/mqtt");

function setupMQTT() {
  client.on("connect", () => {
    console.log("Connected to MQTT broker");
    client.subscribe("#"); // Replace with the topic you want to subscribe to
  });

  client.on("message", (topic, message) => {
    // console.log(topic);
    // console.log(`${message.toString()}`);
    try {
      const validatedJson = JSON.parse(message.toString());
      //   console.log("valid json", validatedJson);
    } catch (error) {
      logger.error("invalid json");
    }
  });

  return client;
}

module.exports = setupMQTT;
