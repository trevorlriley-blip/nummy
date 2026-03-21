export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Privacy Policy – Nummy</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 720px;
      margin: 48px auto;
      padding: 0 24px 64px;
      color: #1a1a1a;
      line-height: 1.7;
    }
    h1 { font-size: 2rem; margin-bottom: 4px; }
    h2 { font-size: 1.2rem; margin-top: 36px; }
    p, li { font-size: 1rem; color: #333; }
    ul { padding-left: 20px; }
    .updated { color: #888; font-size: 0.9rem; margin-bottom: 40px; }
    a { color: #4f7942; }
  </style>
</head>
<body>
  <h1>Privacy Policy</h1>
  <p class="updated">Last updated: March 21, 2026</p>

  <p>Nummy ("we", "our", or "us") is a meal planning app that helps you plan weekly meals, generate grocery lists, and discover new recipes. This Privacy Policy explains what information we collect, how we use it, and your rights.</p>

  <h2>1. Information We Collect</h2>
  <ul>
    <li><strong>Account information:</strong> Your email address and display name when you create an account.</li>
    <li><strong>Preferences:</strong> Dietary restrictions, allergies, cooking methods, family size, and budget preferences you provide during onboarding or in settings.</li>
    <li><strong>Meal plans and recipes:</strong> Meal plans you generate, custom recipes you create, and meals you mark as favorites or rate.</li>
    <li><strong>Google Calendar data:</strong> If you choose to enable Calendar Sync, we request access to create and update events on your Google Calendar. We only write meal events you explicitly sync — we do not read, store, or share your existing calendar data.</li>
  </ul>

  <h2>2. How We Use Your Information</h2>
  <ul>
    <li>To generate personalized meal plans and grocery lists using AI.</li>
    <li>To save and sync your preferences, meal history, and custom recipes across sessions.</li>
    <li>To add meal events to your Google Calendar when you request it.</li>
    <li>To improve the app experience.</li>
  </ul>

  <h2>3. Google API Disclosure</h2>
  <p>Nummy's use of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
  <p>We use Google Calendar solely to write meal plan events at your request. We do not use your Google data for advertising, profiling, or any purpose beyond the Calendar Sync feature.</p>

  <h2>4. Data Storage</h2>
  <p>Your account and preference data is stored securely using Supabase. Meal plans, custom recipes, and local settings may also be stored on your device. We do not sell your data to third parties.</p>

  <h2>5. Data Retention and Deletion</h2>
  <p>You may delete your account at any time from the Profile screen in the app. Deleting your account permanently removes all associated data from our servers. You may also revoke Google Calendar access at any time from your <a href="https://myaccount.google.com/permissions" target="_blank">Google Account permissions page</a>.</p>

  <h2>6. Third-Party Services</h2>
  <ul>
    <li><strong>Supabase</strong> – authentication and data storage</li>
    <li><strong>Anthropic Claude</strong> – AI meal planning and recipe generation</li>
    <li><strong>Spoonacular</strong> – recipe search</li>
    <li><strong>Google Calendar API</strong> – optional calendar sync</li>
  </ul>

  <h2>7. Children's Privacy</h2>
  <p>Nummy is not directed at children under 13. We do not knowingly collect personal information from children.</p>

  <h2>8. Changes to This Policy</h2>
  <p>We may update this policy from time to time. Continued use of the app after changes constitutes acceptance of the updated policy.</p>

  <h2>9. Contact</h2>
  <p>Questions? Email us at <a href="mailto:trevorlriley@gmail.com">trevorlriley@gmail.com</a>.</p>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
