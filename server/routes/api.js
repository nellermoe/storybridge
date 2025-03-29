// server/routes/api.js
const express = require('express');
const router = express.Router();
const neo4jService = require('../services/neo4jService');

// Import the Neo4j service here
// const neo4jService = require('../services/neo4jService');

// Mock stories API for testing
router.get('/stories', (req, res) => {
  // Using WoT characters for our stories
  const stories = [
    {
      id: 1,
      title: "Save the Two Rivers from Trollocs",
      storyteller: "Rand al'Thor",
      storytellerRole: "Dragon Reborn",
      target: "Moiraine Damodred",
      targetRole: "Aes Sedai",
      stepsAway: 1,
      thumbnail: "https://via.placeholder.com/150",
      videoUrl: "/mock-video.mp4"
    },
    // Add more sample stories...
  ];
  
  res.json(stories);
});

module.exports = router;

// Initialize demo data
router.post('/init', async (req, res) => {
  try {
    const result = await neo4jService.createDemoData();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get full character network
router.get('/network', async (req, res) => {
  try {
    const network = await neo4jService.getCharacterNetwork();
    res.json(network);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Find shortest path between two characters
router.get('/path', async (req, res) => {
  const { source, target } = req.query;
  
  if (!source || !target) {
    return res.status(400).json({ 
      error: 'Both source and target parameters are required' 
    });
  }
  
  try {
    const path = await neo4jService.findShortestPath(source, target);
    res.json(path);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get connected characters
router.get('/connections/:character', async (req, res) => {
  const { character } = req.params;
  
  try {
    const connections = await neo4jService.getConnectedCharacters(character);
    res.json(connections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mock stories API
router.get('/stories', (req, res) => {
  // Using WoT characters for our stories
  const stories = [
    {
      id: 1,
      title: "Save the Two Rivers from Trollocs",
      storyteller: "Rand al'Thor",
      storytellerRole: "Dragon Reborn",
      target: "Moiraine Damodred",
      targetRole: "Aes Sedai",
      stepsAway: 1,
      thumbnail: "https://via.placeholder.com/150",
      videoUrl: "/mock-video.mp4"
    },
    {
      id: 2,
      title: "Rebuild Malkier After the Blight",
      storyteller: "Lan Mandragoran",
      storytellerRole: "King of Malkier",
      target: "Nynaeve al'Meara",
      targetRole: "Aes Sedai",
      stepsAway: 1,
      thumbnail: "https://via.placeholder.com/150",
      videoUrl: "/mock-video.mp4"
    },
    {
      id: 3,
      title: "Aiel Crossing the Dragonwall",
      storyteller: "Aviendha",
      storytellerRole: "Wise One",
      target: "Elayne Trakand",
      targetRole: "Queen of Andor",
      stepsAway: 3,
      thumbnail: "https://via.placeholder.com/150",
      videoUrl: "/mock-video.mp4"
    },
    {
      id: 4,
      title: "Protecting Ogier Stedding from Deforestation",
      storyteller: "Loial",
      storytellerRole: "Ogier Scholar",
      target: "Perrin Aybara",
      targetRole: "Lord of the Two Rivers",
      stepsAway: 2,
      thumbnail: "https://via.placeholder.com/150",
      videoUrl: "/mock-video.mp4"
    },
    {
      id: 5,
      title: "Rebuilding the White Tower",
      storyteller: "Egwene al'Vere",
      storytellerRole: "Amyrlin Seat",
      target: "Siuan Sanche",
      targetRole: "Former Amyrlin",
      stepsAway: 1,
      thumbnail: "https://via.placeholder.com/150",
      videoUrl: "/mock-video.mp4"
    }
  ];
  
  res.json(stories);
});

module.exports = router;