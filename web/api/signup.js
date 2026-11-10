export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { login, password, name } = req.body || {};
    if (!login || !password) {
      return res.status(400).json({ error: 'Login e senha são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha precisa ter no mínimo 6 dígitos' });
    }

    const cleaned = login.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    const canonicalEmail = `${cleaned || 'usuario'}@montanha.com`;

    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://muryznvaxzszcffrbxpv.supabase.co';
    const SERVICE_KEY =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cnl6bnZheHpzemNmZnJieHB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDQ0MTE2OSwiZXhwIjoyMTAwMDE3MTY5fQ.SpYzAP5ej1jUKyIPGSowyZrG_eeox50HmKnP1r81a24';

    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: canonicalEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: name || cleaned,
          username: cleaned
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      if (data.msg && data.msg.includes('already registered')) {
        return res.status(400).json({ error: 'Este login já está em uso. Se você já tem conta, clique na aba "Entrar".' });
      }
      return res.status(response.status).json({ error: data.msg || data.error_description || 'Erro ao registrar usuário' });
    }

    return res.status(200).json({ success: true, user: data });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro interno do servidor' });
  }
}
