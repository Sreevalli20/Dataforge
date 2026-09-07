# FILE 08 — IMPLEMENTATION_PLAN.md
## Phased Implementation Order for Devin

This document specifies the step-by-step engineering roadmap for Devin. Every module is strictly specified to eliminate ambiguity.

---

### Phase 1: Pure Mathematical & Linear Algebra Engine (`src/lib/linearAlgebra.ts`)

#### Step 1.1: Implement Core Matrix & Vector Primitives
Devin will implement a zero-dependency, high-performance typed array math module:
- `createVector(d: number): Float64Array`
- `createMatrix(rows: number, cols: number): Float64Array` (flattened $1\text{D}$ array for cache locality)
- `dot(u: Float64Array, v: Float64Array): number`
- `norm(v: Float64Array): number`
- `normalize(v: Float64Array): Float64Array` (with $10^{-7}$ epsilon guard)
- `outerProduct(u: Float64Array, v: Float64Array): Float64Array` ($u v^T$)
- `matVecMul(M: Float64Array, v: Float64Array, d: number): Float64Array` ($M v$)
- `matAdd(A: Float64Array, B: Float64Array, scaleB?: number): Float64Array`
- `frobeniusNorm(M: Float64Array): number`
- `cosineSimilarity(u: Float64Array, v: Float64Array): number`
- `l2Distance(u: Float64Array, v: Float64Array): number`

#### Step 1.2: Deterministic PRNG & Vector Generation
- Implement LCG random number generator (`seed: number => () => number`).
- Implement Gram-Schmidt orthogonalization to generate $d$ mutually orthogonal unit vectors $\{u_1, \dots, u_d\}$.
- Implement controlled key angle synthesizer:
  $$k_2(\theta) = \cos(\theta) u_1 + \sin(\theta) u_2^{\perp}$$

---

### Phase 2: Memory Models Implementation (`src/lib/memoryModels.ts`)

#### Step 2.1: Fast Weights Plasticity Model
Implement class or pure state function `runFastWeightsExperiment(...)`:
- Handles Pure Hebbian update:
  $$M_t = \lambda M_{t-1} + \eta (v_t k_t^T)$$
- Handles Delta Rule update:
  $$\hat{v}_t = M_{t-1} k_t, \quad e_t = v_t - \hat{v}_t, \quad M_t = \lambda M_{t-1} + \eta (e_t k_t^T)$$
- Handles BDH Non-Negative Sparse Dale update:
  $$M_t = \max\left(\mathbf{0}, \, \lambda M_{t-1} + \eta (e_t k_t^T)\right)$$
- Performs readout $\hat{v} = M_T q$ and returns full state history for all steps $t \in [1, N]$.

#### Step 2.2: Transformer KV-Cache Baseline Model
Implement `runKVCacheExperiment(...)`:
- Accumulates key tensor $\mathcal{K} \in \mathbb{R}^{T \times d}$ and value tensor $\mathcal{V} \in \mathbb{R}^{T \times d}$.
- Computes scaled dot-product attention scores $s_i = (q \cdot k_i) / \sqrt{d}$.
- Computes numerically stable softmax:
  $$\alpha_i = \frac{\exp(s_i - \max(s))}{\sum_j \exp(s_j - \max(s))}$$
- Computes readout $\hat{v}_{\text{KV}} = \sum_{i=1}^T \alpha_i v_i$.
- Returns exact allocated byte footprint: $2 \times T \times d \times 4 \text{ bytes}$.

---

### Phase 3: Reactive State Hook (`src/hooks/useSynapticExperiment.ts`)

Devin will encapsulate the full simulation into a clean React hook:
- **Inputs**:
  - `stage: number` (1 through 7)
  - `dimension: number` ($8, 16, 32$)
  - `sequenceLength: number` ($N$)
  - `correlationAngleDeg: number` ($\theta$)
  - `algorithm: 'hebbian' | 'delta' | 'bdh_sparse'`
  - `decay: number` ($\lambda$)
  - `learningRate: number` ($\eta$)
  - `probeIndex: number` ($p$)
  - `seed: number`
- **Outputs**:
  - `currentMatrix: Float64Array` ($d \times d$)
  - `groundTruthValue: Float64Array` ($v^*$)
  - `fastWeightReadout: Float64Array` ($\hat{v}_{\text{FW}}$)
  - `kvCacheReadout: Float64Array` ($\hat{v}_{\text{KV}}$)
  - `l2Error: number`
  - `cosineSim: number`
  - `fastWeightMemoryBytes: number`
  - `kvCacheMemoryBytes: number`
  - `allTokens: Array<{ index: number; keyNorm: number; label: string }>`
  - `fidelityCurve: Array<{ angle: number; theory: number; fwSim: number; kvSim: number }>`

---

### Phase 4: UI Components & Guided Stage Architecture (`src/components/`)

#### Step 4.1: Component Layouts
1. `Navbar.tsx`: Stage stepper, experiment reset, title & badges.
2. `WeightMatrixHeatmap.tsx`: Render $d \times d$ matrix with SVG/Canvas, dynamic color ramp, hover cell tooltips.
3. `TruthBesideEstimate.tsx`: Side-by-side bar chart of $v^*$ vs $\hat{v}_{\text{FW}}$ vs $\hat{v}_{\text{KV}}$, discrepancy error meters, and pass/fail badges.
4. `MemoryFootprintChart.tsx`: Real-time comparison graph of $O(1)$ vs $O(T)$ memory scaling.
5. `CrosstalkCurve.tsx`: Dynamic plot of retrieval fidelity as a function of key angle $\theta$.
6. `ControlToolbar.tsx`: Slider for $\theta$, stepper for $N$, toggle for algorithm, learning rate, decay.
7. `BdhMappingModal.tsx`: Rigorous reference sheet outlining the connection to Pathway's Dragon Hatchling.

#### Step 4.2: Guided Stage Progression Engine (`src/components/GuidedStageEngine.tsx`)
- Configured presets for each stage (Stage 1: single token, Stage 2: orthogonal pair, Stage 3: correlation slider active, Stage 4: Delta rule toggle active, Stage 5: long context scaling, Stage 6: BDH sparsity demo, Stage 7: full sandbox).
- Clear pedagogical prompts, learner questions, and actionable "Next Stage" transitions.

---

### Phase 5: Verification Suite Integration & Final Build

1. Devin runs all unit tests specified in `TEST_SPEC.md` (`npm test` or in-app self-testing runner).
2. Devin runs `compile_applet` to confirm zero TypeScript compilation errors.
3. Devin verifies responsive layout on both desktop (wide multi-column workbench) and mobile viewport (stacked cards).
