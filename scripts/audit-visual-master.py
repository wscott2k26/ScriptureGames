#!/usr/bin/env python3
"""Strict visual-system release gate for Scripture Games RC3.

This is intentionally conservative: it verifies that the locked design pillars
are implemented through shared production components and that every route uses
an approved backdrop and glass vocabulary rather than bypassing them.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"
APP = FRONTEND / "app"
SRC = FRONTEND / "src"

passed = 0
failed: list[str] = []


def check(condition: bool, label: str) -> None:
    global passed
    if condition:
        passed += 1
    else:
        failed.append(label)


def text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except Exception as exc:  # pragma: no cover - release diagnostic
        failed.append(f"readable file: {path.relative_to(ROOT)} ({exc})")
        return ""


def contains(path: Path, *needles: str) -> None:
    body = text(path)
    for needle in needles:
        check(needle in body, f"{path.relative_to(ROOT)} contains {needle!r}")


# ---------------------------------------------------------------------------
# Locked tool set / dependency boundaries
# ---------------------------------------------------------------------------
package = json.loads(text(FRONTEND / "package.json"))
deps = package.get("dependencies", {})
approved_visual = {
    "expo-blur",
    "expo-linear-gradient",
    "expo-haptics",
    "react-native-reanimated",
}
for name in approved_visual:
    check(name in deps, f"approved visual dependency declared: {name}")
check(deps.get("expo-blur") == "~15.0.8", "Expo SDK 54 compatible expo-blur is locked to ~15.0.8")

for unapproved in (
    "lottie-react-native",
    "@shopify/react-native-skia",
    "rive-react-native",
    "react-native-blur",
    "moti",
):
    check(unapproved not in deps, f"no unapproved/duplicate visual engine: {unapproved}")

scripts = package.get("scripts", {})
check(scripts.get("audit:visual") == "python ../scripts/audit-visual-master.py", "visual audit script is wired into package scripts")
check("audit:visual" in scripts.get("validate", ""), "visual audit is part of the full validate command")

# ---------------------------------------------------------------------------
# Pillar 1 — Liquid Glassmorphism
# ---------------------------------------------------------------------------
glass_panel = SRC / "components/premium/GlassPanel.tsx"
contains(
    glass_panel,
    "BlurView",
    "experimentalBlurMethod",
    "useReducedTransparencyPreference",
    "glass-caustics.png",
    "LinearGradient",
    "intensity",
    "systemUltraThinMaterialDark",
)

global_dock = SRC / "components/navigation/GlobalNavigationDock.tsx"
contains(
    global_dock,
    "BlurView",
    "experimentalBlurMethod",
    "LinearGradient",
    "systemUltraThinMaterialDark",
    "GLOBAL_DOCK_HEIGHT",
)

tabs_layout = APP / "(tabs)/_layout.tsx"
contains(
    tabs_layout,
    "detachInactiveScreens",
    "freezeOnBlur: true",
    "GlassTabBackground",
    "tabBarBackground",
)
tabs_body = text(tabs_layout)
check("detachInactiveScreens={false}" not in tabs_body, "native tabs do not keep every inactive screen mounted")
check("tabBarStyle: { display: 'none' }" not in tabs_body, "native tab bar remains visible instead of using the flashing overlay")

# ---------------------------------------------------------------------------
# Pillar 2 — Tactile Maximalism
# ---------------------------------------------------------------------------
material = SRC / "components/premium/MaterialSurface.tsx"
for texture in (
    "polished-gold.png",
    "aged-bronze.png",
    "obsidian-stone.png",
    "carved-sandstone.png",
):
    contains(material, texture)

button = SRC / "components/premium/TactileButton.tsx"
contains(
    button,
    "withSpring",
    "translateY",
    "scaleY",
    "MaterialSurface",
    "sfx.press",
    "shimmer",
    "depth",
    "useReducedMotionPreference",
)

pressable = SRC / "components/premium/TactilePressable.tsx"
contains(pressable, "withSpring", "translateY", "scale", "useReducedMotionPreference")

for texture in sorted((FRONTEND / "assets/textures").glob("*.png")):
    check(texture.stat().st_size > 10_000, f"texture is substantive, not a placeholder: {texture.name}")
check(len(list((FRONTEND / "assets/textures").glob("*.png"))) == 5, "exactly five approved material/caustic textures are present")

allowed_native_pressable = {
    SRC / "components/premium/TactileButton.tsx",
    SRC / "components/premium/TactilePressable.tsx",
    SRC / "components/ScriptureLink.tsx",
}
for source in sorted(FRONTEND.rglob("*.tsx")):
    if "node_modules" in source.parts:
        continue
    body = text(source)
    native_pressable = bool(
        re.search(r"import\s*\{[^}]*\bPressable\b[^}]*\}\s*from\s*['\"]react-native['\"]", body, re.S)
    )
    check(not native_pressable or source in allowed_native_pressable, f"no raw native Pressable outside tactile primitives: {source.relative_to(FRONTEND)}")

# ---------------------------------------------------------------------------
# Pillar 3 — Immersive cinematic and peaceful atmosphere systems
# ---------------------------------------------------------------------------
backdrop = SRC / "components/premium/CinematicBackdrop.tsx"
contains(
    backdrop,
    "withRepeat",
    "withTiming",
    "Easing.inOut",
    "translateX",
    "translateY",
    "scale",
    "DUST",
    "lightSweep",
    "FadeIn.duration",
    "useReducedMotionPreference",
)

peaceful_backdrop = SRC / "components/premium/PeacefulBackdrop.tsx"
contains(
    peaceful_backdrop,
    "LinearGradient",
    "resolveRotatingSceneId",
    "DEFAULT_PEACEFUL_SCENE_ID",
    "PeacefulScenePreview",
    "crossVertical",
    "waterLine",
    "mountainFront",
)
peaceful_scenes = SRC / "backgrounds/peaceful-scenes.ts"
contains(
    peaceful_scenes,
    "cross-on-the-hill",
    "Bethlehem Dawn",
    "Peaceful Lake",
    "Ocean Sunrise",
    "resolveRotatingSceneId",
)

word_reveal = SRC / "components/premium/WordRevealText.tsx"
contains(
    word_reveal,
    "cinematicText",
    "useReducedMotionPreference",
    "onPress",
    "setVisible(wordCount)",
    "split(/(\\s+)/)",
)

root_layout = APP / "_layout.tsx"
contains(root_layout, "fade_from_bottom", "useReducedMotionPreference", "animation: reducedMotion ? 'none'")
contains(APP / "story/[id].tsx", "WordRevealText")
contains(APP / "genesis-trial.tsx", "WordRevealText")

route_exclusions = {"_layout.tsx", "+html.tsx"}
routes = [p for p in sorted(APP.rglob("*.tsx")) if p.name not in route_exclusions]
check(len(routes) >= 25, "complete route inventory discovered")
for route in routes:
    body = text(route)
    rel = route.relative_to(APP)
    check(
        "CinematicBackdrop" in body or "PeacefulBackdrop" in body,
        f"route uses an approved cinematic or peaceful backdrop: {rel}",
    )
    check("GlassPanel" in body, f"route uses glass surfaces: {rel}")

for route in routes:
    body = text(route)
    if "<Pressable" in body:
        check(
            "TactilePressable as Pressable" in body,
            f"route aliases all Pressables to tactile primitive: {route.relative_to(APP)}",
        )

contains(APP / "genesis-quiz.tsx", "MaterialSurface", "material={right ? 'gold' : wrong ? 'danger' : chosen ? 'bronze' : 'stone'}")
contains(APP / "genesis-trial.tsx", "MaterialSurface", "material={selected ? 'bronze' : 'stone'}")
contains(APP / "puzzle.tsx", "MaterialSurface", "material={selectedLetter ? 'bronze' : 'stone'}", "material=\"gold\"")
contains(APP / "verse.tsx", "MaterialSurface", "material=\"sandstone\"")

# Accessibility / restraint gates.
for hook in ("use-reduced-motion.ts", "use-reduced-transparency.ts", "use-motion-intensity.ts"):
    check((SRC / "hooks" / hook).exists(), f"accessibility hook exists: {hook}")
preference_sources = text(SRC / "preferences-context.tsx") + text(SRC / "preferences-core.ts")
for field in ("motionMode", "cinematicTextEnabled", "backgroundId", "backgroundRotationEnabled", "favoriteBackgroundIds"):
    check(field in preference_sources, f"preference schema includes {field}")
visible_settings = text(APP / "(tabs)/preferences.tsx")
for copy in ("Motion Off", "Gentle Motion", "Full Experience", "Choose Peaceful Background", "Faith Rhythm"):
    check(copy in visible_settings, f"visible Settings includes {copy}")
check("GlobalNavigationDock" not in text(APP / "_layout.tsx"), "root layout does not restore the flashing full-screen navigation overlay")

print(f"Visual master audit: {passed} passed, {len(failed)} failed")
if failed:
    for item in failed:
        print(f"FAIL: {item}")
    sys.exit(1)
