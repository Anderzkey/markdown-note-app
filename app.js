// Core application state
const appState = {
  currentFile: null,
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = [".md", ".markdown", ".txt"];
const ALLOWED_MIME_TYPES = ["text/plain", "text/markdown", ""];

// DOM references
const fileInput = document.getElementById("file-input");
const dropZone = document.getElementById("drop-zone");
const fileInfoEl = document.getElementById("file-info");
const fileErrorEl = document.getElementById("file-error");
const previewEl = document.getElementById("preview");

// Configure marked + highlight.js
if (window.marked) {
  marked.setOptions({
    gfm: true,
    breaks: false,
    headerIds: true,
    mangle: false,
    highlight(code, lang) {
      if (window.hljs) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      }
      return code;
    },
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileExtension(name) {
  const idx = name.lastIndexOf(".");
  return idx === -1 ? "" : name.slice(idx).toLowerCase();
}

function clearError() {
  fileErrorEl.textContent = "";
}

function showError(message) {
  fileErrorEl.textContent = message;
}

function updateFileInfo(file) {
  if (!file) {
    fileInfoEl.textContent = "No file loaded.";
    fileInfoEl.classList.add("file-info--empty");
    return;
  }

  fileInfoEl.classList.remove("file-info--empty");
  fileInfoEl.innerHTML = `
    <strong>${file.name}</strong>
    &nbsp;·&nbsp;
    ${formatFileSize(file.size)}
  `;
}

function validateFile(file) {
  if (!file) {
    showError("No file selected.");
    return false;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    showError("File is too large. Maximum size is 5 MB.");
    return false;
  }

  const ext = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    showError("Unsupported file type. Use .md, .markdown, or .txt.");
    return false;
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    // Some systems may set empty MIME types; we already approved by extension above
    // so treat unknown types as acceptable if extension is valid.
  }

  clearError();
  return true;
}

function renderMarkdown(content) {
  if (!window.marked) {
    previewEl.textContent = content;
    return;
  }

  const html = marked.parse(content);
  previewEl.innerHTML = html;

  if (window.hljs) {
    previewEl.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block);
    });
  }
}

function handleFile(file) {
  if (!validateFile(file)) {
    return;
  }

  const reader = new FileReader();

  reader.onload = (event) => {
    const text = event.target.result || "";
    appState.currentFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      content: text,
    };

    updateFileInfo(appState.currentFile);
    renderMarkdown(text);
  };

  reader.onerror = () => {
    showError("Failed to read file. Please try again.");
  };

  reader.readAsText(file);
}

// Event wiring
if (fileInput) {
  fileInput.addEventListener("change", (event) => {
    const [file] = event.target.files || [];
    if (file) {
      handleFile(file);
    }
  });
}

if (dropZone) {
  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      event.stopPropagation();
      dropZone.classList.add("drop-zone--active");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (eventName === "drop") {
        const dt = event.dataTransfer;
        const files = dt?.files;
        const [file] = files || [];
        if (file) {
          handleFile(file);
        }
      }

      dropZone.classList.remove("drop-zone--active");
    });
  });

  dropZone.addEventListener("click", () => {
    fileInput?.click();
  });
}

