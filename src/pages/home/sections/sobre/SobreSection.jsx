import "./SobreSection.css";
import dogRun from "../../../../assets/dog-run.gif";

const steps = [
  {
    phase: "FASE 01",
    title: "Encontre",
    description: "Os usuários encontram os cachorros comunitários pelo campus.",
  },
  {
    phase: "FASE 02",
    title: "Escaneie",
    description: "O QR Code permite iniciar uma tentativa de captura no game.",
  },
  {
    phase: "FASE 03",
    title: "Capture",
    description: "Cada cão pode ser adicionado à DogDex do usuário.",
  },
  {
    phase: "FASE 04",
    title: "Apoie",
    description: "O projeto ajuda a divulgar adoção, cuidados e doações.",
  },
];

export default function SobreSection() {
  return (
    <section id="sobre" className="sobre-section">
      <div className="sobre-content">
        <div className="sobre-main-grid">
          <div className="sobre-card-area">
            <article className="sobre-collect-card">
              <div className="sobre-card-glow"></div>

              <div className="sobre-card-topbar">
                <span className="sobre-card-id">Nº001</span>
              </div>

              <div className="sobre-card-image-area">
                <div className="sobre-card-grid-pattern"></div>

                <span className="sobre-card-spark spark-1"></span>
                <span className="sobre-card-spark spark-2"></span>
                <span className="sobre-card-spark spark-3"></span>
                <span className="sobre-card-spark spark-4"></span>

                <img
                  src={dogRun}
                  alt="Cachorro correndo"
                  className="sobre-card-dog-image"
                />
              </div>

              <div className="sobre-card-name-block">
                <span className="sobre-card-name-label">Projeto</span>
                <div className="sobre-card-name">DogDex</div>
              </div>

              <div className="sobre-card-tags">
                <span className="sobre-card-tag">Tecnologia</span>
                <span className="sobre-card-tag">Game</span>
                <span className="sobre-card-tag">Impacto social</span>
              </div>

              <div className="sobre-card-info-list">
                <div className="sobre-card-info-row">
                  <span>Disciplina</span>
                  <strong>Engenharia de Software II</strong>
                </div>

                <div className="sobre-card-info-row">
                  <span>Objetivo</span>
                  <strong>Conectar pessoas e cães do campus</strong>
                </div>

                <div className="sobre-card-info-row">
                  <span>Missão</span>
                  <strong>Cuidar, capturar e apoiar</strong>
                </div>
              </div>
            </article>
          </div>

          <div className="sobre-text">
            <span className="sobre-kicker">Sobre o projeto</span>

            <h2>Um projeto que une tecnologia, jogo e impacto social</h2>

            <p>
              O DogDex é um website responsivo desenvolvido por alunos da 6ª
              fase do curso de Ciência da Computação, como trabalho do semestre
              da disciplina de Engenharia de Software II.
            </p>

            <p>
              A proposta é transformar a interação com os cachorros
              comunitários da UNESC em uma experiência divertida, acessível e
              consciente. Usuários podem escanear QR Codes relacionados aos cães
              e tentar capturá-los dentro do game, com uma chance de sucesso.
            </p>
          </div>
        </div>

        <div className="sobre-level-select">
          {steps.map((step) => (
            <article className="sobre-level-card" key={step.phase}>
              <div className="sobre-level-phase-box">
                <span className="sobre-level-number">{step.number}</span>
                <span className="sobre-level-phase">{step.phase}</span>
              </div>

              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}