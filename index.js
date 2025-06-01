const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { GoogleAuth } = require("google-auth-library");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PROJECT_ID = "cv-notifications"; // 👈 replace with Firebase Project ID
const SERVICE_ACCOUNT = require("./service-account.json");

const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];

async function getAccessToken() {
  const auth = new GoogleAuth({
    credentials: SERVICE_ACCOUNT,
    scopes: SCOPES,
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token;
}

app.post("/send-notification", async (req, res) => {
  const { title, body } = req.body;

  const message = {
    message: {
      topic: "allUsers",
      notification: {
        title: title,
        body: body,
      },
    },
  };

  try {
    const accessToken = await getAccessToken();
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      }
    );

    const data = await response.json();
    res.status(200).send({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 v1 API server running on port ${PORT}`);
});
