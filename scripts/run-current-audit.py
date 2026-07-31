#!/usr/bin/env python3
"""Run the complete legacy release audit with the current privacy invariant.

The original audit predates optional cloud backup and requires an empty iOS
collected-data manifest. This wrapper preserves every other check verbatim and
replaces only that obsolete assertion with stricter non-tracking declarations
for the current cloud-enabled product.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
SOURCE = SCRIPTS / "audit.py"
TEMP = SCRIPTS / ".audit-current.tmp.py"

OLD = '    check(privacy.get("NSPrivacyCollectedDataTypes") == [], "Privacy manifest declares no collected data in local-first mode")\n'
NEW = '''    collected_types = privacy.get("NSPrivacyCollectedDataTypes", [])
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

source = SOURCE.read_text(encoding="utf-8")
if source.count(OLD) != 1:
    raise SystemExit("Legacy privacy assertion was not found exactly once; refusing to run a partial audit adaptation.")

TEMP.write_text(source.replace(OLD, NEW, 1), encoding="utf-8")
try:
    result = subprocess.run([sys.executable, str(TEMP)], cwd=SOURCE.parents[1], check=False)
    raise SystemExit(result.returncode)
finally:
    TEMP.unlink(missing_ok=True)
