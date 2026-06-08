'use client';
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api/generate-ppt', {
      method: 'POST',
      body: JSON.stringify({
        topic: formData.get('topic'),
        details: formData.get('details'),
        email: formData.get('email'),
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    alert(data.message);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: '50px auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>AI PPT 助手</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>PPT主题</label>
          <input name="topic" required style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>详细要求（可选）</label>
          <textarea name="details" rows={4} style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>您的邮箱</label>
          <input name="email" type="email" required style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', background: '#0070f3', color: 'white', padding: 10, border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {loading ? '生成中...' : '立即生成PPT'}
        </button>
      </form>
    </div>
  );
}