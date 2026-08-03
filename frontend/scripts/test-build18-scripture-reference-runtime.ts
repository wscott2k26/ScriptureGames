import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';

import { parseBibleReferenceParts } from '../src/bible-reference-parser.ts';

function expectReference(input: string, bookText: string, chapter: number, verse?: number) {
  assert.deepEqual(
    parseBibleReferenceParts(input),
    { bookText, chapter, ...(verse === undefined ? {} : { verse }) },
    `Expected ${input} to resolve to ${bookText} ${chapter}${verse === undefined ? '' : `:${verse}`}`,
  );
}

// Real formats already shipped in Scripture Games.
expectReference('Genesis 1:3', 'Genesis', 1, 3);
expectReference('Genesis 1:3-5', 'Genesis', 1, 3);
expectReference('Genesis 1:3–5', 'Genesis', 1, 3);
expectReference('Genesis 6–9', 'Genesis', 6);
expectReference('Psalm 46:10 (WEB)', 'Psalm', 46, 10);
expectReference('Psalm 23:1 (WEB)', 'Psalm', 23, 1);
expectReference('1 John 4:19 (WEB)', '1 John', 4, 19);
expectReference('  John 3 : 16  ', 'John', 3, 16);

const bibleLibrarySource = readFileSync(join(process.cwd(), 'src/bible-library.ts'), 'utf8');
assert.match(bibleLibrarySource, /parseBibleReferenceParts\(input\)/, 'The Bible library must use the tested pure parser seam.');

const linkSource = readFileSync(join(process.cwd(), 'src/components/ScriptureLink.tsx'), 'utf8');
assert.match(linkSource, /router\.navigate\(/, 'ScriptureLink must use the proven tab-navigation method.');
assert.match(linkSource, /pathname:\s*['"]\/\(tabs\)\/bible['"]/, 'ScriptureLink must target the registered Bible tab route.');
assert.doesNotMatch(linkSource, /pathname:\s*['"]\/bible['"]/, 'ScriptureLink must not use the unregistered root Bible path.');
assert.match(linkSource, /parseBibleReference\(reference\)/, 'ScriptureLink must validate the same reference it sends to the Bible reader.');

console.log('Build 18 Scripture-reference runtime contract passed.');
