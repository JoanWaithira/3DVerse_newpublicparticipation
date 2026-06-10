import { useNavigate } from 'react-router-dom';

export default function NotFound({ lang }) {
  const t = (nl, en) => lang === 'nl' ? nl : en;
  const navigate = useNavigate();

  return (
    <div className="inner" style={{ textAlign: 'center', paddingTop: 64 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>404</div>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>
        {t('Pagina niet gevonden', 'Page not found')}
      </h1>
      <p style={{ color: 'var(--gray-400)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
        {t(
          'Deze pagina bestaat niet. Ga terug naar de startpagina.',
          'This page does not exist. Go back to the home page.'
        )}
      </p>
      <button className="btn-primary" onClick={() => navigate('/')}>
        {t('Naar startpagina', 'Go home')}
      </button>
    </div>
  );
}
