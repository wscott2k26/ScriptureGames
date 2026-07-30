import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, type TextStyle, type StyleProp } from 'react-native';
import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';
import { usePreferences } from '@/src/preferences-context';
import { TactilePressable } from './TactilePressable';

type Token = { value: string; wordIndex: number | null };

export function WordRevealText({
  text,
  style,
  speed = 48,
  onComplete,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
  speed?: number;
  onComplete?: () => void;
}) {
  const reduced = useReducedMotionPreference();
  const { preferences } = usePreferences();
  const revealImmediately = reduced || !preferences.cinematicTextEnabled;
  const tokens = useMemo<Token[]>(() => {
    let wordIndex = 0;
    return text.split(/(\s+)/).filter(Boolean).map((value) => {
      if (/^\s+$/.test(value)) return { value, wordIndex: null };
      const token = { value, wordIndex };
      wordIndex += 1;
      return token;
    });
  }, [text]);
  const wordCount = useMemo(() => tokens.reduce((total, token) => total + (token.wordIndex === null ? 0 : 1), 0), [tokens]);
  const [visible, setVisible] = useState(revealImmediately ? wordCount : 0);
  const completeRef = useRef(onComplete);
  const didComplete = useRef(false);

  useEffect(() => { completeRef.current = onComplete; }, [onComplete]);

  const complete = () => {
    if (didComplete.current) return;
    didComplete.current = true;
    completeRef.current?.();
  };

  useEffect(() => {
    didComplete.current = false;
    setVisible(revealImmediately ? wordCount : 0);
    if (revealImmediately) {
      complete();
      return;
    }
    const interval = setInterval(() => {
      setVisible((current) => {
        const next = Math.min(wordCount, current + 1);
        if (next >= wordCount) {
          clearInterval(interval);
          complete();
        }
        return next;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [revealImmediately, speed, text, wordCount]);

  const revealAll = () => {
    setVisible(wordCount);
    complete();
  };

  return (
    <TactilePressable
      accessibilityRole="text"
      accessibilityLabel={text}
      accessibilityHint={visible < wordCount ? 'Tap to reveal all text' : undefined}
      onPress={revealAll}
      pressScale={0.998}
      pressDepth={0}
    >
      <Text style={[styles.text, style]}>
        {tokens.map((token, index) => {
          if (token.wordIndex === null) return <Text key={`space-${index}`}>{token.value}</Text>;
          const shown = token.wordIndex < visible;
          const cursor = shown && token.wordIndex === visible - 1 && visible < wordCount;
          return (
            <Text key={`word-${index}`} style={shown ? styles.visible : styles.hidden}>
              {token.value}{cursor ? <Text style={styles.cursor}> ✦</Text> : null}
            </Text>
          );
        })}
      </Text>
    </TactilePressable>
  );
}

const styles = StyleSheet.create({
  text: { color: '#F7F2E7', fontSize: 17, lineHeight: 27 },
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
  cursor: { color: '#E9BC62', fontSize: 12 },
});
