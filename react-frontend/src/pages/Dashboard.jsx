import { useEffect, useMemo, useState } from 'react';
import { getRoadmapItems, getSurveyStats } from '../api/client';

const STATUS_META = {
  'in-progress': { color: '#1a9e6e', label: { en: 'In progress', nl: 'Bezig' } },
  'planned':     { color: '#c07a10', label: { en: 'Planned',     nl: 'Gepland' } },
  'done':        { color: '#6b7280', label: { en: 'Done',        nl: 'Afgerond' } },
};
const STATUS_ORDER = ['in-progress', 'planned', 'done'];

// ── Mini bar chart ────────────────────────────────────────────────────────────

function MiniBar({ data, total, color }) {
  if (!data || !data.length) return <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>—</p>;
  const max = data[0][1];
  return (
    <div className="db-bars">
      {data.map(([label, count]) => (
        <div className="db-bar-row" key={label}>
          <div className="db-bar-label">{label}</div>
          <div className="db-bar-track">
            <div className="db-bar-fill" style={{ width: `${Math.round((count / max) * 100)}%`, background: color }} />
          </div>
          <div className="db-bar-pct">{total ? Math.round((count / total) * 100) : 0}%</div>
        </div>
      ))}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard({ lang }) {
  const t = (nl, en) => lang === 'nl' ? nl : en;

  const [items,   setItems]   = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getRoadmapItems().catch(() => []),
      getSurveyStats().catch(() => null),
    ]).then(([roadmap, surveyStats]) => {
      setItems(roadmap);
      setStats(surveyStats);
    }).finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => (
    STATUS_ORDER.reduce((acc, s) => {
      acc[s] = items.filter(i => i.status === s);
      return acc;
    }, {})
  ), [items]);

  const inProgress = grouped['in-progress']?.length ?? 0;
  const done       = grouped['done']?.length ?? 0;

  const n      = stats?.total   ?? 0;
  const aiYes  = stats?.ai_yes  ?? 0;
  const aiPct  = n ? Math.round((aiYes / n) * 100) : 0;
  const q2Data = stats?.q2 ?? [];
  const q3Data = stats?.q3 ?? [];
  const q7Data = stats?.q7 ?? [];

  if (loading) {
    return (
      <div className="screen full-screen-shell dashboard-shell" style={{ paddingTop: 40, color: 'var(--gray-400)', fontSize: 13 }}>
        {t('Laden…', 'Loading…')}
      </div>
    );
  }

  return (
    <div className="screen full-screen-shell dashboard-shell">

      {/* ── Page header ── */}
      <div className="cd-header">
        <h1 className="cd-title">{t('Community Dashboard', 'Community Dashboard')}</h1>
        <p className="cd-sub">
          {t(
            'Volg de ontwikkeling van de digitale tweeling: wat in uitvoering is, wat gepland staat en wat is afgerond.',
            'Follow development of the digital twin: what is in progress, what is planned, and what has been completed.'
          )}
        </p>
        <div className="cd-survey-clause">
          <div className="cd-survey-copy">
            <strong>{t('Heb je de enquête al ingevuld?', 'Have you filled the survey yet?')}</strong>
            <span>
              {t(
                'Jouw input helpt ons prioriteiten stellen voor Aadorp. Het invullen duurt ongeveer 5 minuten.',
                'Your input helps us set priorities for Aadorp. Completing it takes about 5 minutes.'
              )}
            </span>
          </div>
          <a className="cd-survey-link" href="/survey">
            {t('Ga naar enquête →', 'Go to survey →')}
          </a>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — Community input stats                                  */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="cd-section-label">
        <span className="cd-section-dot" style={{ background: '#1a5fa8' }} />
        {t('Gemeenschapsinput', 'Community input')}
      </div>

      <div className="dash-live-grid">
        <div className="dash-live-card">
          <div className="dash-live-num">{n}</div>
          <div className="dash-live-lbl">{t('Inzendingen', 'Responses')}</div>
          <div className="dash-live-note">{t('ingevulde enquêtes', 'surveys completed')}</div>
        </div>
        <div className="dash-live-card">
          <div className="dash-live-num">{aiPct}%</div>
          <div className="dash-live-lbl">{t('Wil AI-assistent', 'Want AI assistant')}</div>
          <div className="dash-live-note">{t(`${aiYes} van ${n} respondenten`, `${aiYes} of ${n} respondents`)}</div>
        </div>
        <div className="dash-live-card">
          <div className="dash-live-num">{inProgress}</div>
          <div className="dash-live-lbl">{t('In uitvoering', 'In progress')}</div>
          <div className="dash-live-note">{t('actief door projectteam', 'actively worked on')}</div>
        </div>
        <div className="dash-live-card">
          <div className="dash-live-num">{done}</div>
          <div className="dash-live-lbl">{t('Afgerond', 'Completed')}</div>
          <div className="dash-live-note">{t('gereed voor bewoners', 'ready for residents')}</div>
        </div>
      </div>

      {/* ── Survey insights ── */}
      {n > 0 && (
        <>
          <div className="cd-section-label" style={{ marginTop: 8 }}>
            <span className="cd-section-dot" style={{ background: '#1a9e6e' }} />
            {t('Wat bewoners willen zien', 'What residents want to see')}
          </div>
          <div className="db-insights-grid">

            <div className="db-insight-card">
              <div className="db-insight-title">
                {t('Energie-prioriteit (V2)', 'Energy priority (Q2)')}
              </div>
              <MiniBar data={q2Data} total={n} color="var(--green)" />
            </div>

            <div className="db-insight-card">
              <div className="db-insight-title">
                {t('Eigen woning of buurt? (V3)', 'Own home or neighbourhood? (Q3)')}
              </div>
              <MiniBar data={q3Data} total={n} color="#1a5fa8" />
            </div>

            <div className="db-insight-card">
              <div className="db-insight-title">
                {t('Technologievoorkeuren (V7)', 'Technology preferences (Q7)')}
              </div>
              <MiniBar data={q7Data} total={n} color="#c07a10" />
            </div>

            <div className="db-insight-card">
              <div className="db-insight-title">
                {t('AI-ondersteuning (V8)', 'AI support (Q8)')}
              </div>
              <div className="db-ai-row">
                <div className="db-ai-bar-wrap">
                  <div className="db-ai-bar" style={{ width: `${aiPct}%` }} />
                </div>
                <span className="db-ai-label">{aiPct}% {t('wil AI', 'want AI')}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 6 }}>
                {aiYes} {t('ja', 'yes')} · {n - aiYes} {t('nee', 'no')} · {n} {t('totaal', 'total')}
              </div>
            </div>

          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — Public Development Roadmap                             */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="cd-section-label" style={{ marginTop: 8 }}>
        <span className="cd-section-dot" style={{ background: '#c07a10' }} />
        {t('Publieke ontwikkelroadmap', 'Public development roadmap')}
      </div>

      {items.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--gray-400)', paddingBottom: 16 }}>
          {t('Nog geen items op de roadmap.', 'No roadmap items yet.')}
        </p>
      ) : (
        STATUS_ORDER.map(status => {
          const meta  = STATUS_META[status];
          const group = grouped[status] || [];
          if (group.length === 0) return null;
          return (
            <div className={'rm-section' + (status === 'done' ? ' rm-section-done' : '')} key={status}>
              <div className="rm-head">
                <span className="status-dot" style={{ background: meta.color }} />
                <span className="status-lbl">{lang === 'nl' ? meta.label.nl : meta.label.en}</span>
                <span className="rm-count">{group.length}</span>
              </div>
              {group.map(item => (
                <div className="rm-item" key={item.id}>
                  <div className="rm-info">
                    <div className="rm-title">{item.title}</div>
                    {item.description && <div className="rm-sub">{item.description}</div>}
                  </div>
                  {status === 'done' && <span className="rm-done-badge">✓</span>}
                </div>
              ))}
            </div>
          );
        })
      )}

    </div>
  );
}
