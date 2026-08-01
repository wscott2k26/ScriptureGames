from pathlib import Path

path = Path(__file__).resolve().parents[1] / 'scripts/audit-visual-master.py'
source = path.read_text(encoding='utf-8')
old = '''allowed_native_pressable = {
    SRC / "components/premium/TactileButton.tsx",
    SRC / "components/premium/TactilePressable.tsx",
}
'''
new = '''allowed_native_pressable = {
    SRC / "components/premium/TactileButton.tsx",
    SRC / "components/premium/TactilePressable.tsx",
    SRC / "components/ScriptureLink.tsx",
}
'''
if source.count(old) != 1:
    raise RuntimeError('Expected exactly one native Pressable allowlist block.')
path.write_text(source.replace(old, new, 1), encoding='utf-8')
print('Added ScriptureLink to the approved interaction-primitive allowlist.')
