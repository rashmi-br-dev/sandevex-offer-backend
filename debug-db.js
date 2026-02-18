const mongoose = require('mongoose');
require('dotenv').config();

async function debugDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Check if 'offers' collection exists and count documents
    if (collections.find(c => c.name === 'offers')) {
      const offersCount = await db.collection('offers').countDocuments();
      console.log('Documents in offers collection:', offersCount);
      
      if (offersCount > 0) {
        const offers = await db.collection('offers').find({}).toArray();
        console.log('Sample offers data:', JSON.stringify(offers.slice(0, 2), null, 2));
      }
    }
    
    // Check if students collection exists
    if (collections.find(c => c.name === 'students')) {
      const studentsCount = await db.collection('students').countDocuments();
      console.log('Documents in students collection:', studentsCount);
    }
    
    // Check for any collection that might contain offer data
    for (const collection of collections) {
      if (collection.name.includes('offer') || collection.name.includes('application')) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`Documents in ${collection.name}:`, count);
        if (count > 0) {
          const sample = await db.collection(collection.name).findOne({});
          console.log(`Sample data from ${collection.name}:`, JSON.stringify(sample, null, 2));
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

debugDatabase();
