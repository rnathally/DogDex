import { useState } from "react";
import { Link } from "react-router-dom";
import { MdEmail } from "react-icons/md";

import Navbar from "../../components/navbar/Navbar";
import { supabase } from "../../lib/supabase";
import bg from "../../assets/fundo1.jpg";

import "../login/Login.css";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!email) {
      setMessage("Digite seu e-mail para continuar.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setMessage(
        "Enviamos um link para redefinir sua senha. Verifique seu e-mail."
      );
      setMessageType("success");
      setEmail("");
    } catch (error) {
      console.error("Erro ao enviar e-mail de recuperação:", error);

      setMessage(
        error.message || "Não foi possível enviar o e-mail de recuperação."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page" style={{ backgroundImage: `url(${bg})` }}>
      <Navbar />

      <div className="login-overlay">
        <section className="login-card forgot-password-card">
          <Link to="/login" className="close-btn" aria-label="Fechar">
            ×
          </Link>

          <h1 className="login-title">Recuperar senha</h1>

          <p className="forgot-password-description">
            Digite seu e-mail cadastrado e enviaremos um link para você criar
            uma nova senha.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <span className="input-icon input-icon-small">
                <MdEmail />
              </span>
            </div>

            {message && (
              <p className={`login-message ${messageType}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar link"}
            </button>
          </form>

          <p className="login-switch">
            Lembrou sua senha?

            <Link to="/login" className="forgot-password-link">
              {" "}
              Voltar ao login
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}