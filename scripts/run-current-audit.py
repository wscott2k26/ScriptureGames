#!/usr/bin/env python3
"""Run the complete legacy release audit with current product invariants.

The original audit predates optional cloud backup, user-controlled foreground
audio, and the curated peaceful-photo collection. This wrapper preserves every
other check verbatim and replaces only those obsolete assertions with stricter
current checks.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
SOURCE = SCRIPTS / "audit.py"
TEMP = SCRIPTS / ".audit-current.tmp.py"

OLD_PRIVACY = '    check(privacy.get("NSPrivacyCollectedDataTypes") == [], "Privacy manifest declares no collected data in local-first mode")\n'
NEW_PRIVACY = '''    collected_types = privacy.get("NSPrivacyCollectedDataTypes", [])
    declared_types = {item.get("NSPrivacyCollectedDataType") for item in collected_types}
    required_cloud_types = {
        "NSPrivacyCollectedDataTypeName",
        "NSPrivacyCollectedDataTypeEmailAddress",
        "NSPrivacyCollectedDataTypeUserID",
        "NSPrivacyCollectedDataTypeGameplayContent",
        "NSPrivacyCollectedDataTypeProductInteraction",
        "NSPrivacyCollectedDataTypeOtherUserContent",
        "NSPrivacyCollectedDataTypeSensitiveInfo",
        "NSPrivacyCollectedDataTypeHealth",
    }
    check(required_cloud_types.issubset(declared_types), "Privacy manifest declares optional cloud-account and user-content data")
    check(all(item.get("NSPrivacyCollectedDataTypeTracking") is False for item in collected_types), "Collected data is declared as not used for tracking")
    check(all("NSPrivacyCollectedDataTypePurposeAppFunctionality" in item.get("NSPrivacyCollectedDataTypePurposes", []) for item in collected_types), "Collected data is limited to app-functionality purposes")
'''

OLD_DEPENDENCIES = '''    required = {
        "expo", "expo-router", "react", "react-native", "@expo/vector-icons",
        "@react-native-async-storage/async-storage", "expo-font", "expo-haptics",
        "expo-image", "expo-linear-gradient", "expo-splash-screen",
        "react-native-gesture-handler", "react-native-reanimated",
        "react-native-safe-area-context", "react-native-screens", "react-native-worklets",
    }
    check(required.issubset(deps), "Required native/runtime dependencies are declared")
    forbidden = {"expo-audio", "expo-secure-store", "react-native-dotenv", "react-native-webview", "date-fns", "dayjs", "react-native-confetti-cannon"}
    check(not (forbidden & set(deps)), "Unused, privacy-confusing, or avoidable compatibility dependencies were removed")
'''
NEW_DEPENDENCIES = '''    required = {
        "expo", "expo-router", "react", "react-native", "@expo/vector-icons",
        "@react-native-async-storage/async-storage", "expo-audio", "expo-file-system",
        "expo-font", "expo-haptics", "expo-image", "expo-linear-gradient",
        "expo-splash-screen", "react-native-gesture-handler", "react-native-reanimated",
        "react-native-safe-area-context", "react-native-screens", "react-native-worklets",
    }
    check(required.issubset(deps), "Required native/runtime dependencies are declared")
    forbidden = {"expo-secure-store", "react-native-dotenv", "react-native-webview", "date-fns", "dayjs", "react-native-confetti-cannon"}
    check(not (forbidden & set(deps)), "Unused, privacy-confusing, or avoidable compatibility dependencies were removed")
    check(deps.get("expo-audio") == "~1.1.1", "SDK 54 foreground audio dependency is pinned to the supported Expo version")
    check(deps.get("expo-file-system") == "~19.0.23", "SDK 54 offline audio storage dependency is pinned to the supported Expo version")
'''

OLD_RUNTIME_URLS = '''    runtime_urls = set(re.findall(r"https?://[^'\\"\\s)]+", combined))
    allowed_runtime_urls = {
        "https://scripture-games-support.vercel.app/privacy/",
        "https://scripture-games-support.vercel.app/support/",
    }
    check(runtime_urls.issubset(allowed_runtime_urls), "Runtime source has no unapproved remote URLs or remote assets")
'''
NEW_RUNTIME_URLS = '''    runtime_url_pattern = r"https?://[^'\\"\\s)]+"
    runtime_urls_by_file = {
        path: set(re.findall(runtime_url_pattern, path.read_text(encoding="utf-8")))
        for path in source_files
    }
    runtime_urls = set().union(*runtime_urls_by_file.values()) if runtime_urls_by_file else set()
    allowed_runtime_urls = {
        "https://scripture-games-support.vercel.app/privacy/",
        "https://scripture-games-support.vercel.app/support/",
    }
    peaceful_photo_source = FRONTEND / "src" / "backgrounds" / "peaceful-photo-sources.ts"
    peaceful_photo_text = peaceful_photo_source.read_text(encoding="utf-8")
    approved_photo_urls = set(re.findall(r"https://images\\.pexels\\.com/photos/\\d+/pexels-photo-\\d+\\.jpeg\\?auto=compress&cs=tinysrgb&w=1600", peaceful_photo_text))
    approved_source_pages = set(re.findall(r"https://www\\.pexels\\.com/photo/[^'\\"\\s)]+/", peaceful_photo_text))
    approved_pexels_urls = approved_photo_urls | approved_source_pages
    pexels_urls_outside_catalog = {
        str(path.relative_to(FRONTEND)): sorted(url for url in urls if "pexels.com/" in url)
        for path, urls in runtime_urls_by_file.items()
        if path != peaceful_photo_source and any("pexels.com/" in url for url in urls)
    }
    check(len(approved_photo_urls) == 50, "Peaceful background catalog contains exactly 50 approved Pexels image URLs")
    check(len(approved_source_pages) == 50, "Peaceful background catalog retains exactly 50 Pexels source pages")
    check(not pexels_urls_outside_catalog, "Pexels URLs appear only in the reviewed peaceful-photo catalog")
    check(runtime_urls.issubset(allowed_runtime_urls | approved_pexels_urls), "Runtime source has no unapproved remote URLs or remote assets")
'''

source = SOURCE.read_text(encoding="utf-8")
for old, label in (
    (OLD_PRIVACY, "legacy privacy assertion"),
    (OLD_DEPENDENCIES, "legacy dependency assertion"),
    (OLD_RUNTIME_URLS, "legacy remote-asset assertion"),
):
    if source.count(old) != 1:
        raise SystemExit(f"{label} was not found exactly once; refusing to run a partial audit adaptation.")

current = (
    source
    .replace(OLD_PRIVACY, NEW_PRIVACY, 1)
    .replace(OLD_DEPENDENCIES, NEW_DEPENDENCIES, 1)
    .replace(OLD_RUNTIME_URLS, NEW_RUNTIME_URLS, 1)
)
TEMP.write_text(current, encoding="utf-8")
try:
    result = subprocess.run([sys.executable, str(TEMP)], cwd=SOURCE.parents[1], check=False)
    raise SystemExit(result.returncode)
finally:
    TEMP.unlink(missing_ok=True)
