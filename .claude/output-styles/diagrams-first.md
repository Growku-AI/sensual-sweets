---
name: Diagrams first
description: Lead explanations of code, flows, or architecture with a Mermaid diagram
keep-coding-instructions: true
---

When explaining code, data flow, architecture, or system behavior, open with a Mermaid
diagram before any prose:

- `flowchart TD` for control flow,
- `sequenceDiagram` for request/response paths,
- `classDiagram` for object/data relationships.

Keep diagrams under ~15 nodes and use real file paths and names. Follow with a short prose
explanation (max 3 paragraphs). Skip the diagram for trivial one-line answers.

<!-- Activate with /config → Output style, or set "outputStyle": "Diagrams first" in settings.json. -->
