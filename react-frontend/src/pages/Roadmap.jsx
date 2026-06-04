import { useState, useEffect } from 'react';
import { getRoadmapItems } from '../api/client';

const STATUS_META = {
  'in-progress': { color: '#1a9e6e', label: { en: 'In progress',  nl: 'Bezig' } },
  'planned':     { color: '#c07a10', label: { en: 'Planned',      nl: 'Gepland' } },
  'done':        { color: '#6b7280', label: { en: 'Done',         nl: 'Afgerond' } },
};

const STATUS_ORDER = ['in-progress', 'planned', 'done'];

export default function Roadmap({ lang }) {
  const t = (nl, en) => lang === 'nl' ? nl : en;
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRoadmapItems()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  // Group items by status
  const grouped = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = items.filter(i => i.status === s);
    return acc;
  }, {});

  return (
    <div className="inner">
      <h1 className="page-title">{t('Ontwikkelroadmap', 'Development roadmap')}</h1>

      <div className="update-banner">
        <div>
          <div className="ub-title">{t('Laatste update', 'Latest update')}</div>
          <div className="ub-body">
            {t(
              'Prioriteiten zijn afgestemd met bewonersinzichten en eerste pilotmetingen.',
              'Priorities are aligned with resident insights and first pilot measurements.'
            )}
          </div>
        </div>
      </div>

      {loading && (
        <p style={{ fontSize: 13, color: 'var(--gray-400)', padding: '16px 0' }}>
          {t('Laden…', 'Loading…')}
        </p>
      )}

      {!loading && items.length === 0 && (
        <p style={{ fontSize: 13, color: 'var(--gray-400)', padding: '16px 0' }}>
          {t('Nog geen items op de roadmap.', 'No roadmap items yet.')}
        </p>
      )}

      {STATUS_ORDER.map(status => {
        const meta  = STATUS_META[status];
        const group = grouped[status] || [];
        if (group.length === 0) return null;
        return (
          <div className="rm-section" key={status}>
            <div className="rm-head">
              <span className="status-dot" style={{ background: meta.color }} />
              <span className="status-lbl">
                {lang === 'nl' ? meta.label.nl : meta.label.en}
              </span>
            </div>
            {group.map(item => (
              <div className="rm-item" key={item.id}>
                <div className="rm-info">
                  <div className="rm-title">{item.title}</div>
                  {item.description && <div className="rm-sub">{item.description}</div>}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
