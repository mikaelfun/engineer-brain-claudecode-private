# OneNote Export + RAG Sync: Comprehensive Analysis

## Executive Summary
onenote-export and rag-sync are two separate, loosely-coupled skills in the OneNote-to-RAG pipeline.

- **onenote-export**: OneNote → Markdown files (incremental export based on lastModifiedTime)
- **rag-sync**: Markdown → Vector DB (incremental ingest based on file mtime+size)

**Current Status**: ~70% integrated. Share config but lack end-to-end automation.

## Key Configuration Paths

1. onenote-export config: .claude/skills/onenote-export/config.json
   - Sets outputDir: C:\Users\fangkun\Documents\EngineerBrain-Data\OneNote Export

2. rag-sync reads same outputDir from onenote-export config

3. Local-RAG MCP (in .mcp.json):
   - BASE_DIR: Same OneNote Export directory
   - DB_PATH: C:\Users\fangkun\Documents\EngineerBrain-Data\lancedb
   - MODEL_NAME: text-embedding-3-small (OpenAI)

## Data Status

Exported notebooks:
- Kun Fang OneNote: 396 files
- MCVKB: 1274 files  
- Mooncake POD Support: 479 files
- Total: 2149 MD files tracked in .rag-manifest.json

Manifest (.rag-manifest.json):
- Size: ~250 KB (6685 lines)
- Tracks: 1670 files (excludes .git, .obsidian)
- Model: jinaai/jina-embeddings-v2-base-zh (INCONSISTENT WITH CONFIG!)
- LastSync: 2026-03-27T18:27:34.758Z

LanceDB Vector Store:
- Size: 333 MB
- Chunks: ~0.2 MB per file average
- Estimated: ~1.2M chunks
