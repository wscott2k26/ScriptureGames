import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function read(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

function requireMatch(source: string, pattern: RegExp, message: string) {
  if (!pattern.test(source)) {
    throw new Error(message);
  }
}

const quiz = read('app/quiz-play.tsx');
const bible = read('app/(tabs)/bible.tsx');

requireMatch(
  quiz,
  /const openReference = \(\) => \{[\s\S]*?router\.push\(\{ pathname: '\/\(tabs\)\/bible', params: \{ reference: question\.verse, fromQuiz: '1' \} \}\);[\s\S]*?\};/,
  'Quiz feedback must route the exact graded-question reference to the Bible tab.',
);

requireMatch(
  quiz,
  /<Pressable[\s\S]*?testID="quiz-scripture-reference"[\s\S]*?onPress=\{openReference\}[\s\S]*?<Text[^>]*>Source: \{question\.verse\}<\/Text>[\s\S]*?<\/Pressable>/,
  'The visible blue Scripture source itself must be a pressable control wired to openReference.',
);

requireMatch(
  quiz,
  /accessibilityLabel=\{`Open \$\{question\.verse\} in Bible`\}/,
  'The pressable Scripture source must have a descriptive accessibility label.',
);

requireMatch(
  bible,
  /const \{ reference, fromQuiz \} = useLocalSearchParams/,
  'The Bible tab must accept quiz reference and return-route parameters.',
);

requireMatch(
  bible,
  /reference \? parseBibleReference\(String\(reference\)\) : null/,
  'The Bible tab must parse the incoming quiz reference before selecting the passage.',
);

requireMatch(
  bible,
  /fromQuiz === '1'[\s\S]*?onPress=\{\(\) => router\.back\(\)\}/,
  'The Bible tab must preserve a Return to Quiz action for quiz lookups.',
);

console.log('Build 16 Scripture-reference navigation contract passed.');
