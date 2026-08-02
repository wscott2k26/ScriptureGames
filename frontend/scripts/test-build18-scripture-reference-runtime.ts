import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';

import { parseBibleReference } from '../src/bible-library.ts';

function expectReference(input: string, bookId: string, chapter: number, verse?: number) {
  assert.deepEqual(
    parseBibleReference(input),
    { bookId, chapter, ...(verse === undefined ? {} : { verse }) },
    `Expected ${input} to resolve to ${bookId} ${chapter}${verse === undefined ? '' : `:${verse}`}`,
  );
}

// Real formats already shipped in Scripture Games.
expectReference('Genesis 1:3', 'GEN', 1, 3);
expectReference('Genesis 1:3-5', 'GEN', 1, 3);
expectReference('Genesis 1:3–5', 'GEN', 1, 3);
expectReference('Genesis 6–9', 'GEN', 6);
expectReference('Psalm 46:10 (WEB)', 'PSA', 46, 10);
expectReference('Psalm 23:1 (WEB)', 'PSA', 23, 1);
expectReference('1 John 4:19 (WEB)', '1JN', 4, 19);
expectReference('  John 3 : 16  ', 'JHN', 3, 16);

const linkSource = readFileSync(join(process.cwd(), 'src/components/ScriptureLink.tsx'), 'utf8');
assert.match(linkSource, /router\.navigate\(/, 'ScriptureLink must use the proven tab-navigation method.');
assert.match(linkSource, /pathname:\s*['"]\/\(tabs\)\/bible['"]/, 'ScriptureLink must target the registered Bible tab route.');
assert.doesNotMatch(linkSource, /pathname:\s*['"]\/bible['"]/, 'ScriptureLink must not use the unregistered root Bible path.');
assert.match(linkSource, /parseBibleReference\(reference\)/, 'ScriptureLink must validate the same reference it sends to the Bible reader.');

console.log('Build 18 Scripture-reference runtime contract passed.');
