---
name: markitdown
description: Converts diverse file formats (PDF, DOCX, XLSX, PPTX, HTML, ZIP, images) into clean Markdown. Use this when the user uploads non-text files or requests document text extraction.
---

# MarkItDown Skill

You are equipped with the `markitdown` Python package capabilities to convert unstructured files into structured Markdown.

## When to use this skill
- When a user provides a file path or attaches a document (like a PDF statement, Word document, Excel sheet, or PowerPoint presentation).
- When you need to parse text, tables, or layout metadata out of a binary file format.

## Dependencies & Setup
Before running python scripts using this skill, ensure the package is available in the local environment:
```bash
pip install markitdown