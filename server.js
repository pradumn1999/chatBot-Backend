const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();


const port = process.env.PORT || 3000;
const apiKey = process.env.API_KEY;
const frontendUrl = process.env.FRONTEND_URL;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const corsOptions = {
  origin: frontendUrl, // Replace with your frontend URL
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type',
};

app.use(cors(corsOptions));



const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

app.use(express.json());

app.post('/generate', async (req, res) => {
  const { message } = req.body;
  console.log('Received message:', message); // Log received message
  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  try {
    const result = await chatSession.sendMessage(message);
    console.log('API response:', result.response.text()); // Log API response
    res.json({ response: result.response.text() });
  } catch (error) {
    console.error('Error:', error); // Log error
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
