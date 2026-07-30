#!/usr/bin/env python3
"""Static release audit for Scripture Games.

This intentionally avoids network access so it can run before every EAS build.
"""
from __future__ import annotations

import importlib.util
import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"
BACKEND = ROOT / "backend"
FAILURES: list[str] = []
PASSES: list[str] = []


def check(condition: bool, message: str) -> None:
    (PASSES if condition else FAILURES).append(message)


def load_seed() -> Any:
    path = BACKEND / "seed_data.py"
    spec = importlib.util.spec_from_file_location("scripture_games_seed", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def words(text: str) -> int:
    return len(re.findall(r"\b[\w’'-]+\b", text, flags=re.UNICODE))


def audit_content(seed: Any) -> dict[str, int]:
    nodes = seed.JOURNEY_NODES
    topics = seed.QUIZ_QUESTIONS
    verses = seed.VERSES
    stories = seed.STORIES
    puzzles = seed.PUZZLES

    check(len(nodes) == 10, "Journey contains exactly 10 release nodes")
    check([n["id"] for n in nodes] == [f"node-{i}" for i in range(1, 11)], "Journey node IDs are sequential and unique")
    check(len({n["id"] for n in nodes}) == len(nodes), "Journey node IDs are unique")
    check(all(n["kind"] in {"quiz", "story", "verse", "puzzle"} for n in nodes), "Journey node kinds are supported")
    check(all(isinstance(n["xp_reward"], int) and n["xp_reward"] > 0 for n in nodes), "Journey XP rewards are positive integers")

    story_topic_to_id = {"adam_eve": "s15", "joseph": "s14", "daniel": "s3", "noah": "s1", "jonah": "s4"}
    story_ids = {s["id"] for s in stories}
    for node in nodes:
        if node["kind"] == "quiz":
            check(node["topic"] in topics, f"Journey quiz topic exists: {node['topic']}")
        elif node["kind"] == "story":
            check(story_topic_to_id.get(node["topic"]) in story_ids, f"Journey story mapping exists: {node['topic']}")
        elif node["kind"] == "verse":
            check(any(v["id"] == "v13" for v in verses), "Abraham journey verse v13 exists")
        elif node["kind"] == "puzzle":
            check(bool(puzzles), "Journey puzzle content exists")

    total_questions = sum(len(qs) for qs in topics.values())
    check(len(topics) == 15, "Quiz bank contains 15 topics")
    check(total_questions == 168, "Quiz bank contains 168 questions")
    question_texts: list[str] = []
    for topic, questions in topics.items():
        check(len(questions) >= 10, f"Quiz topic has at least 10 questions: {topic}")
        for index, question in enumerate(questions, 1):
            label = f"{topic} question {index}"
            q_text = question.get("q", "").strip()
            options = question.get("options", [])
            answer = question.get("answer")
            question_texts.append(q_text.casefold())
            check(bool(q_text) and re.search(r"[?.][\"'”’]?$", q_text) is not None, f"{label} has complete prompt punctuation")
            check(len(options) == 4, f"{label} has four options")
            check(len({str(o).strip().casefold() for o in options}) == 4, f"{label} options are unique")
            check(isinstance(answer, int) and 0 <= answer < len(options), f"{label} answer index is valid")
            check(question.get("difficulty") in {1, 2, 3}, f"{label} difficulty is 1-3")
            check(not any(token in q_text.lower() for token in ("lorem", "todo", "tbd", "placeholder")), f"{label} has no placeholder text")
    dup_questions = [q for q, count in Counter(question_texts).items() if count > 1]
    check(not dup_questions, "Quiz prompts are unique across all topics")

    expected_verses = {
        "v1": ("John 3:16", "For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life."),
        "v2": ("Psalm 23:1", "Yahweh is my shepherd; I shall lack nothing."),
        "v3": ("Philippians 4:13", "I can do all things through Christ who strengthens me."),
        "v4": ("Proverbs 3:5", "Trust in Yahweh with all your heart, and don’t lean on your own understanding."),
        "v5": ("Matthew 5:9", "Blessed are the peacemakers, for they shall be called children of God."),
        "v6": ("Joshua 1:9", "Haven’t I commanded you? Be strong and courageous. Don’t be afraid. Don’t be dismayed, for Yahweh your God is with you wherever you go."),
        "v7": ("Jeremiah 29:11", "For I know the thoughts that I think toward you, says Yahweh, thoughts of peace, and not of evil, to give you hope and a future."),
        "v8": ("Isaiah 40:31", "But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles. They will run, and not be weary. They will walk, and not faint."),
        "v9": ("Romans 8:28", "We know that all things work together for good for those who love God, for those who are called according to his purpose."),
        "v10": ("1 John 4:19", "We love him, because he first loved us."),
        "v11": ("Psalm 46:10", "Be still, and know that I am God. I will be exalted among the nations. I will be exalted on the earth."),
        "v12": ("Matthew 6:33", "But seek first God’s Kingdom and his righteousness; and all these things will be given to you as well."),
        "v13": ("Genesis 12:2", "I will make of you a great nation. I will bless you and make your name great. You will be a blessing."),
    }
    check(len(verses) == 13, "Verse bank contains 13 memory passages")
    check(len({v["id"] for v in verses}) == len(verses), "Verse IDs are unique")
    check(set(expected_verses) == {v["id"] for v in verses}, "Verse bank matches the approved reference set")
    for verse in verses:
        label = f"Verse {verse['id']}"
        expected_reference, expected_text = expected_verses[verse["id"]]
        check(verse.get("translation") == "WEB Classic", f"{label} is labeled WEB Classic")
        check(verse.get("reference") == expected_reference, f"{label} reference matches the approved passage")
        check(verse.get("text") == expected_text, f"{label} text matches the reviewed WEB Classic wording")
        check(bool(verse.get("reference")), f"{label} has a reference")
        check(len(verse.get("blanks", [])) == 2, f"{label} has two memory blanks")
        check(len(set(verse.get("blanks", []))) == len(verse.get("blanks", [])), f"{label} blanks are unique")
        cursor = -1
        in_order = True
        for blank in verse.get("blanks", []):
            position = verse["text"].find(blank, cursor + 1)
            if position < 0:
                in_order = False
                break
            cursor = position
        check(in_order, f"{label} blanks appear in text order")

    check(len(stories) == 15, "Story library contains 15 stories")
    check({s["id"] for s in stories} == {f"s{i}" for i in range(1, 16)}, "Story IDs cover s1-s15")
    seen_titles: set[str] = set()
    for story in stories:
        label = f"Story {story['id']}"
        check(story["title"].casefold() not in seen_titles, f"{label} title is unique")
        seen_titles.add(story["title"].casefold())
        check(story.get("image") == f"local:{story['id']}", f"{label} uses its bundled image key")
        check(words(story.get("kids_text", "")) >= 200, f"{label} kids text is substantial")
        check(words(story.get("adult_text", "")) >= 250, f"{label} adult text is substantial")
        check(5 <= words(story.get("summary", "")) <= 20, f"{label} summary length is concise")
        combined = f"{story.get('kids_text', '')}\n{story.get('adult_text', '')}"
        check("http://" not in combined and "https://" not in combined, f"{label} has no remote dependency")
        check("**" not in combined and "```" not in combined, f"{label} has no raw Markdown artifacts")
        check(not re.search(r"\b(lorem ipsum|TODO|OBD|placeholder)\b", combined, flags=re.I), f"{label} has no placeholder copy")
        sentences = [re.sub(r"\s+", " ", part).strip() for part in re.split(r"(?<=[.!?])\s+", combined) if part.strip()]
        duplicates = [sentence for sentence, count in Counter(sentences).items() if count > 1 and len(sentence) > 40]
        check(not duplicates, f"{label} has no duplicated long sentences")
        asset = FRONTEND / "assets" / "images" / "stories" / f"{story['id']}.jpg"
        check(asset.is_file() and asset.stat().st_size > 20_000, f"{label} bundled JPG exists")

    check(len(puzzles) == 3, "Word-puzzle library contains 3 sets")
    check(len({p["id"] for p in puzzles}) == len(puzzles), "Puzzle IDs are unique")
    for puzzle in puzzles:
        check(len(puzzle["words"]) >= 4, f"Puzzle {puzzle['id']} has at least four words")
        check(len(set(puzzle["words"])) == len(puzzle["words"]), f"Puzzle {puzzle['id']} words are unique")

    return {
        "journey_nodes": len(nodes),
        "quiz_topics": len(topics),
        "quiz_questions": total_questions,
        "verses": len(verses),
        "stories": len(stories),
        "puzzles": len(puzzles),
    }


def audit_frontend(seed: Any) -> None:
    app_config = json.loads((FRONTEND / "app.json").read_text(encoding="utf-8"))["expo"]
    package = json.loads((FRONTEND / "package.json").read_text(encoding="utf-8"))
    eas = json.loads((FRONTEND / "eas.json").read_text(encoding="utf-8"))

    check(app_config.get("name") == "Scripture Games", "Expo app name is Scripture Games")
    check(app_config.get("slug") == "scripture-games", "Expo slug is production-safe")
    check(app_config.get("owner") == "wscott2k8", "Expo owner matches the connected EAS account")
    check(app_config.get("version") == "1.0.0", "Marketing version is 1.0.0")
    ios = app_config.get("ios", {})
    check(ios.get("bundleIdentifier") == "com.willywill.scripturegames", "iOS bundle identifier is branded")
    check(ios.get("buildNumber") == "1", "iOS build number is set")
    check(ios.get("supportsTablet") is False, "Initial TestFlight scope is iPhone only")
    check(ios.get("infoPlist", {}).get("ITSAppUsesNonExemptEncryption") is False, "Encryption export flag is declared")
    privacy = ios.get("privacyManifests", {})
    check(privacy.get("NSPrivacyTracking") is False, "Privacy manifest declares no tracking")
    check(privacy.get("NSPrivacyCollectedDataTypes") == [], "Privacy manifest declares no collected data in local-first mode")
    reasons = privacy.get("NSPrivacyAccessedAPITypes", [])
    check(any(item.get("NSPrivacyAccessedAPIType") == "NSPrivacyAccessedAPICategoryUserDefaults" and "CA92.1" in item.get("NSPrivacyAccessedAPITypeReasons", []) for item in reasons), "Privacy manifest includes UserDefaults reason CA92.1")

    check("production" in eas.get("build", {}), "EAS production build profile exists")
    check(eas.get("build", {}).get("production", {}).get("autoIncrement") is True, "EAS production builds auto-increment")
    expected_build_image = "latest"
    check(eas.get("build", {}).get("production", {}).get("ios", {}).get("image") == expected_build_image, "Production iOS build uses the maintained latest image")
    check(eas.get("build", {}).get("preview", {}).get("ios", {}).get("image") == expected_build_image, "Preview iOS build uses the maintained latest image")
    check(eas.get("build", {}).get("production", {}).get("android", {}).get("image") == expected_build_image, "Production Android build uses the maintained latest image")
    check(eas.get("build", {}).get("preview", {}).get("android", {}).get("buildType") == "apk", "Preview Android build produces an installable APK")
    check(eas.get("build", {}).get("production", {}).get("ios", {}).get("simulator") is False, "Production iOS build targets real devices")
    check(eas.get("build", {}).get("production", {}).get("env", {}).get("EXPO_PUBLIC_USE_REMOTE_API") == "false", "Production build explicitly disables the optional remote API")
    check(eas.get("build", {}).get("preview", {}).get("env", {}).get("EXPO_PUBLIC_USE_REMOTE_API") == "false", "Preview build explicitly disables the optional remote API")
    check("production" in eas.get("submit", {}), "EAS submit profile exists")
    check(package.get("dependencies", {}).get("expo-dev-client") == "6.0.21", "SDK 54 development build includes expo-dev-client")
    check((FRONTEND / ".easignore").is_file(), "EAS upload ignore file exists")
    check("export:ios" in package.get("scripts", {}) and "export:android" in package.get("scripts", {}), "Release scripts export both iOS and Android bundles")
    support_root = ROOT / "support-site"
    support_config = json.loads((support_root / "vercel.json").read_text(encoding="utf-8"))
    check(support_config.get("outputDirectory") == "public", "Support site has a deployable Vercel output directory")
    for relative in ("public/index.html", "public/support/index.html", "public/privacy/index.html", "public/styles.css"):
        check((support_root / relative).is_file(), f"Support site source exists: {relative}")
    metadata = (ROOT / "APP_STORE_METADATA.md").read_text(encoding="utf-8")
    check("https://scripture-games-support.vercel.app/support/" in metadata, "Store metadata includes canonical support URL")
    check("https://scripture-games-support.vercel.app/privacy/" in metadata, "Store metadata includes canonical privacy URL")

    deps = package.get("dependencies", {})
    required = {
        "expo", "expo-router", "react", "react-native", "@expo/vector-icons",
        "@react-native-async-storage/async-storage", "expo-font", "expo-haptics",
        "expo-image", "expo-linear-gradient", "expo-splash-screen",
        "react-native-gesture-handler", "react-native-reanimated",
        "react-native-safe-area-context", "react-native-screens", "react-native-worklets",
    }
    check(required.issubset(deps), "Required native/runtime dependencies are declared")
    forbidden = {"expo-audio", "expo-secure-store", "react-native-dotenv", "react-native-webview", "date-fns", "dayjs", "react-native-confetti-cannon"}
    check(not (forbidden & set(deps)), "Unused, privacy-confusing, or avoidable compatibility dependencies were removed")
    scripts = package.get("scripts", {})
    check("preinstall" not in scripts and "reset-project" not in scripts, "Template command guards and reset scripts were removed")

    expected_routes = {
        "app/index.tsx", "app/onboarding.tsx", "app/(tabs)/journey.tsx", "app/(tabs)/quiz.tsx",
        "app/(tabs)/stories.tsx", "app/(tabs)/companion.tsx", "app/quiz-play.tsx",
        "app/verse.tsx", "app/puzzle.tsx", "app/story/[id].tsx", "app/devotional.tsx",
        "app/leaderboard.tsx", "app/premium.tsx", "app/family/index.tsx",
        "app/family/add-child.tsx", "app/family/dashboard.tsx", "app/faction-select.tsx",
        "app/genesis-trial.tsx", "app/genesis-quiz.tsx", "app/season-victory.tsx",
        "app/(tabs)/command.tsx", "app/daily-challenge.tsx", "app/achievements.tsx",
        "app/settings.tsx", "app/+not-found.tsx",
    }
    for route in expected_routes:
        check((FRONTEND / route).is_file(), f"Route exists: {route}")

    source_files = list((FRONTEND / "app").rglob("*.ts*")) + list((FRONTEND / "src").rglob("*.ts*"))
    combined = "\n".join(path.read_text(encoding="utf-8") for path in source_files)
    check("LogBox.ignoreAllLogs" not in combined, "App does not suppress all runtime warnings")
    check("com.emergent" not in combined and "Bible Quest" not in combined, "Old branding is absent from app source")
    check("stripe" not in combined.casefold() and "simulated purchase" not in combined.casefold(), "No simulated payment flow remains")
    runtime_urls = set(re.findall(r"https?://[^'\"\s)]+", combined))
    allowed_runtime_urls = {
        "https://scripture-games-support.vercel.app/privacy/",
        "https://scripture-games-support.vercel.app/support/",
    }
    check(runtime_urls.issubset(allowed_runtime_urls), "Runtime source has no unapproved remote URLs or remote assets")
    check("Family Plan" not in combined, "Family feature is labeled Family Hub rather than a paid plan")
    settings_source = (FRONTEND / "app" / "settings.tsx").read_text(encoding="utf-8")
    check("https://scripture-games-support.vercel.app/privacy/" in settings_source, "Settings links to the live privacy policy")
    check("https://scripture-games-support.vercel.app/support/" in settings_source, "Settings links to live player support")
    api_source = (FRONTEND / "src" / "api.ts").read_text(encoding="utf-8")
    journey_source = (FRONTEND / "app" / "(tabs)" / "journey.tsx").read_text(encoding="utf-8")
    check("resetAll" in api_source and "item.startsWith('scripture_games_')" in api_source, "Full reset removes all Scripture Games local data")
    check("Erase All App Data" in journey_source and "storage.resetAll()" in journey_source, "Destructive data reset is confirmation-gated in the profile menu")
    check("bq_profile_id" not in api_source and "bq_family_id" not in api_source, "Local storage keys use current Scripture Games branding")
    genesis_source = (FRONTEND / "src" / "genesis-season.ts").read_text(encoding="utf-8")
    season_store_source = (FRONTEND / "src" / "season-progress.ts").read_text(encoding="utf-8")
    local_store_source = (FRONTEND / "src" / "local-api.ts").read_text(encoding="utf-8")
    daily_store_source = (FRONTEND / "src" / "daily-challenge.ts").read_text(encoding="utf-8")
    profile_context_source = (FRONTEND / "src" / "profile-context.tsx").read_text(encoding="utf-8")
    index_source = (FRONTEND / "app" / "index.tsx").read_text(encoding="utf-8")
    check("serializeLocalCall" in local_store_source and "MUTATING_LOCAL_METHODS" in local_store_source, "Local database mutations are serialized")
    check("corrupt_backup" in local_store_source and "corrupt_backup" in season_store_source and "corrupt_backup" in daily_store_source, "Corrupt local records are preserved before recovery")
    check("serializeProgress" in season_store_source and "serializeDaily" in daily_store_source, "Season and daily progress mutations are serialized")
    celebration_source = (FRONTEND / "src" / "components" / "premium" / "CelebrationBurst.tsx").read_text(encoding="utf-8")
    check("useReducedMotionPreference" in combined and "CelebrationBurst" in combined, "Celebrations use the app motion preference and bundled animation component")
    check("react-native-confetti-cannon" not in combined, "Celebrations do not depend on the unverified confetti package")
    check("withTiming" in celebration_source and 'importantForAccessibility="no-hide-descendants"' in celebration_source, "Bundled celebration animation is cinematic and hidden from accessibility")
    check("error: string | null" in profile_context_source and "startup-recovery-screen" in index_source, "Startup restoration failures use a recoverable error state")
    trial_ids = re.findall(r"id: 'trial-(\d{2})'", genesis_source)
    check(trial_ids == [f"{i:02d}" for i in range(1, 11)], "Genesis Season contains ten sequential premium trials")
    check(genesis_source.count("q('") >= 60, "Genesis Season contains at least 60 reviewed challenge questions")
    check(genesis_source.count("background: GENESIS_BACKGROUNDS['trial-") == 10, "Every Genesis trial has a bundled cinematic background")
    check("lionguard" in genesis_source and "dovebound" in genesis_source and "torchbearers" in genesis_source, "All three original factions are declared")
    check("completeSeasonTrial" in season_store_source and "firstCompletion" in season_store_source, "Genesis rewards prevent duplicate first-clear payouts")
    check("GENESIS_TRIALS" in journey_source and "loadSeasonProgress" in journey_source, "Tournament map uses the Genesis Season progression model")
    check("Liquid" not in journey_source or "GlassPanel" in journey_source, "Premium journey uses reusable glass surfaces")
    for index in range(1, 11):
        asset = FRONTEND / "assets" / "images" / "genesis" / f"trial-{index:02d}.jpg"
        check(asset.is_file() and asset.stat().st_size > 40_000, f"Genesis trial {index:02d} cinematic background exists")
    check((FRONTEND / "assets" / "images" / "genesis" / "opening.jpg").is_file(), "Genesis cinematic opening background exists")
    quiz_hub = (FRONTEND / "app" / "(tabs)" / "quiz.tsx").read_text(encoding="utf-8")
    for topic in seed.QUIZ_QUESTIONS:
        check(f"topic: '{topic}'" in quiz_hub, f"Quiz Hub exposes topic: {topic}")
    puzzle_source = (FRONTEND / "app" / "puzzle.tsx").read_text(encoding="utf-8")
    check("api.getPuzzles()" in puzzle_source and "buildRounds" in puzzle_source, "Puzzle screen uses all embedded word-puzzle sets")
    companion_source = (FRONTEND / "app" / "(tabs)" / "companion.tsx").read_text(encoding="utf-8")
    check("api.chatHistory(sessionId)" in companion_source and "`chat-${profile.id}`" in companion_source, "Companion restores per-profile chat history")
    check("maxLength={1000}" in companion_source, "Companion input is limited to 1,000 characters")
    onboarding_source = (FRONTEND / "app" / "onboarding.tsx").read_text(encoding="utf-8")
    check("api.listProfiles()" in onboarding_source and "Continue as" in onboarding_source, "Returning local players can be selected from onboarding")
    local_api_source = (FRONTEND / "src" / "local-api.ts").read_text(encoding="utf-8")
    check("sample-1" not in local_api_source and "Faithful Fox" not in local_api_source, "Device leaderboard contains no fictional users")
    check("shuffleQuestion" in local_api_source and ".map(shuffleQuestion)" in local_api_source, "Quiz answer choices are randomized while preserving the answer index")
    premium_source = (FRONTEND / "app" / "premium.tsx").read_text(encoding="utf-8")
    check("13 memory passages" in premium_source, "Beta access copy matches the 13 embedded memory passages")

    command_source = (FRONTEND / "app" / "(tabs)" / "command.tsx").read_text(encoding="utf-8")
    daily_source = (FRONTEND / "app" / "daily-challenge.tsx").read_text(encoding="utf-8")
    daily_store_source = (FRONTEND / "src" / "daily-challenge.ts").read_text(encoding="utf-8")
    settings_source = (FRONTEND / "app" / "settings.tsx").read_text(encoding="utf-8")
    preferences_source = (FRONTEND / "src" / "preferences-context.tsx").read_text(encoding="utf-8")
    haptics_source = (FRONTEND / "src" / "sfx.ts").read_text(encoding="utf-8")
    achievements_source = (FRONTEND / "src" / "achievements.ts").read_text(encoding="utf-8")
    check("Daily Scripture Trial" in command_source and "Achievement Hall" in command_source, "Command Center exposes daily and achievement systems")
    check("loadDailyChallengeState" in daily_source and "awardSeasonBonus" in daily_source and "api.awardBonus" in daily_source, "Daily challenge uses persisted idempotent rewards")
    check(daily_source.index("Promise.all") < daily_source.rindex("saveDailyChallengeResult"), "Daily reward awards complete before the daily completion flag is written")
    check("seededShuffle" in daily_store_source and "hashText" in daily_store_source, "Daily challenge selection is deterministic for the local date")
    check("hapticsEnabled" in preferences_source and "cinematicTextEnabled" in preferences_source and "motionMode" in preferences_source, "Accessibility experience preferences are persisted")
    check("configureHaptics" in haptics_source and "Haptics" in haptics_source, "Haptic feedback is centrally controlled")
    direct_haptics = [path for path in (FRONTEND / "app").rglob("*.tsx") if "expo-haptics" in path.read_text(encoding="utf-8")]
    check(not direct_haptics, "Screens route haptic feedback through the shared preference-aware service")
    check("Reset Genesis Season Only" in settings_source and "Erase All Scripture Games Data" in settings_source, "Settings provides scoped and full destructive-data controls")
    check("getAchievements" in achievements_source and achievements_source.count("id: '") >= 12, "Achievement Hall derives at least twelve meaningful achievements")

    # Generated content must match seed data exactly.
    generated = (FRONTEND / "src" / "content.generated.ts").read_text(encoding="utf-8")
    for name, value in {
        "JOURNEY_NODES": seed.JOURNEY_NODES,
        "QUIZ_QUESTIONS": seed.QUIZ_QUESTIONS,
        "VERSES": seed.VERSES,
        "STORIES": seed.STORIES,
        "PUZZLES": seed.PUZZLES,
    }.items():
        payload = json.dumps(value, ensure_ascii=False, indent=2)
        check(f"export const {name} = {payload} as const;" in generated, f"Generated frontend content is current: {name}")

    # Image dimensions and modes.
    try:
        from PIL import Image
    except ImportError:
        FAILURES.append("Pillow is unavailable; image dimensions could not be audited")
    else:
        image_expectations = {
            "assets/images/icon.png": ((1024, 1024), {"RGB", "RGBA"}),
            "assets/images/adaptive-icon.png": ((1024, 1024), {"RGBA"}),
            "assets/images/favicon.png": ((256, 256), {"RGB", "RGBA"}),
            "assets/images/splash-image.png": ((1200, 900), {"RGBA"}),
        }
        for relative, (size, modes) in image_expectations.items():
            with Image.open(FRONTEND / relative) as image:
                check(image.size == size, f"Asset dimensions are correct: {relative}")
                check(image.mode in modes, f"Asset color mode is correct: {relative}")
        for story_id in range(1, 16):
            with Image.open(FRONTEND / "assets" / "images" / "stories" / f"s{story_id}.jpg") as image:
                check(image.size == (1200, 800), f"Story art s{story_id} is 1200x800")
                check(image.mode == "RGB", f"Story art s{story_id} is RGB JPEG")


def audit_secrets() -> None:
    candidates = []
    for base in (FRONTEND / "app", FRONTEND / "src", BACKEND, ROOT / "scripts"):
        for path in base.rglob("*"):
            if path.is_file() and path.suffix in {".py", ".ts", ".tsx", ".js", ".json", ".md"} and "content.generated" not in path.name:
                candidates.append(path)
    text = "\n".join(path.read_text(encoding="utf-8", errors="ignore") for path in candidates)
    patterns = {
        "OpenAI key": r"sk-[A-Za-z0-9_-]{20,}",
        "GitHub token": r"gh[pousr]_[A-Za-z0-9]{30,}",
        "AWS access key": r"AKIA[0-9A-Z]{16}",
        "Private key": r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
    }
    for label, pattern in patterns.items():
        check(re.search(pattern, text) is None, f"No {label} is embedded")
    env_files = [p for p in ROOT.rglob(".env*") if p.name != ".env.example"]
    check(not env_files, "No real .env file is included")


def main() -> int:
    seed = load_seed()
    stats = audit_content(seed)
    audit_frontend(seed)
    audit_secrets()

    print("SCRIPTURE GAMES RELEASE AUDIT")
    print("=" * 31)
    print(", ".join(f"{key.replace('_', ' ')}: {value}" for key, value in stats.items()))
    print(f"Checks passed: {len(PASSES)}")
    print(f"Checks failed: {len(FAILURES)}")
    if FAILURES:
        print("\nFAILURES")
        for failure in FAILURES:
            print(f"- {failure}")
        return 1
    print("\nPASS — static content, configuration, assets, privacy declarations, and release structure are consistent.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
