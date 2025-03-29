// server/services/neo4jService.js
const neo4j = require('neo4j-driver');
require('dotenv').config();

// Neo4j connection
const driver = neo4j.driver(
  process.env.NEO4J_URI || 'neo4j+s://c4c2507f.databases.neo4j.io',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'xpN4ZXJZkTNCTFblyUO-rPsnOjOp5t1FO4ic3yl9cPM'
  )
);

// For hackathon purposes, we'll create a simplified dataset
// based on the Wheel of Time character relationships
const createDemoData = async () => {
  const session = driver.session();
  try {
    // Clear existing data
    await session.run('MATCH (n) DETACH DELETE n');
    
    // Create main characters
    const mainCharacters = [
      { name: 'Rand al\'Thor', role: 'Dragon Reborn', allegiance: 'Dragon' },
      { name: 'Matrim Cauthon', role: 'General', allegiance: 'Band of the Red Hand' },
      { name: 'Perrin Aybara', role: 'Lord', allegiance: 'Two Rivers' },
      { name: 'Egwene al\'Vere', role: 'Amyrlin Seat', allegiance: 'White Tower' },
      { name: 'Nynaeve al\'Meara', role: 'Aes Sedai', allegiance: 'White Tower' },
      { name: 'Moiraine Damodred', role: 'Aes Sedai', allegiance: 'Blue Ajah' },
      { name: 'Lan Mandragoran', role: 'Warder', allegiance: 'Malkier' },
      { name: 'Thom Merrilin', role: 'Gleeman', allegiance: 'None' },
      { name: 'Min Farshaw', role: 'Seer', allegiance: 'Dragon' },
      { name: 'Elayne Trakand', role: 'Queen', allegiance: 'Andor' },
      { name: 'Aviendha', role: 'Wise One', allegiance: 'Aiel' },
      { name: 'Loial', role: 'Scholar', allegiance: 'Ogier' },
      { name: 'Siuan Sanche', role: 'Aes Sedai', allegiance: 'Blue Ajah' },
      { name: 'Faile Bashere', role: 'Lady', allegiance: 'Saldaea' },
      { name: 'Verin Mathwin', role: 'Aes Sedai', allegiance: 'Brown Ajah' }
    ];
    
    // Create character nodes
    for (const char of mainCharacters) {
      await session.run(
        'CREATE (c:Character {name: $name, role: $role, allegiance: $allegiance})',
        char
      );
    }
    
    // Define relationships
    // These are based on significant character interactions in the books
    const relationships = [
      { from: 'Rand al\'Thor', to: 'Matrim Cauthon', strength: 0.9 },
      { from: 'Rand al\'Thor', to: 'Perrin Aybara', strength: 0.9 },
      { from: 'Rand al\'Thor', to: 'Egwene al\'Vere', strength: 0.7 },
      { from: 'Rand al\'Thor', to: 'Min Farshaw', strength: 0.9 },
      { from: 'Rand al\'Thor', to: 'Elayne Trakand', strength: 0.8 },
      { from: 'Rand al\'Thor', to: 'Aviendha', strength: 0.8 },
      { from: 'Rand al\'Thor', to: 'Moiraine Damodred', strength: 0.7 },
      { from: 'Matrim Cauthon', to: 'Perrin Aybara', strength: 0.7 },
      { from: 'Matrim Cauthon', to: 'Thom Merrilin', strength: 0.8 },
      { from: 'Perrin Aybara', to: 'Faile Bashere', strength: 0.9 },
      { from: 'Perrin Aybara', to: 'Loial', strength: 0.7 },
      { from: 'Egwene al\'Vere', to: 'Nynaeve al\'Meara', strength: 0.8 },
      { from: 'Egwene al\'Vere', to: 'Elayne Trakand', strength: 0.8 },
      { from: 'Nynaeve al\'Meara', to: 'Lan Mandragoran', strength: 0.9 },
      { from: 'Moiraine Damodred', to: 'Lan Mandragoran', strength: 0.9 },
      { from: 'Moiraine Damodred', to: 'Siuan Sanche', strength: 0.8 },
      { from: 'Moiraine Damodred', to: 'Thom Merrilin', strength: 0.7 },
      { from: 'Siuan Sanche', to: 'Verin Mathwin', strength: 0.6 },
      { from: 'Egwene al\'Vere', to: 'Siuan Sanche', strength: 0.7 }
    ];
    
    // Create relationships
    for (const rel of relationships) {
      await session.run(
        `
        MATCH (a:Character {name: $from})
        MATCH (b:Character {name: $to})
        CREATE (a)-[r:KNOWS {strength: $strength}]->(b)
        CREATE (b)-[r2:KNOWS {strength: $strength}]->(a)
        `,
        rel
      );
    }
    
    console.log('Demo data created successfully');
    return { success: true, message: 'Demo data created successfully' };
  } catch (error) {
    console.error('Error creating demo data:', error);
    return { success: false, message: error.message };
  } finally {
    await session.close();
  }
};

// Get the entire character network
const getCharacterNetwork = async () => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (c1:Character)-[r:KNOWS]->(c2:Character)
      RETURN c1.name AS source, c2.name AS target, r.strength AS strength,
             c1.role AS sourceRole, c1.allegiance AS sourceAllegiance,
             c2.role AS targetRole, c2.allegiance AS targetAllegiance
    `);
    
    // Create nodes with unique ids
    const nodesMap = new Map();
    const links = [];
    
    result.records.forEach(record => {
      const source = record.get('source');
      const target = record.get('target');
      const strength = record.get('strength');
      
      if (!nodesMap.has(source)) {
        nodesMap.set(source, {
          id: source,
          role: record.get('sourceRole'),
          allegiance: record.get('sourceAllegiance')
        });
      }
      
      if (!nodesMap.has(target)) {
        nodesMap.set(target, {
          id: target,
          role: record.get('targetRole'),
          allegiance: record.get('targetAllegiance')
        });
      }
      
      links.push({
        source,
        target,
        strength: strength.toNumber()
      });
    });
    
    return {
      nodes: Array.from(nodesMap.values()),
      links
    };
  } catch (error) {
    console.error('Error getting character network:', error);
    throw error;
  } finally {
    await session.close();
  }
};

// Find the shortest path between two characters
const findShortestPath = async (source, target) => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH path = shortestPath((a:Character {name: $source})-[:KNOWS*]-(b:Character {name: $target}))
      RETURN path
    `, { source, target });
    
    if (result.records.length === 0) {
      return { 
        success: false, 
        message: 'No path found between these characters' 
      };
    }
    
    const path = result.records[0].get('path');
    const segments = path.segments;
    
    // Extract nodes and relationships from the path
    const pathNodes = [];
    const pathRelationships = [];
    
    // Add start node
    pathNodes.push({
      id: segments[0].start.properties.name,
      role: segments[0].start.properties.role,
      allegiance: segments[0].start.properties.allegiance,
      onPath: true
    });
    
    // Add intermediate nodes and relationships
    segments.forEach(segment => {
      pathRelationships.push({
        source: segment.start.properties.name,
        target: segment.end.properties.name,
        strength: segment.relationship.properties.strength.toNumber(),
        onPath: true
      });
      
      pathNodes.push({
        id: segment.end.properties.name,
        role: segment.end.properties.role,
        allegiance: segment.end.properties.allegiance,
        onPath: true
      });
    });
    
    return {
      success: true,
      distance: segments.length,
      nodes: pathNodes,
      links: pathRelationships
    };
  } catch (error) {
    console.error('Error finding shortest path:', error);
    return { success: false, message: error.message };
  } finally {
    await session.close();
  }
};

// Get characters connected to a given character
const getConnectedCharacters = async (characterName) => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (c:Character {name: $name})-[r:KNOWS]-(connected:Character)
      RETURN connected.name AS name, connected.role AS role, 
             connected.allegiance AS allegiance, r.strength AS strength
      ORDER BY r.strength DESC
    `, { name: characterName });
    
    return result.records.map(record => ({
      name: record.get('name'),
      role: record.get('role'),
      allegiance: record.get('allegiance'),
      connectionStrength: record.get('strength').toNumber()
    }));
  } catch (error) {
    console.error('Error getting connected characters:', error);
    throw error;
  } finally {
    await session.close();
  }
};

module.exports = {
  createDemoData,
  getCharacterNetwork,
  findShortestPath,
  getConnectedCharacters
};