import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const pathSegments = req.query.path;
    const path = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;

    const targetUrl = `http://13.125.10.228/${path}`;

    const response = await fetch(targetUrl, {
        method: req.method,
        headers: { 'Content-Type': 'application/json' },
        body: req.method !== 'GET' && req.method !== 'HEAD'
            ? JSON.stringify(req.body)
            : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
}