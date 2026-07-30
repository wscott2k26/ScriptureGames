#!/usr/bin/env python3
"""Generate the frontend TypeScript content bundle from backend/seed_data.py."""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "backend" / "seed_data.py"
OUTPUT = ROOT / "frontend" / "src" / "content.generated.ts"

spec = importlib.util.spec_from_file_location("scripture_games_seed", SEED)
if spec is None or spec.loader is None:
    raise RuntimeError(f"Unable to load {SEED}")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

data = {
    "JOURNEY_NODES": module.JOURNEY_NODES,
    "QUIZ_QUESTIONS": module.QUIZ_QUESTIONS,
    "VERSES": module.VERSES,
    "STORIES": module.STORIES,
    "PUZZLES": module.PUZZLES,
}

parts = [
    "// Generated from backend/seed_data.py.\n",
    "// Run `python scripts/generate-content.py` after editing the seed content.\n\n",
]
for name, value in data.items():
    payload = json.dumps(value, ensure_ascii=False, indent=2)
    parts.append(f"export const {name} = {payload} as const;\n\n")

OUTPUT.write_text("".join(parts), encoding="utf-8")
print(f"Generated {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size:,} bytes)")
