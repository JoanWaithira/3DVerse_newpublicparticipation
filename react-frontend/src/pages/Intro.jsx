import { useNavigate } from 'react-router-dom';

export default function Intro({ lang }) {
  const t = (nl, en) => lang === 'nl' ? nl : en;
  const navigate = useNavigate();

  return (
    <div className="inner">
      <div className="eyebrow">Aadorp · Overijssel · 2025-2026</div>
      <h1 className="display-title">
        {t('Help ons de digitale toekomst van Aadorp vormgeven',
           'Help shape the digital future of Aadorp')}
      </h1>
      <p className="lead">
        {t('Wij bouwen een digitale tweeling van Aadorp — een virtueel model van jouw buurt. Jouw input bepaalt wat we bouwen en hoe het eruitziet.',
           'We are building a digital twin of Aadorp — a virtual model of your neighbourhood. Your input decides what we build and how it looks.')}
      </p>

      <div className="what-card">
        <div className="what-card-head">
          <div className="what-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <div className="what-card-title">
            {t('Wat is een digitale tweeling?', 'What is a digital twin?')}
          </div>
        </div>
        <p className="what-body">
          {t('Een digitale tweeling is een virtueel model van een echte plek. Het combineert kaart-, gebouw- en energiedata zodat bewoners en planners opties kunnen verkennen en scenario\'s vergelijken — voordat beslissingen worden genomen.',
             'A digital twin is a virtual model of a real place. It combines map, building, and energy data so residents and planners can explore options and compare scenarios — before decisions are made.')}
        </p>
        <div className="what-pts">
          {[
            [t('Klik op gebouwen om energielabels, verbruik en verbetermogelijkheden te zien',
               'Click buildings to see energy labels, usage and upgrade options')],
            [t('Vergelijk renovatiescenario\'s — kosten, besparing en CO2-reductie',
               'Compare retrofit scenarios — costs, savings and CO2 reduction')],
            [t('Ontworpen samen met bewoners — jouw stem telt',
               'Designed together with residents — your voice matters')],
          ].map(([label], i) => (
            <div className="what-pt" key={i}>
              <div className="what-pt-dot">
                <svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg>
              </div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sec-label">{t('Projectvideo', 'Project video')}</div>
      <div className="video-box">
        <div className="video-screen">
          <iframe
            src="https://www.youtube.com/embed/UEsZKyuMFRk"
            title="Introductie: Aadorp Digital Twin project"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="video-foot">
          <svg viewBox="0 0 24 24"><path d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
          <div>
            <div className="vf-title">{t('Introductie: Aadorp Digital Twin project', 'Introduction: Aadorp Digital Twin project')}</div>
            <div className="vf-sub">{t('3DxVERSE projectteam · ca. 3 min', '3DxVERSE project team · approx. 3 min')}</div>
          </div>
        </div>
      </div>

      <div className="sec-label">{t('Bekijk de digitale tweelingen', 'Explore the digital twins')}</div>
      <div className="twins-grid">
        {[
          { href: 'https://kadambari-17.github.io/Cesium-Energy-Dashboard/', bg: '#3a2d80', chip: 'Aadorp 3D',
            name: t('Aadorp energiedashboard', 'Aadorp energy dashboard'),
            desc: t('3D model met energielabels A-G en renovatiescenario\'s', '3D model with energy labels A-G and retrofit scenarios') },
          { href: 'https://a-neighbourhood-scale-urban-digital-twin-for-energy-ecolog.pages.dev/', bg: '#074d35', chip: 'Twekkelerveld',
            name: t('Wijk energie-twin', 'Neighbourhood energy twin'),
            desc: t('Buurtkaart met zonne- en warmtepompopties', 'Neighbourhood map with solar and heat pump options') },
          { href: 'https://ai-building-silk.vercel.app/', bg: '#0b3d6e', chip: 'AI gebouw',
            name: t('AI gebouwassistent', 'AI building assistant'),
            desc: t('AI-analyse van gebouwprestaties en upgrades', 'AI analysis of building performance and upgrades') },
        ].map(({ href, bg, chip, name, desc }) => (
          <a className="twin-card" href={href} target="_blank" rel="noopener" key={href}>
            <div className="twin-screen" style={{ background: bg }}>
              <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
              <span className="twin-chip">{chip}</span>
            </div>
            <div className="twin-body">
              <div className="twin-name">{name}</div>
              <div className="twin-desc">{desc}</div>
              <div className="twin-open">
                <svg viewBox="0 0 10 10"><path d="M2 8L8 2M5 2h3v3"/></svg>
                <span>{t('Openen', 'Open')}</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="cta-box">
        <div className="cta-title">{t('Klaar om mee te doen?', 'Ready to take part?')}</div>
        <p className="cta-sub">
          {t('Jouw antwoorden helpen ons bepalen wat er in de digitale tweeling komt. Anoniem verwerkt, duurt ongeveer 5 minuten.',
             'Your answers help us decide what goes into the digital twin. Processed anonymously, takes about 5 minutes.')}
        </p>
        <div className="meta-pills">
          <span className="mpill">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
            {t('ca. 5 min', 'approx. 5 min')}
          </span>
          <span className="mpill">
            <svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            {t('9 vragen', '9 questions')}
          </span>
          <span className="mpill">
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            {t('Anoniem', 'Anonymous')}
          </span>
        </div>
        <button className="btn-primary" onClick={() => navigate('/survey')}>
          {t('Start de enquête ->', 'Start the survey ->')}
        </button>
        <div className="skip-link" onClick={() => navigate('/wishlist')}>
          {t('Sla over — bekijk de wenslijst van de buurt', 'Skip — view the community wishlist')}
        </div>
      </div>

      <div className="page-footer">
        3DxVERSE · Aadorp Local Digital Twin · Co-funded by the European Union (CIVIS)<br />
        {t('Vragen? ', 'Questions? ')}<a href="mailto:data-protection-officer@3dxverse.eu">data-protection-officer@3dxverse.eu</a>
      </div>
    </div>
  );
}
