import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/Logo.png";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 35);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("navbar-menu-open");
    } else {
      document.body.classList.remove("navbar-menu-open");
    }

    return () => {
      document.body.classList.remove("navbar-menu-open");
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav
      className={`navbar ${isScrolled ? "navbar-scrolled" : ""} ${
        menuOpen ? "menu-open" : ""
      }`}
    >
      <a href="/#inicio" className="navbar-logo" onClick={closeMenu}>
        <img src={logo} alt="DogDex" className="logo" />
      </a>

      <button
        type="button"
        className={`menu-toggle ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={menuOpen}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`navbar-right ${menuOpen ? "open" : ""}`}>
        <div className="menu">
          <a href="/#inicio" className="menu-link" onClick={closeMenu}>
            Início
          </a>

          <a href="/#comunidade" className="menu-link" onClick={closeMenu}>
            Comunidade
          </a>

          <a href="/#sobre" className="menu-link" onClick={closeMenu}>
            Sobre
          </a>

          <a href="/#contato" className="menu-link" onClick={closeMenu}>
            Contato
          </a>
        </div>

        <Link to="/login" className="login-button-navbar" onClick={closeMenu}>
          Entrar
        </Link>
      </div>
    </nav>
  );
}