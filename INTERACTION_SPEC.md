# FILE 03 — INTERACTION_SPEC.md
## Interactive Parameter Mapping & State Transitions

This document specifies every learner-controllable input, its direct mathematical binding, the triggered computational pipeline, and the exact pedagogical observation expected from the learner.

---

### 1. Control-to-Computation Mapping Matrix

#### CONTROL 01: Correlation Angle Slider ($\theta$)
- **UI Control**: Horizontal Slider + Numeric Input.
- **Range & Step**: $0^\circ \le \theta \le 90^\circ$, step $1^\circ$ (Default: $90^\circ$ in Stage 1/2, manipulated in Stage 3).
- **Mathematical Variable**: $\theta$, the angular separation between key vectors $k_1$ and $k_2$.
- **What Changes Computationally**:
  $$k_2(\theta) = \cos(\theta) u_1 + \sin(\theta) u_2^{\perp} \quad \implies \quad k_1^T k_2 = \cos(\theta)$$
  The second key's projection onto the first key increases smoothly from $0.0$ at $90^\circ$ to $1.0$ at $0^\circ$. The outer product update $\Delta M_2 = v_2 k_2^T$ shifts from an orthogonal matrix subspace into overlapping row/column indices.
- **Expected Learner Observation**:
  - At $\theta = 90^\circ$: The weight heatmap displays isolated, distinct synaptic activation clusters. Readout cosine similarity is $\mathcal{S}_{\cos} = 1.000$ with $L_2 \text{ error} = 0.000$.
  - At $\theta = 45^\circ$: Crosstalk appears in the heatmap. Probing with $k_1$ yields a distorted vector; similarity drops to $\approx 0.85$.
  - At $\theta = 0^\circ$ (Collinear Collision): Total catastrophic interference. Probing with $k_1$ retrieves an equal superposition $\frac{1}{2}(v_1 + v_2)$. Error spikes to $1.000$. The learner visually grasps why linear memory requires key orthogonality.

---

#### CONTROL 02: Sequence Association Count ($N$)
- **UI Control**: Stepper (+ / -) and Range Slider.
- **Range & Step**: $N \in [1, 32]$, step 1 (Default: $N=2$ in Stage 1, $N=16$ in Stage 4/5).
- **Mathematical Variable**: $T$, total sequence length / number of accumulated key-value pairs $\{k_t, v_t\}_{t=1}^N$.
- **What Changes Computationally**:
  The simulation sequentially performs $N$ rank-1 updates:
  $$M_N = \sum_{t=1}^N \lambda^{N-t} \Delta M_t$$
  while the baseline expands its tensor buffers $\mathcal{K}_N \in \mathbb{R}^{N \times d}, \mathcal{V}_N \in \mathbb{R}^{N \times d}$.
- **Expected Learner Observation**:
  - For $N \le d$: As long as keys are generated randomly or orthogonally, retrieval error remains modest.
  - When $N > d$ (Crossing the Dimensional Capacity Boundary): The rank of the matrix saturates at $\min(N, d) = d$. The weight matrix displays high Frobenius norm saturation. Retrieval error jumps sharply, proving the theoretical capacity limit live in the browser.
  - KV-cache memory meter rises linearly ($2 \times N \times d \times 4 \text{ bytes}$), whereas the Fast Weight memory meter remains flat at $1,024 \text{ bytes}$.

---

#### CONTROL 03: Feature Dimension ($d$)
- **UI Control**: Segmented Radio Buttons: `[8-dim]`, `[16-dim (Standard)]`, `[32-dim]`.
- **Mathematical Variable**: $d$, dimensionality of the hidden feature space.
- **What Changes Computationally**:
  Resizes the weight matrix $M \in \mathbb{R}^{d \times d}$ ($64$, $256$, or $1,024$ synapses) and re-generates all orthonormal basis sets $\{u_i\}_{i=1}^d$.
- **Expected Learner Observation**:
  In 8-dim mode, interference occurs early ($N \ge 6$). In 32-dim mode, the matrix comfortably absorbs up to 24 associations before noticeable degradation. The learner directly verifies that synaptic capacity scales with $d$.

---

#### CONTROL 04: Plasticity Update Algorithm Selector
- **UI Control**: Dropdown / Pill Switcher:
  1. `Pure Hebbian (Correlation)`
  2. `Delta Rule (Local Backpropagation)`
  3. `BDH Sparse Dale (Non-Negative Plasticity)`
- **Mathematical Variable**: The functional form of $\Delta M_t$.
- **What Changes Computationally**:
  - *Pure Hebbian*: $\Delta M_t = \eta (v_t k_t^T)$. No prior check.
  - *Delta Rule*: Calculates prior prediction $\hat{v}_t = M_{t-1} k_t$, calculates local error vector $e_t = v_t - \hat{v}_t$, updates $\Delta M_t = \eta (e_t k_t^T)$.
  - *BDH Sparse*: Passes activations through non-negative rectifier, computes error, clamps resulting weights $M_{i,j} \ge 0$.
- **Expected Learner Observation**:
  Under correlated keys, switching from Hebbian to Delta Rule drops the retrieval error by $60\%\text{--}80\%$. The Delta Rule error-correcting term suppresses redundant gradient steps on already-memorized features. The learner observes how local backpropagation stabilizes associative memory.

---

#### CONTROL 05: Passive Synaptic Decay ($\lambda$)
- **UI Control**: Continuous Slider.
- **Range & Step**: $0.70 \le \lambda \le 1.00$, step $0.01$ (Default: $1.00$).
- **Mathematical Variable**: Retention decay coefficient $\lambda$ per token step.
- **What Changes Computationally**:
  Multiplies prior matrix state by $\lambda$ at each step: $M_t = \lambda M_{t-1} + \Delta M_t$.
  Associations stored at step $p$ are attenuated by factor $\lambda^{T-p}$ by step $T$.
- **Expected Learner Observation**:
  When $\lambda = 0.90$, probing token 1 after 15 steps yields weak retrieval ($\mathcal{S}_{\cos} \approx 0.20$), while probing token 15 yields crystal-clear recall ($\mathcal{S}_{\cos} = 0.99$). The learner sees the biological transition between persistent long-term storage and sliding-window working memory.

---

#### CONTROL 06: Query Probe Selector ($p$)
- **UI Control**: Interactive Token Timeline Chips (`Token #1`, `Token #2`, ..., `Token #N`).
- **Mathematical Variable**: $p \in \{1, \dots, N\}$, setting $q = k_p$.
- **What Changes Computationally**:
  Performs forward inference with the chosen probe:
  $$\hat{v}_{\text{FW}} = M_N k_p \quad \text{and} \quad \hat{v}_{\text{KV}} = \text{Attention}(k_p, \mathcal{K}_N, \mathcal{V}_N)$$
  Recomputes ground truth target $v^* = v_p$ and calculates metrics.
- **Expected Learner Observation**:
  Learner can selectively test whether old tokens suffer more degradation than recent tokens (recency vs. primacy effect), or whether specific correlated tokens mutually disrupt each other.

---

#### CONTROL 07: Deterministic PRNG Seed
- **UI Control**: Dice Icon ("Re-roll Basis") + Seed Integer Input field.
- **Mathematical Variable**: Initial seed for pseudo-random basis generation.
- **What Changes Computationally**:
  Generates a completely new random orthonormal manifold in $\mathbb{R}^d$, resetting the experiment deterministically.
- **Expected Learner Observation**:
  Confirms that the observed mathematical phenomenon is an invariant geometric law of vector spaces, not an artifact of one specific random drawing.

---

### 2. State Transition & Reset Protocol

```
[Default State: Seed 42, d=16, N=2, θ=90°, Hebbian, λ=1.0]
     │
     ├─► User adjusts θ (90° → 15°)
     │     └─► Recomputes k2(θ) in <0.2 ms
     │     └─► Re-runs update pipeline M_t
     │     └─► Re-probes q = k1
     │     └─► Re-renders Heatmap & Error Meters
     │
     ├─► User clicks "Delta Rule"
     │     └─► Re-runs sequence with e_t = v_t - M_{t-1}k_t
     │     └─► Heatmap transitions: weight magnitudes redistribute
     │     └─► Error drops visibly in real-time
     │
     └─► User clicks "Reset Experiment"
           └─► Resets to pristine canonical baseline: M = 0, N=2, θ=90°
```

All interactions execute synchronously on the main thread via memoized algebraic routines; typical execution latency is $< 1.2 \text{ ms}$, ensuring 60 fps responsive interaction without jank.
