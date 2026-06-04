import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitResponse, submitIdea } from '../api/client';

// ── Embedded preview component ────────────────────────────────────────────────
// Lazy-loads an iframe only after the user clicks "View preview".
// Shows a spinner until the iframe fires onLoad, then fades in.

function EmbedPreview({ src, title, label, lang }) {
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const t = (nl, en) => lang === 'nl' ? nl : en;
  return (
    <div className="embed-preview">
      <div className="embed-bar">
        <span className="embed-label">{label}</span>
        <div className="embed-actions">
          {!active ? (
            <button className="embed-load-btn" onClick={() => setActive(true)}>
              {t('▶ Bekijk voorbeeld', '▶ View preview')}
            </button>
          ) : (
            <button className="embed-close-btn" onClick={() => { setActive(false); setLoaded(false); }}>
              {t('✕ Sluit voorbeeld', '✕ Close preview')}
            </button>
          )}
          <a className="embed-ext-link" href={src} target="_blank" rel="noopener noreferrer">
            {t('Openen ↗', 'Open ↗')}
          </a>
        </div>
      </div>
      {active && (
        <div className="embed-container">
          {!loaded && <div className="embed-spinner" />}
          <iframe
            src={src}
            title={title}
            className="embed-frame"
            style={{ opacity: loaded ? 1 : 0 }}
            onLoad={() => setLoaded(true)}
            allow="fullscreen"
          />
        </div>
      )}
    </div>
  );
}

const SUBMITTED_KEY = 'aadorp_survey_done';

// ── Already-submitted screen ──────────────────────────────────────────────────

function AlreadyDone({ lang }) {
  const t = (nl, en) => lang === 'nl' ? nl : en;
  return (
    <div className="inner">
      <div className="already-done-wrap">
        <div className="already-done-icon">✅</div>
        <h2 className="already-done-title">
          {t('Je hebt al meegedaan!', 'You have already participated!')}
        </h2>
        <p className="already-done-sub">
          {t(
            'Jouw antwoorden zijn opgeslagen. Bedankt voor je bijdrage aan de Aadorp digitale tweeling.',
            'Your answers have been saved. Thank you for contributing to the Aadorp digital twin.'
          )}
        </p>
        <a className="btn-primary" href="/wishlist" style={{ textDecoration: 'none', display: 'inline-block' }}>
          {t('Bekijk de wenslijst →', 'View the community wishlist →')}
        </a>
      </div>
    </div>
  );
}

// ── Option data ───────────────────────────────────────────────────────────────

const ROLE_OPTS = [
  { en: 'Resident of Aadorp',   nl: 'Bewoner van Aadorp' },
  { en: 'Municipality',         nl: 'Gemeente' },
  { en: 'Grid operator',        nl: 'Netbeheerder' },
  { en: 'Researcher / student', nl: 'Onderzoeker / student' },
  { en: 'Company / installer',  nl: 'Bedrijf / installateur' },
  { en: 'Other',                nl: 'Anders' },
];

const Q1_OPTS = [
  { en: 'Aadorp',                        nl: 'Aadorp' },
  { en: 'Nearby area (within Almelo)',   nl: 'Nabijgelegen buurt (binnen Almelo)' },
  { en: 'Elsewhere in the Netherlands',  nl: 'Elders in Nederland' },
  { en: 'Outside the Netherlands',       nl: 'Buiten Nederland' },
];

const Q2_OPTS = [
  { en: 'Monthly costs (€)',     nl: 'Kosten per maand (€)' },
  { en: 'Usage in kWh',          nl: 'Verbruik in kWh' },
  { en: 'CO₂ emissions',         nl: 'CO₂-uitstoot' },
  { en: 'Solar energy yield',    nl: 'Zonne-energie opbrengst' },
  { en: 'Comfort & temperature', nl: 'Comfort & temperatuur' },
];

const Q3_OPTS = [
  { en: 'Only my own home',                  nl: 'Alleen mijn eigen woning' },
  { en: 'My street or neighbourhood',        nl: 'Mijn straat of buurt' },
  { en: 'Both — depending on the question',  nl: 'Beide — afhankelijk van de vraag' },
];

const Q4_OPTS = [
  { en: 'Per-household level',   nl: 'Per woning' },
  { en: 'Neighbourhood level',   nl: 'Buurtniveau' },
  { en: 'Both views available',  nl: 'Beide weergaven beschikbaar' },
];

const Q5_OPTS = [
  { en: 'Raw numbers (kWh, kg CO₂…)', nl: 'Ruwe getallen (kWh, kg CO₂…)' },
  { en: 'Energy label (A to G)',       nl: 'Energielabel (A t/m G)' },
  { en: 'Both — overview and detail',  nl: 'Beide — overzicht én detail' },
];

const Q6_CHIPS = [
  { en: 'Yesterday',            nl: 'Gisteren' },
  { en: 'Last week',            nl: 'Vorige week' },
  { en: 'Last year',            nl: 'Vorig jaar' },
  { en: 'Similar homes nearby', nl: 'Vergelijkbare woningen' },
  { en: 'National average',     nl: 'Nationaal gemiddelde' },
  { en: 'My street total',      nl: 'Mijn straat totaal' },
];

const Q7_CHIPS = [
  { en: 'Solar panels',         nl: 'Zonnepanelen' },
  { en: 'Heat pump',            nl: 'Warmtepomp' },
  { en: 'Hybrid heat pump',     nl: 'Hybride warmtepomp' },
  { en: 'Wall insulation',      nl: 'Gevelisolatie' },
  { en: 'Roof insulation',      nl: 'Dakisolatie' },
  { en: 'Local energy sharing', nl: 'Lokaal energie delen' },
  { en: 'Not sure yet',         nl: 'Weet ik nog niet' },
];

function inferIdeaCategory(answers) {
  const hay = [answers.q2, answers.q7, answers.q9].join(' ').toLowerCase();
  if (/(solar|heat pump|insulation|energy|co2|kwh|zonne|warmtepomp|isolatie|energie)/.test(hay)) return 'Energy';
  if (/(street|traffic|bike|bus|mobility|straat|verkeer|mobiliteit)/.test(hay)) return 'Mobility';
  if (/(park|tree|green|nature|groen|natuur)/.test(hay)) return 'Green & nature';
  if (/(safe|safety|light|crime|veilig|veiligheid|verlichting)/.test(hay)) return 'Safety';
  if (/(square|playground|public space|plein|speel|openbare)/.test(hay)) return 'Public space';
  return 'Other';
}

function buildIdeaPayload(answers) {
  const comment = answers.q9.trim();
  const role = answers.role || 'Participant';
  const primary = answers.q2 || 'Digital twin preference';
  const title = (comment || `${role}: ${primary}`).slice(0, 120);
  const description = [
    `Role: ${answers.role || '-'}`,
    `Location: ${answers.q1 || '-'}`,
    `Priority: ${answers.q2 || '-'}`,
    `Scale preference: ${answers.q3 || '-'}`,
    `Twin level: ${answers.q4 || '-'}`,
    `Data format: ${answers.q5 || '-'}`,
    `Useful comparisons: ${answers.q6.join(', ') || '-'}`,
    `Tech preferences: ${answers.q7.join(', ') || '-'}`,
    `AI assistant: ${answers.q8 || '-'}`,
    `Open comment: ${comment || '-'}`,
  ].join(' | ').slice(0, 1200);

  return {
    title,
    description,
    category: inferIdeaCategory(answers),
  };
}

// ── Reusable input components ─────────────────────────────────────────────────

function SingleOpts({ opts, value, onChange, lang }) {
  return (
    <div className="opts">
      {opts.map(o => (
        <div
          key={o.en}
          className={'opt' + (value === o.en ? ' sel' : '')}
          onClick={() => onChange(o.en)}
        >
          <div className="opt-text">{lang === 'nl' ? o.nl : o.en}</div>
        </div>
      ))}
    </div>
  );
}

function Chips({ opts, selected, onToggle, lang }) {
  return (
    <div className="chips">
      {opts.map(o => (
        <button
          key={o.en}
          className={'chip' + (selected.includes(o.en) ? ' sel' : '')}
          onClick={() => onToggle(o.en)}
        >
          {lang === 'nl' ? o.nl : o.en}
        </button>
      ))}
    </div>
  );
}

function YesNo({ value, onChange, lang }) {
  const t = (nl, en) => lang === 'nl' ? nl : en;
  return (
    <div className="yn-row">
      <div className={'yn-btn' + (value === 'Yes please' ? ' sel' : '')} onClick={() => onChange('Yes please')}>
        <span className="yn-btn-icon">👍</span>
        {t('Ja, graag', 'Yes please')}
      </div>
      <div className={'yn-btn' + (value === 'No thanks' ? ' sel' : '')} onClick={() => onChange('No thanks')}>
        <span className="yn-btn-icon">👎</span>
        {t('Nee, bedankt', 'No thanks')}
      </div>
    </div>
  );
}

// ── Thank-you screen ──────────────────────────────────────────────────────────

function ThankYou({ lang }) {
  const t = (nl, en) => lang === 'nl' ? nl : en;
  const navigate = useNavigate();

  const dots = Array.from({ length: 42 }, (_, i) => ({
    faint: Math.random() < 0.25,
    key: i,
  }));

  return (
    <div className="inner">
      <div className="ty-wrap">
        <div className="ty-title">{t('Bedankt voor je input!', 'Thank you for your input!')}</div>
        <p className="ty-sub">
          {t(
            'Jouw antwoorden helpen ons de Aadorp digital twin bouwen voor mensen zoals jij. We laten je weten wanneer er updates zijn.',
            "Your answers help us build the Aadorp digital twin for people like you. We'll let you know when there are updates."
          )}
        </p>
        <div className="impact-row">
          <div className="imp-card">
            <div className="imp-num">43</div>
            <div className="imp-lbl">{t('bewoners deden mee', 'residents participated')}</div>
          </div>
          <div className="imp-card">
            <div className="imp-num">~12 t</div>
            <div className="imp-lbl">{t('CO₂ samen te besparen', 'CO₂ to save together')}</div>
          </div>
        </div>
        <div className="dot-map">
          <div className="dm-lbl">{t('Wie deed mee in Aadorp?', 'Who participated in Aadorp?')}</div>
          <div className="dots">
            {dots.map(d => <div key={d.key} className={'dot' + (d.faint ? ' faint' : '')} />)}
            <div className="dot you" />
          </div>
          <div className="dm-sub">
            {t('Elke stip = één anonieme deelnemer · groen = jij', 'Each dot = one anonymous participant · green = you')}
          </div>
        </div>
        <button className="btn-primary" onClick={() => navigate('/wishlist')}>
          {t('Bekijk de wenslijst van de buurt →', 'View the community wishlist →')}
        </button>
        <div style={{ height: 10 }} />
        <button className="btn-secondary" onClick={() => navigate('/roadmap')}>
          {t('Volg de ontwikkeling →', 'Follow the development →')}
        </button>
      </div>
    </div>
  );
}

// ── Survey ────────────────────────────────────────────────────────────────────

export default function Survey({ lang }) {
  const t = (nl, en) => lang === 'nl' ? nl : en;

  const [answers, setAnswers] = useState({
    role: '',
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: [],
    q7: [],
    q8: '',
    q9: '',
  });
  const [submitted, setSubmitted]         = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState('');

  const requiredFields = ['role', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'];
  const completedCount = requiredFields.filter((key) => {
    const value = answers[key];
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(String(value || '').trim());
  }).length;
  const progressPct = Math.round((completedCount / requiredFields.length) * 100);

  const setQ = (key, val) => setAnswers(prev => ({ ...prev, [key]: val }));

  function toggleChip(key, val) {
    setAnswers(prev => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      await submitResponse({
        role: answers.role,
        q1:   answers.q1,
        q2:   answers.q2,
        q3:   answers.q3,
        q4:   answers.q4,
        q5:   answers.q5,
        q6:   answers.q6.join(' | '),
        q7:   answers.q7.join(' | '),
        q8:   answers.q8,
        q9:   answers.q9,
      });
      // Every survey response is also published as a wishlist idea.
      await submitIdea(buildIdeaPayload(answers)).catch(() => {});
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Survey submit error:', err);
      setError((err?.message || String(err)) || t('Kon niet indienen. Probeer opnieuw.', 'Could not submit. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) return <ThankYou lang={lang} />;

  return (
    <div className="inner survey-shell" id="survey-questions">

      {/* ── Survey header ── */}
      <div className="survey-header">
        <h1 className="survey-main-title">
          {t('Jouw digitale tweeling voorkeuren', 'Your Digital Twin Preferences')}
        </h1>
        <p className="survey-main-sub">
          {t(
            'Nu je hebt ingestemd om deel te nemen, hebben we een paar korte vragen over hoe je de Aadorp digitale tweeling zou willen gebruiken. Jouw antwoorden helpen ons de tool te ontwerpen voor mensen zoals jij. Alle antwoorden worden anoniem verwerkt onder de doeleinden die je hebt goedgekeurd (P-03).',
            'Now that you have agreed to participate, we have a few short questions about how you would like to use the Aadorp digital twin. Your answers help us design the tool for people like you. All responses are processed anonymously under the purposes you agreed to (P-03).'
          )}
        </p>
        <div className="survey-badges">
          <span className="s-badge">{t('Duur: ca. 5 min', 'Duration: approx. 5 min')}</span>
          <span className="s-badge">{t('Vorm: 9 vragen', 'Format: 9 questions')}</span>
          <span className="s-badge">{t('Verwerking: anoniem', 'Processing: anonymous')}</span>
        </div>
        <div className="survey-progress-wrap" aria-live="polite">
          <div className="survey-progress-top">
            <span>{t('Voortgang', 'Progress')}</span>
            <span>{completedCount}/{requiredFields.length}</span>
          </div>
          <div className="survey-progress-track">
            <div className="survey-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="survey-form-card">

      {/* ── Role pre-question (unnumbered) ── */}
      <div className="q-block role-block">
        <h2 className="q-title">
          {t('Vanuit welke rol vul jij deze vragenlijst in?', 'From which role are you completing this survey?')}
        </h2>
        <p className="q-sub">
          {t('Dit helpt ons de resultaten beter te interpreteren per type gebruiker.', 'This helps us interpret results better per user type.')}
        </p>
        <SingleOpts opts={ROLE_OPTS} value={answers.role} onChange={v => setQ('role', v)} lang={lang} />
      </div>

      {/* ── Q1: Where do you live? ── */}
      <div className="q-block" id="s1">
        <div className="q-eye">{t('Vraag 1 van 9', 'Question 1 of 9')}</div>
        <h2 className="q-title">{t('Waar woont u?', 'Where do you live?')}</h2>
        <SingleOpts opts={Q1_OPTS} value={answers.q1} onChange={v => setQ('q1', v)} lang={lang} />
      </div>

      {/* ── Q2: Building energy ── */}
      <div className="q-block" id="s2">
        <div className="q-eye">{t('Vraag 2 van 9', 'Question 2 of 9')}</div>
        <h2 className="q-title">
          {t(
            'Als u één ding over het energieverbruik van uw woning op een scherm zou kunnen zien — wat zou dat zijn?',
            "If you could see one thing about your building's energy on a screen — what would it be?"
          )}
        </h2>
        <SingleOpts opts={Q2_OPTS} value={answers.q2} onChange={v => setQ('q2', v)} lang={lang} />
      </div>

      {/* ── Q3: Own home or neighbourhood? ── */}
      <div className="q-block" id="s3">
        <div className="q-eye">{t('Vraag 3 van 9', 'Question 3 of 9')}</div>
        <h2 className="q-title">
          {t(
            'Wilt u liever uw eigen woning zien, of de hele buurt?',
            'Would you rather see your own home, or the whole neighbourhood?'
          )}
        </h2>
        <SingleOpts opts={Q3_OPTS} value={answers.q3} onChange={v => setQ('q3', v)} lang={lang} />
      </div>

      {/* ── Q4: Per-household or neighbourhood level? ── */}
      <div className="q-block" id="s4">
        <div className="q-eye">{t('Vraag 4 van 9', 'Question 4 of 9')}</div>
        <h2 className="q-title">
          {t(
            'Wilt u de digitale tweeling op woningniveau of buurtniveau gebruiken?',
            'Would you prefer the digital twin at per-household level or neighbourhood level?'
          )}
        </h2>
        <p className="q-sub">
          {t(
            'Verken de kaart hieronder, klik op gebouwen en vergelijk renovatiescenario\'s.',
            'Explore the map below, click buildings, and compare retrofit scenarios.'
          )}
        </p>
        <EmbedPreview
          src="https://a-neighbourhood-scale-urban-digital-twin-for-energy-ecolog.pages.dev/"
          title="Twekkelerveld Smart Energy Twin"
          label={t('🗺️ Twekkelerveld Smart Energy Twin', '🗺️ Twekkelerveld Smart Energy Twin')}
          lang={lang}
        />
        <SingleOpts opts={Q4_OPTS} value={answers.q4} onChange={v => setQ('q4', v)} lang={lang} />
      </div>

      {/* ── Q5: Raw numbers or simpler format? ── */}
      <div className="q-block" id="s5">
        <div className="q-eye">{t('Vraag 5 van 9', 'Question 5 of 9')}</div>
        <h2 className="q-title">
          {t('Wilt u ruwe getallen of een eenvoudiger formaat?', 'Do you want raw numbers or a simpler format?')}
        </h2>
        <SingleOpts opts={Q5_OPTS} value={answers.q5} onChange={v => setQ('q5', v)} lang={lang} />
      </div>

      {/* ── Q6: Most useful comparison? (multi) ── */}
      <div className="q-block" id="s6">
        <div className="q-eye">{t('Vraag 6 van 9', 'Question 6 of 9')}</div>
        <h2 className="q-title">
          {t(
            'Welke vergelijking is het nuttigst om te weten of uw woning energiezuinig is?',
            'What comparison is most useful for knowing if your home is energy-efficient?'
          )}
        </h2>
        <p className="q-sub">{t('U kunt meerdere antwoorden kiezen.', 'You can choose multiple answers.')}</p>
        <Chips opts={Q6_CHIPS} selected={answers.q6} onToggle={v => toggleChip('q6', v)} lang={lang} />
      </div>

      {/* ── Q7: Renewable tech? (multi + guidance card) ── */}
      <div className="q-block" id="s7">
        <div className="q-eye">{t('Vraag 7 van 9', 'Question 7 of 9')}</div>
        <h2 className="q-title">
          {t(
            'Welke duurzame energietechnologieën geeft u de voorkeur voor uw woning en buurt?',
            'Which renewable energy technologies would you prefer for your home and neighbourhood?'
          )}
        </h2>
        <p className="q-sub">{t('U kunt meerdere antwoorden kiezen.', 'You can choose multiple answers.')}</p>
        <p className="q-sub">
          {t(
            'Gebruik de interactieve tweeling om upgrademogelijkheden (zoals zonnepanelen, isolatie of een warmtepomp) te vergelijken voordat u kiest.',
            'Use the interactive twin below to compare upgrade options (solar, insulation, heat pump) before choosing.'
          )}
        </p>
        <EmbedPreview
          src="https://a-neighbourhood-scale-urban-digital-twin-for-energy-ecolog.pages.dev/"
          title="Neighbourhood Energy Twin — upgrade comparison"
          label={t('🏘️ Buurt energie-tweeling — vergelijk opties', '🏘️ Neighbourhood Energy Twin — compare options')}
          lang={lang}
        />
        <Chips opts={Q7_CHIPS} selected={answers.q7} onToggle={v => toggleChip('q7', v)} lang={lang} />
      </div>

      {/* ── Q8: AI assistant? (yes/no + guidance card) ── */}
      <div className="q-block" id="s8">
        <div className="q-eye">{t('Vraag 8 van 9', 'Question 8 of 9')}</div>
        <h2 className="q-title">
          {t(
            "Wilt u een AI-assistent die helpt bij het vergelijken van energiescenario's voor uw buurt?",
            "Would you like an AI assistant to help compare energy scenarios for your neighbourhood?"
          )}
        </h2>
        <p className="q-sub">
          {t(
            "Probeer de assistent hieronder — stel een vraag over energiescenario's en zie hoe het antwoordt.",
            "Try the assistant below — ask a question about energy scenarios and see how it responds."
          )}
        </p>
        <EmbedPreview
          src="https://ai-building-silk.vercel.app/"
          title="AI Building Energy Assistant"
          label={t('🤖 AI gebouw-energieassistent', '🤖 AI Building Energy Assistant')}
          lang={lang}
        />
        <YesNo value={answers.q8} onChange={v => setQ('q8', v)} lang={lang} />
      </div>

      {/* ── Q9: Open text ── */}
      <div className="q-block" id="s9">
        <div className="q-eye">{t('Vraag 9 van 9 — Bijna klaar!', 'Question 9 of 9 — Almost done!')}</div>
        <h2 className="q-title">
          {t(
            'Is er nog iets dat u graag zou willen zien in de digitale tweeling, of iets dat u zorgen baart?',
            'Is there anything else you would like to see in the digital twin, or anything that concerns you?'
          )}
        </h2>
        <p className="q-sub">
          {t('Heeft u ideeën, zorgen of concrete voorstellen voor Aadorp?', 'Do you have any ideas, concerns, or concrete proposals for Aadorp?')}
        </p>
        <p className="q-sub" style={{ marginTop: 2 }}>
          {t(
            'Optioneel: noem bijvoorbeeld een straat, onderwerp of maatregel die volgens u prioriteit verdient.',
            'Optional: for example, mention a street, topic, or measure that should get priority.'
          )}
        </p>
        <textarea
          className="textarea-f"
          id="open-answer"
          placeholder={t('Ideeën, zorgen of vragen...', 'Ideas, concerns or questions...')}
          value={answers.q9}
          onChange={e => setQ('q9', e.target.value)}
        />
        <p className="share-idea-disclaimer" style={{ marginTop: 0 }}>
          ⚠️ {t(
            'Elke inzending wordt toegevoegd aan de community-wenslijst. Vermeld geen persoonlijke informatie zoals naam, e-mail of adres.',
            'Every submission is added to the community wishlist. Do not include personal information such as name, email, or address.'
          )}
        </p>
      </div>

      <div className="survey-submit-wrap">
        <p className="survey-submit-note">
          {t(
            'Controleer je antwoorden voordat je indient. Je kunt deze pagina daarna opnieuw bekijken via het dashboard.',
            'Review your answers before submitting. You can revisit this page later through the dashboard.'
          )}
        </p>
        {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 10 }}>{error}</p>}

        <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? t('Bezig…', 'Submitting…') : t('Verstuur antwoorden →', 'Submit answers →')}
        </button>
      </div>

      <div className="page-footer" style={{ marginTop: 16 }}>
        <span>{t('Anoniem verwerkt · P-03 · ', 'Processed anonymously · P-03 · ')}</span>
        <a href="mailto:data-protection-officer@3dxverse.eu">data-protection-officer@3dxverse.eu</a>
      </div>

      </div>

    </div>
  );
}
