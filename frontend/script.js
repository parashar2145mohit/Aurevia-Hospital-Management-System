const API = {
  patients: "http://127.0.0.1:8000/api/queue/patients/",
  tokens: "http://127.0.0.1:8000/api/queue/tokens/",
  nextToken: "http://127.0.0.1:8000/api/queue/tokens/next/",
  wards: "http://127.0.0.1:8000/api/bed/wards/",
  beds: "http://127.0.0.1:8000/api/bed/beds/",
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const toast = $("#toast");
const callNextBtn = $("#callNextBtn");
const skipTokenBtn = $("#skipTokenBtn");
const doneTokenBtn = $("#doneTokenBtn");
const nextBox = $("#nextBox");

let currentTokenId = null;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function updateClock() {
  const clock = $("#clock");
  if (clock) clock.textContent = new Date().toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

$$(".nav").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$(".nav").forEach((b) => b.classList.remove("active"));
    $$(".tab").forEach((t) => t.classList.remove("active"));
    btn.classList.add("active");

    const tab = document.getElementById(btn.dataset.tab);
    if (tab) tab.classList.add("active");
  });
});

async function requestJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    throw new Error(typeof data === "string" ? data : JSON.stringify(data));
  }

  return data;
}

function normalizeList(data) {
  return Array.isArray(data) ? data : data?.results || [];
}

function renderPatients(list) {
  const tbody = $("#patientsTable");
  if (!tbody) return;

  tbody.innerHTML = list
    .map(
      (p) => `
      <tr>
        <td>${p.id ?? "-"}</td>
        <td>${p.name ?? "-"}</td>
        <td>${p.age ?? "-"}</td>
        <td>${p.type ?? "-"}</td>
        <td>${p.created_at ? new Date(p.created_at).toLocaleString() : "-"}</td>
      </tr>
    `
    )
    .join("");

  const counter = $("#cPatients");
  if (counter) counter.textContent = list.length;
}

function renderTokens(list) {
  const tbody = $("#tokensTable");
  if (!tbody) return;

  tbody.innerHTML = list
    .map(
      (t) => `
      <tr>
        <td>${t.id ?? "-"}</td>
        <td>${t.patient_name ?? t.patient ?? "-"}</td>
        <td>${t.number ?? "-"}</td>
        <td>${t.status ?? "-"}</td>
        <td>${t.created_at ? new Date(t.created_at).toLocaleString() : "-"}</td>
      </tr>
    `
    )
    .join("");

  const counter = $("#cTokens");
  if (counter) counter.textContent = list.length;
}

function renderWards(list) {
  const tbody = $("#wardsTable");
  if (!tbody) return;

  tbody.innerHTML = list
    .map(
      (w) => `
      <tr>
        <td>${w.id ?? "-"}</td>
        <td>${w.name ?? "-"}</td>
        <td>${w.ward_type ?? "-"}</td>
      </tr>
    `
    )
    .join("");

  const counter = $("#cWards");
  if (counter) counter.textContent = list.length;
}

function renderBeds(list) {
  const tbody = $("#bedsTable");
  if (!tbody) return;

  tbody.innerHTML = list
    .map(
      (b) => `
      <tr>
        <td>${b.id ?? "-"}</td>
        <td>${b.ward_name ?? b.ward ?? "-"}</td>
        <td>${b.number ?? "-"}</td>
        <td>${b.status ?? "-"}</td>
        <td>${b.patient ?? "-"}</td>
      </tr>
    `
    )
    .join("");

  const counter = $("#cBeds");
  if (counter) counter.textContent = list.length;
}

function showNextPatient(token) {
  if (!nextBox) return;

  nextBox.innerHTML = `
    <p><strong>Token No:</strong> ${token.number ?? "-"}</p>
    <p><strong>Patient Name:</strong> ${token.patient_name ?? "-"}</p>
    <p><strong>Age:</strong> ${token.patient_age ?? "-"}</p>
    <p><strong>Type:</strong> ${token.patient_type ?? "-"}</p>
    <p><strong>Status:</strong> ${token.status ?? "-"}</p>
  `;
}

async function loadAll() {
  try {
    const [patientsRes, tokensRes, wardsRes, bedsRes] = await Promise.all([
      requestJSON(API.patients),
      requestJSON(API.tokens),
      requestJSON(API.wards),
      requestJSON(API.beds),
    ]);

    renderPatients(normalizeList(patientsRes));
    renderTokens(normalizeList(tokensRes));
    renderWards(normalizeList(wardsRes));
    renderBeds(normalizeList(bedsRes));

    showToast("Data loaded");
  } catch (err) {
    console.error("LOAD ERROR:", err);
    showToast("Backend connect nahi ho raha");
  }
}

const loadPatientsBtn = $("#loadPatients");
if (loadPatientsBtn) loadPatientsBtn.addEventListener("click", loadAll);

const loadTokensBtn = $("#loadTokens");
if (loadTokensBtn) loadTokensBtn.addEventListener("click", loadAll);

const loadWardsBtn = $("#loadWards");
if (loadWardsBtn) loadWardsBtn.addEventListener("click", loadAll);

const loadBedsBtn = $("#loadBeds");
if (loadBedsBtn) loadBedsBtn.addEventListener("click", loadAll);

const patientForm = $("#patientForm");
if (patientForm) {
  patientForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData(patientForm);

    const payload = {
      name: form.get("name"),
      age: Number(form.get("age")),
      type: form.get("type"),
    };

    try {
      await requestJSON(API.patients, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      patientForm.reset();
      showToast("Patient added");
      loadAll();
    } catch (err) {
      console.error("PATIENT ERROR:", err);
      showToast("Patient add failed");
    }
  });
}

const tokenForm = $("#tokenForm");
if (tokenForm) {
  tokenForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData(tokenForm);

    const payload = {
      patient: Number(form.get("patient")),
      number: Number(form.get("number")),
      status: form.get("status"),
    };

    try {
      await requestJSON(API.tokens, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      tokenForm.reset();
      showToast("Token added");
      loadAll();
    } catch (err) {
      console.error("TOKEN ERROR:", err);
      showToast("Token add failed");
    }
  });
}

const wardForm = $("#wardForm");
if (wardForm) {
  wardForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData(wardForm);

    const payload = {
      name: form.get("name"),
      ward_type: form.get("ward_type"),
    };

    try {
      await requestJSON(API.wards, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      wardForm.reset();
      showToast("Ward added");
      loadAll();
    } catch (err) {
      console.error("WARD ERROR:", err);
      showToast("Ward add failed");
    }
  });
}

const wardForm2 = $("#wardForm2");
if (wardForm2) {
  wardForm2.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData(wardForm2);

    const payload = {
      name: form.get("name"),
      ward_type: form.get("ward_type"),
    };

    try {
      await requestJSON(API.wards, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      wardForm2.reset();
      showToast("Ward added");
      loadAll();
    } catch (err) {
      console.error("WARD2 ERROR:", err);
      showToast("Ward add failed");
    }
  });
}

const bedForm = $("#bedForm");
if (bedForm) {
  bedForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData(bedForm);

    const payload = {
      ward: Number(form.get("ward")),
      number: form.get("number"),
      status: form.get("status"),
    };

    try {
      await requestJSON(API.beds, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      bedForm.reset();
      showToast("Bed added");
      loadAll();
    } catch (err) {
      console.error("BED ERROR:", err);
      showToast("Bed add failed");
    }
  });
}

if (callNextBtn) {
  callNextBtn.addEventListener("click", async () => {
    try {
      const data = await requestJSON(API.nextToken, {
        method: "POST",
        body: JSON.stringify({}),
      });

      const token = data.token;
      currentTokenId = token.id;
      showNextPatient(token);
      showToast("Next patient called");
      loadAll();
    } catch (err) {
      console.error("NEXT TOKEN ERROR:", err);
      currentTokenId = null;
      if (nextBox) nextBox.innerHTML = `<p>No waiting patient found</p>`;
      showToast("No waiting patient");
    }
  });
}

if (skipTokenBtn) {
  skipTokenBtn.addEventListener("click", async () => {
    if (!currentTokenId) {
      showToast("No active token");
      return;
    }

    try {
      await requestJSON(`${API.tokens}${currentTokenId}/skip/`, {
        method: "POST",
        body: JSON.stringify({}),
      });

      currentTokenId = null;
      if (nextBox) nextBox.innerHTML = `<p>Token skipped</p>`;
      showToast("Token skipped");
      loadAll();
    } catch (err) {
      console.error("SKIP ERROR:", err);
      showToast("Skip failed");
    }
  });
}

function updateAnalogClock() {
  const now = new Date();

  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  const secondHand = document.getElementById("second");
  const minuteHand = document.getElementById("minute");
  const hourHand = document.getElementById("hour");

  if (secondHand) {
    secondHand.style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;
  }
  if (minuteHand) {
    minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
  }
  if (hourHand) {
    hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
  }

  const clockDay = document.getElementById("clockDay");
  const clockDate = document.getElementById("clockDate");

  if (clockDay) {
    clockDay.textContent = now.toLocaleDateString([], { weekday: "long" });
  }
  if (clockDate) {
    clockDate.textContent = now.toLocaleDateString([], {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
}

setInterval(updateAnalogClock, 1000);
updateAnalogClock();

loadAll();