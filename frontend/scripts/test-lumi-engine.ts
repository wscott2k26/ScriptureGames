import assert from 'node:assert/strict';

import { createLumiReply } from '../src/lumi-engine.ts';

const adult = (message: string) => createLumiReply(message, 'adult');
const kids = (message: string) => createLumiReply(message, 'kids');

assert.match(adult('hello'), /hello|glad|welcome/i, 'A greeting should receive a greeting, not the generic fallback.');
assert.doesNotMatch(adult('hello'), /worthwhile question|thoughtful question/i);

assert.match(adult('Genesis'), /Genesis/i, 'A Bible book name should produce a useful book overview.');
assert.match(adult('Genesis'), /creation|beginning|covenant|Abraham/i);

assert.match(adult('What is Romans about?'), /Romans/i, 'A book question should identify the requested book.');
assert.match(adult('What is Romans about?'), /gospel|faith|grace|righteous/i);

assert.match(adult('Psalm 23:1'), /Psalm 23:1/i, 'A valid verse reference should be quoted and explained.');
assert.match(adult('Psalm 23:1'), /shepherd/i);

assert.match(adult('Who was Moses?'), /Moses/i, 'A major Bible person should receive a substantive answer.');
assert.match(adult('Who was Moses?'), /Exodus|Israel|Sinai|law/i);

assert.match(adult('I am worried and anxious'), /anx|fear|peace|Philippians|Peter/i, 'A life-topic question should receive grounded Scripture guidance.');

assert.match(kids('hello'), /hello|glad|welcome/i);
assert.match(kids('Tell me about Esther'), /Esther/i);
assert.match(kids('Tell me about Esther'), /brave|courage|queen|people/i);

const unknown = adult('Tell me about quantum mechanics');
assert.doesNotMatch(unknown, /^That is a worthwhile question\./i, 'Unknown questions should not repeat the old canned fallback.');
assert.match(unknown, /Bible|Scripture|passage|topic/i, 'Unknown questions should clearly explain Lumi’s Scripture-focused scope.');

console.log('Lumi engine behavior tests passed.');
