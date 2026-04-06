"""Merge crawled wiki leaves into scanned-ado-wiki.json, producing rebuild report."""
import json, sys, os
from datetime import datetime

def merge_index(product_id, crawl_file, scan_file):
    # Load crawled leaves
    with open(crawl_file, 'r', encoding='utf-8') as f:
        crawl = json.load(f)
    new_index = crawl['leaves']

    # Load existing scan state
    if os.path.exists(scan_file):
        with open(scan_file, 'r', encoding='utf-8') as f:
            scan = json.load(f)
    else:
        scan = {"index": [], "scanned": [], "skipped": []}

    old_index = set(scan.get('index', []))
    scanned = set(scan.get('scanned', []))
    skipped = set(scan.get('skipped', []))
    new_index_set = set(new_index)

    # Calculate diffs
    added = new_index_set - old_index
    removed = old_index - new_index_set
    scanned_valid = scanned & new_index_set
    scanned_stale = scanned - new_index_set
    skipped_valid = skipped & new_index_set
    to_scan = new_index_set - scanned - skipped

    # Update scan state
    scan['index'] = sorted(new_index_set)
    scan['indexUpdatedAt'] = datetime.now().isoformat()
    # Keep scanned/skipped as-is (stale entries are harmless)

    with open(scan_file, 'w', encoding='utf-8') as f:
        json.dump(scan, f, ensure_ascii=False, indent=2)

    # Check if we should reset sourceStates
    should_reset = len(added) > max(len(old_index) * 0.1, 10) if old_index else len(new_index_set) > 0

    report = {
        'product': product_id,
        'old_index': len(old_index),
        'new_index': len(new_index_set),
        'added': len(added),
        'removed': len(removed),
        'scanned_valid': len(scanned_valid),
        'scanned_stale': len(scanned_stale),
        'skipped_valid': len(skipped_valid),
        'to_scan': len(to_scan),
        'should_reset': should_reset,
    }
    return report

def update_progress(product_id, should_reset, enrich_dir):
    progress_file = os.path.join(enrich_dir, 'progress.json')
    if os.path.exists(progress_file):
        with open(progress_file, 'r', encoding='utf-8') as f:
            progress = json.load(f)
    else:
        progress = {}

    if should_reset:
        if 'sourceStates' not in progress:
            progress['sourceStates'] = {}
        progress['sourceStates']['ado-wiki'] = 'scanning'

    with open(progress_file, 'w', encoding='utf-8') as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    product_id = sys.argv[1]
    crawl_file = sys.argv[2]
    scan_file = sys.argv[3]

    report = merge_index(product_id, crawl_file, scan_file)

    enrich_dir = os.path.dirname(scan_file)
    if report['should_reset']:
        update_progress(product_id, True, enrich_dir)

    print(json.dumps(report))
