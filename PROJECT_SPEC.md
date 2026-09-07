# FILE 01 — PROJECT_SPEC.md
## DataForge 2026 Pathway Track: Frontier AI Technical Architecture

**Application Title**: Synaptic Plasticity vs. KV-Cache: Exploring Associative Fast Weights in Post-Transformer Architectures (Dragon Hatchling / BDH)  
**System Role**: Research Architect, ML Systems Designer, and Technical Lead  
**Target Implementer**: Devin (Autonomous Software Engineer)  
**Track**: Pathway / Frontier AI Track (DataForge 2026)  
**Runtime Target**: Web Browser (Vite + React 19 + TypeScript + Tailwind CSS, 100% Client-Side In-Memory Execution, Zero Server Dependency)

---

### 1. Executive Concept & The Single Selected Frontier-AI Idea

#### 1.1 Selected Primary Concept
**Associative Memory and Fast Weights (Synaptic Plasticity as Short-Term Memory)** within Post-Transformer Architectures, specifically grounded in the mathematical principles of Pathway's **Dragon Hatchling (BDH)** and **BDH-CQ (Continuous Query)** architectures ("The Equations of Reasoning").

#### 1.2 Justification Against Alternative Concepts
Among the approved DataForge concepts:
- *Linear Attention Variants (e.g. Katharopoulos et al., RWKV, Mamba)*: While mathematically elegant, linear attention is often perceived as an established baseline or incremental kernel approximation rather than a biological/frontier paradigm shift.
- *KV-Cache Alternatives alone*: Only negative framing (identifying memory explosion) without an active neuro-computational learning mechanism.
- *Recurrent Latent-Space Reasoning alone*: Difficult to isolate visually without speculative ungrounded latent representations.
- *Synaptic Plasticity / Fast Weights (BDH Foundation)*: 
  1. **Directly addresses the fundamental bottleneck of modern LLMs**: The quadratic $O(T^2)$ computational complexity and unbounded $O(T \cdot d)$ footprint of Transformer Key-Value (KV) caching during autoregressive decoding.
  2. **Provides genuine, real-time client-side linear algebra**: Computes exact matrix outer products, Hebbian updates, online gradient tracing (Delta rule), and vector projections in $<1.5$ ms in pure TypeScript.
  3. **Delivers an unambiguous, visceral "Aha!" moment**: Learners can watch a fixed $d \times d$ weight matrix absorb associations in $O(1)$ memory, then directly induce *retroactive interference* (crosstalk) when key vectors correlate or exceed capacity, contrasting directly against the swelling memory footprint of an exact KV-cache.
  4. **Grounds deeply in primary research**: Directly maps to the core mechanism of Pathway's *Dragon Hatchling* ("The Equations of Reasoning") and synaptic plasticity theories (von der Malsburg 1986; Schmidhuber 1992; Ba et al. 2016; BDH 2024–2025).

---

### 2. The Single Falsifiable Central Claim

> **Central Falsifiable Claim:**  
> *"A fixed-size recurrent synaptic weight matrix $M_t \in \mathbb{R}^{d \times d}$ updated via local online plasticity (Hebbian / Delta rule) achieves strict $O(1)$ memory consumption per token and retrieves bound key-value associations ($k \to v$) with near-zero error ($\|v - \hat{v}\|_2 < 10^{-4}$) when keys are orthogonal and total associations $N \le d$; however, as key angular distance decreases ($\theta \to 0$) or context sequence length exceeds the dimensional capacity ($N > d$), sequential updates induce catastrophic crosstalk interference, whereas an unbounded KV-cache maintains invariant retrieval fidelity at the cost of strictly linear $O(T \cdot d)$ memory growth."*

#### 2.1 Experimental Testability
The learner can systematically vary:
1. **Key Orthogonality / Correlation Angle** $\theta \in [0^\circ, 90^\circ]$.
2. **Context Sequence Length / Association Load** $N \in [1, 48]$ relative to state dimension $d \in \{8, 16, 32\}$.
3. **Plasticity Rule** (Pure Hebbian outer product vs. Error-correcting Delta rule with learning rate $\eta$ and decay $\lambda$).
4. **Retrieval Probe Position** (Recall earliest token vs. middle token vs. most recent token).

The system continuously measures and plots:
- Exact Euclidean reconstruction error $\|v^* - \hat{v}\|_2$
- Cosine similarity $\cos(v^*, \hat{v})$
- Memory footprint in bytes (Fast Weights $4 d^2$ bytes constant vs. KV-cache $8 T d$ bytes linear)
- Internal weight matrix condition number and Frobenius norm $\|M_t\|_F$.

---

### 3. Core Architectural Substrate & System Boundaries

#### 3.1 Strict Client-Side Computation (Zero Mocking, Zero Fake Animation)
All computations are executed dynamically in the browser's JavaScript engine using typed Float64/Float32 arrays:
- **No pre-recorded videos or mock GIFs**.
- **No synthetic loading spinners**.
- **No simulated random outputs**.
- Every matrix cell displayed in the UI reflects the true numeric contents of the internal synaptic memory tensor $M \in \mathbb{R}^{d \times d}$ or the token key-value matrix buffers $K \in \mathbb{R}^{T \times d}, V \in \mathbb{R}^{T \times d}$.
- Any slider adjustment or token stream modification invokes an immediate deterministic re-execution pipeline in synchronous or microtask-deferred time ($< 2 \text{ ms}$).

#### 3.2 System Architecture Stack
- **Framework**: React 19 + Vite 6 + TypeScript 5.8
- **Styling**: Tailwind CSS v4 (Light neutral high-contrast mathematical typography, zero neon AI clichés)
- **Math Engine**: In-memory dense matrix/vector math kernel (`/src/lib/linearAlgebra.ts`)
- **State Management**: Reactive custom React hooks (`useSynapticExperiment.ts`) with deterministic pseudo-random seeds (PCG/LCG) to guarantee 100% reproducible experiments across platforms.
- **Visual Rendering**: Pure SVG vector canvas & HTML5 Canvas for real-time weight heatmap rendering, memory gauges, and Pareto frontier curves.

---

### 4. Pedagogical Flow: Guided 6-Stage Journey into Open Sandbox

The application is structured into two complementary modes:
1. **The Guided Learning Journey (Stages 1 through 6)**: Step-by-step cognitive scaffolding designed to guide a first-time learner from naive observation to system failure, root-cause diagnosis, and frontier model connection.
2. **The Open Research Sandbox**: An unconstrained laboratory workbench with full parameter control, token sequence injection, custom vector editing, and automated stress testing.

#### Stage Breakdown
- **Stage 1: Observe (Zero-Overhead Memory)**  
  *Learner Question*: How can a fixed-size grid of numbers store an association without adding a new row for every word?  
  *Experience*: Learner sees a single key-value token pair $(k_1 \to v_1)$ bound into an empty $d \times d$ matrix via Hebbian outer product. Immediate retrieval probe yields exact recall ($\cos \theta = 1.000$).
- **Stage 2: Accumulate (Orthogonal Superposition)**  
  *Learner Question*: Can multiple memories coexist in the same synaptic matrix simultaneously?  
  *Experience*: Learner adds orthogonal pairs $(k_2 \to v_2)$ and $(k_3 \to v_3)$. Both are retrieved cleanly. The weight matrix displays constructive interference patterns.
- **Stage 3: Break the System (The Interference Catastrophe)**  
  *Learner Question*: What happens when two concepts share semantic features or when we store too much?  
  *Experience*: Learner slides the key angular separation slider from $90^\circ$ (orthogonal) to $15^\circ$ (correlated). The retrieved vector instantly fractures into a blended hallucination. Learner increases $N > d$, provoking capacity saturation.
- **Stage 4: Repair with Backpropagation / Delta Rule**  
  *Learner Question*: Can local error feedback protect old memories from being corrupted?  
  *Experience*: Learner switches the update rule from naive Hebbian to the Delta Rule ($M_t = M_{t-1} + \eta (v_t - M_{t-1} k_t) k_t^T$). The system traces real-time backpropagation gradients locally at each synapse, restoring stability up to the theoretical limit.
- **Stage 5: Head-to-Head: Fast Weights vs. KV-Cache**  
  *Learner Question*: If KV-cache never forgets, why is frontier AI racing to replace it?  
  *Experience*: Live interactive side-by-side comparison across context lengths from $T=4$ to $T=4096$. Learner manipulates sequence length and inspects memory bandwidth, cache eviction costs, and associative accuracy.
- **Stage 6: The Frontier Connection (Dragon Hatchling / BDH & BDH-CQ)**  
  *Learner Question*: How does Pathway's BDH overcome the interference limit of simple fast weights?  
  *Experience*: Transparent scientific mapping connecting the educational toy model to the full BDH multi-layer architecture (sparse non-negative activations, monosemantic synapses, and continuous latent-space queries).
- **Stage 7: Open Scientific Sandbox**  
  Unrestricted interactive workbench allowing arbitrary sequence editing, noise perturbation, dimension selection ($d=8, 16, 32$), live vector probe testing, and SVG export of Pareto curves.

---

### 5. Scientific Boundaries & Honesty Classifications

Every claim, metric, and visual element presented in the UI is strictly tagged under one of four unambiguous epistemological classifications:
1. `[DIRECT COMPUTATION]`: Computed live on the learner's CPU in JavaScript (e.g. current matrix products, L2 loss, cosine similarity, Frobenius norm).
2. `[EDUCATIONAL TOY MODEL]`: Explicitly labeled single-layer associative plasticity substrate demonstrating the core principle of fast weights; NOT claimed to be the 1B+ parameter Pathway model.
3. `[PUBLISHED RESEARCH RESULT]`: Quantities derived directly from peer-reviewed literature or official technical reports (e.g., Hopfield capacity bounds $C \approx d / (2 \ln d)$, BDH scaling exponents from Pathway's Dragon Hatchling paper).
4. `[THEORETICAL BOUND]`: Formal mathematical asymptotes (e.g., $O(1)$ recurrent memory scaling vs $O(T \cdot d)$ KV-cache scaling).

---

### 6. Devin Execution Protocol
Devin must follow the exact specifications laid out in Files 02 through 09. Devin is strictly forbidden from:
- Replacing matrix computation with mock animations.
- Removing the side-by-side "Truth beside Estimate" layout.
- Adding unrequested external server dependencies or API keys for the core simulation.
- Omitting the mathematical test suite or invariant validations.
