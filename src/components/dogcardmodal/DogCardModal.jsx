import { useRef } from "react";
import "./DogCardModal.css";

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

  return personalityNames[personality] || personality || "Dog";
}

function formatDate(date) {
  if (!date) {
    return "Não informado";
  }

  return new Date(date).toLocaleDateString("pt-BR");
}

function getRarityClass(rarity) {
  const normalized = String(rarity || "common")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return `dog-card-rarity-${normalized}`;
}

function getDogVersion(dog) {
  return dog?.selectedVersion || dog?.cardVersion || "normal";
}

function canUseMouseEffect() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export default function DogCardModal({ dog, onClose }) {
  const cardRef = useRef(null);
  const frameRef = useRef(null);

  if (!dog) {
    return null;
  }

  const dogVersion = getDogVersion(dog);
  const isShiny = dogVersion === "shiny";
  const rarityClass = getRarityClass(dog.rarity);

  const dogImage = isShiny
    ? dog.shiny_large_image_url ||
      dog.shiny_sprite_url ||
      dog.large_image_url ||
      dog.sprite_url
    : dog.large_image_url || dog.sprite_url;

  const displayName = isShiny
    ? dog.name?.includes("Shiny")
      ? dog.name
      : `${dog.name} Shiny`
    : dog.name?.replace(" Shiny", "");

  function updateCardFX(clientX, clientY) {
    if (!cardRef.current || !canUseMouseEffect()) {
      return;
    }

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      const card = cardRef.current;
      const rect = card.getBoundingClientRect();

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const percentX = Math.max(0, Math.min(1, x / rect.width));
      const percentY = Math.max(0, Math.min(1, y / rect.height));

      const rotateY = (percentX - 0.5) * 11;
      const rotateX = (0.5 - percentY) * 11;

      card.style.setProperty("--rx", `${rotateX}deg`);
      card.style.setProperty("--ry", `${rotateY}deg`);
      card.style.setProperty("--mx", `${percentX * 100}%`);
      card.style.setProperty("--my", `${percentY * 100}%`);
      card.style.setProperty("--shine-opacity", "0.85");
    });
  }

  function getNormalVariantClass(dog) {
  const variants = [
    "dog-card-normal-forest",
    "dog-card-normal-rose",
    "dog-card-normal-ocean",
    "dog-card-normal-sunset",
    "dog-card-normal-purple",
    "dog-card-normal-mint",
  ];

  const base = String(dog?.slug || dog?.id || dog?.dex_number || dog?.name || "");

  const total = base.split("").reduce((sum, char) => {
    return sum + char.charCodeAt(0);
  }, 0);

  return variants[total % variants.length];
}

  function resetCardFX() {
    if (!cardRef.current) {
      return;
    }

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    const card = cardRef.current;

    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--mx", "50%");
    card.style.setProperty("--my", "24%");
    card.style.setProperty("--shine-opacity", "0.55");
  }

  function handleMouseMove(event) {
    updateCardFX(event.clientX, event.clientY);
  }

  function handleMouseLeave() {
    resetCardFX();
  }

  return (
    <div className="dog-card-modal-overlay" onClick={onClose}>
      <section
        ref={cardRef}
        className={`
          dog-card-modal
          ${rarityClass}
          ${
  isShiny
    ? "dog-card-modal-shiny"
    : `dog-card-modal-normal ${getNormalVariantClass(dog)}`
}
        `}
        onClick={(event) => event.stopPropagation()}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          className="dog-card-modal-close"
          onClick={onClose}
          aria-label="Fechar carta"
        >
          ×
        </button>

        <div className="dog-card-modal-inner">
          <div className="dog-card-modal-top">
            <span className="dog-card-number">
              {formatDexNumber(dog.dex_number)}
            </span>

            <div className="dog-card-modal-rarity-group">
              {isShiny && <em>Shiny</em>}
              <strong>{formatRarity(dog.rarity)}</strong>
            </div>
          </div>

          <div className="dog-card-modal-image-area">
            {dogImage ? (
              <img
                src={dogImage}
                alt={displayName}
                className="dog-card-modal-image"
              />
            ) : (
              <div className="dog-card-modal-emoji">{dog.emoji || "🐕"}</div>
            )}
          </div>

          <div className="dog-card-modal-name-area">
            <h2>{displayName}</h2>
          </div>

          <div className="dog-card-modal-tags">
            <span>{formatPersonality(dog.personality)}</span>

            {dog.breed && <span>{dog.breed}</span>}

            <span
              className={
                isShiny ? "dog-card-shiny-tag" : "dog-card-normal-tag"
              }
            >
              {isShiny ? "Versão shiny" : "Versão normal"}
            </span>
          </div>

          <p className="dog-card-modal-description">
            {dog.description ||
              "Esse cachorro ainda não possui uma descrição cadastrada."}
          </p>

          <div className="dog-card-modal-info-grid">
            <div>
              <span>Primeiro encontro</span>
              <strong>{formatDate(dog.entry?.first_seen_at)}</strong>
            </div>

            <div>
              <span>Encontros</span>
              <strong>{dog.entry?.scan_count || 1}</strong>
            </div>

            <div>
              <span>Estágio</span>
              <strong>{dog.entry?.evolution_stage || 1}</strong>
            </div>

            <div>
              <span>Versão</span>
              <strong>{isShiny ? "Shiny" : "Normal"}</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}