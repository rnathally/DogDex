import "./ComunidadeSection.css";

export default function ComunidadeSection() {
  return (
    <section id="comunidade" className="comunidade-section">
      <div className="comunidade-content">
        <div className="comunidade-top">
          <span className="comunidade-kicker">Área do campus</span>

          <h2>Comunidade</h2>

          <p>
            Cães que fazem parte da rotina da UNESC e ajudam a transformar o
            campus em um espaço mais acolhedor, afetivo e coletivo.
          </p>
        </div>

        <div className="comunidade-game-panel">
          <div className="comunidade-main-screen">
            <h3>Cães que fazem parte da rotina da UNESC</h3>

            <p>
              Na UNESC, alguns cachorros fazem parte da rotina de estudantes,
              professores, funcionários e visitantes. Eles circulam pelo campus,
              recebem carinho e são cuidados por voluntários do projeto Coragem
              e Gentileza.
            </p>

            <p>
              O DogDex foi criado para aproximar ainda mais a comunidade desses
              cães, trazendo visibilidade para suas histórias e incentivando o
              cuidado coletivo.
            </p>
          </div>

          <div className="comunidade-missions">
            <article className="comunidade-mission comunidade-mission-dark">
              <span className="comunidade-mission-number">01</span>

              <div>
                <h4>Cuidado comunitário</h4>
                <p>Valoriza os cães que já fazem parte do campus.</p>
              </div>
            </article>

            <article className="comunidade-mission comunidade-mission-green">
              <span className="comunidade-mission-number">02</span>

              <div>
                <h4>Apoio aos voluntários</h4>
                <p>Ajuda a divulgar o trabalho de quem cuida deles.</p>
              </div>
            </article>

            <article className="comunidade-mission comunidade-mission-pink">
              <span className="comunidade-mission-number">03</span>

              <div>
                <h4>Incentivo à adoção</h4>
                <p>Aproxima pessoas das histórias dos cães.</p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}