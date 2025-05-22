// Serverless function to proxy requests to Semaphore API
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://api.semaphore.co/api/v4/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.text();

    // Forward the response status
    res.status(response.status);

    // Try to parse as JSON, if not, send as text
    try {
      res.json(JSON.parse(data));
    } catch {
      res.send(data);
    }
  } catch (error) {
    console.error('Error proxying to Semaphore:', error);
    res.status(500).json({ message: 'Failed to send SMS' });
  }
} 