import {
  useCallback,
  useEffect,
  useRef,
  useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { TactilePressable as Pressable } from '@/src/components/premium/TactilePressable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/src/api';
import { useProfile } from '@/src/profile-context';
import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';
import { CinematicBackdrop } from '@/src/components/premium/CinematicBackdrop';
import { GlassPanel } from '@/src/components/premium/GlassPanel';
import { ScreenHeader } from '@/src/components/premium/ScreenHeader';
import { AnimatedMascot } from '@/src/components/AnimatedMascot';
import { colors, radii, spacing } from '@/src/theme';
import { sfx } from '@/src/sfx';

type Msg = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS_KIDS = ['Who was Noah?', 'What is prayer?', 'Tell me about Jesus', 'Why did God make people?'];
const SUGGESTIONS_ADULT = ['What does John 3:16 mean?', 'How do I read the Bible daily?', 'Explain grace in one paragraph', 'What is the Sermon on the Mount?'];

export default function CompanionScreen() {
  const { profile } = useProfile();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionId = profile ? `chat-${profile.id}` : 'chat-guest';
  const scrollRef = useRef<any>(null);

  const greeting = useCallback((): Msg => ({
    role: 'assistant',
    content: profile?.mode === 'kids'
      ? `Hi ${profile?.name}! I’m Lumi, your Bible companion. Ask about a person, story, verse, or prayer. 🕊️`
      : `Hello ${profile?.name}. I’m Lumi. Bring a Scripture passage, doctrine, prayer, or life question you want to explore carefully.`,
  }), [profile?.mode, profile?.name]);

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
      setMessages((current) => [...current, { role: 'assistant', content: response.reply }]);
      sfx.correct();
    } catch {
      setError('Lumi could not answer this time. Your saved conversation remains on this device.');
      setMessages((current) => [...current, { role: 'assistant', content: 'I could not complete that response. Please try again in a moment.' }]);
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [profile, sending, sessionId]);

  const clearConversation = () => {
    Alert.alert('Clear this conversation?', 'This removes Lumi’s saved chat history for this player from this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear Chat', style: 'destructive', onPress: async () => {
          await api.clearChat(sessionId);
          setMessages([greeting()]);
          setError(null);
        },
      },
    ]);
  };

  if (!profile) return null;
  const suggestions = profile.mode === 'kids' ? SUGGESTIONS_KIDS : SUGGESTIONS_ADULT;

  return (
    <CinematicBackdrop source={GENESIS_BACKGROUNDS['trial-03']} darkness={0.73}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader
          eyebrow="SCRIPTURE COMPANION"
          title="Lumi"
          subtitle="General Bible guidance with clear safety and privacy boundaries."
          right={
            <Pressable accessibilityRole="button" accessibilityLabel="Clear conversation" hitSlop={10} onPress={clearConversation}>
              <GlassPanel style={styles.clearButton}><Ionicons name="trash-outline" size={19} color={colors.muted} /></GlassPanel>
            </Pressable>
          }
        />

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={76}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.chat}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            <GlassPanel strong style={styles.identityCard}>
              <View style={styles.mascot}><AnimatedMascot size={42} emoji="🕊️" glow /></View>
              <View style={styles.identityCopy}>
                <Text style={styles.identityTitle}>Lumi · Local Bible Companion</Text>
                <Text style={styles.identityText}>Your conversation is stored locally in this beta. Lumi may make mistakes and should not replace a trusted adult, pastor, counselor, qualified professional, or emergency service.</Text>
              </View>
            </GlassPanel>

            {restoring ? <GlassPanel style={styles.restore}><ActivityIndicator color={colors.brand} /><Text style={styles.restoreText}>Restoring your conversation…</Text></GlassPanel> : null}

            {!restoring && messages.map((message, index) => (
              <View key={`${index}-${message.content.slice(0, 12)}`} testID={`msg-${index}`} style={[styles.messageRow, message.role === 'user' && styles.messageRowUser]}>
                {message.role === 'assistant' ? <Text style={styles.smallAvatar}>🕊️</Text> : null}
                <GlassPanel strong={message.role === 'assistant'} style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.botBubble]}>
                  <Text style={[styles.messageText, message.role === 'user' && styles.userText]}>{message.content}</Text>
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

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>

          <GlassPanel strong style={styles.composer}>
            <TextInput
              testID="chat-input"
              value={input}
              onChangeText={setInput}
              placeholder="Ask Lumi about Scripture…"
              placeholderTextColor={colors.muted}
              style={styles.input}
              multiline
              maxLength={1000}
              returnKeyType="send"
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
  chat: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  identityCard: { borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  mascot: { width: 60, height: 60, borderRadius: 20, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(232,185,87,0.11)', alignItems: 'center', justifyContent: 'center' },
  identityCopy: { flex: 1 },
  identityTitle: { color: colors.onSurface, fontSize: 14, fontWeight: '900' },
  identityText: { color: colors.muted, fontSize: 10.5, lineHeight: 15, marginTop: 3 },
  restore: { minHeight: 72, borderRadius: radii.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  restoreText: { color: colors.muted, fontWeight: '800', fontSize: 12 },
  messageRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end', maxWidth: '91%' },
  messageRowUser: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  smallAvatar: { fontSize: 19, marginBottom: 4 },
  bubble: { maxWidth: '100%', borderRadius: radii.lg, padding: spacing.md },
  botBubble: { borderBottomLeftRadius: 5 },
  userBubble: { backgroundColor: 'rgba(232,185,87,0.92)', borderColor: 'rgba(255,235,179,0.72)', borderBottomRightRadius: 5 },
  messageText: { color: colors.onSurface, fontSize: 14.5, lineHeight: 21 },
  userText: { color: colors.onBrand, fontWeight: '700' },
  typing: { borderRadius: radii.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  typingText: { color: colors.muted, fontSize: 11.5, fontWeight: '800' },
  suggestions: { gap: spacing.sm, marginTop: spacing.sm },
  suggestionTitle: { color: colors.parchment, fontSize: 13, fontWeight: '900' },
  suggestionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  suggestionChip: { borderRadius: radii.pill, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(232,185,87,0.10)', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  suggestionText: { color: colors.onBrandTertiary, fontSize: 12, fontWeight: '800' },
  error: { color: colors.error, textAlign: 'center', fontSize: 12, fontWeight: '800' },
  composer: { borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 0, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  input: { flex: 1, minHeight: 45, maxHeight: 110, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(4,8,16,0.72)', color: colors.onSurface, paddingHorizontal: spacing.md, paddingVertical: 11, fontSize: 14 },
  sendButton: { width: 46, height: 46, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 8 },
  sendDisabled: { opacity: 0.4 },
});
