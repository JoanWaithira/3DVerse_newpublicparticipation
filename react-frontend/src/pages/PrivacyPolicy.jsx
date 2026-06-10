export default function PrivacyPolicy({ lang }) {
  const t = (nl, en) => lang === 'nl' ? nl : en;

  return (
    <div className="inner" style={{ maxWidth: 680, paddingTop: 32, paddingBottom: 64 }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>
        {t('Privacybeleid', 'Privacy Policy')}
      </h1>
      <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 32 }}>
        {t('Laatste update: juni 2026', 'Last updated: June 2026')}
      </p>

      <h2 style={{ fontSize: 16, marginBottom: 8 }}>
        {t('Welke gegevens verzamelen we?', 'What data do we collect?')}
      </h2>
      <p style={{ marginBottom: 24 }}>
        {t(
          'De enquête vraagt naar uw rol in de buurt, energieprioriteiten, technologievoorkeuren en of u een AI-assistent zou willen. U kunt optioneel uw naam achterlaten. Er worden geen contactgegevens zoals e-mailadressen of telefoonnummers verzameld.',
          'The survey asks about your role in the neighbourhood, energy priorities, technology preferences, and whether you would like an AI assistant. You may optionally leave your name. No contact details such as email addresses or phone numbers are collected.'
        )}
      </p>

      <h2 style={{ fontSize: 16, marginBottom: 8 }}>
        {t('Hoe wordt u het gebruikt?', 'How is it used?')}
      </h2>
      <p style={{ marginBottom: 24 }}>
        {t(
          'Uw antwoorden worden uitsluitend gebruikt om de prioriteiten voor de digitale tweeling van Aadorp te bepalen. Geaggregeerde resultaten (aantallen en percentages, nooit individuele antwoorden) worden gepubliceerd in het communitysdashboard.',
          'Your answers are used solely to determine priorities for the Aadorp digital twin project. Aggregated results (counts and percentages, never individual responses) are published in the community dashboard.'
        )}
      </p>

      <h2 style={{ fontSize: 16, marginBottom: 8 }}>
        {t('Waar worden gegevens opgeslagen?', 'Where is data stored?')}
      </h2>
      <p style={{ marginBottom: 24 }}>
        {t(
          'Antwoorden worden opgeslagen in Supabase, een beveiligde clouddienst gehost in de Europese Unie. Toegang tot individuele antwoorden is beperkt tot geautoriseerde projectmedewerkers.',
          'Responses are stored in Supabase, a secure cloud service hosted in the European Union. Access to individual responses is restricted to authorised project staff.'
        )}
      </p>

      <h2 style={{ fontSize: 16, marginBottom: 8 }}>
        {t('Hoe lang bewaren we gegevens?', 'How long do we keep data?')}
      </h2>
      <p style={{ marginBottom: 24 }}>
        {t(
          'Gegevens worden bewaard gedurende de looptijd van het project en daarna verwijderd, tenzij wettelijk anders vereist.',
          'Data is retained for the duration of the project and then deleted, unless legally required otherwise.'
        )}
      </p>

      <h2 style={{ fontSize: 16, marginBottom: 8 }}>
        {t('Uw rechten', 'Your rights')}
      </h2>
      <p style={{ marginBottom: 24 }}>
        {t(
          'U heeft recht op inzage, correctie en verwijdering van uw gegevens. Neem hiervoor contact op via het projectteam van 3DxVERSE.',
          'You have the right to access, correct, and delete your data. Please contact the 3DxVERSE project team to exercise these rights.'
        )}
      </p>

      <h2 style={{ fontSize: 16, marginBottom: 8 }}>
        {t('Contact', 'Contact')}
      </h2>
      <p>
        {t(
          'Vragen over dit privacybeleid? Neem contact op met het 3DxVERSE projectteam.',
          'Questions about this privacy policy? Contact the 3DxVERSE project team.'
        )}
      </p>
    </div>
  );
}
