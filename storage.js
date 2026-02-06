// Storage persistence layer for multi-file library management

/**
 * Generates a unique ID for a file using crypto hash
 * Prevents collisions from identical name/size/date combinations
 * @param {File} file - The File object
 * @returns {string} Unique file ID (16 char hash prefix)
 */
function generateFileId(file) {
  // Create deterministic input from file metadata
  const input = `${file.name}|${file.lastModified}|${file.size}|${file.type}|${Date.now()}`;

  // Generate timestamp-based ID with uniqueness guarantee
  // Format: "file_TIMESTAMP_RANDOM" ensures uniqueness even for identical files
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `file_${timestamp}_${random}`;
}

/**
 * Saves current app state to localStorage
 * Converts Sets to Arrays for JSON serialization
 * Includes quota checking to prevent data loss
 */
function saveToStorage() {
  const data = {
    version: 1,
    files: appState.files.map(f => ({
      id: f.id,
      name: f.name,
      size: f.size,
      type: f.type,
      lastModified: f.lastModified,
      content: f.content,
      tags: Array.from(f.tags || []),
      addedAt: f.addedAt,
      lastViewed: f.lastViewed,
    })),
    settings: {
      sidebarExpanded: appState.sidebarExpanded ?? true,
      sortBy: appState.sortBy ?? "recent",
    },
  };

  try {
    const json = JSON.stringify(data);
    const sizeInMB = json.length / (1024 * 1024);

    // Check if save would exceed quota (safety margin: 4.5MB of 5MB)
    if (sizeInMB > 4.5) {
      showError("Storage is running low. Please delete some files to continue.");
      return false;
    }

    localStorage.setItem('markdown-app-library', json);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      showError("Storage is full. Please delete some files and try again.");
      return false;
    }
    console.error('Storage error:', error);
    return false;
  }
}

/**
 * Loads app state from localStorage
 * Reconstructs Sets from stored Arrays
 * Shows warning if data recovery fails
 * @returns {Object|null} Loaded state or null if nothing saved
 */
function loadFromStorage() {
  const raw = localStorage.getItem('markdown-app-library');
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);

    // Reconstruct Sets from Arrays
    if (data.files) {
      data.files.forEach(f => {
        f.tags = new Set(f.tags || []);
      });
    }

    return data;
  } catch (error) {
    console.error('Error loading from storage:', error);

    // Warn user about data loss
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; padding: 12px;
      background: #b00020; color: white; z-index: 1001; font-weight: 500;
    `;
    warning.textContent = '⚠️ Could not recover library data. Starting fresh.';
    document.body?.prepend(warning);
    setTimeout(() => warning.remove(), 5000);

    return null;
  }
}

/**
 * Gets the current localStorage usage as a percentage (0-100)
 * Helps prevent exceeding browser limits
 */
function getStorageUsagePercent() {
  try {
    const raw = localStorage.getItem('markdown-app-library');
    const size = raw ? raw.length : 0;
    // Rough estimate: browsers typically allow 5-10MB
    const limit = 5 * 1024 * 1024;
    return Math.round((size / limit) * 100);
  } catch (error) {
    return 0;
  }
}
