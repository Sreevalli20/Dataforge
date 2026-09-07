# FILE 05 — UI_SPEC.md
## Screen-by-Screen Frontend Specification & Learning Journey

### 1. Global Visual Layout & Design System

- **Visual Archetype**: High-precision scientific laboratory workbench (clean, crisp, mathematical typography, neutral warm-slate palette `#0f172a`, `#f8fafc`, `#334155`, `#2563eb`).
- **Typography**: 
  - Primary UI & Explanations: Standard clean sans-serif (Inter / System UI) with high legibility.
  - Mathematics, Tensors & Vectors: Monospaced font (`JetBrains Mono`, `Fira Code`, or system monospace).
- **Navigation Bar**:
  - Left: Application Title: **SYNAPTIC PLASTICITY vs. KV-CACHE** (with badge: `DataForge 2026 / Pathway Frontier Track`).
  - Center: Stage Progress Tracker (Stages 1–6 + Sandbox Mode).
  - Right: System Stats Badge (`Float64 Math Kernel: Active`, `Latency: <1.5ms`, `Seed: 42`).

---

### 2. Screen-by-Screen Specifications

#### SCREEN 01: STAGE 1 — OBSERVE (Zero-Overhead Memory)
- **Purpose**: Immediately demonstrate the core phenomenon—storing and retrieving an association within a fixed $d \times d$ matrix without allocating token slots. Opens with the preset ALREADY RUNNING.
- **Learner Question**: *"Can an association $(k_1 \to v_1)$ be stored inside a grid of numbers and retrieved perfectly without saving the raw tokens?"*
- **Visible Elements**:
  1. **Equation Card**: $\Delta M = v_1 k_1^T, \quad \hat{v} = M q$.
  2. **Synaptic Weight Heatmap ($16 \times 16$)**: Showing the initial rank-1 outer product matrix.
  3. **Truth Beside Estimate Panel**:
     - Ground Truth Target: $v_1$ (bar chart of 16 vector components).
     - Fast Weight Output: $\hat{v}_{\text{FW}}$ (bar chart overlaid).
     - L2 Error: $0.0000$, Cosine Similarity: $1.0000$.
     - Verification Badge: `EXACT RETRIEVAL (100% Signal)`.
  4. **Memory Footprint Gauge**:
     - Fast Weight State: `1,024 Bytes (Fixed)`.
     - KV-Cache: `128 Bytes`.
- **Controls Available**:
  - `[Probe Key 1]` button (active).
  - `[Next: Add Second Memory →]` (primary action).
- **Live Computation**:
  Generates orthonormal $u_1, u_2 \in \mathbb{R}^{16}$. Computes $M_1 = v_1 k_1^T$. Computes $\hat{v} = M_1 k_1$. Computes $\|v_1 - \hat{v}\|_2$.
- **Expected Learner Observation**:
  The predicted vector matches the ground truth vector with zero visible discrepancy.
- **Transition Condition**: Learner clicks `[Next: Add Second Memory →]`.

---

#### SCREEN 02: STAGE 2 — PREDICT (Orthogonal Superposition)
- **Purpose**: Test whether multiple memories can coexist in the exact same weight matrix.
- **Learner Question**: *"If we write a second association $(k_2 \to v_2)$ into the same matrix, will it overwrite or destroy the first memory?"*
- **Visible Elements**:
  1. Interactive Hypothesis Prompt: *"What will happen when you probe Key 1 after writing Key 2?"*
     - Option A: *Key 1 will be completely overwritten.*
     - Option B: *Key 1 will remain intact if Key 2 is orthogonal.* (Correct)
  2. Synaptic Heatmap: Now showing the sum of two outer products $M_2 = v_1 k_1^T + v_2 k_2^T$.
  3. Dual Probe Switcher: `[Probe Key 1]` vs `[Probe Key 2]`.
  4. Truth beside Estimate: Probing Key 1 displays $v_1^* = v_1$ vs $\hat{v}$, achieving $1.0000$ cosine similarity. Probing Key 2 displays $v_2^* = v_2$ vs $\hat{v}$, achieving $1.0000$ cosine similarity.
- **Controls Available**:
  - Hypothesis selector buttons.
  - Probe toggle: Token 1 / Token 2.
- **Live Computation**:
  Computes $M_2 = M_1 + v_2 k_2^T$ with $k_1 \perp k_2$. Probes selected key.
- **Expected Learner Observation**:
  Both memories are recovered with zero error. The learner realizes that orthogonal memory states exist in superposition without interference.
- **Transition Condition**: Learner confirms hypothesis and clicks `[Next: Induce Interference →]`.

---

#### SCREEN 03: STAGE 3 — BREAK THE SYSTEM (The Interference Catastrophe)
- **Purpose**: Induce real, verifiable computational failure by violating vector orthogonality.
- **Learner Question**: *"What happens when two concepts share features (keys are not orthogonal) or when we overload the matrix?"*
- **Visible Elements**:
  1. **Correlation Angle Slider ($\theta$)**: Highlighted with warning accent (`90°` down to `0°`).
  2. **Live Crosstalk Math Breakdown**:
     $$\hat{v} = v_1 + \underbrace{\cos(\theta) \, v_2}_{\text{Crosstalk Hallucination}}$$
  3. **Truth beside Estimate**:
     - As $\theta$ decreases, the Fast Weight output bars visibly warp away from $v_1$ and blend with $v_2$.
     - L2 Error meter rises: $0.00 \to 0.35 \to 0.71 \to 1.00$.
     - Cosine similarity drops: $1.000 \to 0.707$.
     - Verification Badge flips to: `CROSSTALK INTERFERENCE DETECTED` (Amber/Red).
  4. **Baseline Comparison**: The Transformer KV-cache maintains $0.999$ similarity because softmax attention separates queries non-linearly.
- **Controls Available**:
  - $\theta$ slider ($0^\circ$ to $90^\circ$).
  - Presets: `[Orthogonal (90°)]`, `[Moderate Crosstalk (45°)]`, `[Severe Collision (10°)]`.
- **Live Computation**:
  Re-generates $k_2(\theta) = \cos(\theta) u_1 + \sin(\theta) u_2^{\perp}$. Updates matrix and computes readouts in $<1 \text{ ms}$.
- **Expected Learner Observation**:
  The learner directly causes and watches the failure happen. There is no mystery: the math makes the failure transparent.
- **Transition Condition**: Learner observes error $> 0.30$ and clicks `[Next: Repair with Delta Rule →]`.

---

#### SCREEN 04: STAGE 4 — REPAIR VIA LOCAL BACKPROPAGATION (The Delta Rule)
- **Purpose**: Demonstrate how online gradient descent / error correction stabilizes fast weights.
- **Learner Question**: *"How can local error feedback prevent new memories from destroying old ones?"*
- **Visible Elements**:
  1. **Algorithm Comparison Toggle**:
     - `[Pure Hebbian (Open-Loop)]` vs `[Delta Rule (Closed-Loop Gradient)]`.
  2. **Gradient Equation Inspector**:
     $$\Delta M_t = \eta (v_t - M_{t-1} k_t) k_t^T = - \eta \nabla_M \mathcal{L}_t$$
  3. **Error Vector Visualizer**: Displays $e_t = v_t - \hat{v}_t^{\text{prior}}$, showing the exact correction signal.
  4. **Side-by-Side Performance**:
     - Under $\theta = 45^\circ$, Hebbian error is $0.52$. Switching to Delta Rule drops error to $<0.12$.
- **Controls Available**:
  - Algorithm switcher.
  - Learning rate slider $\eta \in [0.2, 1.5]$.
- **Live Computation**:
  Simulates multi-epoch online delta adaptation over the 2-pair sequence.
- **Expected Learner Observation**:
  The Delta rule prevents the matrix from accumulating redundant energy, significantly preserving retrieval fidelity.
- **Transition Condition**: Learner toggles both rules and clicks `[Next: Scale Context Length →]`.

---

#### SCREEN 05: STAGE 5 — HEAD-TO-HEAD: FAST WEIGHTS vs. KV-CACHE
- **Purpose**: Stress test both paradigms under long context ($T = 4$ to $T = 64$).
- **Learner Question**: *"If KV-cache is more accurate, why do frontier AI researchers want to eliminate it?"*
- **Visible Elements**:
  1. **Sequence Length Stepper ($N = 1 \dots 32$)**.
  2. **Dual Metric Panel**:
     - **Retrieval Fidelity Chart**: Fast Weights accuracy vs. KV-cache accuracy as $N$ increases past dimension $d=16$.
     - **Memory Footprint Chart**: Fast Weights flat line ($1 \text{ KB}$) vs. KV-cache linear diagonal ($128 \text{ B} \to 4 \text{ KB} \to \dots$).
  3. **The Pareto Frontier Callout**:
     Shows the computational trade-off: Fast Weights trade retrieval precision at high $N$ for zero memory scaling overhead.
- **Controls Available**:
  - $N$ slider.
  - Dimension selector ($d=8, 16, 32$).
- **Live Computation**:
  Runs batch sequence generation of $N$ tokens, runs both architectures, computes aggregate accuracy.
- **Expected Learner Observation**:
  Learner witnesses the crossover point: at $N > d$, Fast Weights degrade, but their memory never budges. KV-cache stays accurate, but its memory requirements explode.
- **Transition Condition**: Learner clicks `[Next: Frontier Connection (BDH) →]`.

---

#### SCREEN 06: STAGE 6 — THE FRONTIER CONNECTION (Dragon Hatchling / BDH)
- **Purpose**: Connect the educational toy directly to Pathway's Dragon Hatchling architecture.
- **Learner Question**: *"How does Pathway's BDH architecture scale synaptic fast weights to frontier LLMs without collapsing from interference?"*
- **Visible Elements**:
  1. **Architectural Mapping Diagram**:
     Toy Model ($1$ layer, dense linear) $\longrightarrow$ Dragon Hatchling ($L$ layers, non-negative sparse activations, Dale's principle).
  2. **Interactive Sparsity Demonstration**:
     Toggling `[Enforce Non-Negative Sparsity (ReLU)]` demonstrates how sparse firing creates quasi-orthogonal vectors in high dimensions, mathematically suppressing crosstalk.
  3. **BDH-CQ Streaming Principle**:
     Explains how continuous-query systems maintain state without reloading historical KV caches.
  4. **Scientific Honesty Card**: Clear table showing what is toy vs. what is full BDH.
- **Controls Available**:
  - Sparsity toggle.
  - Pathway research paper citation links.
- **Transition Condition**: Learner clicks `[Enter Open Research Sandbox ⚗️]`.

---

#### SCREEN 07: STAGE 7 — OPEN RESEARCH SANDBOX
- **Purpose**: Complete exploratory freedom for researchers and evaluators.
- **Learner Question**: *"Can I break, stress-test, or verify any combination of parameters?"*
- **Visible Elements**:
  - Full Parameter Sidebar (Dimension $d$, Sequence $N$, Correlation $\theta$, Learning Rate $\eta$, Decay $\lambda$, Algorithm, Random Seed).
  - Interactive Matrix Heatmap with hover tooltips displaying individual cell float values $M_{i,j}$.
  - Custom Token Sequence Inspector & Probe Selector.
  - "Truth beside Estimate" Vector Comparator.
  - Export Experiment Results (JSON/CSV of current parameters and evaluation metrics).
- **Controls Available**: All parameters unlocked.
