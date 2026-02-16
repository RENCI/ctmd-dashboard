# Pipeline Rebuild: Parallel Workstreams

Reference: [pipeline-rebuild-spec.md](./pipeline-rebuild-spec.md)

---

## Overview

The rebuild decomposes into two independent work streams that converge at integration (Epic 4). A shared kickoff story (2.1) unblocks both streams.

```
                        ┌─── Stream A: Schema + DB Ops ────┐
                        │                                   │
  2.1 Field Manifest ──►│                                   ├──► Epic 4 ──► Epic 5
  (shared kickoff)      │                                   │    Integration  Testing
                        │                                   │
                        └─── Stream B: REDCap + Transform ──┘
```

---

## Shared Kickoff: Story 2.1

**Story 2.1 — Analyze mapping.json to build REDCap field manifest**

This must complete before either stream begins. It produces:
- The complete list of REDCap source fields (informs Stream B)
- Validated table/column inventory against API service expectations (informs Stream A)

**Estimated effort:** 1 day

---

## Stream A: Schema + Database Operations (Epics 1 + 3)

**Why independent:** Uses `mapping.json` (already exists) and can test against CSV output from the current Spark pipeline in `data/tables/`. Does not need the new Python ETL.

### Phase A1: Schema Generation (Epic 1, Stories 1.1-1.4)

| Story | Description | Depends On | Estimated Effort |
|-------|-------------|------------|------------------|
| 1.1 | Parse mapping.json into validated Pydantic models | 2.1 | 1-2 days |
| 1.2 | Generate initial migration SQL (CREATE TABLE + PK) | 1.1 | 1-2 days |
| 1.3 | Implement migration runner (numbered SQL files) | None | 1-2 days |
| 1.4 | Wire migration runner into pipeline startup | 1.2, 1.3 | 1 day |

Notes:
- 1.1 and 1.3 can be done in parallel (1.1 produces the SQL content, 1.3 is the runner mechanism)
- 1.2 needs 1.1's output
- 1.4 wires them together

### Phase A2: Database Operations (Epic 3, Stories 3.1-3.4)

| Story | Description | Depends On | Estimated Effort |
|-------|-------------|------------|------------------|
| 3.1 | Bulk load with PostgreSQL COPY, fix SQL injection | 1.2 (need schema) | 2-3 days |
| 3.2 | Atomic sync with transaction boundaries | 3.1 | 1-2 days |
| 3.3 | Update Flask REST API endpoints | 3.1 | 1-2 days |
| 3.4 | Pre-load data validation | 1.1 (need models) | 1-2 days |

Notes:
- 3.1 can start as soon as the schema exists (from 1.2)
- 3.3 and 3.4 can be done in parallel once 3.1 is complete
- Test using existing CSV output from current pipeline

### Phase A3: Deferred Constraints (Epic 1, Story 1.5)

| Story | Description | Depends On | Estimated Effort |
|-------|-------------|------------|------------------|
| 1.5 | Add FK and NOT NULL constraints | Stream B complete, real data validated | 2-3 days |

This story **cannot start** until the new Python ETL (Stream B) has produced real data and NULL counts have been checked per column.

### Stream A Timeline

```
Week 1                    Week 2                    Week 3
──────────────────────────────────────────────────────────────
1.1 Parse models ──►┐
                     ├──► 1.2 Gen SQL ──► 1.4 Wire in
1.3 Migration runner►┘
                                          3.1 COPY loader ──►┐
                          3.4 Validation                      ├──► Done
                                          3.2 Atomic sync  ──►│   (except 1.5)
                                          3.3 Flask update ──►┘
```

---

## Stream B: REDCap Extraction & Transformation (Epic 2)

**Why independent:** Outputs DataFrames. Does not need the new schema or database loader — can test transformation output against existing Spark output as a reference.

### Phase B1: Client & Core Logic

| Story | Description | Depends On | Estimated Effort |
|-------|-------------|------------|------------------|
| 2.2 | REDCap API client with targeted extraction | 2.1 | 2-3 days |
| 2.3 | Field transformation functions (coalesce, generate_ID, conditionals) | 2.1 | 2-3 days |
| 2.4 | Port name parser from Scala | None (reference: DSL.scala:25-151) | 2-3 days |

Notes:
- 2.2, 2.3, and 2.4 can all be done in parallel
- 2.4 has no dependency on 2.1 — it's a pure port of existing Scala logic

### Phase B2: Filters & Unpivot

| Story | Description | Depends On | Estimated Effort |
|-------|-------------|------------|------------------|
| 2.5 | Data filters (non-repeating, test data, auxiliary, blocklist) | None (reference: Transform.scala:54-153) | 2-3 days |
| 2.6 | Checkbox unpivot (wide-to-long) | None (reference: Transform.scala:411-494) | 1-2 days |

Notes:
- Both are pure ports of Scala logic with no external dependencies
- Can run in parallel with each other AND with Phase B1
- Test using fixtures from `services/pipeline/test/`

### Phase B3: Auxiliary Tables

| Story | Description | Depends On | Estimated Effort |
|-------|-------------|------------|------------------|
| 2.7 | `name` table generation from data dictionary | 2.1, 2.2 (needs data dict download) | 2-3 days |
| 2.8 | `reviewer_organization` table generation | None (reference: Transform.scala:538-549) | 1 day |

Notes:
- 2.7 depends on the REDCap client (2.2) for data dictionary download
- 2.8 has no dependencies and can run anytime
- 2.7 is **critical path** — the `name` table is used by nearly every API endpoint

### Stream B Timeline

```
Week 1                    Week 2                    Week 3
──────────────────────────────────────────────────────────────
2.2 REDCap client ──────►┐
                          ├──► 2.7 Name table gen ──► Done
2.3 Transforms ──────────►┘
2.4 Name parser ─────────►
2.5 Filters ─────────────►
2.6 Unpivot ──────►
2.8 Reviewer org ─►
```

### Parallelism Within Stream B (Summary)

| Story | Can Run Concurrently With |
|-------|--------------------------|
| 2.2 REDCap client | 2.3, 2.4, 2.5, 2.6, 2.8 |
| 2.3 Transforms | 2.2, 2.4, 2.5, 2.6, 2.7, 2.8 |
| 2.4 Name parser | Everything |
| 2.5 Filters | Everything |
| 2.6 Unpivot | Everything |
| 2.7 Name table | 2.3, 2.4, 2.5, 2.6, 2.8 (needs 2.2 for data dict) |
| 2.8 Reviewer org | Everything |

---

## Convergence: Epic 4 (Integration)

**Prerequisite:** Streams A and B both complete.

| Story | Description | Depends On | Estimated Effort |
|-------|-------------|------------|------------------|
| 4.1 | Rewrite pipeline orchestration | Streams A + B | 2-3 days |
| 4.2 | Simplify Dockerfile (single-stage Python) | 4.1 | 1-2 days |
| 4.3 | Update Helm chart and env vars | 4.2 | 1 day |
| 4.4 | Remove dead code (Haskell, Scala, Spark) | 4.1 | 1 day |
| 4.5 | Update Makefile | 4.2 | 0.5 day |

Notes:
- 4.4 and 4.5 can be done in parallel with 4.2 and 4.3
- This is inherently sequential work (wiring components together)

```
4.1 Orchestration ──► 4.2 Dockerfile ──► 4.3 Helm
                      4.4 Remove dead code
                      4.5 Makefile
```

---

## Validation: Epic 5 (Testing)

**Prerequisite:** Epic 4 complete.

| Story | Description | Depends On | Estimated Effort |
|-------|-------------|------------|------------------|
| 5.1 | Unit tests: schema generation | Epic 1 | 1-2 days |
| 5.2 | Unit tests: field transformations | Epic 2 | 1-2 days |
| 5.3 | Output equivalence (Spark vs. Python) | Epics 2 + 4 | 2-3 days |
| 5.4 | End-to-end integration test | Epic 4 | 2-3 days |
| 5.5 | Performance benchmarks | Epic 4 | 1 day |
| 5.6 | Failure and recovery testing | Epic 4 | 1-2 days |

Notes:
- 5.1 and 5.2 can start earlier (as unit tests for their respective epics)
- 5.3, 5.4, 5.5, 5.6 require the integrated pipeline (Epic 4)
- 5.3 is the gate for production cutover

```
5.1 Schema tests ──────►┐
5.2 Transform tests ────►├──► 5.3 Equivalence ──► 5.4 E2E ──► Cutover
                         │    5.5 Benchmarks
                         │    5.6 Failure testing
                         ┘
```

---

## Two-Person Assignment

| Week | Person 1 (Stream A) | Person 2 (Stream B) |
|------|--------------------|--------------------|
| 0 | 2.1 Field manifest (collaborate) | 2.1 Field manifest (collaborate) |
| 1 | 1.1 Parse mapping.json models | 2.2 REDCap client |
| 1 | 1.3 Migration runner (parallel w/ 1.1) | 2.4 Name parser (parallel w/ 2.2) |
| 2 | 1.2 Generate migration SQL | 2.3 Field transformations |
| 2 | 1.4 Wire into startup | 2.5 Filters + 2.6 Unpivot |
| 3 | 3.1 COPY loader | 2.7 Name table generation |
| 3 | 3.4 Pre-load validation | 2.8 Reviewer org table |
| 4 | 3.2 Atomic sync | 4.1 Orchestration (collaborate) |
| 4 | 3.3 Flask endpoint updates | 4.1 Orchestration (collaborate) |
| 5 | 4.2 Dockerfile + 4.5 Makefile | 4.3 Helm + 4.4 Remove dead code |
| 5 | 5.1 Schema unit tests | 5.2 Transform unit tests |
| 6 | 5.3 Output equivalence | 5.4 End-to-end integration |
| 6 | 5.5 Benchmarks | 5.6 Failure testing |
| 7 | 1.5 Add FK/NOT NULL constraints | Review + cutover prep |

---

## Single-Person Critical Path

If one person does all work sequentially, the critical path is:

```
2.1 → 1.1 → 1.2 → 1.3 → 1.4 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7 → 2.8
→ 3.1 → 3.2 → 3.3 → 3.4 → 4.1 → 4.2 → 4.3 → 4.4 → 4.5
→ 5.3 → 5.4 → 5.5 → 5.6 → 1.5
```

**Estimated total:** 6-8 weeks single-person, 4-5 weeks with two people.

---

## Risk Gates

Before proceeding past each gate, validate:

| Gate | Between | Validation |
|------|---------|------------|
| **G1** | Stream A Phase 1 → Phase 2 | Migration runner creates all 19 tables, PK constraints present |
| **G2** | Stream B Phase 1 → Phase 3 | Transformations produce correct output for synthetic dataset |
| **G3** | Streams A+B → Epic 4 | Both streams pass their unit tests independently |
| **G4** | Epic 4 → Epic 5 | Pipeline runs end-to-end on synthetic data |
| **G5** | Epic 5 → Cutover | Output equivalence test passes against production data |
| **G6** | Cutover → Remove rollback flags | 1-2 weeks stable in production |
