#!/usr/bin/env python3
"""Release audit for the generated offline Bible library inside the mobile project."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

FRONTEND = Path(__file__).resolve().parents[1]
DATA = FRONTEND / "src" / "bible-data"
INDEX = FRONTEND / "src" / "bible.generated.ts"

EXPECTED = [
    ("GEN", "Genesis", 50), ("EXO", "Exodus", 40), ("LEV", "Leviticus", 27),
    ("NUM", "Numbers", 36), ("DEU", "Deuteronomy", 34), ("JOS", "Joshua", 24),
    ("JDG", "Judges", 21), ("RUT", "Ruth", 4), ("1SA", "1 Samuel", 31),
    ("2SA", "2 Samuel", 24), ("1KI", "1 Kings", 22), ("2KI", "2 Kings", 25),
    ("1CH", "1 Chronicles", 29), ("2CH", "2 Chronicles", 36), ("EZR", "Ezra", 10),
    ("NEH", "Nehemiah", 13), ("EST", "Esther", 10), ("JOB", "Job", 42),
    ("PSA", "Psalms", 150), ("PRO", "Proverbs", 31), ("ECC", "Ecclesiastes", 12),
    ("SNG", "Song of Solomon", 8), ("ISA", "Isaiah", 66), ("JER", "Jeremiah", 52),
    ("LAM", "Lamentations", 5), ("EZK", "Ezekiel", 48), ("DAN", "Daniel", 12),
    ("HOS", "Hosea", 14), ("JOL", "Joel", 3), ("AMO", "Amos", 9),
    ("OBA", "Obadiah", 1), ("JON", "Jonah", 4), ("MIC", "Micah", 7),
    ("NAM", "Nahum", 3), ("HAB", "Habakkuk", 3), ("ZEP", "Zephaniah", 3),
    ("HAG", "Haggai", 2), ("ZEC", "Zechariah", 14), ("MAL", "Malachi", 4),
    ("MAT", "Matthew", 28), ("MRK", "Mark", 16), ("LUK", "Luke", 24),
    ("JHN", "John", 21), ("ACT", "Acts", 28), ("ROM", "Romans", 16),
    ("1CO", "1 Corinthians", 16), ("2CO", "2 Corinthians", 13), ("GAL", "Galatians", 6),
    ("EPH", "Ephesians", 6), ("PHP", "Philippians", 4), ("COL", "Colossians", 4),
    ("1TH", "1 Thessalonians", 5), ("2TH", "2 Thessalonians", 3), ("1TI", "1 Timothy", 6),
    ("2TI", "2 Timothy", 4), ("TIT", "Titus", 3), ("PHM", "Philemon", 1),
    ("HEB", "Hebrews", 13), ("JAS", "James", 5), ("1PE", "1 Peter", 5),
    ("2PE", "2 Peter", 3), ("1JN", "1 John", 5), ("2JN", "2 John", 1),
    ("3JN", "3 John", 1), ("JUD", "Jude", 1), ("REV", "Revelation", 22),
]


def main() -> int:
    failures: list[str] = []
    total_chapters = 0
    total_verses = 0
    samples: dict[str, str] = {}

    if not INDEX.is_file():
        failures.append("generated Bible index is missing")
    else:
        index = INDEX.read_text(encoding="utf-8")
        for required in ("complete: true", "bookCount: 66", "chapterCount: 1189", "publicDomain: true"):
            if required not in index:
                failures.append(f"generated Bible index is missing {required!r}")
        match = re.search(r"verseCount: (\d+)", index)
        if not match or int(match.group(1)) < 31_000:
            failures.append("generated Bible index does not certify at least 31,000 verses")

    for book_id, expected_name, expected_chapters in EXPECTED:
        path = DATA / f"{book_id}.json"
        if not path.is_file():
            failures.append(f"missing book file: {book_id}")
            continue
        try:
            book = json.loads(path.read_text(encoding="utf-8"))
        except Exception as error:
            failures.append(f"{book_id} is not valid JSON: {error}")
            continue
        if book.get("id") != book_id or book.get("name") != expected_name:
            failures.append(f"{book_id} metadata is incorrect")
        chapters = book.get("chapters")
        if not isinstance(chapters, list) or len(chapters) != expected_chapters:
            failures.append(f"{expected_name}: expected {expected_chapters} chapters")
            continue
        total_chapters += len(chapters)
        for chapter_number, chapter in enumerate(chapters, start=1):
            if not isinstance(chapter, list) or not chapter:
                failures.append(f"{expected_name} {chapter_number} has no verses")
                continue
            seen: set[int] = set()
            for verse in chapter:
                if not isinstance(verse, list) or len(verse) != 2:
                    failures.append(f"{expected_name} {chapter_number} contains malformed verse data")
                    continue
                number, text = verse
                if not isinstance(number, int) or number < 1 or number in seen:
                    failures.append(f"{expected_name} {chapter_number} contains invalid verse numbering")
                seen.add(number)
                if not isinstance(text, str) or not text.strip():
                    failures.append(f"{expected_name} {chapter_number}:{number} is empty")
                total_verses += 1
                samples[f"{book_id}.{chapter_number}.{number}"] = text

    if total_chapters != 1189:
        failures.append(f"expected 1189 chapters, found {total_chapters}")
    if total_verses < 31_000:
        failures.append(f"expected at least 31,000 verses, found {total_verses}")
    if not samples.get("GEN.1.1", "").startswith("In the beginning"):
        failures.append("Genesis 1:1 sample does not match the WEB text")
    if "God so loved the world" not in samples.get("JHN.3.16", ""):
        failures.append("John 3:16 sample does not match the WEB text")

    print("SCRIPTURE GAMES FULL BIBLE AUDIT")
    print("=================================")
    print(f"books: {len(EXPECTED)}, chapters: {total_chapters}, verses: {total_verses}")
    if failures:
        print(f"Checks failed: {len(failures)}")
        for failure in failures[:50]:
            print(f"- {failure}")
        return 1
    print("PASS — the complete 66-book public-domain Bible library is present and internally consistent.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
