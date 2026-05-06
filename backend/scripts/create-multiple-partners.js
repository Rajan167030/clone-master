(async () => {
  try {
    const fetch = globalThis.fetch || (await import('node-fetch')).default;
    const loginRes = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@startuplanes.local', password: 'AdminPass123!' }),
    });
    const loginJson = await loginRes.json();
    if (!loginJson.token) {
      console.error('Login failed:', loginJson);
      process.exit(1);
    }
    const token = loginJson.token;

    const partners = [
      { name: 'Test Partner A', logoUrl: 'https://example.com/logo-a.png', websiteUrl: 'https://example.com/a', order: 1, isActive: true },
      { name: 'Test Partner B', logoUrl: 'https://example.com/logo-b.png', websiteUrl: 'https://example.com/b', order: 2, isActive: true },
      { name: 'Test Partner C', logoUrl: 'https://example.com/logo-c.png', websiteUrl: 'https://example.com/c', order: 3, isActive: false },
      { name: 'Test Partner D', logoUrl: 'https://example.com/logo-d.png', websiteUrl: 'https://example.com/d', order: 4, isActive: true },
    ];

    for (const p of partners) {
      const res = await fetch('http://localhost:4000/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(p),
      });
      const body = await res.json().catch(() => ({}));
      console.log('CREATE', p.name, '=>', res.status, body.message || JSON.stringify(body));
      if (body.partner) console.log('  id:', body.partner._id);
    }

    console.log('Done creating partners.');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
