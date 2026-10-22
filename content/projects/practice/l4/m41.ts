import { practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M41: ProjectSrc[] = [
  practice("m4-1-extracting-from-pdfs-html-and-docx", "extend",
    pj("Add tables and metadata", 40, "Extend a basic PDF text extractor so it keeps page numbers and handles tables.",
      [
        ["Run the starter on a PDF with a table and note how the table text comes out.", "Rows often merge into one line."],
        ["Return one document per page with the page number in its metadata.", "Keep the source file path as well."],
        ["Extract tables separately and write each as Markdown rows.", "Libraries such as `pdfplumber` find tables."],
        ["Add a test with a small sample PDF that checks the page numbers and the table rows.", "Assert on exact values."],
      ],
      "An extractor that returns per-page documents with metadata and Markdown tables, with a passing test.",
      ["One document per page with numbers", "Tables written as Markdown", "Test passes on a sample PDF"],
      "Look at cleaning while keeping structure next.", ["Python 3.11 or newer"]),
    { starter: code(
      "from pypdf import PdfReader",
      "def extract(path):",
      "    reader = PdfReader(path)",
      "    return ' '.join(page.extract_text() for page in reader.pages)") }),
  practice("m4-1-cleaning-while-keeping-structure", "debug",
    pj("The cleaner that eats headings", 35, "Find why a cleaning function deletes real headings and joins separate paragraphs, and fix it.",
      [
        ["Run the cleaner on the sample text above and compare it with the input.", "Print both side by side."],
        ["Write down every line that disappeared and every pair of lines that merged.", "Find the rule that caused each."],
        ["Fix the rules so repeated page headers go but real headings stay.", "Test with a heading that repeats once only."],
        ["Add three test cases for headings, bullet lists and hyphenated line breaks.", "Assert on exact output."],
      ],
      "A cleaner that keeps headings and paragraphs, with three passing tests.",
      ["Lost lines identified", "Rules fixed and retested", "Three tests pass"],
      "Look at duplicates and re-indexing next.", ["Python 3.11 or newer"]),
    { starter: code(
      "def clean(text):",
      "    lines = [l.strip() for l in text.split('\\n')]",
      "    counts = {l: lines.count(l) for l in lines}",
      "    kept = [l for l in lines if counts[l] == 1 and not l.isupper()]",
      "    return ' '.join(kept)") }),
  practice("m4-1-duplicates-updates-and-re-indexing", "reimplement",
    pj("Mini sync tool", 50, "Reimplement in miniature what a sync tool does: detect new, changed and deleted files and update an index.",
      [
        ["Write a function that hashes every file in a folder and saves a manifest.", "Use a content hash, not the modified time."],
        ["Write a comparison that returns new, changed, unchanged and deleted files.", "Test it with a temporary folder."],
        ["Apply the changes to a simple index file and record how many entries each class touched.", "Deleted files must remove their entries."],
        ["Compare your tool with how a real tool such as `rsync` or a vector store upsert works.", "Note what yours lacks."],
      ],
      "A small sync tool with a manifest, a four-way comparison, an applied index update and a note on gaps.",
      ["Manifest uses content hashes", "Four classes detected in tests", "Index updated correctly"],
      "Go on to chunking strategies in M4.2.", ["Python 3.11 or newer"]),
    {}),
];
