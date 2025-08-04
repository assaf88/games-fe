export function generateGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const generateTabId = () => {
  if (!window.name) {
    window.name = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
  return window.name;
}; 

export const getGamePlayerLimits = (gameName) => {
  switch (gameName) {
    case 'avalon':
      return { minPlayers: 3, maxPlayers: 10 };
    case 'codenames':
      return { minPlayers: 4, maxPlayers: 20 };
    default:
      return { minPlayers: -1, maxPlayers: -1 };
  }
};

// Version management functions
export const getCurrentVersion = () => {
  return sessionStorage.getItem('app_version') || null;
};

export const setCurrentVersion = (version) => {
  sessionStorage.setItem('app_version', version);
};

export const shouldRestartForVersion = (newVersion) => {
  const currentVersion = getCurrentVersion();
  
  setCurrentVersion(newVersion);
  
  // If no stored version, this is first connection - no restart needed
  if (!currentVersion) {
    return false;
  }
  
  // Compare only first two digits (major.minor)
  const getMajorMinor = (version) => {
    const parts = version.split('.');
    return `${parts[0]}.${parts[1]}`;
  };
  
  const currentMajorMinor = getMajorMinor(currentVersion);
  const newMajorMinor = getMajorMinor(newVersion);
  
  return currentMajorMinor !== newMajorMinor;
};