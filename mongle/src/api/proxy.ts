export default async function handler(req, res) {
    const response = await fetch(`http://13.125.10.228${req.url.replace('/api/proxy', '')}`, {
        method: req.method,
        headers: { 'Content-Type': 'application/json' },
        body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });
    const data = await response.json();
    res.status(response.status).json(data);
}