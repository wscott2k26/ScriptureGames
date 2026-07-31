#!/usr/bin/env python3
"""Build the offline Scripture Games Bible library from eBible.org's public-domain WEBP VPL XML."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
import tempfile
import time
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

SOURCE_URL = "https://ebible.org/Scriptures/engwebp_vpl.zip"
TRANSLATION_ID = "WEBP"
TRANSLATION_NAME = "World English Bible"
SOURCE_NAME = "eBible.org"

BOOKS = [
    ("GEN", "Genesis", "Old Testament", 50, ["GEN"]),
    ("EXO", "Exodus", "Old Testament", 40, ["EXO"]),
    ("LEV", "Leviticus", "Old Testament", 27, ["LEV"]),
    ("NUM", "Numbers", "Old Testament", 36, ["NUM"]),
    ("DEU", "Deuteronomy", "Old Testament", 34, ["DEU", "DT"]),
    ("JOS", "Joshua", "Old Testament", 24, ["JOS", "JOSHUA"]),
    ("JDG", "Judges", "Old Testament", 21, ["JDG"]),
    ("RUT", "Ruth", "Old Testament", 4, ["RUT"]),
    ("1SA", "1 Samuel", "Old Testament", 31, ["1SA", "1SAMUEL", "I SAMUEL"]),
    ("2SA", "2 Samuel", "Old Testament", 24, ["2SA", "2SAMUEL", "II SAMUEL"]),
    ("1KI", "1 Kings", "Old Testament", 22, ["1KI", "1KINGS", "I KINGS"]),
    ("2KI", "2 Kings", "Old Testament", 25, ["2KI", "2KINGS", "II KINGS"]),
    ("1CH", "1 Chronicles", "Old Testament", 29, ["1CH", "1CHRONICLES", "I CHRONICLES"]),
    ("2CH", "2 Chronicles", "Old Testament", 36, ["2CH", "2CHRONICLES", "II CHRONICLES"]),
    ("EZR", "Ezra", "Old Testament", 10, ["EZR"]),
    ("NEH", "Nehemiah", "Old Testament", 13, ["NEH"]),
    ("EST", "Esther", "Old Testament", 10, ["EST"]),
    ("JOB", "Job", "Old Testament", 42, ["JOB"]),
    ("PSA", "Psalms", "Old Testament", 150, ["PSA", "PSALM", "PSALMS"]),
    ("PRO", "Proverbs", "Old Testament", 31, ["PRO", "PRV", "PROVERBS"]),
    ("ECC", "Ecclesiastes", "Old Testament", 12, ["ECC"]),
    ("SNG", "Song of Solomon", "Old Testament", 8, ["SNG", "SONG OF SONGS", "SONG OF SOLOMON", "CANTICLES"]),
    ("ISA", "Isaiah", "Old Testament", 66, ["ISA"]),
    ("JER", "Jeremiah", "Old Testament", 52, ["JER"]),
    ("LAM", "Lamentations", "Old Testament", 5, ["LAM"]),
    ("EZK", "Ezekiel", "Old Testament", 48, ["EZK", "EZE", "EZEKIEL"]),
    ("DAN", "Daniel", "Old Testament", 12, ["DAN"]),
    ("HOS", "Hosea", "Old Testament", 14, ["HOS"]),
    ("JOL", "Joel", "Old Testament", 3, ["JOL", "JOEL"]),
    ("AMO", "Amos", "Old Testament", 9, ["AMO"]),
    ("OBA", "Obadiah", "Old Testament", 1, ["OBA", "OBADIAH"]),
    ("JON", "Jonah", "Old Testament", 4, ["JON"]),
    ("MIC", "Micah", "Old Testament", 7, ["MIC"]),
    ("NAM", "Nahum", "Old Testament", 3, ["NAM", "NAH", "NAHUM"]),
    ("HAB", "Habakkuk", "Old Testament", 3, ["HAB"]),
    ("ZEP", "Zephaniah", "Old Testament", 3, ["ZEP", "ZEPHANIAH"]),
    ("HAG", "Haggai", "Old Testament", 2, ["HAG"]),
    ("ZEC", "Zechariah", "Old Testament", 14, ["ZEC", "ZECHARIAH"]),
    ("MAL", "Malachi", "Old Testament", 4, ["MAL"]),
    ("MAT", "Matthew", "New Testament", 28, ["MAT", "MATTHEW"]),
    ("MRK", "Mark", "New Testament", 16, ["MRK", "MAR", "MARK"]),
    ("LUK", "Luke", "New Testament", 24, ["LUK", "LUKE"]),
    ("JHN", "John", "New Testament", 21, ["JHN", "JOH", "JOHN"]),
    ("ACT", "Acts", "New Testament", 28, ["ACT", "ACTS"]),
    ("ROM", "Romans", "New Testament", 16, ["ROM", "ROMANS"]),
    ("1CO", "1 Corinthians", "New Testament", 16, ["1CO", "1CORINTHIANS", "I CORINTHIANS"]),
    ("2CO", "2 Corinthians", "New Testament", 13, ["2CO", "2CORINTHIANS", "II CORINTHIANS"]),
    ("GAL", "Galatians", "New Testament", 6, ["GAL"]),
    ("EPH", "Ephesians", "New Testament", 6, ["EPH"]),
    ("PHP", "Philippians", "New Testament", 4, ["PHP", "PHILIPPIANS"]),
    ("COL", "Colossians", "New Testament", 4, ["COL"]),
    ("1TH", "1 Thessalonians", "New Testament", 5, ["1TH", "1THESSALONIANS", "I THESSALONIANS"]),
    ("2TH", "2 Thessalonians", "New Testament", 3, ["2TH", "2THESSALONIANS", "II THESSALONIANS"]),
    ("1TI", "1 Timothy", "New Testament", 6, ["1TI", "1TIMOTHY", "I TIMOTHY"]),
    ("2TI", "2 Timothy", "New Testament", 4, ["2TI", "2TIMOTHY", "II TIMOTHY"]),
    ("TIT", "Titus", "New Testament", 3, ["TIT"]),
    ("PHM", "Philemon", "New Testament", 1, ["PHM", "PHILEMON"]),
    ("HEB", "Hebrews", "New Testament", 13, ["HEB"]),
    ("JAS", "James", "New Testament", 5, ["JAS", "JAMES"]),
    ("1PE", "1 Peter", "New Testament", 5, ["1PE", "1PETER", "I PETER"]),
    ("2PE", "2 Peter", "New Testament", 3, ["2PE", "2PETER", "II PETER"]),
    ("1JN", "1 John", "New Testament", 5, ["1JN", "1JOHN", "I JOHN"]),
    ("2JN", "2 John", "New Testament", 1, ["2JN", "2JOHN", "II JOHN"]),
    ("3JN", "3 John", "New Testament", 1, ["3JN", "3JOHN", "III JOHN"]),
    ("JUD", "Jude", "New Testament", 1, ["JUD", "JUDE"]),
    ("REV", "Revelation", "New Testament", 22, ["REV", "REVELATION"]),
]


def normalize_book(value: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", value.upper().replace("FIRST", "1").replace("SECOND", "2").replace("THIRD", "3"))


def alias_map() -> dict[str, str]:
    result: dict[str, str] = {}
    for book_id, name, _testament, _chapters, aliases in BOOKS:
        for alias in [book_id, name, *aliases]:
            result[normalize_book(alias)] = book_id
    return result


def download(source: str, destination: Path) -> None:
    if Path(source).is_file():
        shutil.copyfile(source, destination)
        return
    request = urllib.request.Request(source, headers={"User-Agent": "ScriptureGames-BibleBuilder/1.0"})
    last_error: Exception | None = None
    for attempt in range(1, 4):
        try:
            with urllib.request.urlopen(request, timeout=45) as response, destination.open("wb") as handle:
                shutil.copyfileobj(response, handle)
            if destination.stat().st_size < 1_000_000:
                raise RuntimeError("Downloaded Bible archive is unexpectedly small")
            return
        except Exception as error:  # pragma: no cover - network retry path
            last_error = error
            if destination.exists():
                destination.unlink()
            if attempt < 3:
                time.sleep(attempt * 2)
    raise RuntimeError(f"Unable to download Bible source: {last_error}")


def find_xml(archive: zipfile.ZipFile) -> str:
    candidates = [name for name in archive.namelist() if name.lower().endswith("_vpl.xml")]
    if not candidates:
        candidates = [name for name in archive.namelist() if name.lower().endswith(".xml")]
    if not candidates:
        raise RuntimeError("Bible archive did not contain a VPL XML file")
    return sorted(candidates, key=len)[0]


def parse(xml_bytes: bytes) -> dict[str, dict[int, list[tuple[int, str]]]]:
    root = ET.fromstring(xml_bytes)
    aliases = alias_map()
    grouped: dict[str, dict[int, list[tuple[int, str]]]] = {book_id: {} for book_id, *_ in BOOKS}
    unknown: set[str] = set()
    for element in root.iter():
        if element.tag.rsplit("}", 1)[-1].lower() != "v":
            continue
        raw_book = element.attrib.get("b", "").strip()
        book_id = aliases.get(normalize_book(raw_book))
        if not book_id:
            unknown.add(raw_book)
            continue
        try:
            chapter = int(element.attrib.get("c", "0"))
            verse = int(element.attrib.get("v", "0").split("-")[0])
        except ValueError:
            continue
        text = " ".join("".join(element.itertext()).split())
        if chapter > 0 and verse > 0 and text:
            grouped[book_id].setdefault(chapter, []).append((verse, text))
    if unknown:
        print(f"Ignoring non-canonical or unknown VPL books: {sorted(unknown)}", file=sys.stderr)
    return grouped


def validate(grouped: dict[str, dict[int, list[tuple[int, str]]]]) -> tuple[int, int]:
    total_chapters = 0
    total_verses = 0
    failures: list[str] = []
    for book_id, name, _testament, expected_chapters, _aliases in BOOKS:
        chapters = grouped.get(book_id, {})
        if len(chapters) != expected_chapters:
            failures.append(f"{name}: expected {expected_chapters} chapters, found {len(chapters)}")
        expected_numbers = set(range(1, expected_chapters + 1))
        if set(chapters) != expected_numbers:
            failures.append(f"{name}: chapter numbering is incomplete")
        for chapter_number, verses in chapters.items():
            if not verses:
                failures.append(f"{name} {chapter_number}: no verses")
                continue
            seen: set[int] = set()
            for verse_number, text in verses:
                if verse_number in seen:
                    failures.append(f"{name} {chapter_number}:{verse_number}: duplicate verse")
                seen.add(verse_number)
                if not text.strip():
                    failures.append(f"{name} {chapter_number}:{verse_number}: empty text")
            total_verses += len(verses)
        total_chapters += len(chapters)
    if total_chapters != 1189:
        failures.append(f"expected 1189 canonical chapters, found {total_chapters}")
    if total_verses < 31_000:
        failures.append(f"expected at least 31,000 verses, found {total_verses}")
    if failures:
        raise RuntimeError("Bible validation failed:\n- " + "\n- ".join(failures[:30]))
    return total_chapters, total_verses


def write_library(output_root: Path, grouped: dict[str, dict[int, list[tuple[int, str]]]], total_chapters: int, total_verses: int) -> None:
    output_root.mkdir(parents=True, exist_ok=True)
    for stale in output_root.glob("*.json"):
        stale.unlink()

    imports: list[str] = []
    values: list[str] = []
    for book_id, name, testament, expected_chapters, _aliases in BOOKS:
        chapters = grouped[book_id]
        payload = {
            "id": book_id,
            "name": name,
            "testament": testament,
            "chapters": [sorted(chapters[number], key=lambda item: item[0]) for number in range(1, expected_chapters + 1)],
        }
        (output_root / f"{book_id}.json").write_text(
            json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )
        symbol = re.sub(r"[^A-Z0-9_]", "_", f"BOOK_{book_id}")
        imports.append(f"import {symbol} from './bible-data/{book_id}.json';")
        values.append(symbol)

    index_path = output_root.parent / "bible.generated.ts"
    index_path.write_text(
        "\n".join(
            [
                "// Generated from eBible.org's public-domain World English Bible. Do not edit by hand.",
                "import type { BibleBook } from './bible-types';",
                *imports,
                "",
                f"export const BIBLE_BOOKS = [{', '.join(values)}] as BibleBook[];",
                "export const BIBLE_BUILD_META = {",
                "  complete: true,",
                f"  translationId: '{TRANSLATION_ID}',",
                f"  translationName: '{TRANSLATION_NAME}',",
                f"  sourceName: '{SOURCE_NAME}',",
                f"  sourceUrl: '{SOURCE_URL}',",
                "  publicDomain: true,",
                f"  bookCount: {len(BOOKS)},",
                f"  chapterCount: {total_chapters},",
                f"  verseCount: {total_verses},",
                "} as const;",
                "",
            ]
        ),
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", default=SOURCE_URL, help="Official zip URL or a local zip path")
    parser.add_argument("--output", default="frontend/src/bible-data", help="Output directory for per-book JSON")
    args = parser.parse_args()

    output_root = Path(args.output).resolve()
    with tempfile.TemporaryDirectory(prefix="scripture-games-bible-") as temporary:
        archive_path = Path(temporary) / "webp.zip"
        download(args.source, archive_path)
        with zipfile.ZipFile(archive_path) as archive:
            xml_name = find_xml(archive)
            grouped = parse(archive.read(xml_name))
        total_chapters, total_verses = validate(grouped)
        write_library(output_root, grouped, total_chapters, total_verses)

    print(
        f"Built {TRANSLATION_NAME}: {len(BOOKS)} books, "
        f"{total_chapters} chapters, {total_verses} verses."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
