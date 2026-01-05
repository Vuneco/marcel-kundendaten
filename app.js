// 1) HIER deine Apps Script Web-App URL eintragen:
const ENDPOINT = "https://script.google.com/macros/s/AKfycbw0svKBib4KB593dkQvzgDQhNGOnoDM7ZU3kuabXOMaMnRh0T0XWhNvfQnZg9MLrHj8/exec";


const pinGate = document.getElementById("pinGate");
const formCard = document.getElementById("formCard");
const pinInput = document.getElementById("pin");
const pinMsg = document.getElementById("pinMsg");
const unlockBtn = document.getElementById("unlock");

const form = document.getElementById("dataForm");
const formMsg = document.getElementById("formMsg");
const clearBtn = document.getElementById("clear");

let sessionPin = null;

// Optional: PIN nur für die Session merken
unlockBtn.addEventListener("click", () => {
  const pin = (pinInput.value || "").trim();
  if (!/^\d{3}$/.test(pin)) {
    pinMsg.textContent = "Bitte genau 3 Ziffern eingeben.";
    return;
  }
  sessionPin = pin;
  pinMsg.textContent = "";
  pinGate.classList.add("hidden");
  formCard.classList.remove("hidden");
});

clearBtn.addEventListener("click", () => {
  form.reset();
  formMsg.textContent = "";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMsg.textContent = "Speichere...";

  if (!sessionPin) {
    formMsg.textContent = "PIN fehlt. Bitte Seite neu laden.";
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());
  const payload = { pin: sessionPin, ...data };

  try {
    const res = await fetch(ENDPOINT, {
  method: "POST",
  // WICHTIG: Kein application/json, sonst Preflight
  headers: { "Content-Type": "text/plain;charset=utf-8" },
  body: JSON.stringify(payload),
});

    const json = await res.json().catch(() => ({}));

    if (!res.ok || !json.ok) {
      formMsg.textContent = json.error ? `Fehler: ${json.error}` : "Fehler beim Speichern.";
      return;
    }

    formMsg.textContent = "✅ Gespeichert!";
    form.reset();

  } catch (err) {
    formMsg.textContent = "Netzwerkfehler / Endpoint falsch / CORS Problem.";
  }
});
