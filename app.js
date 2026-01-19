/* global XLSX, pdfjsLib */

const fileInput = document.getElementById("fileInput");
const fileInfo = document.getElementById("fileInfo");
const msgInfo = document.getElementById("msg_info");
const dropZone = document.getElementById("dropZone");
const langSelect = document.getElementById("langSelect");

const sheetRow = document.getElementById("sheetRow");
const sheetSelect = document.getElementById("sheetSelect");


const columnsCard = document.getElementById("columnsCard");
const columnsList = document.getElementById("columnsList");

const previewCard = document.getElementById("previewCard");
const previewDiv = document.getElementById("preview");

const generateCard = document.getElementById("generateCard");
const generateBtn = document.getElementById("generateBtn");

const downloadSlots = document.querySelectorAll(".download-slot");
const downloadsPrivate = document.getElementById("downloadsPrivate");
const downloadsPublic = document.getElementById("downloadsPublic");
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

let lastPrivateRows = null;
let lastPublicRows = null;

const translations = {
  ca: {
    title: "Pseudoanonimitzador de dades personals",
    subtitle: "Processament local al navegador web. No s’envien dades a cap servidor.",
    validation: "Validat per l'Àrea de Tecnologies educatives i Digitalització responsable del Departament d'Educació i Formació professional de Catalunya.",
    languageLabel: "Idioma",
    step1: "Carrega full de càlcul amb totes les dades",
    uploadTitle: "Arrossega el teu arxiu aquí",
    uploadHint: "o fes clic per seleccionar",
    uploadFormats: "Formats: CSV, XLSX, XLS, ODS, PDF",
    csvHint: "CSV: separador ',' o ';' i decimals amb punt (.).",
    sheetLabel: "Full (sheet):",
    step2: "Previsualizació del document original",
    step3: "Selecciona camps a pseudoanonimitzar",
    step4: "Genera i descarrega",
    step5: "Previsualizació del resultat i descàrrega",
    privateTitle: "Full privat",
    privateHint: "Conté dades personals. No compartir amb repositoris en línia o IA.",
    publicTitle: "Full públic",
    publicHint: "Podeu fer-lo servir públicament.",
    download: "Descarrega",
    generate: "Generar fitxers",
    previewEmpty: "Sense files per mostrar.",
    previewCount: "Mostrant {count} de {total} files.",
    statusSheetEmpty: "Aquest full no té dades.",
    statusNoData: "No hi ha dades carregades.",
    statusSelectColumn: "Selecciona com a mínim una columna a pseudoanonimitzar.",
    statusMissingColumns: "Columnes no trobades: {cols}",
    statusGenerated: "Fitxers generats. Pots descarregar-los ara.",
    statusUnsupported: "Format no suportat. Puja CSV, XLSX, XLS, ODS o PDF.",
    statusReadError: "Error llegint fitxer: {err}"
  },
  es: {
    title: "Pseudoanonimizador de datos personales",
    subtitle: "Procesamiento local en el navegador. No se envían datos a ningún servidor.",
    validation: "Validado por el Área de Tecnologías educativas y Digitalización responsable del Departamento de Educación y Formación profesional de Cataluña.",
    languageLabel: "Idioma",
    step1: "Carga la hoja con todos los datos",
    uploadTitle: "Arrastra tu archivo aquí",
    uploadHint: "o haz clic para seleccionar",
    uploadFormats: "Formatos: CSV, XLSX, XLS, ODS, PDF",
    csvHint: "CSV: separador ',' o ';' y decimales con punto (.).",
    sheetLabel: "Hoja (sheet):",
    step2: "Vista previa del documento original",
    step3: "Selecciona campos a pseudoanonimizar",
    step4: "Genera y descarga",
    step5: "Vista previa del resultado y descarga",
    privateTitle: "Hoja privada",
    privateHint: "Contiene datos personales. No compartir con repositorios en línea o IA.",
    publicTitle: "Hoja pública",
    publicHint: "Puede usarse públicamente.",
    download: "Descargar",
    generate: "Generar archivos",
    previewEmpty: "No hay filas para mostrar.",
    previewCount: "Mostrando {count} de {total} filas.",
    statusSheetEmpty: "Esta hoja no tiene datos.",
    statusNoData: "No hay datos cargados.",
    statusSelectColumn: "Selecciona al menos una columna para pseudoanonimizar.",
    statusMissingColumns: "Columnas no encontradas: {cols}",
    statusGenerated: "Archivos generados. Ya puedes descargarlos.",
    statusUnsupported: "Formato no soportado. Sube CSV, XLSX, XLS, ODS o PDF.",
    statusReadError: "Error leyendo archivo: {err}"
  },
  en: {
    title: "Personal Data Pseudonymizer",
    subtitle: "Processed locally in the browser. No data is sent to any server.",
    validation: "Validated by the Educational Technologies and Responsible Digitalization area of the Department of Education and Vocational Training of Catalonia.",
    languageLabel: "Language",
    step1: "Upload the spreadsheet with all data",
    uploadTitle: "Drag your file here",
    uploadHint: "or click to select",
    uploadFormats: "Formats: CSV, XLSX, XLS, ODS, PDF",
    csvHint: "CSV: separator ',' or ';' and decimals with dot (.).",
    sheetLabel: "Sheet:",
    step2: "Preview of the original document",
    step3: "Select fields to pseudonymize",
    step4: "Generate and download",
    step5: "Preview of the result and download",
    privateTitle: "Private sheet",
    privateHint: "Contains personal data. Do not share with online repositories or AI.",
    publicTitle: "Public sheet",
    publicHint: "Safe to use publicly.",
    download: "Download",
    generate: "Generate files",
    previewEmpty: "No rows to show.",
    previewCount: "Showing {count} of {total} rows.",
    statusSheetEmpty: "This sheet has no data.",
    statusNoData: "No data loaded.",
    statusSelectColumn: "Select at least one column to pseudonymize.",
    statusMissingColumns: "Columns not found: {cols}",
    statusGenerated: "Files generated. You can download them now.",
    statusUnsupported: "Unsupported format. Upload CSV, XLSX, XLS, ODS, or PDF.",
    statusReadError: "Error reading file: {err}"
  }
};

let currentLang = "ca";
let lastStatus = null;
const LANG_COOKIE = "npd_lang";

function setCookie(name, value, days) {
  const maxAge = days ? `; max-age=${days * 24 * 60 * 60}` : "";
  document.cookie = `${name}=${encodeURIComponent(value)}${maxAge}; path=/; samesite=lax`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function t(key, params = {}) {
  const dict = translations[currentLang] || translations.ca;
  let text = dict[key] || "";
  Object.entries(params).forEach(([param, value]) => {
    text = text.replace(new RegExp(`\\{${param}\\}`, "g"), value);
  });
  return text;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    node.textContent = t(key);
  });
}

function updateCsvHint() {
  msgInfo.textContent = inputExt === "csv" ? t("csvHint") : "";
}

if (typeof pdfjsLib !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}


function setStatus(msg, isError = false) {
  statusDiv.textContent = msg;
  statusDiv.style.color = isError ? "#ff6b6b" : "#a8b0bf";
}

function setStatusKey(key, params = {}, isError = false) {
  const msg = t(key, params);
  setStatus(msg, isError);
  lastStatus = { key, params, isError };
}

function clearStatus() {
  setStatus("");
  lastStatus = null;
}

function resetUI() {
  workbook = null;
  activeSheetName = null;
  tableRows = [];
  lastPrivateRows = null;
  lastPublicRows = null;
  updateCsvHint();
  sheetSelect.innerHTML = "";
  columnsList.innerHTML = "";
  previewDiv.innerHTML = "";
  columnsCard.classList.add("hidden");
  previewCard.classList.add("hidden");
  generateCard.classList.add("hidden");
  sheetRow.classList.add("hidden");
  downloadSlots.forEach((slot) => slot.classList.add("hidden"));
  clearStatus();
  resultPreviewCard.classList.add("hidden");
  previewPrivateDiv.innerHTML = "";
  previewPublicDiv.innerHTML = "";
}

function renderPreview(rows, max = 20) {
  if (!rows.length) {
    previewDiv.innerHTML = `<p class='muted'>${escapeHtml(t("previewEmpty"))}</p>`;
    return;
  }
  const cols = Object.keys(rows[0]);
  const head = cols.map(c => `<th>${escapeHtml(c)}</th>`).join("");
  const body = rows.slice(0, max).map(r => {
    const tds = cols.map(c => `<td>${escapeHtml(String(r[c] ?? ""))}</td>`).join("");
    return `<tr>${tds}</tr>`;
  }).join("");

  previewDiv.innerHTML = `
    <table class="table table-sm table-bordered">
      <thead><tr>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>
    <p class="muted">${escapeHtml(t("previewCount", { count: Math.min(max, rows.length), total: rows.length }))}</p>
  `;
}

function renderPreviewInto(targetDiv, rows, max = 3) {
    if (!rows.length) {
      targetDiv.innerHTML = `<p class='muted'>${escapeHtml(t("previewEmpty"))}</p>`;
      return;
    }
    const cols = Object.keys(rows[0]);
    const head = cols.map(c => `<th>${escapeHtml(c)}</th>`).join("");
    const body = rows.slice(0, max).map(r => {
      const tds = cols.map(c => `<td>${escapeHtml(String(r[c] ?? ""))}</td>`).join("");
      return `<tr>${tds}</tr>`;
    }).join("");
  
    targetDiv.innerHTML = `
      <table class="table table-sm table-bordered">
        <thead><tr>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>
      <p class="muted">${escapeHtml(t("previewCount", { count: Math.min(max, rows.length), total: rows.length }))}</p>
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
  const candidates = [",", ";"];
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
  const candidates = [detected, ",", ";"].filter((d, i, a) => a.indexOf(d) === i);
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

function computeLineTolerance(sorted) {
  const unique = [];
  for (const item of sorted) {
    const last = unique[unique.length - 1];
    if (!last || Math.abs(item.y - last) > 0.2) unique.push(item.y);
  }
  if (unique.length < 2) return 3;
  const diffs = [];
  for (let i = 1; i < unique.length; i++) diffs.push(Math.abs(unique[i - 1] - unique[i]));
  diffs.sort((a, b) => a - b);
  const median = diffs[Math.floor(diffs.length / 2)] || 3;
  return Math.max(2, Math.min(6, median * 0.6));
}

function groupPdfTextLines(items) {
  const cleaned = items
    .filter((item) => item.str && item.str.trim().length)
    .map((item) => ({
      text: item.str.trim(),
      x: item.transform[4],
      y: item.transform[5]
    }))
    .sort((a, b) => (b.y - a.y) || (a.x - b.x));

  const tolerance = computeLineTolerance(cleaned);
  const lines = [];

  for (const item of cleaned) {
    const last = lines[lines.length - 1];
    if (!last || Math.abs(item.y - last.y) > tolerance) {
      lines.push({ y: item.y, items: [item] });
    } else {
      last.items.push(item);
    }
  }

  return lines.map((line) => ({
    y: line.y,
    items: line.items.sort((a, b) => a.x - b.x)
  }));
}

function splitBySpacing(text) {
  return text
    .split(/\s{2,}|\t+/)
    .map((part) => part.trim())
    .filter((part) => part.length);
}

function normalizeLineItems(line) {
  if (line.items.length > 1) {
    return { cells: line.items.map((item) => ({ text: item.text, x: item.x })), fromSplit: false };
  }
  if (!line.items.length) return { cells: [], fromSplit: false };
  const parts = splitBySpacing(line.items[0].text);
  return { cells: parts.map((text, index) => ({ text, x: index })), fromSplit: true };
}

function findHeaderLine(lines) {
  const isHeaderCandidate = (cells) =>
    cells.length >= 2 && cells.some((c) => /[A-Za-zÀ-ÿ]/.test(c.text));

  for (let i = 0; i < lines.length; i++) {
    const normalized = normalizeLineItems(lines[i]);
    if (isHeaderCandidate(normalized.cells)) return { index: i, ...normalized };
  }

  let bestIndex = -1;
  let bestCells = [];
  let bestFromSplit = false;
  for (let i = 0; i < lines.length; i++) {
    const normalized = normalizeLineItems(lines[i]);
    if (normalized.cells.length > bestCells.length) {
      bestCells = normalized.cells;
      bestFromSplit = normalized.fromSplit;
      bestIndex = i;
    }
  }
  return bestCells.length >= 2 ? { index: bestIndex, cells: bestCells, fromSplit: bestFromSplit } : null;
}

function extractTableFromPdfLines(lines) {
  if (!lines.length) return null;
  const headerInfo = findHeaderLine(lines);
  if (!headerInfo) return null;

  const headers = headerInfo.cells.map((item) => item.text);
  const useIndexColumns = headerInfo.fromSplit;
  const headerX = headerInfo.cells.map((item) => item.x);
  const data = [];

  for (let i = headerInfo.index + 1; i < lines.length; i++) {
    const line = lines[i];
    const row = Array.from({ length: headers.length }, () => "");
    const normalized = normalizeLineItems(line);
    const cells = normalized.cells;
    if (!cells.length) continue;

    if (useIndexColumns || normalized.fromSplit) {
      for (let c = 0; c < headers.length; c++) {
        row[c] = cells[c]?.text || "";
      }
    } else if (cells.length > 1) {
      for (const cell of cells) {
        let bestIndex = 0;
        let bestDist = Infinity;
        for (let c = 0; c < headerX.length; c++) {
          const dist = Math.abs(cell.x - headerX[c]);
          if (dist < bestDist) {
            bestDist = dist;
            bestIndex = c;
          }
        }
        row[bestIndex] = row[bestIndex] ? `${row[bestIndex]} ${cell.text}` : cell.text;
      }
    } else {
      for (let c = 0; c < headers.length; c++) {
        row[c] = cells[c]?.text || "";
      }
    }

    if (row.some((cell) => cell.trim().length)) data.push(row);
  }

  return { headers, data };
}

async function pdfToWorkbook(buf) {
  if (typeof pdfjsLib === "undefined") {
    throw new Error("No s'ha pogut carregar el lector de PDF.");
  }
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const lines = groupPdfTextLines(content.items);
    const table = extractTableFromPdfLines(lines);
    if (table) {
      const aoa = [table.headers, ...table.data];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "data");
      return wb;
    }
  }

  throw new Error("No s'ha detectat cap taula al PDF.");
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
    setStatusKey("statusSheetEmpty", {}, true);
    return;
  }

  const cols = Object.keys(tableRows[0]);
  renderColumns(cols);
  renderPreview(tableRows,3);

  columnsCard.classList.remove("hidden");
  previewCard.classList.remove("hidden");
  generateCard.classList.remove("hidden");
  clearStatus();
}

function renderColumns(cols) {
  const defaultSensitive = new Set([
    "DNI",
    "NIF",
    "Nom",
    "Cognom",
    "Correu",
    "Correu electrònic",
    "Adreça"
  ].map((c) => c.toLowerCase()));
  columnsList.innerHTML = "";
  cols.forEach((c) => {
    const isDefault = defaultSensitive.has(String(c).trim().toLowerCase());
    const col = document.createElement("div");
    const wrapper = document.createElement("label");

    col.className = "col-sm-6 col-lg-4";
    wrapper.className = "form-check border rounded p-2 d-flex gap-2 align-items-start h-100";
    wrapper.innerHTML = `
      <input class="form-check-input mt-1" type="checkbox" value="${escapeHtml(c)}" ${isDefault ? "checked" : ""} />
      <span class="form-check-label">${escapeHtml(c)}</span>
    `;

    col.appendChild(wrapper);
    columnsList.appendChild(col);
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
  const idCol = "ID";

  if (!tableRows.length) {
    setStatusKey("statusNoData", {}, true);
    return;
  }
  if (selected.length === 0) {
    setStatusKey("statusSelectColumn", {}, true);
    return;
  }

  const originalCols = Object.keys(tableRows[0]);
  const missing = selected.filter(c => !originalCols.includes(c));
  if (missing.length) {
    setStatusKey("statusMissingColumns", { cols: missing.join(", ") }, true);
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

  lastPrivateRows = privateRows;
  lastPublicRows = publicRows;

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

  downloadsPrivate.classList.remove("hidden");
  downloadsPublic.classList.remove("hidden");
  setStatusKey("statusGenerated");
  generateCard.classList.add("hidden");
}

async function handleFileSelection(file) {
  resetUI();
  if (!file) return;

  const lower = file.name.toLowerCase();
  if (lower.endsWith(".csv")) inputExt = "csv";
  else if (lower.endsWith(".pdf")) inputExt = "pdf";
  else if (lower.endsWith(".ods")) inputExt = "ods";
  else inputExt = "xlsx";

  inputBaseName = file.name.replace(/\.[^/.]+$/, "");

  fileInfo.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;
  updateCsvHint();

  const ext = file.name.toLowerCase();
  const buf = await file.arrayBuffer();

  try {
    if (ext.endsWith(".csv")) {
      const text = new TextDecoder("utf-8").decode(new Uint8Array(buf));
      const { wb } = csvToWorkbookWithFallback(text);
      workbook = wb;
    } else if (ext.endsWith(".pdf")) {
      workbook = await pdfToWorkbook(buf);
    } else if (ext.endsWith(".xlsx") || ext.endsWith(".xls") || ext.endsWith(".ods")) {
      workbook = XLSX.read(buf, { type: "array" });
    } else {
      setStatusKey("statusUnsupported", {}, true);
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
    setStatusKey("statusReadError", { err: String(err) }, true);
  }
}

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  await handleFileSelection(file);
});

if (dropZone) {
  dropZone.addEventListener("click", () => fileInput.click());
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });
  dropZone.addEventListener("drop", async (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const file = e.dataTransfer?.files?.[0];
    await handleFileSelection(file);
  });
}

generateBtn.addEventListener("click", generate);

function refreshPreviewsForLanguage() {
  if (tableRows.length) {
    renderPreview(tableRows, 3);
  }
  if (lastPrivateRows && lastPublicRows) {
    renderPreviewInto(previewPrivateDiv, lastPrivateRows, 3);
    renderPreviewInto(previewPublicDiv, lastPublicRows, 3);
  }
}

if (langSelect) {
  const savedLang = getCookie(LANG_COOKIE);
  if (savedLang && translations[savedLang]) {
    currentLang = savedLang;
    langSelect.value = savedLang;
  } else {
    currentLang = langSelect.value || "ca";
  }
  const onLangChange = () => {
    currentLang = langSelect.value;
    setCookie(LANG_COOKIE, currentLang, 365);
    applyTranslations();
    updateCsvHint();
    refreshPreviewsForLanguage();
    if (lastStatus) {
      setStatusKey(lastStatus.key, lastStatus.params, lastStatus.isError);
    }
  };
  langSelect.addEventListener("change", onLangChange);
  langSelect.addEventListener("input", onLangChange);
}

applyTranslations();
updateCsvHint();
