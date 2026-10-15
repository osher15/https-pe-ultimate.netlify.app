# BB-05 Main A: replacement `placements.csv` rows

For `store-content/diagrams/placements.csv` on `codex/g1-notion-export-pilot-20261014`.

**Delete** this row (the "not drawn" exception row, with its `open_question`):

```csv
BB-05,,mainA,1,,none,Not drawn because the source description of the three-cone setup is contradictory.,"The Main A instructions describe three cones while also requiring an empty cone. Which cone is meant to remain empty, and how should the three cones be occupied? Clarify the intended setup before drawing."
```

**Insert** these two rows instead (`open_question` is empty):

```csv
BB-05,BB-05-D3,mainA,1,open-area,representative,"Round 1 of the three-cone pass, cut and swap: the passer and the far player swap cones.",
BB-05,BB-05-D4,mainA,1,open-area,representative,"Round 2 from the positions that result from round 1: the next passer and the far player swap cones.",
```

The scene files are `store-content/diagrams/scenes/BB-05/BB-05-D3.json` and `BB-05-D4.json` (commit on branch `c23-bb05-maina`).
