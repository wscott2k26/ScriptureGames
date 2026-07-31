from pathlib import Path

path = Path("frontend/app/(tabs)/bible.tsx")
text = path.read_text(encoding="utf-8")

if "import * as Speech from 'expo-speech';" in text:
    print("Offline Bible narration is already present.")
    raise SystemExit(0)

replacements = [
    (
        "import { useCallback, useMemo, useRef, useState } from 'react';",
        "import { useCallback, useEffect, useMemo, useRef, useState } from 'react';",
        "React useEffect import",
    ),
    (
        "import { Ionicons } from '@expo/vector-icons';\n",
        "import { Ionicons } from '@expo/vector-icons';\nimport * as Speech from 'expo-speech';\n",
        "Expo Speech import",
    ),
    (
        "  const [saving, setSaving] = useState(false);",
        "  const [saving, setSaving] = useState(false);\n  const [speakingChapter, setSpeakingChapter] = useState(false);",
        "chapter narration state",
    ),
    (
        "  useFocusEffect(useCallback(() => { void load(); }, [load]));\n\n  const book =",
        "  useFocusEffect(useCallback(() => { void load(); }, [load]));\n  useEffect(() => () => { void Speech.stop(); }, []);\n\n  const book =",
        "narration cleanup",
    ),
    (
        "    if (!profile) return;\n    const nextBook = getBibleBook(location.bookId);",
        "    if (!profile) return;\n    await Speech.stop();\n    setSpeakingChapter(false);\n    const nextBook = getBibleBook(location.bookId);",
        "stop narration on navigation",
    ),
]

for old, new, label in replacements:
    if old not in text:
        raise SystemExit(f"Could not locate {label}; refusing a partial patch.")
    text = text.replace(old, new, 1)

share_block = """  const shareVerse = async (verse: number, text: string) => {
    if (!book) return;
    await Share.share({
      title: `${book.name} ${chapter}:${verse}`,
      message: `“${text}”\\n— ${book.name} ${chapter}:${verse} (WEB)`,
    });
  };
"""

narration_block = share_block + """
  const toggleChapterNarration = async () => {
    if (!book || !verses.length) return;
    if (speakingChapter) {
      await Speech.stop();
      setSpeakingChapter(false);
      return;
    }

    const voices = await Speech.getAvailableVoicesAsync().catch(() => []);
    const voice = voices.find((item) => item.language.toLowerCase().startsWith('en') && String(item.quality).toLowerCase().includes('enhanced'))
      || voices.find((item) => item.language.toLowerCase().startsWith('en'));
    const pieces = verses.map(([number, verseText]) => `${number}. ${verseText}`);
    const chunks: string[] = [];
    let current = '';

    for (const piece of pieces) {
      if (`${current} ${piece}`.length > 2800 && current) {
        chunks.push(current.trim());
        current = piece;
      } else {
        current = `${current} ${piece}`;
      }
    }
    if (current.trim()) chunks.push(current.trim());

    setSpeakingChapter(true);
    Speech.speak(`${book.name}, chapter ${chapter}.`, {
      language: 'en-US',
      voice: voice?.identifier,
      rate: 0.91,
      pitch: 1,
    });
    chunks.forEach((chunk, index) => {
      const last = index === chunks.length - 1;
      Speech.speak(chunk, {
        language: 'en-US',
        voice: voice?.identifier,
        rate: 0.91,
        pitch: 1,
        onDone: last ? () => setSpeakingChapter(false) : undefined,
        onStopped: last ? () => setSpeakingChapter(false) : undefined,
        onError: () => setSpeakingChapter(false),
      });
    });
  };
"""

if share_block not in text:
    raise SystemExit("Could not locate verse sharing block; refusing a partial patch.")
text = text.replace(share_block, narration_block, 1)

books_button = """              <Pressable accessibilityRole="button" accessibilityLabel="Choose a Bible book" onPress={() => setShowBooks((value) => !value)} style={styles.toolChip}>
                <Ionicons name="library" size={16} color={colors.brand} />
                <Text style={styles.toolText}>Books</Text>
              </Pressable>
"""

listen_button = books_button + """              <Pressable accessibilityRole="button" accessibilityLabel={`${speakingChapter ? 'Stop' : 'Listen to'} ${book.name} chapter ${chapter}`} onPress={() => void toggleChapterNarration()} style={[styles.toolChip, speakingChapter && { borderColor: colors.brand }]}>
                <Ionicons name={speakingChapter ? 'stop' : 'volume-high'} size={16} color={colors.brand} />
                <Text style={styles.toolText}>{speakingChapter ? 'Stop Audio' : 'Listen'}</Text>
              </Pressable>
"""

if books_button not in text:
    raise SystemExit("Could not locate Bible book tool; refusing a partial patch.")
text = text.replace(books_button, listen_button, 1)

focus_reference = "<Text style={styles.focusReference}>{book.name} {chapter}:{selectedVerse[0]}</Text>"
if focus_reference not in text:
    raise SystemExit("Could not locate focused verse reference; refusing a partial patch.")
text = text.replace(focus_reference, "<Text style={styles.focusReference}>{currentReference}</Text>", 1)

path.write_text(text, encoding="utf-8")
print("Added offline Bible chapter narration with Enhanced device voice preference.")
