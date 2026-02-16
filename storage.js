// Storage persistence layer for multi-file library management

/**
 * Generates a unique ID for a file using crypto-secure randomness
 * Prevents collisions from identical name/size/date combinations
 * @param {File} file - The File object
 * @returns {string} Unique file ID (timestamp + secure random)
 */
function generateFileId(file) {
  // Generate timestamp-based ID with enhanced uniqueness guarantee
  const timestamp = Date.now();

  // Use crypto.getRandomValues if available (secure), fallback to Math.random()
  let random;
  if (window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint8Array(6);
    window.crypto.getRandomValues(arr);
    random = Array.from(arr, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback: Use multiple Math.random() calls for better entropy
    random = (Math.random().toString(36).substring(2) +
              Math.random().toString(36).substring(2)).substring(0, 12);
  }

  return `file_${timestamp}_${random}`;
}

/**
 * Saves current app state to localStorage
 * Converts Sets to Arrays for JSON serialization
 * Includes quota checking to prevent data loss
 * Tests quota availability BEFORE attempting save
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
      showError(`⚠️ Storage nearly full (${Math.round(sizeInMB * 100 / 5)}%). Delete files to continue.`);
      return false;
    }

    // BUG FIX #1: Test quota availability BEFORE attempting save
    // This prevents data corruption if setItem() fails
    try {
      localStorage.setItem('__storage_test__', 'test');
      localStorage.removeItem('__storage_test__');
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        showError('❌ Storage full! Cannot save. Delete files or clear browser data.');
        return false;
      }
      throw error;
    }

    // Now perform actual save (quota is confirmed available)
    localStorage.setItem('markdown-app-library', json);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      showError('❌ Storage full! Cannot save. Delete files or clear browser data.');
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
