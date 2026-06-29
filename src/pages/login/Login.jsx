import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import {
  MdPerson,
  MdEmail,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";

import Navbar from "../../components/navbar/Navbar";
import { supabase } from "../../lib/supabase";
import bg from "../../assets/Fundoverde.png";
import "./Login.css";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loadingAuth, setLoadingAuth] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const navigate = useNavigate();

  function clearMessage() {
    setMessage("");
    setMessageType("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    clearMessage();

    if (isRegister && password !== confirmPassword) {
      setMessage("As senhas não coincidem.");
      setMessageType("error");
      return;
    }

    if (password.length < 6) {
      setMessage("A senha precisa ter pelo menos 6 caracteres.");
      setMessageType("error");
      return;
    }

    try {
      setLoadingAuth(true);

      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });

        if (error) {
          throw error;
        }

        await supabase.auth.signOut();

        setMessage("Conta criada com sucesso! Agora faça login para entrar.");
        setMessageType("success");

        setIsRegister(false);
        setName("");
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        setShowConfirmPassword(false);

        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      navigate("/app");
    } catch (error) {
      console.error("Erro no login/cadastro:", error);

      const errorText = error.message?.toLowerCase() || "";

      if (errorText.includes("invalid login")) {
        setMessage("E-mail ou senha inválidos.");
      } else if (errorText.includes("email not confirmed")) {
        setMessage("Você precisa confirmar seu e-mail antes de entrar.");
      } else if (errorText.includes("already registered")) {
        setMessage("Esse e-mail já está cadastrado. Tente fazer login.");
      } else if (errorText.includes("user already registered")) {
        setMessage("Esse e-mail já está cadastrado. Tente fazer login.");
      } else {
        setMessage(error.message || "Não foi possível autenticar.");
      }

      setMessageType("error");
    } finally {
      setLoadingAuth(false);
    }
  }

  async function handleGoogleLogin() {
    clearMessage();

    try {
      setLoadingAuth(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/app`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Erro ao entrar com Google:", error);
      setMessage("Não foi possível entrar com Google.");
      setMessageType("error");
      setLoadingAuth(false);
    }
  }

  function handleToggleMode() {
    clearMessage();
    setIsRegister((currentValue) => !currentValue);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
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
        <section className="login-card">
          <Link to="/" className="close-btn" aria-label="Fechar">
            ×
          </Link>

          <h1 className="login-title">{isRegister ? "Cadastro" : "Login"}</h1>

          <form className="login-form" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Nome"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />

                <span className="input-icon input-icon-small">
                  <MdPerson />
                </span>
              </div>
            )}

            <div className="input-wrapper">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <span className="input-icon input-icon-small">
                <MdEmail />
              </span>
            </div>

            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button
                type="button"
                className="input-icon input-icon-small input-icon-button"
                onClick={() => setShowPassword((currentValue) => !currentValue)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>

            {isRegister && (
              <div className="input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
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
                >
                  {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            )}

            {!isRegister && (
              <div className="login-options">
                <label className="remember">
                  <input type="checkbox" />
                  <span>Lembrar de mim</span>
                </label>

                <Link to="/forgot-password" className="forgot-password">
                  Esqueci a senha
                </Link>
              </div>
            )}

            {message && (
              <p className={`login-message ${messageType}`}>{message}</p>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loadingAuth}
            >
              {loadingAuth
                ? "Carregando..."
                : isRegister
                  ? "Cadastrar"
                  : "Login"}
            </button>

            {!isRegister && (
              <>
                <div className="divider">
                  <span>ou</span>
                </div>

                <button
                  type="button"
                  className="google-login"
                  onClick={handleGoogleLogin}
                  disabled={loadingAuth}
                >
                  <FcGoogle className="google-icon" />
                  Entrar com Google
                </button>
              </>
            )}
          </form>

          <p className="login-switch">
            {isRegister ? "Já tem uma conta?" : "Não tem uma conta?"}

            <button type="button" onClick={handleToggleMode}>
              {isRegister ? " Entrar" : " Cadastre-se"}
            </button>
          </p>
        </section>
      </div>
    </div>
  );
}