#!/usr/bin/env python3
"""
kusto-query.py — Multi-cluster Kusto query engine with smart truncation.

Usage:
    python kusto-query.py --cluster <uri> --database <db> --query <kql> [options]
    python kusto-query.py --cluster <uri> --database <db> --probe-schema <table>
    python kusto-query.py --cluster <uri> --database <db> --query-file <path>

Environment:
    AZURE_CONFIG_DIR  — Path to Azure CLI profile directory (required for auth)

Examples:
    # Basic query
    python kusto-query.py \\
      --cluster "https://azcrpmc.kusto.chinacloudapi.cn" \\
      --database "crp_allmc" \\
      --query "ApiQosEvent | where TIMESTAMP > ago(1h) | take 5"

    # Schema probe
    python kusto-query.py \\
      --cluster "https://azcrpmc.kusto.chinacloudapi.cn" \\
      --database "crp_allmc" \\
      --probe-schema "ApiQosEvent"

    # With column filter and truncation
    python kusto-query.py \\
      --cluster "https://azcrpmc.kusto.chinacloudapi.cn" \\
      --database "crp_allmc" \\
      --query "ApiQosEvent | take 10" \\
      --columns "PreciseTimeStamp,operationName,resultCode" \\
      --max-rows 5 --max-col-width 60
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

# ---------------------------------------------------------------------------
# Imports — fail fast with clear message if SDK missing
# ---------------------------------------------------------------------------
try:
    from azure.kusto.data import KustoClient, KustoConnectionStringBuilder
    from azure.kusto.data.exceptions import KustoServiceError
except ImportError:
    print("[IMPORT_ERROR] azure-kusto-data not installed. Run: pip install azure-kusto-data", file=sys.stderr)
    sys.exit(1)

try:
    from azure.identity import DefaultAzureCredential, AzureAuthorityHosts
except ImportError:
    print("[IMPORT_ERROR] azure-identity not installed. Run: pip install azure-identity", file=sys.stderr)
    sys.exit(1)


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
CHINA_CLOUD_SUFFIX = "chinacloudapi.cn"
PUBLIC_CLOUD_SUFFIX = "windows.net"

# Kusto resource scopes for token acquisition
CHINA_KUSTO_SCOPE = "https://kusto.kusto.chinacloudapi.cn/.default"
PUBLIC_KUSTO_SCOPE = "https://kusto.kusto.windows.net/.default"


# ---------------------------------------------------------------------------
# KustoEngine — core execution class
# ---------------------------------------------------------------------------
class KustoEngine:
    """Manages Kusto client connections with lazy caching per cluster URI."""

    def __init__(self):
        self._clients: dict[str, KustoClient] = {}

    def _detect_cloud(self, cluster_uri: str) -> str:
        """Detect cloud environment from cluster URI."""
        if CHINA_CLOUD_SUFFIX in cluster_uri:
            return "china"
        return "public"

    def _get_client(self, cluster_uri: str) -> KustoClient:
        """Get or create a KustoClient for the given cluster URI."""
        if cluster_uri in self._clients:
            return self._clients[cluster_uri]

        cloud = self._detect_cloud(cluster_uri)

        if cloud == "china":
            authority = AzureAuthorityHosts.AZURE_CHINA
        else:
            authority = AzureAuthorityHosts.AZURE_PUBLIC_CLOUD

        credential = DefaultAzureCredential(
            authority=authority,
            exclude_managed_identity_credential=True,
            exclude_visual_studio_code_credential=True,
        )

        kcsb = KustoConnectionStringBuilder.with_azure_token_credential(
            cluster_uri, credential
        )

        client = KustoClient(kcsb)
        self._clients[cluster_uri] = client
        return client

    def execute(
        self,
        cluster: str,
        database: str,
        query: str,
        max_rows: int = 100,
        max_col_width: int = 80,
        columns: list[str] | None = None,
        timeout: int = 120,
    ) -> str:
        """Execute a KQL query and return formatted markdown."""
        client = self._get_client(cluster)

        t0 = time.time()
        try:
            response = client.execute(database, query)
        except KustoServiceError as e:
            return _handle_kusto_error(e, database, query)
        except Exception as e:
            return _handle_generic_error(e, cluster, database)

        elapsed = time.time() - t0

        # Extract primary result table
        primary = response.primary_results[0] if response.primary_results else None
        if primary is None:
            return f"### Query Result\n\n(no result set returned)\n\n> 0 rows | 0.{elapsed:.1f}s | {_short_cluster(cluster)}/{database}"

        # Get column names
        col_names = [col.column_name for col in primary.columns]

        # Collect rows
        all_rows = []
        for row in primary:
            all_rows.append([row[c] for c in col_names])

        # Apply column filter
        if columns:
            col_indices = []
            filtered_names = []
            for c in columns:
                c_stripped = c.strip()
                if c_stripped in col_names:
                    col_indices.append(col_names.index(c_stripped))
                    filtered_names.append(c_stripped)
            if col_indices:
                col_names = filtered_names
                all_rows = [[row[i] for i in col_indices] for row in all_rows]

        # Auto-hide all-null columns when >15 columns and no explicit filter
        if len(col_names) > 15 and not columns:
            non_null_indices = []
            for i in range(len(col_names)):
                if any(_cell_value(row[i]) != "" for row in all_rows[:50]):
                    non_null_indices.append(i)
            if non_null_indices and len(non_null_indices) < len(col_names):
                hidden_count = len(col_names) - len(non_null_indices)
                col_names = [col_names[i] for i in non_null_indices]
                all_rows = [[row[i] for i in non_null_indices] for row in all_rows]
            else:
                hidden_count = 0
        else:
            hidden_count = 0

        total_rows = len(all_rows)
        return format_markdown_table(
            col_names,
            all_rows,
            max_rows=max_rows,
            max_col_width=max_col_width,
            total_rows=total_rows,
            elapsed=elapsed,
            cluster=cluster,
            database=database,
            hidden_cols=hidden_count,
        )

    def probe_schema(self, cluster: str, database: str, table: str) -> str:
        """Probe table schema using .show table T schema as json."""
        client = self._get_client(cluster)

        try:
            response = client.execute(database, f".show table {table} schema as json")
        except KustoServiceError as e:
            return _handle_kusto_error(e, database, f".show table {table} schema as json")
        except Exception as e:
            return _handle_generic_error(e, cluster, database)

        primary = response.primary_results[0] if response.primary_results else None
        if primary is None:
            return f"[SCHEMA_MISMATCH] Table '{table}' not found in database '{database}'"

        # Parse schema JSON from result
        schema_json = None
        for row in primary:
            raw = row["Schema"] if "Schema" in [c.column_name for c in primary.columns] else None
            if raw:
                schema_json = raw
                break

        if not schema_json:
            return f"[SCHEMA_MISMATCH] No schema returned for table '{table}' in database '{database}'"

        try:
            schema = json.loads(schema_json)
        except json.JSONDecodeError:
            return f"[QUERY_ERROR] Failed to parse schema JSON for table '{table}'"

        # Format as markdown
        lines = [f"## Table Schema: {table}", ""]
        lines.append(f"**Database**: {database}  ")
        lines.append(f"**Cluster**: {cluster}")
        lines.append("")

        # Extract ordered columns from schema
        ordered_columns = schema.get("OrderedColumns", [])
        if not ordered_columns:
            return f"## Table Schema: {table}\n\n(no columns found in schema)"

        lines.append("| # | Column | Type |")
        lines.append("|---|--------|------|")
        for i, col in enumerate(ordered_columns, 1):
            col_name = col.get("Name", "?")
            col_type = col.get("CslType", col.get("Type", "?"))
            lines.append(f"| {i} | {col_name} | {col_type} |")

        lines.append("")
        lines.append(f"> {len(ordered_columns)} columns | {_short_cluster(cluster)}/{database}")

        return "\n".join(lines)


# ---------------------------------------------------------------------------
# Formatting helpers
# ---------------------------------------------------------------------------
def _cell_value(val) -> str:
    """Convert a cell value to display string."""
    if val is None:
        return ""
    if isinstance(val, (dict, list)):
        s = json.dumps(val, ensure_ascii=False, default=str)
        return s
    return str(val)


def _truncate(s: str, max_width: int) -> str:
    """Truncate string to max_width, adding ellipsis."""
    if len(s) <= max_width:
        return s
    return s[: max_width - 1] + "…"


def _short_cluster(uri: str) -> str:
    """Extract short cluster name from URI."""
    # https://azcrpmc.kusto.chinacloudapi.cn -> azcrpmc
    try:
        host = uri.replace("https://", "").replace("http://", "").split(".")[0]
        return host
    except Exception:
        return uri


def format_markdown_table(
    col_names: list[str],
    rows: list[list],
    max_rows: int,
    max_col_width: int,
    total_rows: int,
    elapsed: float,
    cluster: str,
    database: str,
    hidden_cols: int = 0,
) -> str:
    """Format query results as a markdown table with smart truncation."""
    lines = ["### Query Result", ""]

    if total_rows == 0:
        lines.append("(empty result set)")
        lines.append("")
        lines.append(f"> 0 rows | {len(col_names)} columns | {elapsed:.1f}s | {_short_cluster(cluster)}/{database}")
        return "\n".join(lines)

    # Truncate rows
    display_rows = rows[:max_rows]
    omitted = total_rows - len(display_rows)

    # Build header
    header_cells = [_truncate(c, max_col_width) for c in col_names]
    lines.append("| " + " | ".join(header_cells) + " |")
    lines.append("|" + "|".join(["---"] * len(col_names)) + "|")

    # Build rows
    for row in display_rows:
        cells = [_truncate(_cell_value(v).replace("\n", " ").replace("|", "\\|"), max_col_width) for v in row]
        lines.append("| " + " | ".join(cells) + " |")

    if omitted > 0:
        lines.append(f"| ... ({omitted} more rows omitted) |" + " |" * (len(col_names) - 1))

    # Stats footer
    lines.append("")
    stats_parts = [
        f"{total_rows} rows",
        f"{len(col_names)} columns",
    ]
    if hidden_cols > 0:
        stats_parts.append(f"{hidden_cols} all-null columns hidden")
    stats_parts.extend([
        f"{elapsed:.1f}s",
        f"{_short_cluster(cluster)}/{database}",
    ])
    lines.append("> " + " | ".join(stats_parts))

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Error handling — structured prefixes for evolution triggers
# ---------------------------------------------------------------------------
def _handle_kusto_error(error: KustoServiceError, database: str, query: str) -> str:
    """Parse Kusto service errors into structured error messages."""
    msg = str(error)
    msg_lower = msg.lower()

    # Schema mismatch patterns
    schema_patterns = [
        "has no column",
        "not found",
        "cannot find",
        "is not a valid",
        "semantic error",
        "doesn't have",
        "table not found",
        "entity not found",
        "failed to resolve",
    ]
    if any(p in msg_lower for p in schema_patterns):
        return f"[SCHEMA_MISMATCH] {msg}"

    # Auth errors
    if "401" in msg or "403" in msg or "unauthorized" in msg_lower or "forbidden" in msg_lower:
        azure_dir = os.environ.get("AZURE_CONFIG_DIR", "(not set)")
        return f"[AUTH_ERROR] {msg}\n\nRemediation: Run `az login` with AZURE_CONFIG_DIR={azure_dir}"

    # Timeout
    if "timeout" in msg_lower or "timed out" in msg_lower:
        return f"[TIMEOUT] {msg}\n\nTry narrowing the time range or adding more filters."

    # General query error
    return f"[QUERY_ERROR] {msg}"


def _handle_generic_error(error: Exception, cluster: str, database: str) -> str:
    """Handle non-Kusto exceptions."""
    msg = str(error)
    msg_lower = msg.lower()

    if "401" in msg or "unauthorized" in msg_lower or "credential" in msg_lower:
        azure_dir = os.environ.get("AZURE_CONFIG_DIR", "(not set)")
        return f"[AUTH_ERROR] {msg}\n\nRemediation: Run `az login` with AZURE_CONFIG_DIR={azure_dir}"

    if "timeout" in msg_lower or "timed out" in msg_lower:
        return f"[TIMEOUT] {msg}"

    if "name resolution" in msg_lower or "connection" in msg_lower or "unreachable" in msg_lower:
        return f"[CONNECTION_ERROR] Cannot reach {cluster}: {msg}"

    return f"[ERROR] {msg}"


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------
def parse_args():
    parser = argparse.ArgumentParser(
        description="Multi-cluster Kusto query engine with smart truncation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--cluster", required=True, help="Kusto cluster URI")
    parser.add_argument("--database", required=True, help="Database name")

    # Query source (mutually exclusive)
    query_group = parser.add_mutually_exclusive_group()
    query_group.add_argument("--query", help="KQL query (inline)")
    query_group.add_argument("--query-file", help="Path to file containing KQL")
    query_group.add_argument("--probe-schema", metavar="TABLE", help="Probe table schema")

    # Output controls
    parser.add_argument("--max-rows", type=int, default=100, help="Max result rows (default: 100)")
    parser.add_argument("--max-col-width", type=int, default=80, help="Max column width (default: 80)")
    parser.add_argument("--columns", help="Comma-separated column whitelist")
    parser.add_argument("--format", choices=["markdown", "json", "csv"], default="markdown", help="Output format")
    parser.add_argument("--timeout", type=int, default=120, help="Query timeout in seconds (default: 120)")
    parser.add_argument("--dry-run", action="store_true", help="Print query without executing")

    return parser.parse_args()


def main():
    args = parse_args()
    engine = KustoEngine()

    # Resolve query
    if args.probe_schema:
        if args.dry_run:
            print(f"[DRY-RUN] Would probe schema for table '{args.probe_schema}'")
            print(f"  Cluster:  {args.cluster}")
            print(f"  Database: {args.database}")
            print(f"  Command:  .show table {args.probe_schema} schema as json")
            return
        result = engine.probe_schema(args.cluster, args.database, args.probe_schema)
        print(result)
        return

    # Get KQL from --query or --query-file
    query = None
    if args.query:
        query = args.query
    elif args.query_file:
        try:
            query = Path(args.query_file).read_text(encoding="utf-8").strip()
        except FileNotFoundError:
            print(f"[ERROR] Query file not found: {args.query_file}", file=sys.stderr)
            sys.exit(1)
    else:
        print("[ERROR] One of --query, --query-file, or --probe-schema is required.", file=sys.stderr)
        sys.exit(1)

    if args.dry_run:
        print(f"[DRY-RUN] Would execute query:")
        print(f"  Cluster:  {args.cluster}")
        print(f"  Database: {args.database}")
        print(f"  Max rows: {args.max_rows}")
        print(f"  Timeout:  {args.timeout}s")
        print(f"  Query:")
        for line in query.split("\n"):
            print(f"    {line}")
        return

    columns = [c.strip() for c in args.columns.split(",")] if args.columns else None

    result = engine.execute(
        cluster=args.cluster,
        database=args.database,
        query=query,
        max_rows=args.max_rows,
        max_col_width=args.max_col_width,
        columns=columns,
        timeout=args.timeout,
    )

    # JSON / CSV format conversion
    if args.format == "json" and not result.startswith("["):
        # Re-execute to get raw data for JSON output
        # (only if markdown was produced; error messages pass through)
        pass  # markdown is fine for errors

    print(result)


if __name__ == "__main__":
    main()
