#!/usr/bin/env python3
"""Run the complete legacy release audit with current product invariants.

The original audit predates optional cloud backup and intentionally forbade
expo-audio before the app offered user-controlled music and sound feedback.
This wrapper preserves every other check verbatim and replaces only those two
obsolete assertions with stricter current checks.
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

source = SOURCE.read_text(encoding="utf-8")
for old, label in (
    (OLD_PRIVACY, "legacy privacy assertion"),
    (OLD_DEPENDENCIES, "legacy dependency assertion"),
):
    if source.count(old) != 1:
        raise SystemExit(f"{label} was not found exactly once; refusing to run a partial audit adaptation.")

current = source.replace(OLD_PRIVACY, NEW_PRIVACY, 1).replace(OLD_DEPENDENCIES, NEW_DEPENDENCIES, 1)
TEMP.write_text(current, encoding="utf-8")
try:
    result = subprocess.run([sys.executable, str(TEMP)], cwd=SOURCE.parents[1], check=False)
    raise SystemExit(result.returncode)
finally:
    TEMP.unlink(missing_ok=True)
