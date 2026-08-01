export type PeacefulSceneCategory =
  | 'Cross & Worship'
  | 'Bible Lands'
  | 'Water'
  | 'Mountains'
  | 'Forest & Garden'
  | 'Sky & Light';

export type PeacefulSilhouette =
  | 'cross-hill'
  | 'chapel'
  | 'bethlehem'
  | 'city'
  | 'fields'
  | 'water'
  | 'mountains'
  | 'garden'
  | 'desert'
  | 'forest'
  | 'clouds'
  | 'sanctuary'
  | 'tomb';

export type PeacefulScene = {
  id: string;
  name: string;
  category: PeacefulSceneCategory;
  access: 'free' | 'premium';
  colors: readonly [string, string, string];
  accent: string;
  darkness: number;
  silhouette: PeacefulSilhouette;
  accessibilityLabel: string;
};

export const DEFAULT_PEACEFUL_SCENE_ID = 'cross-on-the-hill';

const scene = (
  id: string,
  name: string,
  category: PeacefulSceneCategory,
  access: PeacefulScene['access'],
  colors: PeacefulScene['colors'],
  accent: string,
  darkness: number,
  silhouette: PeacefulSilhouette,
  accessibilityLabel: string,
): PeacefulScene => ({ id, name, category, access, colors, accent, darkness, silhouette, accessibilityLabel });

export const PEACEFUL_SCENES: readonly PeacefulScene[] = [
  scene('cross-on-the-hill', 'Cross on the Hill', 'Cross & Worship', 'free', ['#7BC7E8', '#F6C978', '#24384D'], '#F5D88C', 0.34, 'cross-hill', 'A wooden cross standing on a peaceful hill beneath a warm sunrise.'),
  scene('sunrise-cross', 'Sunrise Cross', 'Cross & Worship', 'free', ['#4F6B91', '#F3A56D', '#281F35'], '#FFD49A', 0.38, 'cross-hill', 'A quiet cross outlined by coral and golden morning light.'),
  scene('quiet-chapel', 'Quiet Chapel', 'Cross & Worship', 'free', ['#526A79', '#D4B37A', '#202A35'], '#EFD69A', 0.42, 'chapel', 'A small chapel resting in a calm valley at first light.'),
  scene('bethlehem-dawn', 'Bethlehem Dawn', 'Bible Lands', 'free', ['#5B6B83', '#E6B06F', '#443022'], '#F4D39A', 0.4, 'bethlehem', 'Bethlehem rooftops and a guiding star in the soft light of dawn.'),
  scene('shepherd-fields', 'Shepherd Fields', 'Bible Lands', 'free', ['#547B8C', '#D9C17B', '#344634'], '#F2DB9D', 0.3, 'fields', 'Rolling shepherd fields under a wide peaceful sky.'),
  scene('peaceful-lake', 'Peaceful Lake', 'Water', 'free', ['#5EA5C8', '#A9D5D8', '#27465D'], '#CBEAE1', 0.31, 'water', 'Still blue water reflecting a quiet shoreline and gentle sky.'),
  scene('ocean-sunrise', 'Ocean Sunrise', 'Water', 'free', ['#4E92B8', '#F4BC78', '#1D405B'], '#FFD59A', 0.29, 'water', 'Golden sunrise light spreading across a calm ocean.'),
  scene('mountain-morning', 'Mountain Morning', 'Mountains', 'free', ['#759AB2', '#D9C7A0', '#344B5A'], '#E8D7A7', 0.34, 'mountains', 'Layered mountains waking beneath a pale peaceful morning.'),
  scene('olive-garden', 'Olive Garden', 'Forest & Garden', 'free', ['#6A8B77', '#D8C78F', '#31463A'], '#E7DAA6', 0.35, 'garden', 'Ancient olive trees surrounding a quiet place of prayer.'),
  scene('golden-clouds', 'Golden Clouds', 'Sky & Light', 'free', ['#7796C1', '#F5D08B', '#4B5674'], '#FFE1A7', 0.25, 'clouds', 'Soft golden clouds opening across a peaceful blue sky.'),

  scene('calvary-sunset', 'Calvary Sunset', 'Cross & Worship', 'premium', ['#613F62', '#E9906C', '#241E34'], '#F5C38F', 0.44, 'cross-hill', 'A cross on a distant hill beneath a reverent sunset.'),
  scene('candlelit-sanctuary', 'Candlelit Sanctuary', 'Cross & Worship', 'premium', ['#3B2B31', '#A87342', '#15151B'], '#F4C879', 0.52, 'sanctuary', 'Warm candlelight glowing inside a quiet sanctuary.'),
  scene('prayer-garden', 'Prayer Garden', 'Cross & Worship', 'premium', ['#507968', '#C7B77F', '#253B34'], '#E6D79C', 0.35, 'garden', 'A secluded garden path prepared for peaceful prayer.'),
  scene('open-bible-light', 'Open Bible Light', 'Cross & Worship', 'premium', ['#6D5C51', '#E3C087', '#24242D'], '#FFE0A3', 0.46, 'sanctuary', 'A soft beam of light resting over an open Bible.'),
  scene('still-waters-cross', 'Cross by Still Waters', 'Cross & Worship', 'premium', ['#3F7A90', '#AFC9B7', '#263D4A'], '#DDE8C5', 0.38, 'cross-hill', 'A cross beside still waters and a quiet green shoreline.'),

  scene('jerusalem-gold', 'Jerusalem Gold', 'Bible Lands', 'premium', ['#6C7E91', '#D7B170', '#4C392A'], '#F4D192', 0.43, 'city', 'Jerusalem stone walls glowing gently in golden light.'),
  scene('bethlehem-night', 'Bethlehem Night', 'Bible Lands', 'premium', ['#273B66', '#7C7FA0', '#151C35'], '#F8E6A8', 0.48, 'bethlehem', 'Bethlehem beneath a deep blue sky and a bright guiding star.'),
  scene('nazareth-hills', 'Nazareth Hills', 'Bible Lands', 'premium', ['#6F93A0', '#C8B47D', '#435740'], '#E7D49A', 0.31, 'fields', 'Green hills around Nazareth beneath a calm afternoon sky.'),
  scene('galilee-shore', 'Galilee Shore', 'Bible Lands', 'premium', ['#4F8EAA', '#B4CFBF', '#294C5A'], '#D2E4CA', 0.32, 'water', 'The quiet shore of Galilee with soft waves and distant hills.'),
  scene('jordan-river', 'Jordan River', 'Bible Lands', 'premium', ['#4D8292', '#9EBA92', '#314B3E'], '#C8D8AA', 0.36, 'water', 'A peaceful river winding between reeds and green banks.'),
  scene('sinai-dawn', 'Sinai Dawn', 'Bible Lands', 'premium', ['#647B98', '#DFA86A', '#4B3027'], '#F2C58A', 0.38, 'desert', 'Mount Sinai rising from the desert in the stillness of dawn.'),
  scene('judean-desert', 'Judean Desert', 'Bible Lands', 'premium', ['#7C8FA7', '#D6A66E', '#5A3E2D'], '#E9C18E', 0.37, 'desert', 'Quiet Judean desert ridges beneath a spacious blue sky.'),
  scene('olive-mount', 'Mount of Olives', 'Bible Lands', 'premium', ['#6F8E7C', '#D2B67C', '#3B4D3B'], '#E9D298', 0.39, 'garden', 'Olive trees on a peaceful hillside overlooking the city.'),
  scene('road-to-emmaus', 'Road to Emmaus', 'Bible Lands', 'premium', ['#738B9B', '#D9BE84', '#4B513F'], '#F0D59D', 0.33, 'fields', 'A quiet road winding through Bible lands in evening light.'),
  scene('garden-tomb', 'Garden Tomb', 'Bible Lands', 'premium', ['#658579', '#CFBE8E', '#34423B'], '#E9D9AD', 0.42, 'tomb', 'A peaceful garden and an open stone tomb at morning light.'),

  scene('ocean-evening', 'Ocean Evening', 'Water', 'premium', ['#45678C', '#BE8CA0', '#1E304B'], '#E4B8B0', 0.39, 'water', 'A calm ocean beneath lavender and rose evening light.'),
  scene('beach-prayer', 'Beach Prayer', 'Water', 'premium', ['#4F9AB5', '#E0C89A', '#2D5B70'], '#F2DCAA', 0.3, 'water', 'A quiet sandy beach with gentle waves and open sky.'),
  scene('lake-mist', 'Lake Mist', 'Water', 'premium', ['#7DA7B2', '#C7D7D0', '#445D65'], '#DCE6DF', 0.35, 'water', 'Morning mist floating over a silent mountain lake.'),
  scene('river-of-life', 'River of Life', 'Water', 'premium', ['#4E91A0', '#A8C99A', '#2D5147'], '#CDE5B5', 0.33, 'water', 'Clear water flowing through a bright and peaceful green valley.'),
  scene('quiet-waterfall', 'Quiet Waterfall', 'Water', 'premium', ['#4D8290', '#9BBEAC', '#253E3C'], '#C9DED1', 0.4, 'water', 'A gentle waterfall descending into a secluded forest pool.'),
  scene('seaside-clouds', 'Seaside Clouds', 'Water', 'premium', ['#6B9BB7', '#D9D6C1', '#35566B'], '#E9E2CB', 0.28, 'water', 'Soft clouds drifting above a calm blue shoreline.'),
  scene('galilee-sunset', 'Galilee Sunset', 'Water', 'premium', ['#4C6F92', '#E3A06F', '#263C55'], '#F3C18C', 0.38, 'water', 'Warm sunset light settling across the Sea of Galilee.'),
  scene('blue-lagoon', 'Blue Lagoon', 'Water', 'premium', ['#3D97AD', '#8ED0C1', '#1F5365'], '#BFEADC', 0.28, 'water', 'Clear turquoise water resting beneath a bright peaceful sky.'),

  scene('mountain-sunset', 'Mountain Sunset', 'Mountains', 'premium', ['#625F85', '#D99A76', '#302F46'], '#EDC098', 0.4, 'mountains', 'Mountain ridges layered beneath a warm and quiet sunset.'),
  scene('valley-light', 'Valley Light', 'Mountains', 'premium', ['#6E94A2', '#D4C88E', '#405444'], '#E8D9A3', 0.31, 'mountains', 'Sunlight reaching into a peaceful green mountain valley.'),
  scene('cedar-ridge', 'Cedar Ridge', 'Mountains', 'premium', ['#547887', '#A9B897', '#30443E'], '#CAD4AA', 0.38, 'mountains', 'A cedar-covered ridge beneath a calm highland sky.'),
  scene('desert-mountain', 'Desert Mountain', 'Mountains', 'premium', ['#7D8296', '#D8A06E', '#523A32'], '#ECC18E', 0.39, 'mountains', 'A quiet desert mountain glowing in late afternoon light.'),
  scene('highland-lake', 'Highland Lake', 'Mountains', 'premium', ['#5D879F', '#B7C7B1', '#334C5B'], '#D3DFC2', 0.35, 'mountains', 'A still lake surrounded by peaceful highland peaks.'),
  scene('snowy-peace', 'Snowy Peace', 'Mountains', 'premium', ['#86A4BD', '#D8E1E5', '#506277'], '#F0F4F2', 0.27, 'mountains', 'Snow-covered mountains beneath a clear and gentle winter sky.'),

  scene('forest-path', 'Forest Path', 'Forest & Garden', 'premium', ['#416A5B', '#9AB17E', '#243B34'], '#C6D59B', 0.42, 'forest', 'A soft path leading through a quiet green forest.'),
  scene('garden-stream', 'Garden Stream', 'Forest & Garden', 'premium', ['#4A7D6A', '#AFC38B', '#29483E'], '#D0DCA4', 0.36, 'garden', 'A small clear stream moving through a peaceful garden.'),
  scene('olive-grove', 'Ancient Olive Grove', 'Forest & Garden', 'premium', ['#627A68', '#C1B681', '#354238'], '#DDD09A', 0.4, 'garden', 'Ancient olive trees standing quietly in warm afternoon light.'),
  scene('cedar-forest', 'Cedar Forest', 'Forest & Garden', 'premium', ['#3D6355', '#849B75', '#20362F'], '#B8C798', 0.44, 'forest', 'Tall cedar trees surrounding a quiet place of rest.'),
  scene('meadow-prayer', 'Meadow Prayer', 'Forest & Garden', 'premium', ['#6F9B86', '#D1C887', '#3D5845'], '#E7D99B', 0.3, 'fields', 'A peaceful meadow beneath soft light and an open sky.'),
  scene('autumn-trail', 'Autumn Trail', 'Forest & Garden', 'premium', ['#6C665A', '#C58D5B', '#3A332C'], '#E4B176', 0.4, 'forest', 'A quiet trail through warm autumn trees and fallen leaves.'),
  scene('spring-garden', 'Spring Garden', 'Forest & Garden', 'premium', ['#69A08B', '#D7C9A3', '#3B5A4C'], '#EBDAB7', 0.31, 'garden', 'A fresh spring garden filled with soft light and new growth.'),

  scene('starlit-promise', 'Starlit Promise', 'Sky & Light', 'premium', ['#26365F', '#5F6689', '#11162D'], '#F6E7AC', 0.46, 'clouds', 'A deep night sky filled with stars and quiet promise.'),
  scene('rainbow-valley', 'Rainbow Valley', 'Sky & Light', 'premium', ['#6E9DB5', '#D9C99C', '#475B62'], '#F3D9A7', 0.27, 'mountains', 'A soft rainbow appearing over a calm green valley.'),
  scene('moonlit-peace', 'Moonlit Peace', 'Sky & Light', 'premium', ['#334A72', '#8591AC', '#151D35'], '#D9E0F0', 0.43, 'clouds', 'A bright moon above gentle clouds and a silent landscape.'),
  scene('heaven-light', 'Heaven Light', 'Sky & Light', 'premium', ['#6F9CC4', '#E5D7B0', '#475C7A'], '#FFF0C1', 0.24, 'clouds', 'Rays of warm light opening through calm clouds.'),
];

const SCENE_BY_ID = new Map(PEACEFUL_SCENES.map((item) => [item.id, item]));

export function getPeacefulScene(sceneId: string): PeacefulScene | undefined {
  return SCENE_BY_ID.get(sceneId);
}

function accessibleScene(scene: PeacefulScene, hasPremium: boolean): boolean {
  return scene.access === 'free' || hasPremium;
}

function dayHash(value: string): number {
  let result = 0;
  for (const character of value) result = (result * 31 + character.charCodeAt(0)) >>> 0;
  return result;
}

export function resolveRotatingSceneId(
  selectedSceneId: string,
  rotationEnabled: boolean,
  favoriteSceneIds: readonly string[],
  hasPremium: boolean,
  dateKey = new Date().toISOString().slice(0, 10),
): string {
  const selected = getPeacefulScene(selectedSceneId);
  const safeSelected = selected && accessibleScene(selected, hasPremium) ? selected.id : DEFAULT_PEACEFUL_SCENE_ID;
  if (!rotationEnabled) return safeSelected;

  const favorites = [...new Set(favoriteSceneIds)]
    .map(getPeacefulScene)
    .filter((item): item is PeacefulScene => Boolean(item) && accessibleScene(item, hasPremium));
  const pool = favorites.length ? favorites : PEACEFUL_SCENES.filter((item) => accessibleScene(item, hasPremium));
  return pool[dayHash(dateKey) % pool.length]?.id || safeSelected;
}
