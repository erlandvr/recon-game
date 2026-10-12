"""Reproduce the saved design experiments, without running or editing the game.

Run: python3 docs/analysis/speedrun-economy-review/reproduce.py
Writes reproduced.json alongside this script; compares rows to results.json.
"""
from pathlib import Path
import json
from model import Tuning, simulate

root = Path(__file__).resolve().parent
saved = json.loads((root / 'results.json').read_text())
output = {}
for name in ('reference', 'refined'):
    experiment = saved[name]
    tuning = Tuning(**experiment['tuning'])
    rows = [simulate(tuning, row['route'], row['reaction'], row['before_model'],
                     row['capacity'], row['style'], group_work=row['group_work'])
            for row in experiment['rows']]
    assert rows == experiment['rows'], f'{name}: results differ from saved experiment'
    output[name] = {'tuning': experiment['tuning'], 'rows': rows}
    print(f'{name}: {len(rows)} policies reproduced exactly', flush=True)
(root / 'reproduced.json').write_text(json.dumps(output, indent=2) + '\n')
