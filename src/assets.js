const BASE_AVALON_PATH = '/images/avalon/';

const avalonImages = {
  frame: BASE_AVALON_PATH + 'frame1b.png',

  oberon: BASE_AVALON_PATH + 'oberon20b.webp',
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
  BASE_AVALON_PATH + 'desktop-bg80cr.webp',
];