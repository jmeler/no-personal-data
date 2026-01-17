/* global XLSX */

const fileInput = document.getElementById("fileInput");
const fileInfo = document.getElementById("fileInfo");

const sheetRow = document.getElementById("sheetRow");
const sheetSelect = document.getElementById("sheetSelect");

const idColumnInput = document.getElementById("idColumn");

const columnsCard = document.getElementById("columnsCard");
const columnsList = document.getElementById("columnsList");

const previewCard = document.getElementById("previewCard");
const previewDiv = document.getElementById("preview");

const generateCard = document.getElementById("generateCard");
const generateBtn = document.getElementById("generateBtn");

const downloads = document.getElementById("downloads");
const dlPrivate = document.getElementById("dlPrivate");
const dlPublic = document.getElementById("dlPublic");
const statusDiv = document.getElementById("status");

const resultPreviewCard = document.getElementById("resultPreviewCard");
const previewPrivateDiv = document.getElementById("previewPrivate");
const previewPublicDiv = document.getElementById("previewPublic");

let inputBaseName = "anonimitzat"; // se actualiza al cargar archivo
let inputExt = "xlsx";             // por defecto

let workbook = null;
let activeSheetName = null;
let tableRows = []; // array of objects [{col: val, ...}, ...]


function setStatus(msg, isError = false) {
  statusDiv.textContent = msg;
  statusDiv.style.color = isError ? "#ff6b6b" : "#a8b0bf";
}

function resetUI() {
  workbook = null;
  activeSheetName = null;
  tableRows = [];
  sheetSelect.innerHTML = "";
  columnsList.innerHTML = "";
  previewDiv.innerHTML = "";
  columnsCard.classList.add("hidden");
  previewCard.classList.add("hidden");
  generateCard.classList.add("hidden");
  sheetRow.classList.add("hidden");
  downloads.classList.add("hidden");
  setStatus("");
  resultPreviewCard.classList.add("hidden");
  previewPrivateDiv.innerHTML = "";
  previewPublicDiv.innerHTML = "";
}

function renderPreview(rows, max = 20) {
  if (!rows.length) {
    previewDiv.innerHTML = "<p class='muted'>Sense files per mostrar.</p>";
    return;
  }
  const cols = Object.keys(rows[0]);
  const head = cols.map(c => `<th>${escapeHtml(c)}</th>`).join("");
  const body = rows.slice(0, max).map(r => {
    const tds = cols.map(c => `<td>${escapeHtml(String(r[c] ?? ""))}</td>`).join("");
    return `<tr>${tds}</tr>`;
  }).join("");

  previewDiv.innerHTML = `
    <table>
      <thead><tr>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>
    <p class="muted">Mostrant ${Math.min(max, rows.length)} de ${rows.length} files.</p>
  `;
}

function renderPreviewInto(targetDiv, rows, max = 3) {
    if (!rows.length) {
      targetDiv.innerHTML = "<p class='muted'>Sense files per mostrar.</p>";
      return;
    }
    const cols = Object.keys(rows[0]);
    const head = cols.map(c => `<th>${escapeHtml(c)}</th>`).join("");
    const body = rows.slice(0, max).map(r => {
      const tds = cols.map(c => `<td>${escapeHtml(String(r[c] ?? ""))}</td>`).join("");
      return `<tr>${tds}</tr>`;
    }).join("");
  
    targetDiv.innerHTML = `
      <table>
        <thead><tr>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>
      <p class="muted">Mostrant ${Math.min(max, rows.length)} de ${rows.length} files.</p>
    `;
  }
  

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;"
  }[m]));
}

function normalizeCsvText(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function countDelimiter(line, delimiter) {
  let count = 0;
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "\"") {
      if (inQuotes && line[i + 1] === "\"") {
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (!inQuotes && ch === delimiter) {
      count += 1;
    }
  }
  return count;
}

function detectCsvDelimiter(text) {
  const lines = normalizeCsvText(text).split("\n").filter(l => l.trim().length);
  const sample = lines[0] || "";
  const candidates = [",", ";", "\t", "|"];
  let best = { delimiter: ",", count: -1 };
  for (const d of candidates) {
    const count = countDelimiter(sample, d);
    if (count > best.count) best = { delimiter: d, count };
  }
  return best.delimiter;
}

function csvToWorkbookWithFallback(text) {
  const normalized = normalizeCsvText(text);
  const detected = detectCsvDelimiter(normalized);
  const candidates = [detected, ",", ";", "\t", "|"].filter((d, i, a) => a.indexOf(d) === i);
  for (const d of candidates) {
    const wb = XLSX.read(normalized, { type: "string", FS: d });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (rows.length && rows[0].length > 1) return { wb, delimiter: d };
  }
  const ws = XLSX.utils.csv_to_sheet(normalized, { FS: detected });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "data");
  return { wb, delimiter: detected };
}

function loadSheet(sheetName) {
  activeSheetName = sheetName;
  const ws = workbook.Sheets[sheetName];

  // sheet_to_json: defval per conservar columnes amb buits
  tableRows = XLSX.utils.sheet_to_json(ws, { defval: "" });

  if (!tableRows.length) {
    columnsCard.classList.add("hidden");
    previewCard.classList.add("hidden");
    generateCard.classList.add("hidden");
    setStatus("Aquest full no té dades.", true);
    return;
  }

  const cols = Object.keys(tableRows[0]);
  renderColumns(cols);
  renderPreview(tableRows,3);

  columnsCard.classList.remove("hidden");
  previewCard.classList.remove("hidden");
  generateCard.classList.remove("hidden");
  setStatus("");
}

function renderColumns(cols) {
  columnsList.innerHTML = "";
  cols.forEach((c) => {
    const id = `col_${c}`;
    const wrapper = document.createElement("label");
    wrapper.innerHTML = `
      <input type="checkbox" value="${escapeHtml(c)}" />
      <span>${escapeHtml(c)}</span>
    `;
    columnsList.appendChild(wrapper);
  });
}

function getSelectedColumns() {
  return Array.from(columnsList.querySelectorAll("input[type=checkbox]:checked"))
    .map(i => i.value);
}

function toWorksheetFromObjects(rows) {
  return XLSX.utils.json_to_sheet(rows);
}

function workbookToBlobUrl(wb) {
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  return URL.createObjectURL(blob);
}

function generate() {
  const selected = getSelectedColumns();
  const idCol = (idColumnInput.value || "id").trim() || "id";

  if (!tableRows.length) {
    setStatus("No hi ha dades carregades.", true);
    return;
  }
  if (selected.length === 0) {
    setStatus("Selecciona com a mínim una columna a anonimitzar.", true);
    return;
  }

  const originalCols = Object.keys(tableRows[0]);
  const missing = selected.filter(c => !originalCols.includes(c));
  if (missing.length) {
    setStatus(`Columnes no trobades: ${missing.join(", ")}`, true);
    return;
  }

  // Genera ID per fila i construeix privat/public
  const privateRows = [];
  const publicRows = [];

  let counter = 1;

  for (const row of tableRows) {
    const id = counter++;

    const priv = { [idCol]: id };
    const pub = { [idCol]: id };

    for (const c of originalCols) {
      if (selected.includes(c)) priv[c] = row[c];
      else pub[c] = row[c];
    }

    privateRows.push(priv);
    publicRows.push(pub);
  }


  // Previsualización resultados (3 filas)
  renderPreviewInto(previewPrivateDiv, privateRows, 3);
  renderPreviewInto(previewPublicDiv, publicRows, 3);
  resultPreviewCard.classList.remove("hidden");


  // Crea dos XLSX separats
  const wbPriv = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wbPriv, toWorksheetFromObjects(privateRows), "private");

  const wbPub = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wbPub, toWorksheetFromObjects(publicRows), "public");

  // Assigna URLs de descàrrega
  const urlPriv = workbookToBlobUrl(wbPriv);
  const urlPub = workbookToBlobUrl(wbPub);

  dlPrivate.href = urlPriv;
  dlPublic.href = urlPub;
  dlPrivate.download = `${inputBaseName}_private.xlsx`;
  dlPublic.download  = `${inputBaseName}_public.xlsx`;

  downloads.classList.remove("hidden");
  setStatus("Fitxers generats. Pots descarregar-los ara.");
}

fileInput.addEventListener("change", async (e) => {
  resetUI();

  const file = e.target.files?.[0];
  if (!file) return;

  // Base name y extensión para nombrar outputs
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".csv")) inputExt = "csv";
  else if (lower.endsWith(".ods")) inputExt = "ods";
  else inputExt = "xlsx";

  // Base name sin extensión (manejo simple)
  inputBaseName = file.name.replace(/\.[^/.]+$/, "");

  fileInfo.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;

  const ext = file.name.toLowerCase();
  const buf = await file.arrayBuffer();

  try {
    if (ext.endsWith(".csv")) {
      const text = new TextDecoder("utf-8").decode(new Uint8Array(buf));
      const { wb } = csvToWorkbookWithFallback(text);
      workbook = wb;
    } else if (ext.endsWith(".xlsx") || ext.endsWith(".xls") || ext.endsWith(".ods")) {
      workbook = XLSX.read(buf, { type: "array" });
    } else {
      setStatus("Format no suportat. Puja CSV, XLSX o ODS.", true);
      return;
    }    

    const names = workbook.SheetNames;
    if (names.length > 1) {
      sheetRow.classList.remove("hidden");
      sheetSelect.innerHTML = names.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join("");
      sheetSelect.onchange = () => loadSheet(sheetSelect.value);
      loadSheet(names[0]);
    } else {
      sheetRow.classList.add("hidden");
      loadSheet(names[0]);
    }
  } catch (err) {
    setStatus(`Error llegint fitxer: ${err}`, true);
  }
});

generateBtn.addEventListener("click", generate);
