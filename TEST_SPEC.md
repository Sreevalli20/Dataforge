# FILE 07 — TEST_SPEC.md
## Comprehensive Verification & Test Specification

This test plan defines the mathematical invariants, unit validations, regression baselines, and performance benchmarks that Devin must implement and verify.

---

### 1. Mathematical & Algebraic Invariant Tests

#### TEST-M01: Vector Normalization Invariant
- **Rule**: All generated key vectors $k_t$ and value vectors $v_t$ must satisfy unit $L_2$ norm within floating-point tolerance.
- **Assertion**:
  $$\left| \|k_t\|_2 - 1.0 \right| < 10^{-7} \quad \text{and} \quad \left| \|v_t\|_2 - 1.0 \right| < 10^{-7}, \quad \forall t \in \{1, \dots, N\}$$

#### TEST-M02: Controlled Key Orthogonality & Dot Product Invariant
- **Rule**: Given base vectors $u_1, u_2$ orthogonalized via Gram-Schmidt ($u_1 \cdot u_2 = 0$), the synthesized key vector $k_2(\theta) = \cos(\theta) u_1 + \sin(\theta) u_2$ must have exact inner product with $k_1 = u_1$:
  $$\left| (k_1 \cdot k_2) - \cos(\theta) \right| < 10^{-7}, \quad \forall \theta \in [0, \pi/2]$$

#### TEST-M03: Fast Weight Dimensional Invariance
- **Rule**: For any sequence length $T \in [1, 1000]$, the dimensions of the fast-weight matrix $M$ must remain strictly $d \times d$.
- **Assertion**:
  $$\text{shape}(M_T) \equiv (d, d), \quad \text{byteLength}(M_T) \equiv d \times d \times 8 \text{ (Float64)}$$

#### TEST-M04: Single-Association Exact Reconstruction Invariant
- **Rule**: Storing a single normalized pair $(k_1, v_1)$ into an empty matrix $M_0$ via Hebbian update must yield exact recall when probed with $k_1$:
  $$M_1 = v_1 k_1^T \implies \hat{v} = M_1 k_1 = v_1 (k_1^T k_1) = v_1$$
- **Assertion**:
  $$\|v_1 - \hat{v}\|_2 < 10^{-7} \quad \text{and} \quad \cos(v_1, \hat{v}) > 1.0 - 10^{-7}$$

#### TEST-M05: Softmax Probability Conservation Invariant
- **Rule**: In the baseline KV-cache attention mechanism, attention weights $\alpha$ must sum to $1.0$:
  $$\left| \sum_{i=1}^T \alpha_i - 1.0 \right| < 10^{-6}$$

---

### 2. Computational Primitive Unit Tests

#### TEST-U01: Hebbian Rank-1 Accumulator
- Input: Initial matrix $M = \mathbf{0}$, vector $k = [1, 0]^T$, $v = [0, 1]^T$.
- Output: $M_{1,0} = 1.0$, all other entries $0.0$.
- Verify matrix Frobenius norm $\|M\|_F = 1.0$.

#### TEST-U02: Delta Rule Gradient Update
- Input: Existing matrix $M$, incoming pair $(k, v)$ such that $M k = v$ (already memorized).
- Expected Update: Error $e = v - M k = \mathbf{0} \implies \Delta M = \mathbf{0}$.
- Invariant: $M$ remains identical when presenting an already-learned association.

#### TEST-U03: KV-Cache Attention Matching
- Input: Distinct orthogonal keys $k_1, k_2$, values $v_1, v_2$, temperature $\tau = 1.0$.
- Query: $q = k_1$.
- Expected Output: Dot products $q^T k_1 = 1$, $q^T k_2 = 0$. After softmax, $\alpha_1 \approx \frac{e^1}{e^1 + e^0} \approx 0.731$, $\alpha_2 \approx 0.269$. With temperature scaling / large norm, $\alpha_1 \to 1.0$.

---

### 3. Interaction & State Machine Tests

#### TEST-I01: Slider Responsiveness
- Action: Dispatch change event to correlation slider: $\theta = 45^\circ$.
- Verification: Internal state updates immediately; recomputed $\mathcal{S}_{\cos}$ matches theoretical prediction $\frac{1}{\sqrt{1 + \cos^2(45^\circ)}} \approx 0.816 \pm 0.02$.

#### TEST-I02: Seed Determinism
- Action: Set seed to $12345$, run 10-token sequence, record Frobenius norm $\|M_{10}\|_F$.
- Re-run: Refresh model with seed $12345$, verify $\|M_{10}\|_F$ is bit-for-bit identical ($0.000000000$ diff).

#### TEST-I03: Reset Functionality
- Action: Populate sequence to $N=24$, alter $\lambda=0.85$, trigger `Reset`.
- Verification: $N$ returns to canonical preset ($N=2$), $M$ returns to clean rank-2 matrix, error meters zero out.

---

### 4. Ground-Truth Discrepancy & Verification Tests

#### TEST-G01: "Truth Beside Estimate" Integrity
- At every execution step, the system must assert:
  1. $v^*$ is strictly equal to $v_p$ from the recorded buffer.
  2. The displayed $L_2$ error on screen matches $\sqrt{\sum (v^*_j - \hat{v}_j)^2}$ computed by an independent assertion runner.
  3. The displayed cosine similarity matches $\frac{v^* \cdot \hat{v}}{\|v^*\| \|\hat{v}\|}$.

---

### 5. Performance & Latency Benchmarks

| Test ID | Scenario | Target Latency | Pass Criteria |
|---|---|---|---|
| **PERF-01** | Full recompute for $d=16, N=16$ (matrix updates + probe) | $< 1.5 \text{ ms}$ | UI does not drop below 60 fps |
| **PERF-02** | Stress recompute for $d=32, N=64$ | $< 5.0 \text{ ms}$ | Synchronous execution without worker overhead |
| **PERF-03** | Rapid slider dragging ($\theta$ scrubbing at 60 events/sec) | Zero event lag | State queue executes latest event without accumulation |
| **PERF-04** | Cold-start page load to interactive Stage 1 | $< 400 \text{ ms}$ | Zero network requests post-bundle load |
