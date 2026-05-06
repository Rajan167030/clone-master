(async () => {
  try {
    const fetch = globalThis.fetch || (await import('node-fetch')).default;
    const loginRes = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@startuplanes.local', password: 'AdminPass123!' }),
    });
    const loginJson = await loginRes.json();
    console.log('LOGIN_RESPONSE:', loginJson);
    const token = loginJson.token;
    if (!token) {
      console.error('No token received. Aborting.');
      process.exit(1);
    }

    const createRes = await fetch('http://localhost:4000/api/admin/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'Test Partner From Script', logoUrl: 'https://example.com/logo.png', websiteUrl: 'https://example.com', order: 1, isActive: true }),
    });
    const createJson = await createRes.json().catch(() => ({}));
    console.log('CREATE_RESPONSE_STATUS:', createRes.status);
    console.log('CREATE_RESPONSE_BODY:', createJson);
  } catch (err) {
    console.error('Script error:', err);
    process.exit(1);
  }
})();
