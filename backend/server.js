// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bmad_agents', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
// .then(() => console.log('✓ MongoDB Connected'))
// .catch(err => console.error('✗ MongoDB Error:', err));

// // AI Agent Routes
// app.post('/agent/start', (req, res) => {
//     res.json({ status: 'Agent started', timestamp: new Date() });
// });

// app.post('/agent/query', (req, res) => {
//     const { query } = req.body;
//     res.json({ 
//         query: query,
//         response: 'AI Agent processing your request...',
//         agentType: 'BMAD-Method Agent'
//     });
// });

// app.post('/agent/workflow', (req, res) => {
//     const { workflow } = req.body;
//     res.json({ 
//         workflow: workflow,
//         status: 'Workflow triggered',
//         result: 'Automation in progress'
//     });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`✓ BMAD Server running on port ${PORT}`));


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// MongoDB Connection
const mongoUri = process.env.MONGO_URI || 'mongodb://mongodb:27017/bmad_agents';
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.warn('⚠️  MongoDB Error:', err.message));

// AI Function - Call Google Gemini
async function callGemini(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini Error:', error.message);
    throw error;
  }
}

// ============= API ENDPOINTS =============

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: {
      mongodb: mongoose.connection.readyState === 1,
      gemini: !!process.env.GEMINI_API_KEY,
    },
    timestamp: new Date()
  });
});

// Start Agent
app.post('/agent/start', (req, res) => {
  res.json({
    status: 'AI Agent started',
    aiProvider: 'Google Gemini (Free)',
    automation: 'BMAD Method',
    capabilities: [
      'Natural Language Processing',
      'Workflow Automation',
      'HR/CRM/ERP Integration'
    ],
    timestamp: new Date()
  });
});

// Query Agent - Ask AI Questions
app.post('/agent/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`📥 Processing: "${query}"`);
    
    // Call Google Gemini
    const aiResponse = await callGemini(query);
    
    res.json({
      success: true,
      query: query,
      response: aiResponse,
      aiProvider: 'Google Gemini',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate Workflow with AI
app.post('/agent/workflow', async (req, res) => {
  try {
    const { workflow, parameters } = req.body;
    
    if (!workflow) {
      return res.status(400).json({ error: 'Workflow type required' });
    }

    console.log(`⚡ Generating workflow: ${workflow}`);
    
    const prompt = `Generate detailed automation steps for ${workflow} workflow.
Parameters: ${JSON.stringify(parameters, null, 2)}

Provide 5-7 numbered steps that an automation system should follow.`;

    const steps = await callGemini(prompt);
    
    res.json({
      success: true,
      workflow: workflow,
      parameters: parameters,
      automationSteps: steps,
      generatedBy: 'Google Gemini',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 BMAD Server running on port ${PORT}`);
  console.log(`🤖 AI: Google Gemini ${process.env.GEMINI_API_KEY ? '✅' : '❌'}`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? '✅' : '⏳'}`);
  console.log(`\n💡 Test at http://localhost:${PORT}\n`);
});