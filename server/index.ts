import express from 'express';
import cors from 'cors';
import { POST as agentChatHandler } from '../app/api/agent/chat+api';
import { POST as scanRecipeHandler } from '../app/api/scan-recipe+api';
import { POST as deleteAccountHandler } from '../app/api/delete-account+api';
import { GET as homeHandler } from '../app/home+api';
import { GET as privacyHandler } from '../app/privacy+api';
import { GET as termsHandler } from '../app/terms+api';
import { GET as iconHandler } from '../app/icon+api';

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));

async function adaptJsonHandler(
  handler: (req: Request) => Promise<Response>,
  req: express.Request,
  res: express.Response
): Promise<void> {
  const url = `http://localhost${req.originalUrl}`;
  const webRequest = new Request(url, {
    method: req.method,
    headers: { 'Content-Type': 'application/json', ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}) },
    body: JSON.stringify(req.body),
  });

  const webResponse = await handler(webRequest);
  const data = await webResponse.json();
  res.status(webResponse.status).json(data);
}

async function adaptResponseHandler(
  handler: () => Promise<Response>,
  req: express.Request,
  res: express.Response
): Promise<void> {
  const webResponse = await handler();
  const contentType = webResponse.headers.get('Content-Type') ?? 'text/plain';
  res.status(webResponse.status).set('Content-Type', contentType);
  if (contentType.startsWith('image/')) {
    const buf = await webResponse.arrayBuffer();
    res.send(Buffer.from(buf));
  } else {
    const text = await webResponse.text();
    res.send(text);
  }
}

app.post('/api/agent/chat', (req, res) => adaptJsonHandler(agentChatHandler, req, res));
app.post('/api/scan-recipe', (req, res) => adaptJsonHandler(scanRecipeHandler, req, res));
app.post('/api/delete-account', (req, res) => adaptJsonHandler(deleteAccountHandler, req, res));

app.get('/home', (req, res) => adaptResponseHandler(homeHandler, req, res));
app.get('/privacy', (req, res) => adaptResponseHandler(privacyHandler, req, res));
app.get('/terms', (req, res) => adaptResponseHandler(termsHandler, req, res));
app.get('/icon', (req, res) => adaptResponseHandler(iconHandler, req, res));

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Nummy API server on port ${PORT}`));
