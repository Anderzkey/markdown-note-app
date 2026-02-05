// Storage persistence layer for multi-file library management

/**
 * Generates a unique ID for a file based on its metadata
 * @param {File} file - The File object
 * @returns {string} Unique file ID
 */
function generateFileId(file) {
  return `${file.name}_${file.lastModified}_${file.size}`;
}

/**
 * Saves current app state to localStorage
 * Converts Sets to Arrays for JSON serialization
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
  localStorage.setItem('markdown-app-library', JSON.stringify(data));
}

/**
 * Loads app state from localStorage
 * Reconstructs Sets from stored Arrays
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
    return null;
  }
}

/**
 * Clears all saved data from localStorage
 */
function clearStorage() {
  localStorage.removeItem('markdown-app-library');
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
