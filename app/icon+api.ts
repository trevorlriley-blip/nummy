import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const iconPath = join(process.cwd(), 'assets', 'icon.png');
    const iconData = readFileSync(iconPath);
    return new Response(iconData, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
