import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiBookOpen,
  FiAward,
  FiMaximize,
  FiLogOut,
} from "react-icons/fi";

import logo from "../../assets/Logo.png";
import { supabase } from "../../lib/supabase";
import "./DashboardNavbar.css";

export default function DashboardNavbar() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <>
      <div className="dashboard-mobile-top-actions">
        <button
          type="button"
          className="dashboard-mobile-logout-button"
          onClick={handleLogout}
          aria-label="Sair da conta"
          title="Sair"
        >
          <FiLogOut />
        </button>
      </div>

      <aside className="dashboard-app-nav">
        <div className="dashboard-nav-brand">
          <NavLink to="/app" className="dashboard-nav-logo-link">
            <img src={logo} alt="DogDex" className="dashboard-nav-logo" />
          </NavLink>

          <div className="dashboard-nav-title">
            <span>Menu</span>
            <strong>DogDex</strong>
          </div>
        </div>

        <nav className="dashboard-nav-menu" aria-label="Menu do painel">
          <NavLink
            to="/app"
            end
            className={({ isActive }) =>
              isActive ? "dashboard-nav-item active" : "dashboard-nav-item"
            }
          >
            <FiHome />
            <span>Início</span>
          </NavLink>

          <NavLink
            to="/app/dogdex"
            className={({ isActive }) =>
              isActive ? "dashboard-nav-item active" : "dashboard-nav-item"
            }
          >
            <FiBookOpen />
            <span>DogDex</span>
          </NavLink>

          <NavLink
            to="/app/scanner"
            className={({ isActive }) =>
              isActive
                ? "dashboard-nav-scan-button active"
                : "dashboard-nav-scan-button"
            }
          >
            <FiMaximize />
            <span>Escanear</span>
          </NavLink>

          <NavLink
            to="/app/ranking"
            className={({ isActive }) =>
              isActive ? "dashboard-nav-item active" : "dashboard-nav-item"
            }
          >
            <FiAward />
            <span>Ranking</span>
          </NavLink>
        </nav>

        <button
          type="button"
          className="dashboard-nav-logout"
          onClick={handleLogout}
        >
          <FiLogOut />
          <span>Sair</span>
        </button>
      </aside>
    </>
  );
}