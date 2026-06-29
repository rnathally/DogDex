import { useEffect, useMemo, useState } from "react";

import DashboardNavbar from "../../components/dashboardNavbar/DashboardNavbar";
import DogCardModal from "../../components/dogcardmodal/DogCardModal";
import { supabase } from "../../lib/supabase";

import "./DogDex.css";

function formatDexNumber(number) {
  if (!number) {
    return "Nº???";
  }

  return `Nº${String(number).padStart(3, "0")}`;
}

function formatRarity(rarity) {
  const rarityNames = {
    common: "Comum",
    comum: "Comum",
    rare: "Raro",
    raro: "Raro",
    epic: "Épico",
    epico: "Épico",
    legendary: "Lendário",
    lendario: "Lendário",
    lendário: "Lendário",
  };

  return rarityNames[rarity] || rarity || "Comum";
}

function formatPersonality(personality) {
  const personalityNames = {
    playful: "Brincalhão",
    shy: "Tímido",
    calm: "Calmo",
    energetic: "Energético",
    friendly: "Amigável",
    protective: "Protetor",
    bold: "Corajoso",
    curious: "Curioso",
    lazy: "Preguiçoso",
  };

  return personalityNames[personality] || personality || "Carinhoso";
}

function getDogCardImage(dog) {
  if (!dog?.collected) {
    return dog?.silhouette_url || "";
  }

  if (dog.cardVersion === "shiny") {
    return (
      dog.shiny_sprite_url ||
      dog.shiny_large_image_url ||
      dog.sprite_url ||
      dog.large_image_url ||
      ""
    );
  }

  return dog.sprite_url || dog.large_image_url || "";
}

function getCardRarityLabel(dog) {
  if (!dog.collected) {
    return "Ainda não capturado";
  }

  if (dog.cardVersion === "shiny") {
    return "Shiny";
  }

  return formatRarity(dog.rarity);
}

function getCardRarityClass(dog) {
  if (!dog.collected) {
    return "locked";
  }

  if (dog.cardVersion === "shiny") {
    return "shiny";
  }

  return "";
}

function getModalDog(dog) {
  if (dog.cardVersion === "shiny") {
    return {
      ...dog,
      selectedVersion: "shiny",
      name: `${dog.name} Shiny`,
      sprite_url: dog.shiny_sprite_url || dog.sprite_url,
      large_image_url: dog.shiny_large_image_url || dog.large_image_url,
      versionLabel: "Shiny",
    };
  }

  return {
    ...dog,
    selectedVersion: "normal",
    versionLabel: "Normal",
  };
}

export default function DogDex() {
  const [activeTab, setActiveTab] = useState("capturados");
  const [selectedDog, setSelectedDog] = useState(null);

  const [dogs, setDogs] = useState([]);
  const [userEntries, setUserEntries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDogDex() {
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
          setErrorMessage("Você precisa estar logada para ver sua DogDex.");
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
              age_years,
              description,
              personality,
              rarity,
              emoji,
              sprite_url,
              silhouette_url,
              large_image_url,
              shiny_sprite_url,
              shiny_large_image_url,
              max_evolution_stage,
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

        setDogs(dogsData || []);
        setUserEntries(entriesData || []);
      } catch (error) {
        console.error("Erro ao carregar DogDex:", error);

        setErrorMessage(
          `Não foi possível carregar a DogDex: ${
            error?.message || "erro desconhecido"
          }`
        );
      } finally {
        setLoading(false);
      }
    }

    loadDogDex();
  }, []);

  const dogsWithStatus = useMemo(() => {
    return dogs.map((dog) => {
      const entry = userEntries.find((item) => item.dog_id === dog.id);

      const hasNormal = Boolean(entry?.is_captured);
      const hasShiny = Boolean(entry?.is_shiny);
      const collected = hasNormal || hasShiny;

      return {
        ...dog,
        number: formatDexNumber(dog.dex_number),
        types: [formatPersonality(dog.personality)],
        hasNormal,
        hasShiny,
        collected,
        entry,
      };
    });
  }, [dogs, userEntries]);

  const capturedCards = useMemo(() => {
    return dogsWithStatus.flatMap((dog) => {
      const cards = [];

      if (dog.hasNormal) {
        cards.push({
          ...dog,
          cardKey: `${dog.id}-normal`,
          cardVersion: "normal",
          cardName: dog.name,
          collected: true,
        });
      }

      if (dog.hasShiny) {
        cards.push({
          ...dog,
          cardKey: `${dog.id}-shiny`,
          cardVersion: "shiny",
          cardName: `${dog.name} Shiny`,
          collected: true,
        });
      }

      return cards;
    });
  }, [dogsWithStatus]);

  const missingDogs = useMemo(() => {
    return dogsWithStatus.filter((dog) => !dog.collected);
  }, [dogsWithStatus]);

  const currentDogs = activeTab === "capturados" ? capturedCards : missingDogs;

  const normalCapturedCount = useMemo(() => {
    return dogsWithStatus.filter((dog) => dog.hasNormal).length;
  }, [dogsWithStatus]);

  const shinyCapturedCount = useMemo(() => {
    return dogsWithStatus.filter((dog) => dog.hasShiny).length;
  }, [dogsWithStatus]);

  const capturedVersions = normalCapturedCount + shinyCapturedCount;
  const totalVersions = dogsWithStatus.length * 2;

  const progressPercent =
    totalVersions > 0 ? (capturedVersions / totalVersions) * 100 : 0;

  function handleOpenDogCard(dog) {
    if (!dog.collected) {
      return;
    }

    setSelectedDog(getModalDog(dog));
  }

  function handleCloseDogCard() {
    setSelectedDog(null);
  }

  return (
    <div className="dogdex-page">
      <DashboardNavbar />

      <main className="dogdex-main">
        <section className="dogdex-header">
          <div>
            <span className="dogdex-kicker">DogDex</span>

            <h1>Sua coleção de cães</h1>

            <p>
              Veja os cachorros que você já capturou e acompanhe também as
              versões shiny da sua DogDex.
            </p>
          </div>

          <div className="dogdex-progress-card">
            <span>Progresso</span>

            <strong>
              {capturedVersions}/{totalVersions}
            </strong>

            <small>
              {normalCapturedCount} normais · {shinyCapturedCount} shiny
            </small>

            <div className="dogdex-progress-bar">
              <div
                style={{
                  width: `${progressPercent}%`,
                }}
              />
            </div>
          </div>
        </section>

        <section className="dogdex-tabs">
          <button
            type="button"
            className={activeTab === "capturados" ? "active" : ""}
            onClick={() => setActiveTab("capturados")}
          >
            Capturados
          </button>

          <button
            type="button"
            className={activeTab === "faltando" ? "active" : ""}
            onClick={() => setActiveTab("faltando")}
          >
            Não capturados
          </button>
        </section>

        {loading && (
          <section className="dogdex-state-card">
            <h2>Carregando...</h2>
            <p>Buscando os cachorros cadastrados no Supabase.</p>
          </section>
        )}

        {!loading && errorMessage && (
          <section className="dogdex-state-card error">
            <h2>Ops!</h2>
            <p>{errorMessage}</p>
          </section>
        )}

        {!loading && !errorMessage && currentDogs.length === 0 && (
          <section className="dogdex-state-card">
            <h2>
              {activeTab === "capturados"
                ? "Nenhum cachorro capturado ainda"
                : "Nenhum cachorro faltando"}
            </h2>

            <p>
              {activeTab === "capturados"
                ? "Quando você capturar um cachorro, ele aparecerá aqui."
                : "Você já encontrou todos os cachorros disponíveis."}
            </p>
          </section>
        )}

        {!loading && !errorMessage && currentDogs.length > 0 && (
          <section className="dogdex-grid">
            {currentDogs.map((dog) => {
              const dogImage = getDogCardImage(dog);
              const isShinyCard = dog.cardVersion === "shiny";

              return (
                <article
                  className={`dog-card ${
                    dog.collected ? "dog-card-clickable" : "dog-card-locked"
                  } ${dog.collected && isShinyCard ? "dog-card-shiny" : ""}`}
                  key={dog.cardKey || dog.id}
                  onClick={() => handleOpenDogCard(dog)}
                >
                  <div className="dog-image-area">
                    {dogImage ? (
                      <img
                        src={dogImage}
                        alt={
                          dog.collected
                            ? dog.cardName || dog.name
                            : "Cachorro ainda não capturado"
                        }
                        className={`dog-image ${
                          dog.collected ? "" : "dog-image-hidden"
                        }`}
                      />
                    ) : dog.collected ? (
                      <div className="dog-fallback-emoji">
                        {dog.emoji || "🐕"}
                      </div>
                    ) : (
                      <div className="dog-shadow-unknown">
                        <span className="unknown-ear-left" />
                        <span className="unknown-ear-right" />
                        <span className="unknown-head" />
                        <span className="unknown-body" />
                        <span className="unknown-tail" />
                      </div>
                    )}
                  </div>

                  <span className="dog-number">
                    {formatDexNumber(dog.dex_number)}
                  </span>

                  <h2>{dog.collected ? dog.cardName || dog.name : "???"}</h2>

                  <div className="dog-tags">
                    {dog.collected ? (
                      <>
                        <span className="dog-tag">
                          {formatPersonality(dog.personality)}
                        </span>

                        {dog.breed && (
                          <span className="dog-tag secondary">
                            {dog.breed}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="dog-tag locked">Desconhecido</span>
                    )}
                  </div>

                  <span className={`dog-rarity ${getCardRarityClass(dog)}`}>
                    {getCardRarityLabel(dog)}
                  </span>

                  {dog.collected && (
                    <span className="dog-card-hint">Ver carta</span>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </main>

      {selectedDog && (
        <DogCardModal dog={selectedDog} onClose={handleCloseDogCard} />
      )}
    </div>
  );
}