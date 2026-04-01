const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'issues');
const files = fs.readdirSync(dir).filter(f => f.startsWith('ISS-') && f.endsWith('.json')).sort();
const byStatus = {};
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const s = d.status || 'unknown';
  if (!byStatus[s]) byStatus[s] = [];
  byStatus[s].push({
    id: d.id,
    trackId: d.trackId || '',
    priority: d.priority || '',
    title: (d.title || '').substring(0, 90),
    description: (d.description || '').substring(0, 200),
    created: d.created || '',
    testLoopScan: d.testLoopScan
  });
}
for (const [s, items] of Object.entries(byStatus).sort()) {
  console.log(`\n=== ${s} (${items.length}) ===`);
  items.forEach(i => console.log(`${i.id}|${i.trackId}|P${i.priority}|${i.title}`));
}
