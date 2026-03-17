import express from 'express';
import cors from 'cors';
import { POST as agentChatHandler } from '../app/api/agent/chat+api';
import { POST as scanRecipeHandler } from '../app/api/scan-recipe+api';

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' })); // 20 MB to accommodate base64 image uploads

async function adaptHandler(
  handler: (req: Request) => Promise<Response>,
  req: express.Request,
  res: express.Response
): Promise<void> {
  const url = `http://localhost${req.originalUrl}`;
  const webRequest = new Request(url, {
    method: req.method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body),
  });

  const webResponse = await handler(webRequest);
  const data = await webResponse.json();
  res.status(webResponse.status).json(data);
}

app.post('/api/agent/chat', (req, res) => adaptHandler(agentChatHandler, req, res));
app.post('/api/scan-recipe', (req, res) => adaptHandler(scanRecipeHandler, req, res));

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Nummy API server on port ${PORT}`));
