import { NavLink } from 'react-router-dom';

export default function Nav({ lang, setLang }) {
  const t = (nl, en) => lang === 'nl' ? nl : en;

  return (
    <nav className="nav">
      <div className="nav-logo"><em>Aadorp</em> Digital Twin</div>
      <div className="nav-tabs">
        <NavLink className={({ isActive }) => 'nav-tab' + (isActive ? ' active' : '')} to="/" end>
          {t('Intro', 'Intro')}
        </NavLink>
        <NavLink className={({ isActive }) => 'nav-tab' + (isActive ? ' active' : '')} to="/survey">
          {t('Enquête', 'Survey')}
        </NavLink>
        <NavLink className={({ isActive }) => 'nav-tab' + (isActive ? ' active' : '')} to="/wishlist">
          {t('Wenslijst', 'Wishlist')}
        </NavLink>
        <NavLink className={({ isActive }) => 'nav-tab' + (isActive ? ' active' : '')} to="/dashboard">
          {t('Gemeenschap', 'Community')}
        </NavLink>
      </div>
      <div className="nav-right">
        <div className="nav-partners" aria-label="Project partners and funding logos">
          <img className="logo-3dxverse" src="/images/3Dxverse.jpeg" alt="3DxVERSE logo" />
          <img className="logo-almelo"   src="/images/almelo-energy.jpeg" alt="Almelo Energie and OM logo" />
          <img className="logo-eu"       src="/images/co-funded.jpg" alt="Co-funded by the European Union logo" />
        </div>
        <div className="lang-toggle">
          <button className={'lang-btn' + (lang === 'nl' ? ' active' : '')} onClick={() => setLang('nl')}>NL</button>
          <button className={'lang-btn' + (lang === 'en' ? ' active' : '')} onClick={() => setLang('en')}>EN</button>
        </div>
      </div>
    </nav>
  );
}
