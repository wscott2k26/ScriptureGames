from __future__ import annotations

import json
import os
import sys
from pathlib import Path


def replace(path: Path, old: str, new: str, label: str) -> None:
    body = path.read_text(encoding="utf-8")
    if old not in body:
        raise SystemExit(f"Missing expected source for {label}: {path}")
    path.write_text(body.replace(old, new), encoding="utf-8")


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: prepare_rc3.py <source-root>")

    root = Path(sys.argv[1]).resolve()
    project_id = os.environ.get("EAS_PROJECT_ID", "18710e80-2a62-46ac-8d3a-d1711b7d920a")
    owner = os.environ.get("EAS_OWNER", "wscott2k8")

    app_path = root / "frontend" / "app.json"
    app = json.loads(app_path.read_text(encoding="utf-8"))
    app["expo"]["owner"] = owner
    app["expo"].setdefault("extra", {}).setdefault("eas", {})["projectId"] = project_id
    app_path.write_text(json.dumps(app, indent=2) + "\n", encoding="utf-8")

    replace(
        root / "scripts" / "audit.py",
        'check(app_config.get("owner") == "wscott2k26", "Expo owner matches the canonical account")',
        'check(app_config.get("owner") == "wscott2k8", "Expo owner matches the connected EAS account")',
        "Expo audit identity",
    )
    replace(
        root / "scripts" / "audit-visual-master.py",
        'for source in sorted(FRONTEND.rglob("*.tsx")):\n    body = text(source)',
        'for source in sorted(FRONTEND.rglob("*.tsx")):\n    if "node_modules" in source.parts:\n        continue\n    body = text(source)',
        "visual audit scope",
    )
    replace(root / "frontend" / "app" / "(tabs)" / "quiz.tsx", "icon: 'mount'", "icon: 'map'", "valid Ionicon")
    replace(
        root / "frontend" / "src" / "components" / "premium" / "GlassPanel.tsx",
        '<Image pointerEvents="none" source={CAUSTICS} resizeMode="cover" style={styles.caustics} />',
        '<Image source={CAUSTICS} resizeMode="cover" style={styles.caustics} />',
        "GlassPanel Image props",
    )
    replace(
        root / "frontend" / "src" / "components" / "premium" / "MaterialSurface.tsx",
        '<Image source={TEXTURES[material]} resizeMode="repeat" pointerEvents="none" style={styles.texture} />',
        '<Image source={TEXTURES[material]} resizeMode="repeat" style={styles.texture} />',
        "MaterialSurface Image props",
    )

    old_tab_icon = '''function tabIcon(name: keyof typeof Ionicons.glyphMap) {
  return ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <View style={[styles.iconShell, focused && styles.iconShellFocused]}>
      <Ionicons name={name} size={focused ? size + 1 : size} color={color} />
      {focused ? <View style={styles.activeDot} /> : null}
    </View>
  );
}'''
    new_tab_icon = '''function tabIcon(name: keyof typeof Ionicons.glyphMap) {
  const TabIcon = ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <View style={[styles.iconShell, focused && styles.iconShellFocused]}>
      <Ionicons name={name} size={focused ? size + 1 : size} color={color} />
      {focused ? <View style={styles.activeDot} /> : null}
    </View>
  );
  TabIcon.displayName = `TabIcon(${name})`;
  return TabIcon;
}'''
    replace(root / "frontend" / "app" / "(tabs)" / "_layout.tsx", old_tab_icon, new_tab_icon, "tab icon display name")
    replace(
        root / "frontend" / "app" / "(tabs)" / "journey.tsx",
        "import { colors, radii, spacing } from '@/src/theme';",
        "import { colors, spacing } from '@/src/theme';",
        "journey unused import",
    )
    replace(
        root / "frontend" / "app" / "onboarding.tsx",
        "import { AVATARS, colors, radii, spacing } from '@/src/theme';",
        "import { AVATARS, colors } from '@/src/theme';",
        "onboarding unused imports",
    )

    root_layout = root / "frontend" / "app" / "_layout.tsx"
    replace(
        root_layout,
        "import { ErrorBoundary as ExpoRouterErrorBoundary, Stack } from 'expo-router';\n\nexport const ErrorBoundary = ExpoRouterErrorBoundary;\n\nimport * as SplashScreen from 'expo-splash-screen';",
        "import { ErrorBoundary as ExpoRouterErrorBoundary, Stack } from 'expo-router';\nimport * as SplashScreen from 'expo-splash-screen';",
        "root layout import order",
    )
    replace(
        root_layout,
        "import { colors } from '@/src/theme';\n\nvoid SplashScreen.preventAutoHideAsync();",
        "import { colors } from '@/src/theme';\n\nexport const ErrorBoundary = ExpoRouterErrorBoundary;\n\nvoid SplashScreen.preventAutoHideAsync();",
        "root layout ErrorBoundary placement",
    )

    puzzle_path = root / "frontend" / "app" / "puzzle.tsx"
    replace(
        puzzle_path,
        "  useEffect(() => {\n    let active = true;",
        "  useEffect(() => {\n    let active = true;\n    const activeTimers = timers.current;",
        "puzzle timer snapshot",
    )
    replace(
        puzzle_path,
        "      timers.current.forEach(clearTimeout);",
        "      activeTimers.forEach(clearTimeout);",
        "puzzle timer cleanup",
    )
    replace(
        root / "frontend" / "src" / "components" / "premium" / "TactileButton.tsx",
        "import { Pressable, StyleSheet, Text, View, type ViewStyle, type StyleProp } from 'react-native';",
        "import { Pressable, StyleSheet, Text, type ViewStyle, type StyleProp } from 'react-native';",
        "TactileButton unused import",
    )

    print(f"Prepared RC3 source at {root}")


if __name__ == "__main__":
    main()
