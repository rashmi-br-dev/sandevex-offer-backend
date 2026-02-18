import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const endpoints = [
    { path: '/api/offers', status: '✅ Available', description: 'Get all offers' },
    { path: '/api/appointments', status: '✅ Available', description: 'Get/create appointments' },
    { path: '/api/slots/dates', status: '✅ Available', description: 'Get available slot dates' },
    { path: '/api/health', status: '✅ Available', description: 'Health check' },
    { path: '/api/simple', status: '✅ Available', description: 'Simple test endpoint' },
    { path: '/api/status', status: '✅ Available', description: 'Status page (this page)' }
  ];

  const workingEndpoints = endpoints.filter(ep => req.url?.includes(ep.path.replace('/api', '')));
  
  return res.status(200).json({ 
    message: 'Backend API Status',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'unknown',
      MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Not set',
      VERCEL: process.env.VERCEL ? '✅ Yes' : '❌ No'
    },
    endpoints: endpoints,
    currentRequest: {
      url: req.url,
      method: req.method,
      workingEndpoints: workingEndpoints.length
    }
  });
}
