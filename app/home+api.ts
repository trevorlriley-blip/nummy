const BASE = 'https://nummy-production.up.railway.app';

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nummy – AI Meal Planning</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f7f9f5;
      color: #1a1a1a;
    }
    nav {
      background: #fff;
      border-bottom: 1px solid #e8ede6;
      padding: 14px 32px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    nav img { width: 32px; height: 32px; border-radius: 8px; }
    nav .brand { font-weight: 700; font-size: 1.1rem; color: #2e5c27; flex: 1; }
    nav a { color: #4f7942; text-decoration: none; font-size: 0.9rem; margin-left: 20px; }
    nav a:hover { text-decoration: underline; }
    .hero {
      max-width: 800px;
      margin: 80px auto 60px;
      padding: 0 24px;
      text-align: center;
    }
    .hero img {
      width: 100px;
      height: 100px;
      border-radius: 22px;
      box-shadow: 0 8px 32px rgba(79,121,66,0.18);
      margin-bottom: 28px;
    }
    .hero h1 {
      font-size: 2.8rem;
      font-weight: 800;
      color: #2e5c27;
      line-height: 1.15;
      margin-bottom: 16px;
    }
    .hero p {
      font-size: 1.15rem;
      color: #555;
      line-height: 1.7;
      max-width: 560px;
      margin: 0 auto 36px;
    }
    .badge {
      display: inline-block;
      background: #2e5c27;
      color: #fff;
      border-radius: 14px;
      padding: 14px 32px;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      letter-spacing: 0.2px;
    }
    .features {
      max-width: 800px;
      margin: 0 auto 80px;
      padding: 0 24px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }
    .feature {
      background: #fff;
      border-radius: 16px;
      padding: 28px 24px;
      border: 1px solid #e8ede6;
    }
    .feature .icon { font-size: 2rem; margin-bottom: 12px; }
    .feature h3 { font-size: 1rem; font-weight: 700; color: #2e5c27; margin-bottom: 8px; }
    .feature p { font-size: 0.9rem; color: #666; line-height: 1.6; }
    footer {
      background: #fff;
      border-top: 1px solid #e8ede6;
      padding: 24px 32px;
      text-align: center;
      font-size: 0.85rem;
      color: #888;
    }
    footer a { color: #4f7942; text-decoration: none; margin: 0 10px; }
    footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <nav>
    <img src="${BASE}/icon" alt="Nummy logo" />
    <span class="brand">Nummy</span>
    <a href="${BASE}/privacy">Privacy Policy</a>
    <a href="${BASE}/terms">Terms of Service</a>
  </nav>

  <div class="hero">
    <img src="${BASE}/icon" alt="Nummy app icon" />
    <h1>Meal planning,<br>made effortless.</h1>
    <p>Nummy uses AI to build personalized weekly meal plans, generate smart grocery lists, and help you discover recipes your whole family will love.</p>
    <a class="badge" href="https://apps.apple.com/app/nummy" target="_blank">Download on the App Store</a>
  </div>

  <div class="features">
    <div class="feature">
      <div class="icon">🗓️</div>
      <h3>Weekly Meal Plans</h3>
      <p>Generate a full week of personalized meals in seconds, tailored to your dietary needs and preferences.</p>
    </div>
    <div class="feature">
      <div class="icon">🛒</div>
      <h3>Smart Grocery Lists</h3>
      <p>Your grocery list is built automatically from your meal plan — grouped by category and ready to shop.</p>
    </div>
    <div class="feature">
      <div class="icon">📖</div>
      <h3>Your Recipe Collection</h3>
      <p>Save your own recipes and blend them with new discoveries. Scan a recipe photo to add it instantly.</p>
    </div>
    <div class="feature">
      <div class="icon">📅</div>
      <h3>Calendar Sync</h3>
      <p>Sync your meal plan directly to Google Calendar so your whole family stays on the same page.</p>
    </div>
  </div>

  <footer>
    <p>© ${new Date().getFullYear()} Nummy. All rights reserved.</p>
    <p style="margin-top: 8px;">
      <a href="${BASE}/privacy">Privacy Policy</a>
      <a href="${BASE}/terms">Terms of Service</a>
      <a href="mailto:nummyaimealplanning@gmail.com">Contact</a>
    </p>
  </footer>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
