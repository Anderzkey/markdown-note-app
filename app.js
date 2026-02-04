// Core application state
const appState = {
  currentFile: null,
  search: {
    query: "",
    matches: [],
    currentMatchIndex: -1,
    isActive: false,
  },
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_SEARCH_LENGTH = 100; // Prevent DoS from massive search queries
const ALLOWED_EXTENSIONS = [".md", ".markdown", ".txt"];
const ALLOWED_MIME_TYPES = ["text/plain", "text/markdown", ""];

// DOM references
const fileInput = document.getElementById("file-input");
const dropZone = document.getElementById("drop-zone");
const fileInfoEl = document.getElementById("file-info");
const fileErrorEl = document.getElementById("file-error");
const previewEl = document.getElementById("preview");

// Search DOM references
const searchInput = document.getElementById("search-input");
const searchInfoEl = document.getElementById("search-info");
const searchPrevBtn = document.getElementById("search-prev-btn");
const searchNextBtn = document.getElementById("search-next-btn");
const searchClearBtn = document.getElementById("search-clear-btn");

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
  // Use textContent to safely display filename (prevents XSS)
  fileInfoEl.textContent = `${file.name} · ${formatFileSize(file.size)}`;
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

    // Reset search when new file loads
    clearSearch();

    // Enable search controls
    if (searchInput) searchInput.disabled = false;
  };

  reader.onerror = () => {
    showError("Failed to read file. Please try again.");
  };

  reader.readAsText(file);
}

// Search functions
function performSearch(query) {
  appState.search.query = query.trim();
  appState.search.currentMatchIndex = -1;
  appState.search.matches = [];

  // Prevent DoS attack: reject searches longer than MAX_SEARCH_LENGTH
  if (appState.search.query.length > MAX_SEARCH_LENGTH) {
    searchInfoEl.textContent = "Search too long (max 100 characters)";
    appState.search.isActive = false;
    updateSearchNav();
    return;
  }

  if (!appState.search.query) {
    clearSearch();
    return;
  }

  // Get text nodes from preview
  const walker = document.createTreeWalker(
    previewEl,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const regex = new RegExp(
    appState.search.query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "gi"
  );

  let node;
  while ((node = walker.nextNode())) {
    const text = node.textContent;
    let match;

    while ((match = regex.exec(text)) !== null) {
      appState.search.matches.push({
        node: node,
        index: match.index,
        text: match[0],
      });
    }
  }

  if (appState.search.matches.length > 0) {
    appState.search.isActive = true;
    highlightMatches();
    navigateToMatch(0);
  } else {
    searchInfoEl.textContent = "No matches";
    appState.search.isActive = false;
  }

  updateSearchNav();
}

function highlightMatches() {
  // Remove existing highlights
  previewEl.querySelectorAll(".search-highlight").forEach((mark) => {
    const parent = mark.parentNode;
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark);
    }
    parent.removeChild(mark);
  });

  // Create new highlights
  appState.search.matches.forEach((match, idx) => {
    const node = match.node;
    const text = node.textContent;

    const beforeText = text.slice(0, match.index);
    const matchText = text.slice(match.index, match.index + match.text.length);
    const afterText = text.slice(match.index + match.text.length);

    const container = document.createElement("span");

    if (beforeText) {
      container.appendChild(document.createTextNode(beforeText));
    }

    const mark = document.createElement("mark");
    mark.className =
      idx === appState.search.currentMatchIndex
        ? "search-highlight search-highlight--active"
        : "search-highlight";
    mark.textContent = matchText;
    mark.dataset.matchIndex = idx;
    container.appendChild(mark);

    if (afterText) {
      container.appendChild(document.createTextNode(afterText));
    }

    node.parentNode.replaceChild(container, node);
    // Update node reference for potential future use
    appState.search.matches[idx].node = mark;
  });
}

function navigateToMatch(direction) {
  if (appState.search.matches.length === 0) return;

  if (direction === 0) {
    // Jump to first match
    appState.search.currentMatchIndex = 0;
  } else if (direction > 0) {
    // Next match (wrap to first if at end)
    appState.search.currentMatchIndex =
      (appState.search.currentMatchIndex + 1) % appState.search.matches.length;
  } else if (direction < 0) {
    // Previous match (wrap to last if at start)
    appState.search.currentMatchIndex =
      appState.search.currentMatchIndex === 0
        ? appState.search.matches.length - 1
        : appState.search.currentMatchIndex - 1;
  }

  // Update highlights
  previewEl.querySelectorAll(".search-highlight").forEach((mark, idx) => {
    mark.classList.remove("search-highlight--active");
    if (idx === appState.search.currentMatchIndex) {
      mark.classList.add("search-highlight--active");
      mark.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  updateSearchInfo();
}

function updateSearchInfo() {
  if (appState.search.matches.length === 0) {
    searchInfoEl.textContent = "";
    return;
  }

  searchInfoEl.textContent = `${appState.search.currentMatchIndex + 1} of ${
    appState.search.matches.length
  }`;
}

function updateSearchNav() {
  const hasMatches = appState.search.matches.length > 0;
  searchPrevBtn.disabled = !hasMatches;
  searchNextBtn.disabled = !hasMatches;
  searchClearBtn.disabled = !hasMatches;
}

function clearSearch() {
  appState.search.query = "";
  appState.search.matches = [];
  appState.search.currentMatchIndex = -1;
  appState.search.isActive = false;

  if (searchInput) searchInput.value = "";
  searchInfoEl.textContent = "";

  // Remove highlights
  previewEl.querySelectorAll(".search-highlight").forEach((mark) => {
    const parent = mark.parentNode;
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark);
    }
    parent.removeChild(mark);
  });

  updateSearchNav();
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

// Search event wiring
if (searchInput) {
  searchInput.addEventListener("input", (event) => {
    performSearch(event.target.value);
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.shiftKey ? navigateToMatch(-1) : navigateToMatch(1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      clearSearch();
      searchInput.blur();
    }
  });
}

if (searchPrevBtn) {
  searchPrevBtn.addEventListener("click", () => {
    navigateToMatch(-1);
  });
}

if (searchNextBtn) {
  searchNextBtn.addEventListener("click", () => {
    navigateToMatch(1);
  });
}

if (searchClearBtn) {
  searchClearBtn.addEventListener("click", () => {
    clearSearch();
    searchInput?.focus();
  });
}

// Global keyboard shortcut for search: Ctrl+F or Cmd+F
document.addEventListener("keydown", (event) => {
  // Security: Only respond to genuine user keyboard events, not synthetic ones
  if (!event.isTrusted) return;

  if ((event.ctrlKey || event.metaKey) && event.key === "f") {
    event.preventDefault();
    if (appState.currentFile && searchInput) {
      searchInput.focus();
    }
  }
});

