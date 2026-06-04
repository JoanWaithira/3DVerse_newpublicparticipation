import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIdeas, voteIdea } from '../api/client';

const CATEGORIES = ['Mobility', 'Energy', 'Public space', 'Green & nature', 'Safety', 'Other'];
const FILTERS    = ['All', ...CATEGORIES];
const VOTED_KEY  = 'aadorp_voted_ideas';

function loadVoted() {
  try { return new Set(JSON.parse(localStorage.getItem(VOTED_KEY) || '[]')); }
  catch { return new Set(); }
}
function saveVoted(set) {
  try { localStorage.setItem(VOTED_KEY, JSON.stringify([...set])); } catch {}
}

export default function Wishlist({ lang }) {
  const t = (nl, en) => lang === 'nl' ? nl : en;
  const navigate = useNavigate();

  const [ideas, setIdeas]         = useState([]);
  const [voted, setVoted]         = useState(loadVoted);
  const [activeFilter, setFilter] = useState('All');
  const [loading, setLoading]     = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setIdeas(await getIdeas()); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function handleVote(idea) {
    const wasVoted = voted.has(idea.id);
    const delta    = wasVoted ? -1 : 1;

    // Optimistic update
    setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, votes: i.votes + delta } : i));
    const next = new Set(voted);
    wasVoted ? next.delete(idea.id) : next.add(idea.id);
    setVoted(next);
    saveVoted(next);

    try {
      const updated = await voteIdea(idea.id, idea.votes, delta);
      setIdeas(prev => prev.map(i => i.id === updated.id ? { ...i, votes: updated.votes } : i));
    } catch {
      // Roll back on error
      setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, votes: i.votes - delta } : i));
      setVoted(new Set(voted));
      saveVoted(new Set(voted));
    }
  }

  const visible = activeFilter === 'All'
    ? ideas
    : ideas.filter(i => i.category === activeFilter);

  return (
    <div className="inner">
      <div className="wl-toprow">
        <h1 className="page-title">{t('Wenslijst uit de buurt', 'Community wishlist')}</h1>
        <button className="btn-sm-green" onClick={() => navigate('/survey')}>
          + {t('Idee toevoegen', 'Add idea')}
        </button>
      </div>

      {/* Survey CTA banner */}
      <div className="wl-survey-cta">
        <div className="wl-cta-icon">💡</div>
        <div>
          <div className="wl-cta-title">
            {t('Wil je een idee toevoegen?', 'Want to add an idea?')}
          </div>
          <div className="wl-cta-sub">
            {t(
              'Vul de enquête in en kies om je idee te delen op deze wenslijst. Andere bewoners kunnen er dan op stemmen.',
              'Complete the survey and choose to share your idea on this wishlist. Other residents can then vote on it.'
            )}
          </div>
        </div>
        <button className="btn-sm-green" onClick={() => navigate('/survey')}>
          {t('Naar de enquête →', 'Take the survey →')}
        </button>
      </div>

      <div className="wl-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={'fchip' + (activeFilter === f ? ' on' : '')}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && (
        <p style={{ fontSize: 13, color: 'var(--gray-400)', padding: '16px 0' }}>
          {t('Laden…', 'Loading…')}
        </p>
      )}

      {!loading && visible.length === 0 && (
        <div className="wl-empty">
          <div className="wl-empty-icon">🗳️</div>
          <p className="wl-empty-title">
            {activeFilter === 'All'
              ? t('Nog geen ideeën gedeeld.', 'No ideas shared yet.')
              : t('Geen ideeën in deze categorie.', 'No ideas in this category.')}
          </p>
          <p className="wl-empty-sub">
            {t(
              'Vul de enquête in en deel als eerste jouw idee.',
              'Complete the survey and be the first to share your idea.'
            )}
          </p>
        </div>
      )}

      {visible.map(idea => (
        <div className="idea-card" key={idea.id}>
          <div className="vote-col">
            <button
              className={'vote-btn' + (voted.has(idea.id) ? ' voted' : '')}
              onClick={() => handleVote(idea)}
              aria-label="Vote"
            >
              <svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            </button>
            <div className="vote-count">{idea.votes}</div>
          </div>
          <div className="idea-body">
            <div className="idea-title">{idea.title}</div>
            {idea.description && <div className="idea-desc">{idea.description}</div>}
            <div className="idea-tags">
              <span className="tag tag-topic">{idea.category}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
