import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

import Navbar from "../../components/navbar/Navbar";
import { supabase } from "../../lib/supabase";
import bg from "../../assets/Fundoverde.png";

import "../login/Login.css";
import "./ResetPassword.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function checkRecoverySession() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        setMessage(
          "Abra esta página pelo link enviado no seu e-mail para redefinir a senha."
        );
        setMessageType("error");
      }

      setCheckingSession(false);
    }

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMessage("");
        setMessageType("");
        setCheckingSession(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleResetPassword(event) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (password.length < 6) {
      setMessage("A nova senha precisa ter pelo menos 6 caracteres.");
      setMessageType("error");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("As senhas não coincidem.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      await supabase.auth.signOut();

      setMessage("Senha redefinida com sucesso! Você já pode fazer login.");
      setMessageType("success");

      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);

      setMessage(error.message || "Não foi possível redefinir sua senha.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <img
        src={bg}
        alt=""
        className="login-bg-fill"
        aria-hidden="true"
      />

      <img
        src={bg}
        alt=""
        className="login-bg"
        aria-hidden="true"
      />

      <Navbar />

      <div className="login-overlay">
        <section className="login-card reset-password-card">
          <Link to="/login" className="close-btn" aria-label="Fechar">
            ×
          </Link>

          <h1 className="login-title">Nova senha</h1>

          <p className="reset-password-description">
            Crie uma nova senha para acessar sua conta no DogDex.
          </p>

          <form className="login-form" onSubmit={handleResetPassword}>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nova senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={checkingSession}
              />

              <button
                type="button"
                className="input-icon input-icon-small input-icon-button"
                onClick={() => setShowPassword((currentValue) => !currentValue)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                disabled={checkingSession}
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>

            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar nova senha"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                disabled={checkingSession}
              />

              <button
                type="button"
                className="input-icon input-icon-small input-icon-button"
                onClick={() =>
                  setShowConfirmPassword((currentValue) => !currentValue)
                }
                aria-label={
                  showConfirmPassword
                    ? "Ocultar confirmação de senha"
                    : "Mostrar confirmação de senha"
                }
                disabled={checkingSession}
              >
                {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>

            {message && (
              <p className={`login-message ${messageType}`}>{message}</p>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading || checkingSession}
            >
              {checkingSession
                ? "Verificando..."
                : loading
                  ? "Salvando..."
                  : "Redefinir senha"}
            </button>
          </form>

          <p className="login-switch">
            Lembrou sua senha?

            <Link to="/login" className="reset-password-link">
              {" "}
              Voltar ao login
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}