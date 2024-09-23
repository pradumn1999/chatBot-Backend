require('dotenv').config(); // Load environment variables

const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');
const app = express();

const port = process.env.PORT || 3000;
const apiKey = process.env.API_KEY;
const frontendUrl = process.env.FRONTEND_URL;

if (!apiKey) {
  console.error('API key is missing');
  process.exit(1); // Exit if API key is not set
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const corsOptions = {
  origin: frontendUrl || '*', // Fallback for development
  methods: 'GET,POST',
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json());

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

app.post('/generate', async (req, res) => {
  const { message } = req.body;
  console.log('Received message:', message); 

  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  try {
    const result = await chatSession.sendMessage(message);
    console.log('API response:', result); // Log the full response
    if (result && result.response) {
      res.json({ response: result.response.text() });
    } else {
      res.status(500).json({ error: 'Invalid API response' });
    }
  } catch (error) {
    console.error('Error:', error); 
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
