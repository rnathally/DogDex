import "./ContatoSection.css";

const contactOptions = [
  {
    number: "01",
    title: "Voluntariado",
    description: "Apoie ações de cuidado, alimentação e acompanhamento dos cães.",
  },
  {
    number: "02",
    title: "Doações",
    description: "Contribua com ração, potes, coleiras, medicamentos ou suprimentos.",
  },
  {
    number: "03",
    title: "Adoção",
    description: "Ajude a divulgar histórias e incentivar uma adoção responsável.",
  },
];

export default function ContatoSection() {
  return (
    <section id="contato" className="contato-section">
      <div className="contato-content">
        <div className="contato-text">
          <span className="contato-kicker">Contato</span>

          <h2>Quer ajudar ou saber mais?</h2>

          <p>
            O projeto busca incentivar a participação da comunidade por meio de
            ações voluntárias, doações de suprimentos e apoio à adoção
            responsável.
          </p>

          <p>
            Toda ajuda pode fazer diferença na vida dos cães que vivem no
            campus. Entre em contato para conhecer melhor a iniciativa ou apoiar
            os voluntários que cuidam desses animais.
          </p>
        </div>

        <div className="contato-panel">
          <div className="contato-panel-header">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="contato-panel-title">
            <span>Canal de apoio</span>
            <h3>Como você pode participar</h3>
          </div>

          <div className="contato-options">
            {contactOptions.map((option) => (
              <article className="contato-option-card" key={option.number}>
                <span className="contato-option-number">{option.number}</span>

                <div>
                  <h4>{option.title}</h4>
                  <p>{option.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="contato-actions">
          <span className="contato-mini-info">
            Sua ajuda fortalece o cuidado coletivo no campus.
          </span>

          <a href="mailto:contato@dogdex.com" className="contato-button">
            Entrar em contato
          </a>
        </div>
      </div>
    </section>
  );
}