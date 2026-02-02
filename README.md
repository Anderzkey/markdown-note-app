# Markdown Note Reader

A beautiful, minimalist web application for **reading Markdown files** with elegant typography and syntax highlighting.

This project is view‑focused: you open existing `.md` / `.markdown` / `.txt` files and read them in a distraction‑free layout. Editing, multi‑file management, and sync are intentionally out of scope for the MVP.

## Features

- **File input**
  - Drag & drop files into the app
  - Click “Open File” to pick a file via the browser file picker
  - Basic validation for type and size (max 5 MB)
- **Markdown rendering**
  - Uses `marked.js` to convert markdown to HTML
  - Supports headings, lists, emphasis, code, blockquotes, tables, and more
- **Code highlighting**
  - Uses `highlight.js` for syntax highlighting in fenced code blocks
- **Typography and layout**
  - Clean, large, readable fonts
  - Soft card layout with a central preview pane
  - Mobile‑friendly design

## Tech Stack

- **HTML5** for structure and the File API
- **CSS3** for custom styling (no frameworks)
- **Vanilla JavaScript** for all behaviour
- **marked.js** (CDN) for markdown parsing
- **highlight.js** (CDN) for code highlighting

## Getting Started

1. Clone or download this repository.
2. Open `index.html` directly in your browser **or** serve the folder with a small HTTP server:

   ```bash
   cd "Markdown Note Taking App"
   python3 -m http.server 8000
   # then open http://localhost:8000 in your browser
   ```

3. Drag a markdown file into the drop zone or click **📁 Open File**.

## File Size and Types

- Maximum file size: **5 MB**
- Accepted extensions: `.md`, `.markdown`, `.txt`
- Accepted MIME types: `text/markdown`, `text/plain`

## Development Notes

- Core project plan lives in `plans/markdown-note-app.md`.
- `app.js` is kept under ~300 lines and `styles.css` under ~200 lines as a rough guideline for readability.
- Dark mode and other enhancements can be added in later phases without changing the basic structure.

## License

This project is for personal learning and experimentation. Adapt and reuse it as you like within your own projects.***
