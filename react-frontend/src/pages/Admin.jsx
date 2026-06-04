import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  getResponses, deleteAllResponses,
  getIdeas, deleteIdea,
  getRoadmapItems, upsertRoadmapItem, deleteRoadmapItem,
} from '../api/client';

const PAGE_SIZE = 10;

// ── Charts ────────────────────────────────────────────────────────────────────

function freqSingle(rows, key) {
  const counts = {};
  rows.forEach(r => {
    const v = r.answers?.[key]?.trim();
    if (v) counts[v] = (counts[v] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function freqMulti(rows, key) {
  const counts = {};
  rows.forEach(r => {
    (r.answers?.[key] || '').split(' | ').forEach(v => {
      const s = v.trim();
      if (s) counts[s] = (counts[s] || 0) + 1;
    });
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function ChartCard({ title, data, total, color = 'var(--green)' }) {
  if (data.length === 0) return (
    <div className="adm-panel" style={{ marginBottom: 14 }}>
      <div className="adm-ptitle">{title}</div>
      <div className="adm-body">
        <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>No data yet.</p>
      </div>
    </div>
  );
  const max = data[0][1];
  return (
    <div className="adm-panel" style={{ marginBottom: 14 }}>
      <div className="adm-ptitle">{title}</div>
      <div className="adm-body">
        {data.map(([label, count]) => (
          <div className="cbar-row" key={label}>
            <div className="cbar-label" title={label}>{label}</div>
            <div className="cbar-track">
              <div className="cbar-fill" style={{ width: `${Math.round((count / max) * 100)}%`, background: color }} />
            </div>
            <div className="cbar-stat">
              {count} <span>({total ? Math.round((count / total) * 100) : 0}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryTab({ rows }) {
  const n = rows.length;
  if (n === 0) return (
    <div className="adm-panel">
      <div className="adm-ptitle">Summary</div>
      <div className="adm-body"><p style={{ fontSize: 12, color: 'var(--gray-400)' }}>No submissions yet.</p></div>
    </div>
  );

  const aiYes = rows.filter(r => r.answers?.q8 === 'Yes please').length;
  const withIdea = rows.filter(r => r.answers?.q9?.trim()).length;

  return (
    <div>
      {/* Headline KPIs */}
      <div className="adm-panel" style={{ marginBottom: 14 }}>
        <div className="adm-ptitle">At a glance — {n} response{n !== 1 ? 's' : ''}</div>
        <div className="adm-body">
          <div className="adm-kpis">
            <div className="adm-kpi"><div className="adm-kpi-num">{n}</div><div className="adm-kpi-lbl">Total submissions</div></div>
            <div className="adm-kpi"><div className="adm-kpi-num">{withIdea}</div><div className="adm-kpi-lbl">Left a comment / idea</div></div>
            <div className="adm-kpi"><div className="adm-kpi-num">{aiYes}</div><div className="adm-kpi-lbl">Want AI assistant</div></div>
            <div className="adm-kpi"><div className="adm-kpi-num">{n ? Math.round((aiYes/n)*100) : 0}%</div><div className="adm-kpi-lbl">AI support rate</div></div>
          </div>
        </div>
      </div>

      <ChartCard title="Role"                                          data={freqSingle(rows,'role')} total={n} color="#1a5fa8" />
      <ChartCard title="Q1 — Where do you live?"                       data={freqSingle(rows,'q1')}  total={n} color="#1a5fa8" />
      <ChartCard title="Q2 — Building energy priority"                 data={freqSingle(rows,'q2')}  total={n} />
      <ChartCard title="Q3 — Own home or neighbourhood?"               data={freqSingle(rows,'q3')}  total={n} />
      <ChartCard title="Q4 — Digital twin level"                       data={freqSingle(rows,'q4')}  total={n} />
      <ChartCard title="Q5 — Raw numbers or simpler format?"           data={freqSingle(rows,'q5')}  total={n} />
      <ChartCard title="Q6 — Most useful comparison (multi-select)"    data={freqMulti(rows,'q6')}   total={n} color="#c07a10" />
      <ChartCard title="Q7 — Renewable tech preferences (multi-select)" data={freqMulti(rows,'q7')}  total={n} color="#c07a10" />
      <ChartCard title="Q8 — AI assistant support"                     data={freqSingle(rows,'q8')}  total={n} />
    </div>
  );
}

function csvEscape(v) {
  const s = String(v == null ? '' : v);
  return '"' + s.replace(/"/g, '""') + '"';
}

// ── Login screen ──────────────────────────────────────────────────────────────

function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setLoading(false);
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">🔒</div>
        <h2 className="login-title">Admin Login</h2>
        <p className="login-sub">This area is restricted to authorised operators.</p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Roadmap manager ───────────────────────────────────────────────────────────

const STATUS_OPTS = ['in-progress', 'planned', 'done'];
const BLANK_ITEM  = { title: '', description: '', status: 'planned', sort_order: 0 };

function RoadmapManager() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(BLANK_ITEM);
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setItems(await getRoadmapItems()); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  function startEdit(item) {
    setEditId(item.id);
    setForm({ title: item.title, description: item.description || '', status: item.status, sort_order: item.sort_order || 0 });
  }

  function cancelEdit() { setEditId(null); setForm(BLANK_ITEM); }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, title: form.title.trim(), description: form.description.trim() };
      if (editId) payload.id = editId;
      await upsertRoadmapItem(payload);
      cancelEdit();
      refresh();
    } catch (err) { alert('Save failed: ' + err.message); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this roadmap item?')) return;
    try { await deleteRoadmapItem(id); refresh(); }
    catch (err) { alert('Delete failed: ' + err.message); }
  }

  const STATUS_COLORS = { 'in-progress': '#1a9e6e', 'planned': '#c07a10', 'done': '#6b7280' };

  return (
    <div className="adm-panel">
      <div className="adm-ptitle">{editId ? 'Edit Roadmap Item' : 'Roadmap'}</div>
      <div className="adm-body">
        {!editId && (
          <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 16 }}>
            Items appear here from two sources: ideas promoted from the <strong>Wishlist</strong> tab,
            or new features added manually below. Set the status to keep residents informed of progress.
          </p>
        )}
        <form onSubmit={handleSave} style={{ marginBottom: 24 }}>
          <div className="rm-form-grid">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                className="form-input"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Item title"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description / sub-label</label>
              <input
                className="form-input"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Autumn rollout"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              >
                {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Sort order</label>
              <input
                className="form-input"
                type="number"
                value={form.sort_order}
                onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                style={{ width: 80 }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : editId ? 'Update item' : 'Add item'}
            </button>
            {editId && (
              <button className="btn-secondary" type="button" onClick={cancelEdit}>Cancel</button>
            )}
          </div>
        </form>

        {loading
          ? <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>Loading…</p>
          : items.length === 0
            ? <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>No roadmap items yet.</p>
            : items.map(item => (
              <div className="rm-admin-row" key={item.id}>
                <span
                  className="rm-status-dot"
                  style={{ background: STATUS_COLORS[item.status] || '#999' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                  {item.description && <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{item.description}</div>}
                </div>
                <span className="rm-status-badge" style={{ background: STATUS_COLORS[item.status] + '22', color: STATUS_COLORS[item.status] }}>
                  {item.status}
                </span>
                <button className="adm-view-btn" onClick={() => startEdit(item)}>Edit</button>
                <button className="adm-danger-btn" onClick={() => handleDelete(item.id)}>Delete</button>
              </div>
            ))
        }
      </div>
    </div>
  );
}

// ── Wishlist moderator ────────────────────────────────────────────────────────

function WishlistManager() {
  const [ideas, setIdeas]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [promoted, setPromoted] = useState(new Set());
  const [promoting, setPromoting] = useState(null); // id being promoted

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setIdeas(await getIdeas()); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function handlePromote(idea) {
    setPromoting(idea.id);
    try {
      await upsertRoadmapItem({
        title:       idea.title,
        description: idea.description || idea.category,
        status:      'planned',
        sort_order:  99,
      });
      setPromoted(prev => new Set([...prev, idea.id]));
    } catch (err) {
      alert('Could not add to roadmap: ' + err.message);
    }
    setPromoting(null);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this idea?')) return;
    try { await deleteIdea(id); refresh(); }
    catch (err) { alert('Delete failed: ' + err.message); }
  }

  return (
    <div className="adm-panel">
      <div className="adm-ptitle">Wishlist Ideas</div>
      <div className="adm-body">
        <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 12 }}>
          Promote community ideas to the roadmap so residents can follow their progress.
          Promoted items appear in the <strong>Roadmap</strong> tab where you can set their status.
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button className="adm-view-btn" onClick={refresh}>Refresh</button>
          <span className="adm-meta">{ideas.length} idea{ideas.length !== 1 ? 's' : ''}</span>
        </div>
        {loading
          ? <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>Loading…</p>
          : ideas.length === 0
            ? <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>No ideas submitted yet.</p>
            : ideas.map(idea => (
              <div className="rm-admin-row" key={idea.id}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{idea.title}</div>
                  {idea.description && <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{idea.description}</div>}
                  <span className="tag tag-topic" style={{ marginTop: 4, display: 'inline-block' }}>{idea.category}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', minWidth: 40, textAlign: 'right' }}>
                  ▲ {idea.votes}
                </span>
                {promoted.has(idea.id) ? (
                  <span className="promoted-badge">✓ On roadmap</span>
                ) : (
                  <button
                    className="promote-btn"
                    onClick={() => handlePromote(idea)}
                    disabled={promoting === idea.id}
                  >
                    {promoting === idea.id ? '…' : '→ Roadmap'}
                  </button>
                )}
                <button className="adm-danger-btn" onClick={() => handleDelete(idea.id)}>Delete</button>
              </div>
            ))
        }
      </div>
    </div>
  );
}

// ── Admin page ────────────────────────────────────────────────────────────────

export default function Admin({ lang }) {
  const t = (nl, en) => lang === 'nl' ? nl : en;
  const navigate = useNavigate();

  // Auth state
  const [session, setSession]         = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Responses state
  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('dashboard');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [primaryColor, setPrimary]  = useState('#1F4E79');

  const refresh = useCallback(() => {
    setLoading(true);
    getResponses()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (session) refresh(); }, [session, refresh]);

  useEffect(() => {
    document.documentElement.style.setProperty('--green', primaryColor);
  }, [primaryColor]);

  const now      = new Date();
  const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);
  const todayCount = rows.filter(r => new Date(r.submittedAt) >= dayStart).length;
  const openCount  = rows.filter(r => r.answers?.q9?.trim()).length;

  const filtered = rows.filter(r => {
    if (!search) return true;
    const hay = Object.values(r.answers || {}).join(' ') + ' ' + r.id + ' ' + r.submittedAt;
    return hay.toLowerCase().includes(search.toLowerCase());
  }).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleDelete() {
    if (!window.confirm('Delete all stored survey responses? This cannot be undone.')) return;
    deleteAllResponses().then(refresh);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'survey-responses.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function exportCsv() {
    const header = ['id', 'submittedAt', 'role', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'];
    const lines = [header.join(','), ...rows.map(r =>
      [r.id, r.submittedAt, r.answers?.role || '', ...[1,2,3,4,5,6,7,8,9].map(i => r.answers?.['q'+i] || '')]
        .map(csvEscape).join(',')
    )];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'survey-responses.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const TABS = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'summary',   label: 'Summary' },
    { id: 'responses', label: 'Responses' },
    { id: 'roadmap',   label: 'Roadmap' },
    { id: 'wishlist',  label: 'Wishlist' },
    { id: 'branding',  label: 'Branding' },
    { id: 'export',    label: 'Backup' },
  ];

  // ── Auth gates ─────────────────────────────────────────────────────────────
  if (!authChecked) {
    return <div className="screen full-screen-shell admin-shell"><p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Loading…</p></div>;
  }
  if (!session) return <Login />;

  // ── Authenticated admin UI ─────────────────────────────────────────────────
  return (
    <div className="screen full-screen-shell admin-shell">
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="adm-hdr">
          <div className="adm-topbar">
            <div>
              <h2>Admin Control Center</h2>
              <p>Logged in as {session.user.email}</p>
            </div>
            <div className="adm-topbar-actions">
              <button className="adm-view-btn" onClick={() => navigate('/')}>Citizen view</button>
              <button className="adm-danger-btn" onClick={() => supabase.auth.signOut()}>Sign out</button>
            </div>
          </div>
        </div>
        <div className="adm-tabs">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              className={'adm-tab' + (tab === id ? ' active' : '')}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {tab === 'dashboard' && (
        <div style={{ marginTop: 14 }}>
          <div className="adm-panel">
            <div className="adm-ptitle">Operational Overview</div>
            <div className="adm-body">
              <div className="adm-kpis">
                <div className="adm-kpi"><div className="adm-kpi-num">{rows.length}</div><div className="adm-kpi-lbl">Survey submissions</div></div>
                <div className="adm-kpi"><div className="adm-kpi-num">{todayCount}</div><div className="adm-kpi-lbl">Submissions today</div></div>
                <div className="adm-kpi"><div className="adm-kpi-num">{openCount}</div><div className="adm-kpi-lbl">Open comments</div></div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="adm-view-btn" onClick={() => navigate('/dashboard')}>Public dashboard</button>
                <button className="adm-view-btn" onClick={() => setTab('responses')}>Response table</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary charts */}
      {tab === 'summary' && (
        <div style={{ marginTop: 14 }}>
          <SummaryTab rows={rows} />
        </div>
      )}

      {/* Responses */}
      {tab === 'responses' && (
        <div style={{ marginTop: 14 }}>
          <div className="adm-panel">
            <div className="adm-ptitle">Survey Responses Explorer</div>
            <div className="adm-body">
              <div className="adm-tools">
                <input
                  type="text"
                  placeholder="Search responses (any question)"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
                <span className="adm-meta">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                <button className="adm-view-btn" onClick={refresh}>Refresh</button>
                <button className="adm-view-btn" onClick={exportCsv}>Export CSV</button>
                <button className="adm-view-btn" onClick={exportJson}>Export JSON</button>
                <button className="adm-danger-btn" onClick={handleDelete}>Clear all responses</button>
              </div>
              {loading ? (
                <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>Loading…</p>
              ) : (
                <div className="adm-tbl-wrap">
                  <table className="adm-tbl">
                    <thead>
                      <tr><th>ID</th><th>Submitted</th><th>Role</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Q5</th><th>Q6</th><th>Q7</th><th>Q8</th><th>Q9</th></tr>
                    </thead>
                    <tbody>
                      {pageRows.length === 0 && (
                        <tr><td colSpan={12} style={{ textAlign: 'center', color: 'var(--gray-400)' }}>No submissions yet.</td></tr>
                      )}
                      {pageRows.map(r => (
                        <tr key={r.id}>
                          <td title={r.id}>{r.id.slice(0, 8)}…</td>
                          <td>{new Date(r.submittedAt).toLocaleString()}</td>
                          <td>{r.answers?.role || '—'}</td>
                          {[1,2,3,4,5,6,7,8,9].map(i => <td key={i}>{r.answers?.['q'+i] || '—'}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="adm-pager">
                <span className="adm-meta">Page {safePage} of {totalPages}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="adm-view-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage <= 1}>Previous</button>
                  <button className="adm-view-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}>Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Roadmap management */}
      {tab === 'roadmap' && (
        <div style={{ marginTop: 14 }}>
          <RoadmapManager />
        </div>
      )}

      {/* Wishlist moderation */}
      {tab === 'wishlist' && (
        <div style={{ marginTop: 14 }}>
          <WishlistManager />
        </div>
      )}

      {/* Branding */}
      {tab === 'branding' && (
        <div style={{ marginTop: 14 }}>
          <div className="adm-panel">
            <div className="adm-ptitle">Branding Settings</div>
            <div className="adm-body">
              <div className="adm-row">
                <label>Primary colour</label>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimary(e.target.value)}
                  style={{ height: 38, padding: '2px 6px', width: 120 }}
                />
              </div>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>
                Colour change applies live to this session only.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Backup */}
      {tab === 'export' && (
        <div style={{ marginTop: 14 }}>
          <div className="adm-panel">
            <div className="adm-ptitle">Backup and Restore</div>
            <div className="adm-body">
              <p style={{ fontSize: 13, color: '#666', marginBottom: 13 }}>
                Export all survey responses as JSON or CSV for offline analysis and backup.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="adm-view-btn" onClick={exportJson}>Export JSON</button>
                <button className="adm-view-btn" onClick={exportCsv}>Export CSV</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
