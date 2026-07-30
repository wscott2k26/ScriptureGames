import type { ImageSource } from 'expo-image';

export const STORY_IMAGES: Record<string, ImageSource> = {
  s1: require('../assets/images/stories/s1.jpg'),
  s2: require('../assets/images/stories/s2.jpg'),
  s3: require('../assets/images/stories/s3.jpg'),
  s4: require('../assets/images/stories/s4.jpg'),
  s5: require('../assets/images/stories/s5.jpg'),
  s6: require('../assets/images/stories/s6.jpg'),
  s7: require('../assets/images/stories/s7.jpg'),
  s8: require('../assets/images/stories/s8.jpg'),
  s9: require('../assets/images/stories/s9.jpg'),
  s10: require('../assets/images/stories/s10.jpg'),
  s11: require('../assets/images/stories/s11.jpg'),
  s12: require('../assets/images/stories/s12.jpg'),
  s13: require('../assets/images/stories/s13.jpg'),
  s14: require('../assets/images/stories/s14.jpg'),
  s15: require('../assets/images/stories/s15.jpg'),
};

export const DEFAULT_STORY_IMAGE: ImageSource = require('../assets/images/story-placeholder.png');
export const DEVOTIONAL_IMAGE: ImageSource = require('../assets/images/devotional.jpg');

export function storyImage(storyId: string): ImageSource {
  return STORY_IMAGES[storyId] ?? DEFAULT_STORY_IMAGE;
}
