import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Simple CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Simple response without database
    return res.status(200).json({ 
      message: 'Simple test working!',
      method: req.method,
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET'
      }
    });
  } catch (error: any) {
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
}
