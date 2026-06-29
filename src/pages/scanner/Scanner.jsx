import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserMultiFormatReader } from "@zxing/browser";
import {
  FiArrowLeft,
  FiCamera,
  FiCheckCircle,
  FiRefreshCcw,
  FiXCircle,
} from "react-icons/fi";

import DashboardNavbar from "../../components/dashboardnavbar/DashboardNavbar";
import { supabase } from "../../lib/supabase";

import "./Scanner.css";

const SHINY_CHANCE = 0.1;

const INITIAL_MESSAGE =
  "Toque em escanear e aponte a câmera para o QR Code. O biscoito só será usado quando o código for lido.";

function PixelBiscuitIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 44 28"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="10" y="8" width="24" height="12" fill="currentColor" />
      <rect x="4" y="4" width="8" height="8" fill="currentColor" />
      <rect x="4" y="16" width="8" height="8" fill="currentColor" />
      <rect x="32" y="4" width="8" height="8" fill="currentColor" />
      <rect x="32" y="16" width="8" height="8" fill="currentColor" />

      <rect x="16" y="12" width="2" height="2" fill="#f7f4d5" />
      <rect x="21" y="10" width="2" height="2" fill="#f7f4d5" />
      <rect x="24" y="15" width="2" height="2" fill="#f7f4d5" />
      <rect x="28" y="11" width="2" height="2" fill="#f7f4d5" />
    </svg>
  );
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function extractDogSlug(qrText) {
  if (!qrText) return "";

  const text = qrText.trim();

  if (text.startsWith("dogdex:")) {
    return text.replace("dogdex:", "").trim();
  }

  try {
    const url = new URL(text);

    const dogParam = url.searchParams.get("dog");
    if (dogParam) return dogParam.trim();

    const slugParam = url.searchParams.get("slug");
    if (slugParam) return slugParam.trim();

    const captureParam = url.searchParams.get("capture");
    if (captureParam) return captureParam.trim();

    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  } catch {
    return text;
  }
}

function normalizeDogSlug(slug) {
  return normalizeText(slug).replace(/\s+/g, "-");
}

function getCaptureChance(rarity) {
  const normalizedRarity = normalizeText(rarity);

  const chances = {
    common: 0.5,
    comum: 0.5,
    rare: 0.55,
    raro: 0.55,
    epic: 0.35,
    epico: 0.35,
    legendary: 0.2,
    lendario: 0.2,
  };

  return chances[normalizedRarity] ?? 0.5;
}

function getDexNumber(number) {
  return `Nº${String(number || 0).padStart(3, "0")}`;
}

function getDogImage(dog, version) {
  if (version === "shiny") {
    return (
      dog?.shiny_sprite_url ||
      dog?.shiny_large_image_url ||
      dog?.sprite_url ||
      dog?.large_image_url ||
      ""
    );
  }

  return dog?.sprite_url || dog?.large_image_url || "";
}

function createEntryId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return undefined;
}

function getRpcRow(data) {
  if (Array.isArray(data)) {
    return data[0] || null;
  }

  return data || null;
}

function getResultBadge(dogResult) {
  if (!dogResult) return "";

  if (dogResult.result === "miss") {
    return "Não capturado";
  }

  if (dogResult.result === "already_owned") {
    return dogResult.version === "shiny"
      ? "Shiny repetido"
      : "Normal repetido";
  }

  if (dogResult.version === "shiny") {
    return "Shiny capturado";
  }

  return "Normal capturado";
}

function getResultTitle(scanStatus) {
  if (scanStatus === "captured") return "Capturado!";
  if (scanStatus === "escaped") return "Ele fugiu!";
  if (scanStatus === "already") return "Já estava na DogDex";
  if (scanStatus === "error") return "Ops!";
  if (scanStatus === "spending") return "Gastando biscoito...";
  if (scanStatus === "checking") return "Processando QR Code";
  if (scanStatus === "scanning") return "Procurando QR Code";

  return "Pronto para escanear";
}

export default function Scanner() {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const hasProcessedRef = useRef(false);

  const navigate = useNavigate();

  const [cameraStatus, setCameraStatus] = useState("locked");
  const [scanStatus, setScanStatus] = useState("idle");
  const [message, setMessage] = useState(INITIAL_MESSAGE);

  const [dogResult, setDogResult] = useState(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [biscuitsLoading, setBiscuitsLoading] = useState(true);
  const [biscuits, setBiscuits] = useState({
    remaining: 0,
    dailyAllowance: 3,
  });

  useEffect(() => {
    loadBiscuits();

    return () => {
      stopCamera(false);
    };
  }, []);

  function stopCamera(updateStatus = true) {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }

    if (updateStatus) {
      setCameraStatus("locked");
    }
  }

  async function loadBiscuits() {
    try {
      setBiscuitsLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setIsAuthenticated(false);
        setScanStatus("error");
        setMessage("Você precisa estar logada para usar o scanner.");
        return;
      }

      setIsAuthenticated(true);

      const { data, error } = await supabase.rpc("get_normal_biscuits");

      if (error) {
        throw error;
      }

      const biscuitData = getRpcRow(data);

      setBiscuits({
        remaining: biscuitData?.remaining_biscuits ?? 0,
        dailyAllowance: biscuitData?.daily_allowance ?? 3,
      });

      setScanStatus("idle");
      setMessage(INITIAL_MESSAGE);
    } catch (error) {
      console.error("Erro ao carregar biscoitos:", error);

      setScanStatus("error");
      setMessage(
        `Não foi possível carregar seus biscoitos: ${
          error?.message || "erro desconhecido"
        }`
      );
    } finally {
      setBiscuitsLoading(false);
    }
  }

  async function handleStartScanner() {
    try {
      if (!isAuthenticated) {
        setScanStatus("error");
        setMessage("Você precisa estar logada para usar o scanner.");
        return;
      }

      if (biscuits.remaining <= 0) {
        setScanStatus("error");
        setMessage(
          "Você está sem biscoitos por hoje. Volte amanhã para escanear novamente."
        );
        return;
      }

      setDogResult(null);
      hasProcessedRef.current = false;

      setCameraStatus("loading");
      setScanStatus("scanning");
      setMessage(
        "Câmera liberada. Posicione o QR Code no centro da área de leitura."
      );

      await startScanner();
    } catch (error) {
      console.error("Erro ao iniciar scanner:", error);

      setScanStatus("error");
      setMessage(
        `Não foi possível iniciar o scanner: ${
          error?.message || "erro desconhecido"
        }`
      );
    }
  }

  async function startScanner() {
    try {
      stopCamera(false);

      const codeReader = new BrowserMultiFormatReader();

      const handleResult = async (result) => {
        if (!result || hasProcessedRef.current) return;

        hasProcessedRef.current = true;

        const qrText = result.getText();

        console.log("QR lido pela câmera:", qrText);

        stopCamera();

        await handleQrDetected(qrText);
      };

      try {
        const controls = await codeReader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          videoRef.current,
          handleResult
        );

        controlsRef.current = controls;
      } catch (environmentError) {
        console.warn(
          "Não foi possível abrir câmera traseira. Tentando câmera padrão:",
          environmentError
        );

        const controls = await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          handleResult
        );

        controlsRef.current = controls;
      }

      setCameraStatus("ready");
    } catch (error) {
      console.error("Erro ao abrir câmera:", error);

      setCameraStatus("error");
      setScanStatus("error");
      setMessage(
        "Não consegui acessar a câmera. Verifique a permissão do navegador e tente novamente."
      );
    }
  }

  async function handleQrDetected(qrText) {
    try {
      setScanStatus("spending");
      setDogResult(null);
      setMessage("QR Code detectado! Gastando 1 biscoito...");

      const { data, error } = await supabase.rpc("consume_normal_biscuit");

      if (error) {
        throw error;
      }

      const biscuitData = getRpcRow(data);

      if (!biscuitData?.allowed) {
        setBiscuits({
          remaining: biscuitData?.remaining_biscuits ?? 0,
          dailyAllowance: biscuitData?.daily_allowance ?? 3,
        });

        setScanStatus("error");
        setMessage(
          "Você está sem biscoitos por hoje. Volte amanhã para escanear novamente."
        );
        return;
      }

      setBiscuits({
        remaining: biscuitData.remaining_biscuits,
        dailyAllowance: biscuitData.daily_allowance,
      });

      await handleQrCode(qrText);
    } catch (error) {
      console.error("Erro ao gastar biscoito:", error);

      setScanStatus("error");
      setMessage(
        `O QR Code foi lido, mas não consegui gastar o biscoito: ${
          error?.message || "erro desconhecido"
        }`
      );
    }
  }

  async function saveCaptureAttempt({
    userId,
    dogId,
    captureChance,
    rollValue,
    shinyRollValue,
    result,
    becameShiny,
  }) {
    const { error } = await supabase.from("capture_attempts").insert({
      user_id: userId,
      dog_id: dogId,
      biscuit_type: "normal",
      base_catch_rate: captureChance,
      personality_modifier: 1,
      rarity_modifier: 1,
      final_catch_rate: captureChance,
      roll_value: rollValue,
      shiny_roll_value: shinyRollValue,
      result,
      became_shiny: becameShiny,
    });

    if (error) {
      console.error("Erro ao salvar tentativa em capture_attempts:", error);
    }
  }

  async function handleQrCode(qrText) {
    try {
      setScanStatus("checking");
      setDogResult(null);
      setMessage("Biscoito usado! Verificando cachorro...");

      const rawDogSlug = extractDogSlug(qrText);
      const dogSlug = normalizeDogSlug(rawDogSlug);

      console.log("Texto completo do QR:", qrText);
      console.log("Slug extraído antes de normalizar:", rawDogSlug);
      console.log("Slug final usado na busca:", dogSlug);

      if (!dogSlug) {
        setScanStatus("error");
        setMessage("Esse QR Code não tem um código de cachorro válido.");
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log("Usuário logado:", user);
      console.log("Erro ao buscar usuário:", userError);

      if (userError) {
        throw userError;
      }

      if (!user) {
        setScanStatus("error");
        setMessage("Você precisa estar logada para capturar cachorros.");
        return;
      }

      const { data: dog, error: dogError } = await supabase
        .from("dogs")
        .select(
          "id, dex_number, name, slug, rarity, sprite_url, silhouette_url, large_image_url, shiny_sprite_url, shiny_large_image_url, is_active"
        )
        .eq("slug", dogSlug)
        .eq("is_active", true)
        .maybeSingle();

      console.log("Cachorro encontrado:", dog);
      console.log("Erro ao buscar cachorro:", dogError);

      if (dogError) {
        throw dogError;
      }

      if (!dog) {
        setScanStatus("error");
        setMessage(
          `QR lido, mas não encontrei nenhum cachorro ativo com o slug "${dogSlug}".`
        );
        return;
      }

      const { data: existingEntry, error: entryError } = await supabase
        .from("user_dog_entries")
        .select(
          "id, is_captured, is_shiny, scan_count, evolution_stage, first_seen_at"
        )
        .eq("user_id", user.id)
        .eq("dog_id", dog.id)
        .maybeSingle();

      console.log("Registro existente na user_dog_entries:", existingEntry);
      console.log("Erro ao buscar registro existente:", entryError);

      if (entryError) {
        throw entryError;
      }

      const captureChance = getCaptureChance(dog.rarity);
      const rollValue = Math.random();
      const didCapture = rollValue <= captureChance;

      const shinyRollValue = didCapture ? Math.random() : null;
      const didShiny = didCapture && shinyRollValue <= SHINY_CHANCE;

      const version = didCapture ? (didShiny ? "shiny" : "normal") : "none";

      const alreadyOwned =
        version === "normal"
          ? Boolean(existingEntry?.is_captured)
          : version === "shiny"
            ? Boolean(existingEntry?.is_shiny)
            : false;

      const attemptResult = !didCapture
        ? "miss"
        : alreadyOwned
          ? "already_owned"
          : "captured";

      console.log("Chance de captura:", captureChance);
      console.log("Valor sorteado:", rollValue);
      console.log("Capturou?", didCapture);
      console.log("Valor shiny:", shinyRollValue);
      console.log("Veio shiny?", didShiny);
      console.log("Versão sorteada:", version);
      console.log("Já tinha essa versão?", alreadyOwned);
      console.log("Resultado da tentativa:", attemptResult);

      const nextScanCount = (existingEntry?.scan_count || 0) + 1;

      const nextIsCaptured = Boolean(
        existingEntry?.is_captured || version === "normal"
      );

      const nextIsShiny = Boolean(existingEntry?.is_shiny || version === "shiny");

      if (existingEntry) {
        const updatePayload = {
          scan_count: nextScanCount,
          is_captured: nextIsCaptured,
          is_shiny: nextIsShiny,
          evolution_stage: existingEntry.evolution_stage || 1,
        };

        console.log("Payload de update:", updatePayload);

        const { error: updateError } = await supabase
          .from("user_dog_entries")
          .update(updatePayload)
          .eq("id", existingEntry.id);

        console.log("Erro ao atualizar entrada:", updateError);

        if (updateError) {
          throw updateError;
        }
      } else {
        const insertPayload = {
          user_id: user.id,
          dog_id: dog.id,
          is_captured: nextIsCaptured,
          is_shiny: nextIsShiny,
          scan_count: 1,
          evolution_stage: 1,
          first_seen_at: new Date().toISOString(),
        };

        const generatedId = createEntryId();

        if (generatedId) {
          insertPayload.id = generatedId;
        }

        console.log("Payload de insert:", insertPayload);

        const { error: insertError } = await supabase
          .from("user_dog_entries")
          .insert(insertPayload);

        console.log("Erro ao inserir entrada:", insertError);

        if (insertError) {
          throw insertError;
        }
      }

      await saveCaptureAttempt({
        userId: user.id,
        dogId: dog.id,
        captureChance,
        rollValue,
        shinyRollValue,
        result: attemptResult,
        becameShiny: didShiny,
      });

      setDogResult({
        dog,
        captureChance,
        shinyChance: SHINY_CHANCE,
        didCapture,
        isShiny: didShiny,
        version,
        alreadyOwned,
        result: attemptResult,
      });

      if (!didCapture) {
        setScanStatus("escaped");
        setMessage(`${dog.name} apareceu, mas conseguiu fugir.`);
        return;
      }

      if (alreadyOwned) {
        setScanStatus("already");

        setMessage(
          version === "shiny"
            ? `${dog.name} shiny apareceu de novo. Você já tinha essa versão.`
            : `${dog.name} normal apareceu de novo. Você já tinha essa versão.`
        );

        return;
      }

      setScanStatus("captured");

      setMessage(
        version === "shiny"
          ? `${dog.name} shiny apareceu e foi capturado!`
          : `${dog.name} apareceu e foi capturado!`
      );
    } catch (error) {
      console.error("Erro ao processar QR Code:", error);

      setScanStatus("error");
      setMessage(
        `O QR Code foi lido, mas deu erro no Supabase: ${
          error?.message || "erro desconhecido"
        }`
      );
    } finally {
      stopCamera();
    }
  }

  function handleResetScanner() {
    stopCamera();

    hasProcessedRef.current = false;
    setDogResult(null);
    setScanStatus("idle");
    setMessage(INITIAL_MESSAGE);
  }

  const resultDog = dogResult?.dog;
  const resultImage = getDogImage(resultDog, dogResult?.version);

  const canStartScanner =
    isAuthenticated &&
    !biscuitsLoading &&
    biscuits.remaining > 0 &&
    scanStatus !== "spending" &&
    scanStatus !== "scanning" &&
    scanStatus !== "checking";

  const isScannerBusy =
    scanStatus === "spending" ||
    scanStatus === "scanning" ||
    scanStatus === "checking";

  const biscuitPercent =
    biscuits.dailyAllowance > 0
      ? Math.max(
          0,
          Math.min(100, (biscuits.remaining / biscuits.dailyAllowance) * 100)
        )
      : 0;

  return (
    <div className="scanner-page">
      <DashboardNavbar />

      <main className="scanner-content">
        <section className="scanner-header">
          <button
            type="button"
            className="scanner-back-button"
            onClick={() => navigate("/app")}
          >
            <FiArrowLeft />
            <span>Voltar</span>
          </button>

          <span className="scanner-kicker">Scanner</span>

          <h1>Escanear QR Code</h1>

          <p>
            Use 1 biscoito por tentativa. Escaneie o QR Code e descubra o
            resultado da captura.
          </p>
        </section>

        <section className={`scanner-card scanner-${scanStatus}`}>
          <div className="scanner-left-column">
            <div className="scanner-camera-frame">
              <video
                ref={videoRef}
                className="scanner-video"
                muted
                playsInline
                autoPlay
              />

              <div className="scanner-corners">
                <span />
                <span />
                <span />
                <span />
              </div>

              {cameraStatus === "locked" && !isScannerBusy && (
                <div className="scanner-overlay">
                  <FiCamera />
                  <strong>Scanner bloqueado</strong>
                  <small>Toque em escanear para liberar a câmera.</small>
                </div>
              )}

              {cameraStatus === "loading" && (
                <div className="scanner-overlay">
                  <FiCamera />
                  <strong>Abrindo câmera...</strong>
                  <small>Preparando leitura do QR Code.</small>
                </div>
              )}

              {scanStatus === "checking" && (
                <div className="scanner-overlay">
                  <FiCamera />
                  <strong>Verificando QR Code...</strong>
                  <small>Buscando cachorro na DogDex.</small>
                </div>
              )}
            </div>
          </div>

          <div className="scanner-side-panel">
            <article className="scanner-biscuit-counter">
              <div className="scanner-biscuit-top">
                <div className="scanner-biscuit-icon-box">
                  <PixelBiscuitIcon className="scanner-biscuit-icon" />
                </div>

                <div className="scanner-biscuit-copy">
                  <span>Biscoitos</span>
                  <strong>
                    {biscuitsLoading
                      ? "..."
                      : `${biscuits.remaining}/${biscuits.dailyAllowance}`}
                  </strong>
                </div>
              </div>

              <div className="scanner-biscuit-bar">
                <span style={{ width: `${biscuitPercent}%` }} />
              </div>
            </article>

            <article className="scanner-status-card">
              <div className="scanner-status-icon-box">
                {scanStatus === "captured" || scanStatus === "already" ? (
                  <FiCheckCircle className="scanner-status-icon success" />
                ) : scanStatus === "escaped" || scanStatus === "error" ? (
                  <FiXCircle className="scanner-status-icon error" />
                ) : (
                  <FiCamera className="scanner-status-icon" />
                )}
              </div>

              <div className="scanner-status-copy">
                <span className="scanner-status-label">Status</span>
                <strong>{getResultTitle(scanStatus)}</strong>
                <p>{message}</p>
              </div>
            </article>

            {dogResult && (
              <div className={`scanner-result-card ${scanStatus}`}>
                <div className="scanner-result-card-inner">
                  <span className="scanner-result-number">
                    {getDexNumber(resultDog.dex_number)}
                  </span>

                  <div className="scanner-result-image">
                    {resultImage ? (
                      <img src={resultImage} alt={resultDog.name} />
                    ) : (
                      <div className="scanner-result-placeholder" />
                    )}
                  </div>

                  <h2>{resultDog.name}</h2>

                  <span className="scanner-result-badge">
                    {getResultBadge(dogResult)}
                  </span>
                </div>
              </div>
            )}

            <div className="scanner-actions">
              {!isScannerBusy && (
                <button
                  type="button"
                  className="scanner-action-primary"
                  onClick={handleStartScanner}
                  disabled={!canStartScanner}
                >
                  <PixelBiscuitIcon className="scanner-button-biscuit-icon" />
                  Escanear com 1 biscoito
                </button>
              )}

              {(scanStatus === "captured" || scanStatus === "already") && (
                <button
                  type="button"
                  className="scanner-action-secondary"
                  onClick={() => navigate("/app/dogdex")}
                >
                  Ver DogDex
                </button>
              )}

              {(scanStatus === "captured" ||
                scanStatus === "escaped" ||
                scanStatus === "already" ||
                scanStatus === "error") && (
                <button
                  type="button"
                  className="scanner-action-outline"
                  onClick={handleResetScanner}
                >
                  <FiRefreshCcw />
                  Limpar resultado
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}