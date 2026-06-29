import { useEffect, useMemo, useState } from "react";
import {
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiLock,
  FiStar,
  FiTarget,
  FiUser,
  FiZap,
} from "react-icons/fi";

import DashboardNavbar from "../../components/dashboardnavbar/DashboardNavbar";
import { supabase } from "../../lib/supabase";
import "./Dashboard.css";

function getRpcRow(data) {
  if (Array.isArray(data)) {
    return data[0] || null;
  }

  return data || null;
}

function formatTimeAgo(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "agora";
  if (diffMinutes < 60) return `${diffMinutes}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays === 1) return "ontem";

  return `${diffDays} dias`;
}

function formatDogCount(count) {
  if (count === 1) return "1 cão";
  return `${count} cães`;
}

function createAchievements({ totalScans, capturedCount, totalDogs }) {
  const completedDogDex = totalDogs > 0 && capturedCount >= totalDogs;

  return [
    {
      id: 1,
      icon: <FiCheckCircle />,
      title: "Primeiro Scan",
      description:
        totalScans > 0
          ? "Você escaneou seu primeiro QR Code."
          : "Escaneie o primeiro QR Code do campus.",
      status: totalScans > 0 ? "unlocked" : "locked",
    },
    {
      id: 2,
      icon: <FiStar />,
      title: "5 Capturados",
      description:
        capturedCount >= 5
          ? "Você capturou 5 cães para sua DogDex."
          : "Capture 5 cães para desbloquear.",
      status: capturedCount >= 5 ? "unlocked" : "locked",
    },
    {
      id: 3,
      icon: <FiAward />,
      title: "10 Capturados",
      description:
        capturedCount >= 10
          ? "Você capturou 10 cães para sua DogDex."
          : "Continue explorando para desbloquear.",
      status: capturedCount >= 10 ? "unlocked" : "locked",
    },
    {
      id: 4,
      icon: <FiLock />,
      title: "DogDex Completa",
      description: completedDogDex
        ? "Você capturou todos os cães comunitários."
        : "Capture todos os cães comunitários.",
      status: completedDogDex ? "unlocked" : "locked",
    },
  ];
}

function buildActivities({ attempts, transactions, entries, dogs }) {
  const dogsMap = new Map(dogs.map((dog) => [dog.id, dog]));
  const activities = [];

  attempts.forEach((attempt) => {
    const dog = dogsMap.get(attempt.dog_id);
    const dogName = dog?.name || "Um cachorro";

    if (attempt.result === "captured") {
      activities.push({
        id: `attempt-${attempt.id}`,
        color: attempt.became_shiny ? "yellow" : "pink",
        title: `${dogName} foi capturado`,
        description: attempt.became_shiny
          ? "Captura shiny registrada na sua DogDex."
          : "Novo cachorro adicionado à sua DogDex.",
        time: formatTimeAgo(attempt.created_at),
        date: attempt.created_at,
      });
    }

    if (attempt.result === "miss") {
      activities.push({
        id: `attempt-${attempt.id}`,
        color: "yellow",
        title: `${dogName} apareceu e fugiu`,
        description: "Tentativa de captura registrada no scanner.",
        time: formatTimeAgo(attempt.created_at),
        date: attempt.created_at,
      });
    }

    if (attempt.result === "already_owned") {
      activities.push({
        id: `attempt-${attempt.id}`,
        color: "green",
        title: `${dogName} já estava na sua DogDex`,
        description: "Você encontrou novamente um cachorro já capturado.",
        time: formatTimeAgo(attempt.created_at),
        date: attempt.created_at,
      });
    }
  });

  if (attempts.length === 0) {
    entries.forEach((entry) => {
      const dog = dogsMap.get(entry.dog_id);
      const dogName = dog?.name || "Um cachorro";

      activities.push({
        id: `entry-${entry.id}`,
        color: entry.is_captured ? "pink" : "green",
        title: entry.is_captured
          ? `${dogName} foi capturado`
          : `${dogName} foi encontrado`,
        description: entry.is_captured
          ? "Cachorro registrado como capturado na sua DogDex."
          : "Cachorro encontrado, mas ainda não capturado.",
        time: formatTimeAgo(entry.first_seen_at),
        date: entry.first_seen_at,
      });
    });
  }

  transactions.forEach((transaction) => {
    if (transaction.reason !== "scan") return;

    activities.push({
      id: `transaction-${transaction.id}`,
      color: "brown",
      title: "Biscoito usado no scanner",
      description: `Saldo depois do scan: ${transaction.balance_after} biscoito(s).`,
      time: formatTimeAgo(transaction.created_at),
      date: transaction.created_at,
    });
  });

  return activities
    .filter((activity) => activity.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);
}

export default function Dashboard() {
  const [dogs, setDogs] = useState([]);
  const [entries, setEntries] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [attempts, setAttempts] = useState([]);

  const [biscuits, setBiscuits] = useState({
    remaining: 0,
    dailyAllowance: 3,
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setErrorMessage("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          setErrorMessage("Você precisa estar logada para ver o Dashboard.");
          return;
        }

        const { data: dogsData, error: dogsError } = await supabase
          .from("dogs")
          .select(
            `
              id,
              dex_number,
              name,
              slug,
              breed,
              rarity,
              personality,
              is_active
            `
          )
          .eq("is_active", true)
          .order("dex_number", { ascending: true });

        if (dogsError) {
          throw dogsError;
        }

        const { data: entriesData, error: entriesError } = await supabase
          .from("user_dog_entries")
          .select(
            `
              id,
              user_id,
              dog_id,
              is_captured,
              is_shiny,
              scan_count,
              evolution_stage,
              first_seen_at
            `
          )
          .eq("user_id", user.id);

        if (entriesError) {
          throw entriesError;
        }

        const { data: biscuitData, error: biscuitError } = await supabase.rpc(
          "get_normal_biscuits"
        );

        if (biscuitError) {
          console.error("Erro ao buscar biscoitos:", biscuitError);
        }

        const { data: transactionsData, error: transactionsError } =
          await supabase
            .from("biscuit_transactions")
            .select(
              `
                id,
                user_id,
                biscuit_type,
                amount,
                balance_after,
                reason,
                reference_id,
                created_at
              `
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10);

        if (transactionsError) {
          console.error("Erro ao buscar transações:", transactionsError);
        }

        const { data: attemptsData, error: attemptsError } = await supabase
          .from("capture_attempts")
          .select(
            `
              id,
              user_id,
              dog_id,
              biscuit_type,
              base_catch_rate,
              final_catch_rate,
              roll_value,
              result,
              became_shiny,
              created_at
            `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (attemptsError) {
          console.error("Erro ao buscar tentativas:", attemptsError);
        }

        const biscuitRow = getRpcRow(biscuitData);

        setDogs(dogsData || []);
        setEntries(entriesData || []);
        setTransactions(transactionsData || []);
        setAttempts(attemptsData || []);

        setBiscuits({
          remaining: biscuitRow?.remaining_biscuits ?? 0,
          dailyAllowance: biscuitRow?.daily_allowance ?? 3,
        });
      } catch (error) {
        console.error("Erro ao carregar Dashboard:", error);

        setErrorMessage(
          `Não foi possível carregar o Dashboard: ${
            error?.message || "erro desconhecido"
          }`
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const dashboardStats = useMemo(() => {
    const totalDogs = dogs.length;

    const capturedEntries = entries.filter((entry) => entry.is_captured);
    const capturedCount = capturedEntries.length;
    const missingCount = Math.max(totalDogs - capturedCount, 0);

    const scanCountFromEntries = entries.reduce((total, entry) => {
      return total + (entry.scan_count || 0);
    }, 0);

    const scanCountFromTransactions = transactions.filter(
      (transaction) => transaction.reason === "scan"
    ).length;

    const scanCountFromAttempts = attempts.length;

    const totalScans = Math.max(
      scanCountFromEntries,
      scanCountFromTransactions,
      scanCountFromAttempts
    );

    const shinyCount = capturedEntries.filter((entry) => entry.is_shiny).length;

    const progressPercent =
      totalDogs > 0 ? Math.round((capturedCount / totalDogs) * 100) : 0;

    const xp = capturedCount * 100 + totalScans * 20 + shinyCount * 150;
    const level = Math.max(1, Math.floor(xp / 500) + 1);

    return {
      totalDogs,
      capturedCount,
      missingCount,
      totalScans,
      shinyCount,
      progressPercent,
      xp,
      level,
    };
  }, [dogs, entries, transactions, attempts]);

  const achievements = useMemo(() => {
    return createAchievements(dashboardStats);
  }, [dashboardStats]);

  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.status === "unlocked"
  ).length;

  const activities = useMemo(() => {
    return buildActivities({
      attempts,
      transactions,
      entries,
      dogs,
    });
  }, [attempts, transactions, entries, dogs]);

  return (
    <div className="dashboard-page">
      <DashboardNavbar />

      <main className="dashboard-content">
        <section className="dashboard-top-row">
          <div className="dashboard-intro">
            <span className="dashboard-kicker">Painel DogDex</span>

            <h1>Sua jornada</h1>

            <p>
              Acompanhe seu progresso, veja suas conquistas desbloqueadas e
              confira as últimas atividades da sua aventura pelo campus.
            </p>
          </div>

          <article className="dashboard-profile-chip">
            <div className="dashboard-profile-avatar">
              <FiUser />
            </div>

            <div className="dashboard-profile-info">
              <strong>Explorador</strong>
              <small>
                Nível {dashboardStats.level} ·{" "}
                {dashboardStats.xp.toLocaleString("pt-BR")} XP
              </small>
            </div>
          </article>
        </section>

        {loading && (
          <section className="dashboard-progress-card">
            <div className="progress-main">
              <span className="dashboard-section-label">Carregando</span>
              <h2>Buscando seus dados...</h2>
              <p>Estamos carregando seu progresso no Supabase.</p>
            </div>
          </section>
        )}

        {!loading && errorMessage && (
          <section className="dashboard-progress-card">
            <div className="progress-main">
              <span className="dashboard-section-label">Ops</span>
              <h2>Não foi possível carregar</h2>
              <p>{errorMessage}</p>
            </div>
          </section>
        )}

        {!loading && !errorMessage && (
          <>
            <section className="dashboard-progress-card">
              <div className="progress-main">
                <span className="dashboard-section-label">
                  Progresso da coleção
                </span>

                <h2>
                  Capture todos os {dashboardStats.totalDogs} cães da DogDex
                </h2>

                <p>
                  Você já encontrou parte dos cães comunitários. Continue
                  escaneando QR Codes para completar sua coleção.
                </p>

                <div className="progress-bar-header">
                  <span>DogDex preenchida</span>
                  <strong>{dashboardStats.progressPercent}%</strong>
                </div>

                <div className="progress-bar">
                  <span
                    style={{
                      width: `${dashboardStats.progressPercent}%`,
                    }}
                  />
                </div>
              </div>

              <div className="progress-score">
                <strong>
                  {String(dashboardStats.capturedCount).padStart(2, "0")}
                </strong>
                <span>de {dashboardStats.totalDogs} capturados</span>
              </div>
            </section>

            <section className="dashboard-stats-grid">
              <article className="dashboard-stat-card">
                <FiBookOpen />
                <span>DogDex</span>
                <strong>
                  {dashboardStats.capturedCount} / {dashboardStats.totalDogs}
                </strong>
              </article>

              <article className="dashboard-stat-card">
                <FiTarget />
                <span>Faltando</span>
                <strong>{formatDogCount(dashboardStats.missingCount)}</strong>
              </article>

              <article className="dashboard-stat-card">
                <FiZap />
                <span>Biscoitos</span>
                <strong>
                  {biscuits.remaining}/{biscuits.dailyAllowance}
                </strong>
              </article>

              <article className="dashboard-stat-card">
                <FiStar />
                <span>XP atual</span>
                <strong>{dashboardStats.xp.toLocaleString("pt-BR")}</strong>
              </article>
            </section>

            <section className="dashboard-sections-grid">
              <section className="dashboard-card achievements-card">
                <div className="dashboard-card-heading">
                  <div>
                    <span className="dashboard-section-label">Conquistas</span>
                    <h2>Recompensas desbloqueadas</h2>
                  </div>

                  <span className="dashboard-card-count">
                    {unlockedAchievements} / {achievements.length}
                  </span>
                </div>

                <div className="achievements-grid">
                  {achievements.map((achievement) => (
                    <article
                      className={`achievement-item ${achievement.status}`}
                      key={achievement.id}
                    >
                      <div className="achievement-icon">
                        {achievement.icon}
                      </div>

                      <div>
                        <strong>{achievement.title}</strong>
                        <span>{achievement.description}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="dashboard-card activity-card">
                <div className="dashboard-card-heading">
                  <div>
                    <span className="dashboard-section-label">
                      Atividade recente
                    </span>
                    <h2>Últimos acontecimentos</h2>
                  </div>

                  <FiClock className="activity-heading-icon" />
                </div>

                <div className="activity-list">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <article className="activity-item" key={activity.id}>
                        <div className={`activity-dot ${activity.color}`} />

                        <div className="activity-text">
                          <strong>{activity.title}</strong>
                          <span>{activity.description}</span>
                        </div>

                        <time>{activity.time}</time>
                      </article>
                    ))
                  ) : (
                    <article className="activity-item">
                      <div className="activity-dot brown" />

                      <div className="activity-text">
                        <strong>Nenhuma atividade ainda</strong>
                        <span>
                          Escaneie um QR Code para começar sua jornada.
                        </span>
                      </div>

                      <time>agora</time>
                    </article>
                  )}
                </div>
              </section>
            </section>
          </>
        )}
      </main>
    </div>
  );
}