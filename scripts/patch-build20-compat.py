from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / 'frontend'


def read(relative: str) -> str:
    return (FRONTEND / relative).read_text(encoding='utf-8')


def write(relative: str, content: str) -> None:
    (FRONTEND / relative).write_text(content, encoding='utf-8')


def head_file(relative: str) -> str:
    return subprocess.check_output(
        ['git', 'show', f'HEAD:frontend/{relative}'],
        cwd=ROOT,
        text=True,
    )


def replace_once(content: str, old: str, new: str, label: str) -> str:
    if old not in content:
        raise RuntimeError(f'Missing compatibility seam: {label}')
    return content.replace(old, new, 1)

# Preserve the explicit Build 15 piano load gate while supporting two additional ambient sources.
audio = read('src/audio-context.tsx')
ambient_loaded_block = """  const ambientLoaded = useMemo<Record<AmbientSound, boolean>>(() => ({
    piano: pianoStatus.isLoaded,
    rain: rainStatus.isLoaded,
    reading: readingStatus.isLoaded,
  }), [pianoStatus.isLoaded, rainStatus.isLoaded, readingStatus.isLoaded]);

"""
audio = replace_once(audio, ambient_loaded_block, '', 'remove generalized ambient load map')
audio = replace_once(
    audio,
    "    if (!readyRef.current || !musicEnabledRef.current || appState.current !== 'active' || !ambientLoaded[sound]) return;",
    """    if (!readyRef.current || !musicEnabledRef.current || appState.current !== 'active') return;
    if (sound === 'piano') {
      if (!pianoStatus.isLoaded) return;
    } else if (sound === 'rain') {
      if (!rainStatus.isLoaded) return;
    } else {
      if (!readingStatus.isLoaded) return;
    }""",
    'explicit ambient load guards',
)
audio = replace_once(
    audio,
    '  }, [ambientLoaded, ambientPlayers]);',
    '  }, [ambientPlayers, pianoStatus.isLoaded, rainStatus.isLoaded, readingStatus.isLoaded]);',
    'ambient callback dependencies',
)
write('src/audio-context.tsx', audio)

# Keep the exact Build 18 quiz screen and resolve legacy references before they enter screen state.
quiz = read('app/quiz-play.tsx')
quiz = replace_once(
    quiz,
    "import { resolveQuizReference } from '@/src/quiz-reference-resolution';",
    "import { withResolvedQuizReference } from '@/src/quiz-reference-resolution';",
    'classic resolver import',
)
quiz = replace_once(
    quiz,
    'type Question = { q: string; options: string[]; answer: number; verse?: string };',
    'type Question = { q: string; options: string[]; answer: number; verse: string };',
    'classic resolved question type',
)
quiz = replace_once(
    quiz,
    '.then((result) => { if (active) setQuestions(result.questions); })',
    '.then((result) => { if (active) setQuestions(result.questions.map(withResolvedQuizReference)); })',
    'classic resolved question loading',
)
quiz = quiz.replace("  const resolvedReference = question ? resolveQuizReference(question.q, question.verse) : '2 Timothy 3:16';\n", '')
quiz = replace_once(
    quiz,
    'reference={resolvedReference}',
    'reference={question.verse}',
    'classic proven ScriptureLink reference',
)
write('app/quiz-play.tsx', quiz)

# Restore the physically proven Build 18 Daily screen verbatim. Resolve legacy references in its generator,
# so every existing question.verse and witnessVerse link remains valid without a second screen-level route.
write('app/daily-challenge.tsx', head_file('app/daily-challenge.tsx'))
daily_core = read('src/daily-challenge.ts')
if "withResolvedQuizReference" not in daily_core:
    daily_core = replace_once(
        daily_core,
        "import { QUIZ_QUESTIONS } from './content.generated';",
        "import { QUIZ_QUESTIONS } from './content.generated';\nimport { withResolvedQuizReference } from './quiz-reference-resolution';",
        'Daily reference resolver import',
    )
    daily_core = replace_once(
        daily_core,
        "    const question = pool[questionSeed % pool.length];\n    return shuffleQuestion({ ...question, topic, options: [...question.options] }, questionSeed + index * 101);",
        """    const question = pool[questionSeed % pool.length];
    const resolved = withResolvedQuizReference({ ...question, topic, options: [...question.options] });
    return shuffleQuestion(resolved, questionSeed + index * 101);""",
        'Daily resolved question generation',
    )
write('src/daily-challenge.ts', daily_core)

# Add chronology to Genesis while retaining the physically proven Build 18 screen and ScriptureLink component.
genesis = read('app/genesis-quiz.tsx')
if "sortSelectedQuizQuestions" not in genesis:
    genesis = replace_once(
        genesis,
        "import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';",
        "import { useReducedMotionPreference } from '@/src/hooks/use-reduced-motion';\nimport { sortSelectedQuizQuestions } from '@/src/quiz-ordering';",
        'Genesis chronology import',
    )
    genesis = replace_once(
        genesis,
        "  const questions = useMemo(() => trial ? shuffle(trial.questions).slice(0, 5).map(prepareQuestion) : [], [trial]);",
        """  const questions = useMemo(() => {
    if (!trial) return [];
    const selected = shuffle(trial.questions).slice(0, 5);
    return sortSelectedQuizQuestions('genesis-season', selected).map(prepareQuestion);
  }, [trial]);""",
        'Genesis chronological selection',
    )
write('app/genesis-quiz.tsx', genesis)

# Align the recovery audit with the resolved-question model used by the proven quiz screen.
audit = read('scripts/audit-book-mastery.ts')
audit = audit.replace(
    "assert.match(classicScreen, /resolveQuizReference/, 'Classic Training must resolve every Scripture reference.');",
    "assert.match(classicScreen, /withResolvedQuizReference/, 'Classic Training must resolve every Scripture reference before rendering.');",
)
write('scripts/audit-book-mastery.ts', audit)

print('Build 18 compatibility seams preserved for piano, Classic, Daily, and Genesis.')
