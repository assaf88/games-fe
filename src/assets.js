const BASE_AVALON_PATH = '/images/avalon/';

const avalonImages = {
  frame: BASE_AVALON_PATH + 'avalon-frame.png',
  unknown: BASE_AVALON_PATH + 'unknown.png',

  merlin: BASE_AVALON_PATH + 'merlin.webp',
  assassin: BASE_AVALON_PATH + 'assassin.webp',
  percival: BASE_AVALON_PATH + 'percival.webp',
  morgana: BASE_AVALON_PATH + 'morgana.webp',
  mordred: BASE_AVALON_PATH + 'mordred.webp',
  oberon: BASE_AVALON_PATH + 'oberon.webp',

  'servant-m': BASE_AVALON_PATH + 'servant-m.webp',
  'servant-f': BASE_AVALON_PATH + 'servant-f.webp',

  'minion-m': BASE_AVALON_PATH + 'minion-m.webp',
  'minion-f': BASE_AVALON_PATH + 'minion-f.webp',
};

const codenamesImages = [
];

export function getGameImages(gameName) {
  switch (gameName) {
    case 'avalon': return avalonImages;
    case 'codenames': return codenamesImages;
    default: return [];
  }
}

export const backgroundImages = [
  BASE_AVALON_PATH + 'avalon-bg.webp',
];