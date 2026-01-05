// 1) HIER deine Apps Script Web-App URL eintragen:
const ENDPOINT = "https://script.google.com/macros/s/AKfycby8P1bOKW5qwWlmecGUdT8ILNZ9mrBKmwMRCUvRMbBhslF4O6D-sV11FwGHFv8rWVPZ/exec";
const pinGate = document.getElementById("pinGate");
const formCard = document.getElementById("formCard");
const pinInput = document.getElementById("pin");
const pinMsg = document.getElementById("pinMsg");
const unlockBtn = document.getElementById("unlock");

const form = document.getElementById("dataForm");
const formMsg = document.getElementById("formMsg");
const clearBtn = document.getElementById("clear");
const lockBtn = document.getElementById("lock");

let sessionPin = null;

function lock() {
  sessionPin = null;
  formMsg.textContent = "";
  pinMsg.textContent = "";
  pinInput.value = "";
  form.reset();
  formCard.classList.add("hidden");
  pinGate.classList.remove("hidden");
}

async function validatePin(pin) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" }, // kein Preflight
    body: JSON.stringify({ pin, action: "validate" })
  });

  const json = await res.json().catch(() => ({}));
  return json && json.ok === true;
}

// PIN prüfen beim OK-Klick (serverseitig)
unlockBtn.addEventListener("click", async () => {
  const pin = (pinInput.value || "").trim();

  if (!/^\d{3}$/.test(pin)) {
    pinMsg.textContent = "Bitte genau 3 Ziffern eingeben.";
    return;
  }

  pinMsg.textContent = "Prüfe PIN...";
  unlockBtn.disabled = true;

  try {
    const ok = await validatePin(pin);
    if (!ok) {
      pinMsg.textContent = "❌ PIN falsch";
      unlockBtn.disabled = false;
      return;
    }

    // ✅ erst jetzt freischalten
    sessionPin = pin;
    pinMsg.textContent = "";
    pinGate.classList.add("hidden");
    formCard.classList.remove("hidden");
  } catch (e) {
    pinMsg.textContent = "❌ Server nicht erreichbar (Endpoint/CORS).";
  } finally {
    unlockBtn.disabled = false;
  }
});

// Enter auf PIN-Feld = OK
pinInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") unlockBtn.click();
});

clearBtn.addEventListener("click", () => {
  form.reset();
  formMsg.textContent = "";
});

lockBtn.addEventListener("click", lock);

// Speichern
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMsg.textContent = "Speichere...";

  if (!sessionPin) {
    formMsg.textContent = "PIN fehlt. Bitte neu entsperren.";
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());
  const payload = { pin: sessionPin, ...data };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));

    if (!json.ok) {
      formMsg.textContent = json.error ? `Fehler: ${json.error}` : "Fehler beim Speichern.";
      return;
    }

    formMsg.textContent = "✅ Gespeichert!";
    form.reset();
  } catch (err) {
    formMsg.textContent = "Netzwerkfehler / Endpoint falsch / CORS Problem.";
  }
});
