#!/usr/bin/env python3
"""
SAP 路径匹配引擎

根据问题描述/关键词搜索最匹配的 SAP 路径。
用于：
  1. casework assess —— sapMismatch 时建议正确 SAP
  2. casework act —— out-of-scope 时建议 transfer 目标
  3. 工程师手动查询 —— 快速找到某个产品的 SAP 路径

用法：
  python3 match-sap.py "virtual machine disk resize"
  python3 match-sap.py "cosmos db" --family Azure --top 5
  python3 match-sap.py "exchange online mailbox" --pod-check
  python3 match-sap.py --list-products Azure          # 列出某 family 所有产品
  python3 match-sap.py --list-families                 # 列出所有 family
"""

import json, os, sys, re, argparse
from pathlib import Path
from collections import defaultdict

# ── 路径 ──
SCRIPT_DIR = Path(__file__).resolve().parent
# sap-match/ → skills/ → .claude/ → src/ → ../data
SRC_ROOT = SCRIPT_DIR.parents[2]  # .claude/skills/sap-match → src
CONFIG_FILE = SRC_ROOT / "config.json"

def _resolve_data_root():
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            cfg = json.load(f)
        return (SRC_ROOT / cfg.get("dataRoot", "../data")).resolve()
    return (SRC_ROOT / ".." / "data").resolve()

DATA_ROOT = _resolve_data_root()
ROUTING_FILE = DATA_ROOT / "sap-routing.json"
PATHS_DIR = DATA_ROOT / "sap-paths"
SCOPE_FILE = DATA_ROOT / "sap-scope.json"

# ── 加载数据 ──
def load_routing():
    with open(ROUTING_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def load_family_paths(family_file):
    fp = PATHS_DIR / family_file
    if not fp.exists():
        return None
    with open(fp, "r", encoding="utf-8") as f:
        return json.load(f)

def load_scope():
    if SCOPE_FILE.exists():
        with open(SCOPE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return None

# ── Mooncake / Global 范围判定 ──
_MOONCAKE_RE = re.compile(r'21Vianet|Mooncake|21V\b|China\s+(Cloud|Azure)', re.IGNORECASE)

def is_mooncake_path(path):
    """判断 SAP path 是否属于 Mooncake (21Vianet) 范围"""
    return bool(_MOONCAKE_RE.search(path))

# ── 分词 ──
STOP_WORDS = {
    "the", "a", "an", "is", "are", "was", "were", "be", "been",
    "in", "on", "at", "to", "for", "of", "with", "by", "from",
    "and", "or", "not", "can", "cannot", "how", "what", "why",
    "when", "where", "which", "my", "i", "we", "it", "this",
    "that", "have", "has", "had", "do", "does", "did", "will",
    "would", "could", "should", "may", "might", "about", "issue",
    "problem", "error", "help", "need", "please", "want",
}

def tokenize(text):
    """分词：保留有意义的 token（小写化，去停用词）"""
    tokens = re.findall(r'[a-zA-Z0-9]+(?:[-/.][a-zA-Z0-9]+)*', text.lower())
    return [t for t in tokens if t not in STOP_WORDS and len(t) > 1]

# ── 匹配评分 ──
def score_match(query_tokens, target_text, boost=1.0):
    """
    计算 query tokens 与 target text 的匹配分。
    返回 (score, matched_tokens)
    """
    target_lower = target_text.lower()
    target_tokens = set(tokenize(target_text))

    score = 0.0
    matched = []

    for qt in query_tokens:
        qt_lower = qt.lower()
        # 精确 token 匹配（最高分）
        if qt_lower in target_tokens:
            score += 3.0
            matched.append(qt)
        # 子串匹配
        elif qt_lower in target_lower:
            score += 2.0
            matched.append(qt)
        # 部分匹配（target token 包含 query token 或反之）
        else:
            for tt in target_tokens:
                if qt_lower in tt or tt in qt_lower:
                    score += 1.0
                    matched.append(qt)
                    break

    # 覆盖率加权：匹配的 token 占 query 的比例
    if query_tokens:
        coverage = len(matched) / len(query_tokens)
        score *= (0.5 + 0.5 * coverage)

    # 全词组匹配加分
    query_phrase = " ".join(query_tokens)
    if query_phrase in target_lower:
        score += 5.0

    return score * boost, matched


def search_sap(query, routing, family_filter=None, top_n=10, pod_check=False, scope=None):
    """
    主搜索函数。

    scope: None=全部, "mooncake"=只返回 21V 路径, "global"=排除 21V,
           "mooncake-first"=优先 mooncake，不够则 fallback global

    流程：
    1. 在 productIndex 中匹配产品（快速，2K 条目）
    2. 对 top 匹配的 family，在 flatPaths 中搜索详细路径
    3. 标注 POD 归属
    """
    query_tokens = tokenize(query)
    if not query_tokens:
        return []

    sap_scope_data = load_scope() if pod_check else None
    pods = routing.get("pods", {})

    # ── Phase 1: Product-level matching ──
    product_scores = []
    for prod in routing.get("productIndex", []):
        if family_filter and prod["family"].lower() != family_filter.lower():
            continue

        # 匹配 product name + family name
        combined = f"{prod['family']} {prod['name']}"
        score, matched = score_match(query_tokens, combined, boost=1.0)

        if score > 0:
            product_scores.append({
                "family": prod["family"],
                "product": prod["name"],
                "guid": prod["guid"],
                "score": score,
                "matched": matched,
            })

    product_scores.sort(key=lambda x: -x["score"])

    # ── Phase 2: 对 top families 做 flatPaths 搜索 ──
    # 取 top 匹配涉及的 families
    top_families = []
    seen_fam = set()
    for ps in product_scores[:20]:
        if ps["family"] not in seen_fam:
            seen_fam.add(ps["family"])
            top_families.append(ps["family"])
        if len(top_families) >= 5:
            break

    if family_filter:
        top_families = [family_filter]

    # Family -> fileName 映射
    fam_file_map = {f["name"]: f["fileName"] for f in routing.get("familyIndex", [])}

    path_results = []
    for fam_name in top_families:
        file_name = fam_file_map.get(fam_name)
        if not file_name:
            continue

        fam_data = load_family_paths(file_name)
        if not fam_data:
            continue

        for entry in fam_data.get("flatPaths", []):
            path_is_mc = is_mooncake_path(entry["path"])

            score, matched = score_match(query_tokens, entry["path"])
            if score > 0:
                # 加深度加分：更具体的路径更好
                depth_bonus = min(entry["depth"] * 0.3, 1.2)

                result = {
                    "path": entry["path"],
                    "guid": entry["guid"],
                    "depth": entry["depth"],
                    "type": entry["type"],
                    "score": round(score + depth_bonus, 2),
                    "matched": matched,
                    "isMooncake": path_is_mc,
                }

                # POD 检查（归一化反斜杠）
                if pod_check and sap_scope_data:
                    norm_path = entry["path"].replace("\\", "/")
                    in_pod = any(
                        norm_path.startswith(prefix.replace("\\", "/"))
                        for prefix in sap_scope_data.get("validPrefixes", [])
                    )
                    result["inPod"] = in_pod

                    # 查找属于哪个 POD
                    if pods:
                        for pod_name, pod_info in pods.items():
                            if isinstance(pod_info, dict):
                                pod_services = pod_info.get("services", [])
                                for svc in pod_services:
                                    if isinstance(svc, str) and svc.lower() in entry["path"].lower():
                                        result["suggestedPod"] = pod_name
                                        break

                path_results.append(result)

    # 去重 + 排序
    seen_paths = set()
    unique_results = []
    for r in sorted(path_results, key=lambda x: -x["score"]):
        if r["path"] not in seen_paths:
            seen_paths.add(r["path"])
            unique_results.append(r)

    # ── scope 后处理过滤 ──
    if scope == "mooncake":
        unique_results = [r for r in unique_results if r.get("isMooncake")]
    elif scope == "global":
        unique_results = [r for r in unique_results if not r.get("isMooncake")]
    elif scope == "mooncake-first":
        mc = [r for r in unique_results if r.get("isMooncake")]
        gl = [r for r in unique_results if not r.get("isMooncake")]
        unique_results = (mc + gl)

    return unique_results[:top_n]


def list_products(routing, family_name):
    """列出某 family 下所有产品"""
    prods = [p for p in routing.get("productIndex", [])
             if p["family"].lower() == family_name.lower()]
    return sorted(prods, key=lambda x: x["name"])


def list_families(routing):
    """列出所有 family"""
    return routing.get("familyIndex", [])


# ── CLI ──
def main():
    parser = argparse.ArgumentParser(description="SAP 路径匹配引擎")
    parser.add_argument("query", nargs="*", help="搜索关键词")
    parser.add_argument("--family", "-f", help="限定 family")
    parser.add_argument("--top", "-n", type=int, default=10, help="返回前 N 条（默认 10）")
    parser.add_argument("--pod-check", action="store_true", help="标注是否在 POD scope 内")
    parser.add_argument("--scope", "-s", choices=["mooncake", "global", "mooncake-first"],
                        help="范围：mooncake=只 21V, global=排除 21V, mooncake-first=优先 21V 不够补 Global")
    parser.add_argument("--list-families", action="store_true", help="列出所有 family")
    parser.add_argument("--list-products", metavar="FAMILY", help="列出某 family 的所有产品")
    parser.add_argument("--json", action="store_true", help="JSON 格式输出")
    args = parser.parse_args()

    routing = load_routing()

    if args.list_families:
        families = list_families(routing)
        if args.json:
            print(json.dumps(families, ensure_ascii=False, indent=2))
        else:
            print(f"{'Family':<45} {'Products':>8} {'Total':>8}")
            print(f"{'─'*45} {'─'*8} {'─'*8}")
            for f in families:
                print(f"{f['name']:<45} {f['productCount']:>8} {f['totalCount']:>8}")
            print(f"\nTotal: {len(families)} families")
        return

    if args.list_products:
        prods = list_products(routing, args.list_products)
        if args.json:
            print(json.dumps(prods, ensure_ascii=False, indent=2))
        else:
            print(f"Products in [{args.list_products}] ({len(prods)} total):\n")
            for p in prods:
                print(f"  {p['name']}")
        return

    if not args.query:
        parser.print_help()
        return

    query = " ".join(args.query)
    results = search_sap(query, routing,
                         family_filter=args.family,
                         top_n=args.top,
                         pod_check=args.pod_check,
                         scope=args.scope)

    if args.json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        if not results:
            print(f"No matches for: {query}")
            return

        print(f"Query: {query}")
        if args.family:
            print(f"Family: {args.family}")
        print(f"Results: {len(results)}\n")

        for i, r in enumerate(results, 1):
            pod_info = ""
            if args.pod_check:
                if r.get("inPod"):
                    pod_info = " ✅ in-pod"
                else:
                    pod_info = f" ❌ out-of-pod"
                    if r.get("suggestedPod"):
                        pod_info += f" → {r['suggestedPod']}"

            mc_label = " 🌙MC" if r.get("isMooncake") else " 🌐GL"
            print(f"  {i:>2}. [{r['type']:<8}] {r['path']}")
            print(f"      score={r['score']:.1f}  depth={r['depth']}{mc_label}  guid={r['guid'][:16]}...{pod_info}")
            print()


if __name__ == "__main__":
    main()
