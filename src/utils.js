export function generateGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Generate or retrieve tab ID from session storage
export const generateTabId = () => {
    let tabId = sessionStorage.getItem('tabId');
    if (!tabId) {
        tabId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        sessionStorage.setItem('tabId', tabId);
    }
    return tabId;
}; 

export const getGamePlayerLimits = (gameName) => {
  switch (gameName) {
    case 'avalon':
      return { minPlayers: 3, maxPlayers: 10 };
    case 'codenames':
      return { minPlayers: 4, maxPlayers: 20 };
    case 'ddakji':
      return { minPlayers: 2, maxPlayers: 2 };
    default:
      return { minPlayers: -1, maxPlayers: -1 };
  }
};