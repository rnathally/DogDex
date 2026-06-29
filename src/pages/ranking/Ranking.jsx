import { useEffect, useMemo, useState } from "react";

import DashboardNavbar from "../../components/dashboardnavbar/DashboardNavbar";
import { supabase } from "../../lib/supabase";

import "./Ranking.css";

function getPositionLabel(position) {
  return `${position}º`;
}

function getMedal(position) {
  if (position === 1) return "🏆";
  if (position === 2) return "🥈";
  if (position === 3) return "🥉";
  return "◆";
}

function getAvatarLetter(name) {
  return String(name || "J")
    .trim()
    .charAt(0)
    .toUpperCase();
}

function getPlayerTitle(user) {
  if (user.captured >= user.total && user.total > 0) {
    return "Mestre DogDex";
  }

  if (user.captured >= 10) {
    return "Caçador lendário";
  }

  if (user.captured >= 5) {
    return "Caçador dedicado";
  }

  if (user.scans >= 10) {
    return "Explorador do campus";
  }

  return "Iniciante DogDex";
}

export default function Ranking() {
  const [rankingUsers, setRankingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadRanking() {
      try {
        setLoading(true);
        setErrorMessage("");

        const { data, error } = await supabase.rpc("get_public_ranking");

        if (error) {
          throw error;
        }

        const users = (data || []).map((row, index) => {
          const user = {
            id: row.player_id,
            position: index + 1,
            name: row.player_name,
            avatar: getAvatarLetter(row.player_name),
            captured: Number(row.captured || 0),
            shiny: Number(row.shiny || 0),
            scans: Number(row.scans || 0),
            total: Number(row.total_dogs || 0),
            score: Number(row.xp || 0),
          };

          return {
            ...user,
            title: getPlayerTitle(user),
          };
        });

        setRankingUsers(users);
      } catch (error) {
        console.error("Erro ao carregar ranking:", error);

        setErrorMessage(
          `Não foi possível carregar o ranking: ${
            error?.message || "erro desconhecido"
          }`
        );
      } finally {
        setLoading(false);
      }
    }

    loadRanking();
  }, []);

  const totalPlayers = rankingUsers.length;

  const totalScans = useMemo(() => {
    return rankingUsers.reduce((total, user) => total + user.scans, 0);
  }, [rankingUsers]);

  const totalCaptured = useMemo(() => {
    return rankingUsers.reduce((total, user) => total + user.captured, 0);
  }, [rankingUsers]);

  return (
    <div className="ranking-page">
      <DashboardNavbar />

      <main className="ranking-main">
        <section className="ranking-hero">
          <div>
            <span className="ranking-kicker">DogDex Arena</span>

            <h1>Ranking</h1>

            <p>
              Acompanhe os jogadores que mais exploraram o campus, escanearam
              QR Codes e avançaram na coleção da DogDex.
            </p>
          </div>
        </section>

        <section className="ranking-board">
          <div className="ranking-board-header">
            <div>
              <span>Classificação geral</span>
              <h2>Jogadores</h2>
            </div>

            <div className="ranking-board-summary">
              <div>
                <span>Players</span>
                <strong>{loading ? "..." : totalPlayers}</strong>
              </div>

              <div>
                <span>Capturas</span>
                <strong>{loading ? "..." : totalCaptured}</strong>
              </div>

              <div>
                <span>Scans</span>
                <strong>{loading ? "..." : totalScans}</strong>
              </div>
            </div>
          </div>

          {loading && (
            <div className="ranking-table">
              <article className="ranking-row">
                <div className="ranking-player">
                  <div>
                    <h3>Carregando ranking...</h3>
                    <p>Buscando dados reais no Supabase.</p>
                  </div>
                </div>
              </article>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="ranking-table">
              <article className="ranking-row">
                <div className="ranking-player">
                  <div>
                    <h3>Ops!</h3>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              </article>
            </div>
          )}

          {!loading && !errorMessage && rankingUsers.length === 0 && (
            <div className="ranking-table">
              <article className="ranking-row">
                <div className="ranking-player">
                  <div>
                    <h3>Nenhum jogador ainda</h3>
                    <p>O ranking aparecerá quando alguém começar a escanear.</p>
                  </div>
                </div>
              </article>
            </div>
          )}

          {!loading && !errorMessage && rankingUsers.length > 0 && (
            <div className="ranking-table">
              {rankingUsers.map((user) => (
                <article
                  className={`ranking-row ranking-row-${user.position}`}
                  key={user.id}
                >
                  <div className="ranking-rank">
                    <span>{getPositionLabel(user.position)}</span>
                    <strong>{getMedal(user.position)}</strong>
                  </div>

                  <div className="ranking-player">
                    <div className="ranking-avatar">{user.avatar}</div>

                    <div>
                      <h3>{user.name}</h3>
                      <p>{user.title}</p>
                    </div>
                  </div>

                  <div className="ranking-score">
                    <span>XP</span>
                    <strong>{user.score}</strong>
                  </div>

                  <div className="ranking-stats">
                    <div>
                      <span>Dogs</span>
                      <strong>
                        {user.captured}/{user.total}
                      </strong>
                    </div>

                    <div>
                      <span>Shiny</span>
                      <strong>{user.shiny}</strong>
                    </div>

                    <div>
                      <span>Scans</span>
                      <strong>{user.scans}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="ranking-help">
          <span>Dica de missão</span>

          <p>
            Capture mais cães, encontre versões shiny e escaneie QR Codes para
            aumentar seu XP e subir no ranking.
          </p>
        </section>
      </main>
    </div>
  );
}