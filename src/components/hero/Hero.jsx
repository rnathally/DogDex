import { Link } from "react-router-dom";
import heroBg from "../../assets/hero-bg.png";
import heroBgMobile from "../../assets/hero-bg-mobile.png";
import "./Hero.css";

export default function Hero() {
  return (
    <section id="inicio" className="hero-section">
      <img
        src={heroBg}
        alt=""
        className="hero-bg-image hero-bg-image-desktop"
        aria-hidden="true"
      />

      <img
        src={heroBgMobile}
        alt=""
        className="hero-bg-image hero-bg-image-mobile"
        aria-hidden="true"
      />

      <div className="hero-layout">
        <div className="hero-content">
          <div className="hero-kicker" aria-label="Insert coin to continue">
            <span className="hero-kicker-star hero-kicker-star-left">✦</span>

            <span className="hero-tag">Insert Coin To Continue</span>

            <span className="hero-kicker-star hero-kicker-star-right">✦</span>
          </div>

          <h1 className="hero-title">DOGDEX</h1>

          <h2 className="hero-subtitle">Capture cães e complete sua DogDex</h2>

          <p className="hero-description">
            Explore o campus, encontre cães comunitários, escaneie QR Codes e
            complete sua coleção em uma jornada divertida e interativa.
          </p>

          <div className="hero-actions">
            <Link to="/login" className="hero-button hero-button-primary">
              <span className="hero-start-icon">▶</span>
              Press Start
            </Link>

            <a href="/#comunidade" className="hero-button hero-button-secondary">
              Explorar
            </a>
          </div>
        </div>

        <div className="hero-visual-space" aria-hidden="true"></div>
      </div>
    </section>
  );
}