import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useProfile } from '@/src/profile-context';
import { usePreferences } from '@/src/preferences-context';
import {
  DEFAULT_PEACEFUL_SCENE_ID,
  getPeacefulScene,
  resolveRotatingSceneId,
  type PeacefulScene,
} from '@/src/backgrounds/peaceful-scenes';

type Props = {
  children: ReactNode;
  sceneId?: string;
  darkness?: number;
  style?: StyleProp<ViewStyle>;
};

type PreviewProps = {
  scene: PeacefulScene;
  style?: StyleProp<ViewStyle>;
};

function SceneArt({ scene }: { scene: PeacefulScene }) {
  const showWater = scene.silhouette === 'water';
  const showMountains = scene.silhouette === 'mountains' || scene.silhouette === 'desert';
  const showGarden = scene.silhouette === 'garden' || scene.silhouette === 'forest' || scene.silhouette === 'fields';
  const showCity = scene.silhouette === 'city' || scene.silhouette === 'bethlehem';
  const showCross = scene.silhouette === 'cross-hill';
  const showChapel = scene.silhouette === 'chapel' || scene.silhouette === 'sanctuary';
  const showTomb = scene.silhouette === 'tomb';

  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
      <View style={[styles.sun, { backgroundColor: scene.accent, shadowColor: scene.accent }]} />
      <View style={styles.cloudOne} />
      <View style={styles.cloudTwo} />

      {showMountains ? (
        <>
          <View style={[styles.mountainBack, { borderBottomColor: 'rgba(29,42,54,0.52)' }]} />
          <View style={[styles.mountainFront, { borderBottomColor: 'rgba(18,31,38,0.75)' }]} />
        </>
      ) : null}

      {showWater ? (
        <View style={styles.waterWrap}>
          <View style={styles.waterLine} />
          <View style={[styles.waterLine, styles.waterLineTwo]} />
          <View style={[styles.waterLine, styles.waterLineThree]} />
        </View>
      ) : null}

      {showGarden ? (
        <>
          <View style={styles.treeOne}><View style={styles.treeCrown} /></View>
          <View style={styles.treeTwo}><View style={styles.treeCrownSmall} /></View>
          <View style={styles.path} />
        </>
      ) : null}

      {showCity ? (
        <View style={styles.cityRow}>
          <View style={styles.cityTall} />
          <View style={styles.cityShort} />
          <View style={styles.cityDome} />
          <View style={styles.cityMedium} />
          {scene.silhouette === 'bethlehem' ? <View style={[styles.star, { backgroundColor: scene.accent }]} /> : null}
        </View>
      ) : null}

      {showChapel ? (
        <View style={styles.chapel}>
          <View style={styles.chapelRoof} />
          <View style={styles.chapelDoor} />
          <View style={styles.chapelCrossVertical} />
          <View style={styles.chapelCrossHorizontal} />
        </View>
      ) : null}

      {showTomb ? (
        <View style={styles.tomb}>
          <View style={styles.tombOpening} />
          <View style={styles.rolledStone} />
        </View>
      ) : null}

      <View style={styles.hillBack} />
      <View style={styles.hillFront} />

      {showCross ? (
        <View style={styles.crossWrap}>
          <View style={styles.crossVertical} />
          <View style={styles.crossHorizontal} />
        </View>
      ) : null}
    </View>
  );
}

export function PeacefulScenePreview({ scene, style }: PreviewProps) {
  return (
    <View accessibilityLabel={scene.accessibilityLabel} style={[styles.preview, style]}>
      <LinearGradient colors={scene.colors as [string, string, string]} style={StyleSheet.absoluteFill} />
      <SceneArt scene={scene} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(4,8,15,${Math.min(0.35, scene.darkness * 0.45)})` }]} />
    </View>
  );
}

export function PeacefulBackdrop({ children, sceneId, darkness, style }: Props) {
  const { profile } = useProfile();
  const { preferences } = usePreferences();
  const hasPremium = Boolean(profile?.is_premium);
  const resolvedId = sceneId || resolveRotatingSceneId(
    preferences.backgroundId,
    preferences.backgroundRotationEnabled,
    preferences.favoriteBackgroundIds,
    hasPremium,
  );
  const selected = getPeacefulScene(resolvedId);
  const safeScene = selected && (selected.access === 'free' || hasPremium)
    ? selected
    : getPeacefulScene(DEFAULT_PEACEFUL_SCENE_ID)!;
  const overlay = darkness ?? safeScene.darkness;

  return (
    <View style={[styles.root, style]}>
      <LinearGradient colors={safeScene.colors as [string, string, string]} style={StyleSheet.absoluteFill} />
      <SceneArt scene={safeScene} />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(3,7,14,${overlay})` }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden', backgroundColor: '#07111F' },
  preview: { minHeight: 118, borderRadius: 20, overflow: 'hidden', backgroundColor: '#07111F' },
  sun: { position: 'absolute', width: 76, height: 76, borderRadius: 99, right: '14%', top: '12%', opacity: 0.82, shadowOpacity: 0.48, shadowRadius: 28, shadowOffset: { width: 0, height: 0 } },
  cloudOne: { position: 'absolute', width: 150, height: 28, borderRadius: 99, left: '-2%', top: '17%', backgroundColor: 'rgba(255,255,255,0.13)', transform: [{ rotate: '-4deg' }] },
  cloudTwo: { position: 'absolute', width: 116, height: 22, borderRadius: 99, right: '2%', top: '30%', backgroundColor: 'rgba(255,255,255,0.10)', transform: [{ rotate: '3deg' }] },
  hillBack: { position: 'absolute', width: '130%', height: '45%', left: '-35%', bottom: '-18%', borderRadius: 999, backgroundColor: 'rgba(25,54,49,0.52)', transform: [{ rotate: '5deg' }] },
  hillFront: { position: 'absolute', width: '130%', height: '42%', right: '-48%', bottom: '-15%', borderRadius: 999, backgroundColor: 'rgba(15,34,37,0.78)', transform: [{ rotate: '-4deg' }] },
  crossWrap: { position: 'absolute', left: '47%', bottom: '24%', width: 52, height: 105 },
  crossVertical: { position: 'absolute', left: 22, width: 9, height: 105, borderRadius: 3, backgroundColor: 'rgba(23,18,17,0.92)' },
  crossHorizontal: { position: 'absolute', top: 24, left: 2, width: 49, height: 8, borderRadius: 3, backgroundColor: 'rgba(23,18,17,0.92)' },
  mountainBack: { position: 'absolute', bottom: '13%', left: '-8%', width: 0, height: 0, borderLeftWidth: 170, borderRightWidth: 170, borderBottomWidth: 210, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  mountainFront: { position: 'absolute', bottom: '5%', right: '-18%', width: 0, height: 0, borderLeftWidth: 205, borderRightWidth: 205, borderBottomWidth: 250, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  waterWrap: { position: 'absolute', left: 0, right: 0, bottom: '11%', height: '28%', backgroundColor: 'rgba(30,91,116,0.26)' },
  waterLine: { position: 'absolute', left: '8%', right: '12%', top: '24%', height: 2, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.25)' },
  waterLineTwo: { left: '25%', right: '4%', top: '49%', opacity: 0.65 },
  waterLineThree: { left: '3%', right: '37%', top: '72%', opacity: 0.42 },
  treeOne: { position: 'absolute', left: '14%', bottom: '18%', width: 13, height: 95, backgroundColor: 'rgba(35,39,27,0.86)', borderRadius: 7 },
  treeTwo: { position: 'absolute', right: '17%', bottom: '16%', width: 11, height: 76, backgroundColor: 'rgba(31,38,27,0.82)', borderRadius: 7 },
  treeCrown: { position: 'absolute', width: 76, height: 62, borderRadius: 99, left: -31, top: -35, backgroundColor: 'rgba(35,70,48,0.76)' },
  treeCrownSmall: { position: 'absolute', width: 62, height: 50, borderRadius: 99, left: -26, top: -28, backgroundColor: 'rgba(42,78,52,0.72)' },
  path: { position: 'absolute', width: '18%', height: '44%', left: '41%', bottom: '-7%', borderRadius: 999, backgroundColor: 'rgba(222,197,144,0.23)', transform: [{ perspective: 300 }, { rotateX: '56deg' }] },
  cityRow: { position: 'absolute', left: '12%', right: '12%', bottom: '18%', height: 115, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 7 },
  cityTall: { width: 38, height: 92, backgroundColor: 'rgba(53,43,35,0.82)', borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  cityShort: { width: 49, height: 56, backgroundColor: 'rgba(63,49,38,0.8)', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  cityMedium: { width: 43, height: 70, backgroundColor: 'rgba(48,41,36,0.84)', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  cityDome: { width: 54, height: 68, borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: 'rgba(70,54,39,0.82)' },
  star: { position: 'absolute', right: '17%', top: -26, width: 9, height: 9, borderRadius: 99, shadowColor: '#FFFFFF', shadowOpacity: 0.9, shadowRadius: 16 },
  chapel: { position: 'absolute', left: '38%', bottom: '19%', width: 105, height: 91, backgroundColor: 'rgba(42,38,35,0.85)', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  chapelRoof: { position: 'absolute', top: -42, left: -16, width: 0, height: 0, borderLeftWidth: 68, borderRightWidth: 68, borderBottomWidth: 48, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: 'rgba(35,31,30,0.9)' },
  chapelDoor: { position: 'absolute', width: 28, height: 45, left: 39, bottom: 0, borderTopLeftRadius: 14, borderTopRightRadius: 14, backgroundColor: 'rgba(12,16,20,0.72)' },
  chapelCrossVertical: { position: 'absolute', width: 5, height: 31, left: 51, top: -72, backgroundColor: 'rgba(30,25,24,0.95)' },
  chapelCrossHorizontal: { position: 'absolute', width: 21, height: 5, left: 43, top: -62, backgroundColor: 'rgba(30,25,24,0.95)' },
  tomb: { position: 'absolute', left: '31%', bottom: '18%', width: 155, height: 86, borderTopLeftRadius: 70, borderTopRightRadius: 70, backgroundColor: 'rgba(53,55,47,0.76)' },
  tombOpening: { position: 'absolute', width: 54, height: 66, left: 51, bottom: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: 'rgba(9,14,16,0.86)' },
  rolledStone: { position: 'absolute', width: 55, height: 55, borderRadius: 99, right: -28, bottom: -3, backgroundColor: 'rgba(76,75,65,0.86)' },
});
