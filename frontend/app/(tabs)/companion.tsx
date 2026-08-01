import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { useSpeechRecognitionEvent } from 'expo-speech-recognition';

import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { api } from '@/src/api';
import { useProfile } from '@/src/profile-context';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { AnimatedMascot } from '@/src/components/AnimatedMascot';
import { colors, radii, spacing } from '@/src/theme';
import { sfx } from '@/src/sfx';
import {
  abortLumiListening,
  finishLumiListening,
  startLumiListening,
  stopLumiListening,
} from '@/src/lumi-voice';

type Msg = { role: 'user' | 'assistant'; content: string };

const VOICE_PREF_KEY = 'scripture_games_lumi_voice_replies_v1';
const SUGGESTIONS_KIDS = ['Who was Noah?', 'What is prayer?', 'Tell me about Jesus', 'Why did God make people?'];
const SUGGESTIONS_ADULT = ['What does John 3:16 mean?', 'How do I read the Bible daily?', 'Explain grace in one paragraph', 'What is the Sermon on the Mount?'];
const CONTEXT_WORDS = ['Genesis', 'Exodus', 'Psalms', 'Proverbs', 'Matthew', 'Mark', 'Luke', 'John', 'Romans', 'Jesus', 'Yahweh', 'Scripture'];

export default function CompanionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const [voiceStarting, setVoiceStarting] = useState(false);
  const [voiceReplies, setVoiceReplies] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const sessionId = profile ? `chat-${profile.id}` : 'chat-guest';
  const scrollRef = useRef<ScrollView | null>(null);
  const enhancedVoiceRef = useRef<string | undefined>(undefined);

  useSpeechRecognitionEvent('start', () => {
    setVoiceStarting(false);
    setRecognizing(true);
    setError(null);
  });
  useSpeechRecognitionEvent('end', () => {
    setVoiceStarting(false);
    setRecognizing(false);
    void finishLumiListening();
  });
  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript?.trim();
    if (transcript) setInput(transcript.slice(0, 1000));
  });
  useSpeechRecognitionEvent('error', (event) => {
    setVoiceStarting(false);
    setRecognizing(false);
    void finishLumiListening();
    if (event.error !== 'aborted' && event.error !== 'no-speech') {
      setError(event.error === 'not-allowed'
        ? 'Microphone and speech-recognition permission are required for press-to-talk. Typed chat still works.'
        : 'Voice input could not hear that clearly. You can try again or type your question.');
    }
  });

  const greeting = useCallback((): Msg => ({
    role: 'assistant',
    content: profile?.mode === 'kids'
      ? `Hi ${profile?.name}! I’m Lumi, your Bible companion. Type a question or tap the microphone to talk with me. 🕊️`
      : `Hello ${profile?.name}. I’m Lumi. Type a Scripture, doctrine, prayer, or life question—or tap the microphone to speak.`,
  }), [profile?.mode, profile?.name]);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(VOICE_PREF_KEY)
      .then((value) => setVoiceReplies(value === 'true'))
      .catch(() => undefined);
    Speech.getAvailableVoicesAsync()
      .then((voices) => {
        const enhanced = voices.find((voice) => voice.language.toLowerCase().startsWith('en') && String(voice.quality).toLowerCase().includes('enhanced'))
          || voices.find((voice) => voice.language.toLowerCase().startsWith('en'));
        enhancedVoiceRef.current = enhanced?.identifier;
      })
      .catch(() => undefined);
    return () => {
      void Speech.stop();
      void abortLumiListening();
    };
  }, []);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    setRestoring(true);
    api.chatHistory(sessionId)
      .then((history) => {
        if (!active) return;
        const restored = (history.messages || []).map((message: Msg) => ({ role: message.role, content: message.content }));
        setMessages(restored.length ? restored : [greeting()]);
      })
      .catch(() => {
        if (active) setMessages([greeting()]);
      })
      .finally(() => {
        if (active) setRestoring(false);
      });
    return () => { active = false; };
  }, [greeting, profile, sessionId]);

  const speak = useCallback(async (text: string, index: number) => {
    await Speech.stop();
    if (speakingIndex === index) {
      setSpeakingIndex(null);
      return;
    }
    setSpeakingIndex(index);
    Speech.speak(text, {
      language: 'en-US',
      voice: enhancedVoiceRef.current,
      rate: 0.92,
      pitch: 1,
      volume: 1,
      onDone: () => setSpeakingIndex(null),
      onStopped: () => setSpeakingIndex(null),
      onError: () => {
        setSpeakingIndex(null);
        setError('The device voice could not play that response. The written answer is still available.');
      },
    });
  }, [speakingIndex]);

  const send = useCallback(async (text: string) => {
    if (!profile || !text.trim() || sending) return;
    const clean = text.trim().slice(0, 1000);
    setMessages((current) => [...current, { role: 'user', content: clean }]);
    setInput('');
    setSending(true);
    setError(null);
    sfx.press();
    try {
      const response = await api.chat(profile.id, sessionId, clean, profile.mode);
      let responseIndex = 0;
      setMessages((current) => {
        responseIndex = current.length;
        return [...current, { role: 'assistant', content: response.reply }];
      });
      sfx.correct();
      if (voiceReplies) await speak(response.reply, responseIndex);
    } catch {
      setError('Lumi could not answer this time. Your saved conversation remains on this device.');
      setMessages((current) => [...current, { role: 'assistant', content: 'I could not complete that response. Please try again in a moment.' }]);
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [profile, sending, sessionId, speak, voiceReplies]);

  const toggleVoiceReplies = async () => {
    const next = !voiceReplies;
    setVoiceReplies(next);
    await AsyncStorage.setItem(VOICE_PREF_KEY, String(next));
    if (!next) {
      await Speech.stop();
      setSpeakingIndex(null);
    }
  };

  const toggleListening = async () => {
    if (recognizing || voiceStarting) {
      await stopLumiListening();
      return;
    }

    await Speech.stop();
    setSpeakingIndex(null);
    setVoiceStarting(true);
    setError(null);

    const result = await startLumiListening({
      lang: 'en-US',
      interimResults: true,
      continuous: false,
      addsPunctuation: true,
      maxAlternatives: 1,
      contextualStrings: CONTEXT_WORDS,
      iosTaskHint: 'dictation',
    });

    if (!result.ok) {
      setVoiceStarting(false);
      setRecognizing(false);
      if (result.reason === 'unavailable') {
        setError('Speech recognition is unavailable on this device. Typed chat still works normally.');
      } else if (result.reason === 'permission-denied') {
        setError('Microphone and speech-recognition permission were not granted. Typed chat still works normally.');
      } else if (result.reason === 'start-failed') {
        setError('The microphone could not start safely. Typed chat still works, and no audio was saved.');
      }
    }
  };

  const clearConversation = () => {
    Alert.alert('Clear this conversation?', 'This removes Lumi’s saved chat history for this player from this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear Chat', style: 'destructive', onPress: async () => {
          await Speech.stop();
          await abortLumiListening();
          await api.clearChat(sessionId);
          setMessages([greeting()]);
          setSpeakingIndex(null);
          setVoiceStarting(false);
          setRecognizing(false);
          setError(null);
        },
      },
    ]);
  };

  if (!profile) return null;
  const suggestions = profile.mode === 'kids' ? SUGGESTIONS_KIDS : SUGGESTIONS_ADULT;
  const composerBottom = keyboardOpen ? Math.max(insets.bottom, 6) : 86 + insets.bottom;
  const voiceBusy = recognizing || voiceStarting;

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-03']} darkness={0.73}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader
          eyebrow="SCRIPTURE COMPANION"
          title="Lumi"
          subtitle="Type or talk. Hear replies in an enhanced device voice."
          right={
            <Pressable accessibilityRole="button" accessibilityLabel="Clear conversation" hitSlop={10} onPress={clearConversation}>
              <GlassPanel style={styles.clearButton}><Ionicons name="trash-outline" size={19} color={colors.muted} /></GlassPanel>
            </Pressable>
          }
        />

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.chat}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            <GlassPanel strong style={styles.identityCard}>
              <View style={styles.mascot}><AnimatedMascot size={42} emoji="🕊️" glow /></View>
              <View style={styles.identityCopy}>
                <Text style={styles.identityTitle}>Lumi · Private Bible Companion</Text>
                <Text style={styles.identityText}>Chat history stays with this player. Lumi may make mistakes and should not replace a trusted adult, pastor, counselor, qualified professional, or emergency service.</Text>
                <Pressable accessibilityRole="switch" accessibilityState={{ checked: voiceReplies }} onPress={() => void toggleVoiceReplies()} style={[styles.voiceToggle, voiceReplies && styles.voiceToggleOn]}>
                  <Ionicons name={voiceReplies ? 'volume-high' : 'volume-mute'} size={16} color={voiceReplies ? colors.onBrand : colors.muted} />
                  <Text style={[styles.voiceToggleText, voiceReplies && styles.voiceToggleTextOn]}>{voiceReplies ? 'Voice replies on' : 'Voice replies off'}</Text>
                </Pressable>
              </View>
            </GlassPanel>

            <GlassPanel style={styles.toolsCard}>
              <Text style={styles.toolsTitle}>Go deeper with Lumi</Text>
              <View style={styles.toolsRow}>
                <Pressable accessibilityRole="button" onPress={() => router.push('/faith-journeys')} style={styles.toolButton}>
                  <Text style={styles.toolIcon}>🧭</Text>
                  <View style={styles.toolCopy}><Text style={styles.toolTitle}>Faith Journeys</Text><Text style={styles.toolText}>Guided plans</Text></View>
                  <Ionicons name="chevron-forward" size={17} color={colors.brand} />
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => router.push('/prayer-garden')} style={styles.toolButton}>
                  <Text style={styles.toolIcon}>🌿</Text>
                  <View style={styles.toolCopy}><Text style={styles.toolTitle}>Prayer Garden</Text><Text style={styles.toolText}>Private requests</Text></View>
                  <Ionicons name="chevron-forward" size={17} color={colors.success} />
                </Pressable>
              </View>
            </GlassPanel>

            {restoring ? <GlassPanel style={styles.restore}><ActivityIndicator color={colors.brand} /><Text style={styles.restoreText}>Restoring your conversation…</Text></GlassPanel> : null}

            {!restoring && messages.map((message, index) => (
              <View key={`${index}-${message.content.slice(0, 12)}`} testID={`msg-${index}`} style={[styles.messageRow, message.role === 'user' && styles.messageRowUser]}>
                {message.role === 'assistant' ? <Text style={styles.smallAvatar}>🕊️</Text> : null}
                <GlassPanel strong={message.role === 'assistant'} style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.botBubble]}>
                  <Text style={[styles.messageText, message.role === 'user' && styles.userText]}>{message.content}</Text>
                  {message.role === 'assistant' ? (
                    <Pressable accessibilityRole="button" accessibilityLabel={speakingIndex === index ? 'Stop spoken reply' : 'Read reply aloud'} onPress={() => void speak(message.content, index)} style={styles.bubbleVoice}>
                      <Ionicons name={speakingIndex === index ? 'stop' : 'volume-medium'} size={16} color={colors.brand} />
                      <Text style={styles.bubbleVoiceText}>{speakingIndex === index ? 'Stop' : 'Listen'}</Text>
                    </Pressable>
                  ) : null}
                </GlassPanel>
              </View>
            ))}

            {sending ? (
              <View style={styles.messageRow} testID="typing-indicator">
                <Text style={styles.smallAvatar}>🕊️</Text>
                <GlassPanel style={styles.typing}><ActivityIndicator size="small" color={colors.brand} /><Text style={styles.typingText}>Lumi is considering the passage…</Text></GlassPanel>
              </View>
            ) : null}

            {messages.length <= 1 && !restoring ? (
              <View style={styles.suggestions}>
                <Text style={styles.suggestionTitle}>Try a starting question</Text>
                <View style={styles.suggestionGrid}>
                  {suggestions.map((suggestion) => (
                    <Pressable key={suggestion} testID={`suggestion-${suggestion.slice(0, 8)}`} accessibilityRole="button" onPress={() => void send(suggestion)} style={styles.suggestionChip}>
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            {voiceStarting ? (
              <GlassPanel style={styles.listeningBanner}>
                <ActivityIndicator size="small" color={colors.brand} />
                <Text style={styles.listeningText}>Preparing the microphone safely…</Text>
              </GlassPanel>
            ) : null}
            {recognizing ? (
              <GlassPanel style={styles.listeningBanner}>
                <View style={styles.listeningDot} />
                <Text style={styles.listeningText}>Listening… speak your question, then pause.</Text>
              </GlassPanel>
            ) : null}
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          </ScrollView>

          <GlassPanel strong style={[styles.composer, { marginBottom: composerBottom }]}>
            <Pressable
              testID="voice-input-btn"
              accessibilityRole="button"
              accessibilityLabel={recognizing ? 'Stop voice input' : voiceStarting ? 'Microphone is preparing' : 'Start voice input'}
              disabled={voiceStarting}
              onPress={() => void toggleListening()}
              style={[styles.micButton, recognizing && styles.micButtonLive, voiceStarting && styles.micButtonStarting]}
            >
              {voiceStarting
                ? <ActivityIndicator size="small" color={colors.brand} />
                : <Ionicons name={recognizing ? 'stop' : 'mic'} size={21} color={recognizing ? colors.onBrand : colors.brand} />}
            </Pressable>
            <TextInput
              testID="chat-input"
              value={input}
              onChangeText={setInput}
              placeholder={recognizing ? 'Listening…' : voiceStarting ? 'Preparing microphone…' : 'Type or tap the mic to ask Lumi…'}
              placeholderTextColor={colors.muted}
              style={styles.input}
              multiline
              maxLength={1000}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={() => void send(input)}
            />
            <Pressable
              testID="send-btn"
              accessibilityRole="button"
              accessibilityLabel="Send question"
              disabled={!input.trim() || sending}
              onPress={() => void send(input)}
              style={[styles.sendButton, (!input.trim() || sending) && styles.sendDisabled]}
            >
              <Ionicons name="send" size={19} color={colors.onBrand} />
            </Pressable>
          </GlassPanel>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </CinematicBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  clearButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  chat: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
  identityCard: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  mascot: { width: 60, height: 60, borderRadius: 20, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(232,185,87,0.11)', alignItems: 'center', justifyContent: 'center' },
  identityCopy: { flex: 1 },
  identityTitle: { color: colors.onSurface, fontSize: 14, fontWeight: '900' },
  identityText: { color: colors.muted, fontSize: 10.5, lineHeight: 15, marginTop: 3 },
  voiceToggle: { alignSelf: 'flex-start', marginTop: 8, borderRadius: 99, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.035)' },
  voiceToggleOn: { borderColor: colors.brand, backgroundColor: colors.brand },
  voiceToggleText: { color: colors.muted, fontSize: 10, fontWeight: '900' },
  voiceToggleTextOn: { color: colors.onBrand },
  toolsCard: { borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm },
  toolsTitle: { color: colors.parchment, fontSize: 13, fontWeight: '900' },
  toolsRow: { gap: spacing.sm },
  toolButton: { minHeight: 58, borderRadius: 17, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(4,9,18,0.58)', paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  toolIcon: { fontSize: 23 },
  toolCopy: { flex: 1 },
  toolTitle: { color: colors.onSurface, fontSize: 13.5, fontWeight: '900' },
  toolText: { color: colors.muted, fontSize: 10.5, fontWeight: '800', marginTop: 2 },
  restore: { minHeight: 72, borderRadius: radii.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  restoreText: { color: colors.muted, fontWeight: '800', fontSize: 12 },
  messageRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end', maxWidth: '93%' },
  messageRowUser: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  smallAvatar: { fontSize: 19, marginBottom: 4 },
  bubble: { maxWidth: '100%', borderRadius: radii.lg, padding: spacing.md },
  botBubble: { borderBottomLeftRadius: 5 },
  userBubble: { backgroundColor: 'rgba(232,185,87,0.92)', borderColor: 'rgba(255,235,179,0.72)', borderBottomRightRadius: 5 },
  messageText: { color: colors.onSurface, fontSize: 14.5, lineHeight: 21 },
  userText: { color: colors.onBrand, fontWeight: '700' },
  bubbleVoice: { alignSelf: 'flex-start', marginTop: 9, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: 'rgba(232,185,87,0.1)' },
  bubbleVoiceText: { color: colors.brand, fontSize: 9.5, fontWeight: '900' },
  typing: { borderRadius: radii.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  typingText: { color: colors.muted, fontSize: 11.5, fontWeight: '800' },
  suggestions: { gap: spacing.sm, marginTop: spacing.sm },
  suggestionTitle: { color: colors.parchment, fontSize: 13, fontWeight: '900' },
  suggestionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  suggestionChip: { borderRadius: radii.pill, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(232,185,87,0.10)', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  suggestionText: { color: colors.onBrandTertiary, fontSize: 12, fontWeight: '800' },
  listeningBanner: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderColor: colors.coral },
  listeningDot: { width: 10, height: 10, borderRadius: 99, backgroundColor: colors.coral },
  listeningText: { color: colors.parchment, fontSize: 12, fontWeight: '900' },
  error: { color: colors.error, textAlign: 'center', fontSize: 12, fontWeight: '800' },
  composer: { borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 0, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  micButton: { width: 46, height: 46, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(232,185,87,0.10)' },
  micButtonLive: { backgroundColor: colors.coral, borderColor: colors.coral },
  micButtonStarting: { opacity: 0.72 },
  input: { flex: 1, minHeight: 46, maxHeight: 110, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(4,8,16,0.72)', color: colors.onSurface, paddingHorizontal: spacing.md, paddingVertical: 11, fontSize: 14 },
  sendButton: { width: 46, height: 46, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 8 },
  sendDisabled: { opacity: 0.4 },
});