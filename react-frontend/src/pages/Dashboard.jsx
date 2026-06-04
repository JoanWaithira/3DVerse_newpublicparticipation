import { useEffect, useMemo, useState } from 'react';
import { getRoadmapItems } from '../api/client';

const STATUS_META = {
  'in-progress': { color: '#1a9e6e', label: { en: 'In progress', nl: 'Bezig' } },
  'planned':     { color: '#c07a10', label: { en: 'Planned',     nl: 'Gepland' } },
  'done':        { color: '#6b7280', label: { en: 'Done',        nl: 'Afgerond' } },
};
const STATUS_ORDER = ['in-progress', 'planned', 'done'];

export default function Dashboard({ lang }) {
  const t = (nl, en) => lang === 'nl' ? nl : en;

  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRoadmapItems()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => (
    STATUS_ORDER.reduce((acc, s) => {
      acc[s] = items.filter(i => i.status === s);
      return acc;
    }, {})
  ), [items]);

  const inProgress = grouped['in-progress']?.length ?? 0;
  const planned = grouped['planned']?.length ?? 0;
  const done = grouped['done']?.length ?? 0;

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
      {/* SECTION 1 — Development Overview                                   */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="cd-section-label">
        <span className="cd-section-dot" style={{ background: '#1a5fa8' }} />
        {t('Ontwikkelstatus', 'Development status')}
      </div>

      <div className="dash-live-grid">
        <div className="dash-live-card">
          <div className="dash-live-num">{inProgress}</div>
          <div className="dash-live-lbl">{t('In uitvoering', 'In progress')}</div>
          <div className="dash-live-note">{t('actief door projectteam', 'actively worked on')}</div>
        </div>
        <div className="dash-live-card">
          <div className="dash-live-num">{planned}</div>
          <div className="dash-live-lbl">{t('Gepland', 'Planned')}</div>
          <div className="dash-live-note">{t('volgende ontwikkelfase', 'next development phase')}</div>
        </div>
        <div className="dash-live-card">
          <div className="dash-live-num">{done}</div>
          <div className="dash-live-lbl">{t('Afgerond', 'Completed')}</div>
          <div className="dash-live-note">{t('gereed voor bewoners', 'ready for residents')}</div>
        </div>
        <div className="dash-live-card">
          <div className="dash-live-num">{items.length}</div>
          <div className="dash-live-lbl">{t('Totaal roadmap-items', 'Total roadmap items')}</div>
          <div className="dash-live-note">{t('publieke voortgangsoverzicht', 'public progress overview')}</div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — Public Development Roadmap                             */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="cd-section-label">
        <span className="cd-section-dot" style={{ background: '#c07a10' }} />
        {t('Publieke ontwikkelroadmap', 'Public development roadmap')}
      </div>
      <p className="cd-section-sub">
        {t(
          'Hier zie je alleen de voortgang van het project. Diepere statistieken en beheerfuncties staan in het adminpaneel.',
          'This page shows project progress only. Detailed analytics and management actions are available in the admin panel.'
        )}
      </p>

      {items.length > 0 && (
        <div className="cd-bridge">
          <span className="cd-bridge-num">{items.length}</span>
          <span className="cd-bridge-text">
            {t(
              `${inProgress} in uitvoering · ${planned} gepland · ${done} afgerond`,
              `${inProgress} in progress · ${planned} planned · ${done} completed`
            )}
          </span>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — Development roadmap                                    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="cd-section-label">
        <span className="cd-section-dot" style={{ background: '#1a9e6e' }} />
        {t('Roadmap-details', 'Roadmap details')}
      </div>
      <p className="cd-section-sub">
        {t(
          'Bekijk de actuele projectitems per status.',
          'View current project items by status.'
        )}
      </p>

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
