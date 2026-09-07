# FILE 02 — CORE_MODEL.md
## Mathematical Derivation & Computational Mechanism

### 1. Vector Space & Dimensional Definitions

Let the token embedding and associative feature space have dimension $d \in \{8, 16, 32\}$.
- Default educational dimension: $d = 16$.
- Key vectors: $k_t \in \mathbb{R}^d$, normalized such that $\|k_t\|_2 = 1.0$.
- Value vectors: $v_t \in \mathbb{R}^d$, normalized such that $\|v_t\|_2 = 1.0$.
- Query vector for retrieval: $q \in \mathbb{R}^d$, $\|q\|_2 = 1.0$.
- Sequence length / Stored associations: $T \in \mathbb{N}_{\ge 1}$, where individual token steps are indexed $t \in \{1, 2, \dots, T\}$.

---

### 2. State Representations

#### 2.1 Fast Weights / Synaptic Plasticity State (Recurrent Associative Memory)
The entire memory history is compressed into a single dynamic second-order synaptic matrix:
$$M_t \in \mathbb{R}^{d \times d}$$
- **Initial State ($t=0$):**
  $$M_0 = \mathbf{0}_{d \times d}$$
- **Memory Footprint:** Constant $d \times d \times 8 \text{ bytes}$ (Float64Array = 8 bytes per element). For $d=16$, $16 \times 16 \times 8 = 2,048 \text{ bytes}$ ($2 \text{ KB}$), strictly $O(1)$ with respect to sequence length $T$.

#### 2.2 Baseline: Transformer KV-Cache State
The standard multi-head attention cache accumulates all past key and value projections:
$$\mathcal{K}_t = [k_1, k_2, \dots, k_t]^T \in \mathbb{R}^{t \times d}$$
$$\mathcal{V}_t = [v_1, v_2, \dots, v_t]^T \in \mathbb{R}^{t \times d}$$
- **Initial State ($t=0$):** Empty buffers $\mathcal{K}_0 = \emptyset, \mathcal{V}_0 = \emptyset$.
- **Memory Footprint:** $2 \times t \times d \times 8 \text{ bytes}$ (Float64Array = 8 bytes per element). For $t=4096, d=16$, footprint is $1,048,576 \text{ bytes}$ ($1,024 \text{ KB}$), strictly $O(T \cdot d)$.

---

### 3. Plasticity Update Rules (Fast Weights)

At each sequence step $t$, the incoming key-value pair $(k_t, v_t)$ updates the synaptic weight matrix $M_{t-1} \to M_t$. The application implements three explicit, user-selectable update rules:

#### 3.1 Rule A: Pure Outer-Product Hebbian Plasticity
Classic Hebbian correlation learning ("neurons that fire together wire together"):
$$\Delta M_t = \eta \, (v_t \, k_t^T)$$
$$M_t = \lambda M_{t-1} + \Delta M_t$$
where:
- $\eta \in [0.1, 2.0]$ is the plastic learning rate (default $\eta = 1.0$).
- $\lambda \in [0.0, 1.0]$ is the passive synaptic retention / decay factor (default $\lambda = 1.0$ for perfect integration).

#### 3.2 Rule B: Error-Correcting Delta Rule (Local Backpropagation Tracing)
Also known as the Widrow-Hoff learning rule or online least-squares gradient descent. Before updating the matrix, the system performs a predictive read using the current state:
$$\hat{v}_{t}^{\text{prior}} = M_{t-1} k_t$$
The local prediction error is computed as:
$$e_t = v_t - \hat{v}_{t}^{\text{prior}} = v_t - M_{t-1} k_t$$
Notice that this error directly derives from the instantaneous retrieval loss $\mathcal{L}_t(M) = \frac{1}{2} \|v_t - M k_t\|_2^2$, because:
$$\nabla_M \mathcal{L}_t = - (v_t - M k_t) \, k_t^T = - e_t \, k_t^T$$
The weight update performs exact gradient descent along this local error:
$$\Delta M_t = \eta \, (e_t \, k_t^T) = \eta \, (v_t - M_{t-1} k_t) \, k_t^T$$
$$M_t = \lambda M_{t-1} + \Delta M_t$$
*Pedagogical Significance*: If the matrix already reliably stores the mapping $k_t \to v_t$, then $e_t \approx 0$ and $\Delta M_t \approx \mathbf{0}$, preventing redundant overwriting of existing synaptic structures.

#### 3.3 Rule C: Dragon Hatchling (BDH) Sparse Non-Negative Associative Plasticity
Pathway's BDH architecture leverages non-negative activations $\text{ReLU}(\cdot)$ or GeLU alongside sparse synaptic updates to prevent destructive negative crosstalk:
$$a_t = \text{ReLU}(k_t) \quad (\text{sparse non-negative key activation})$$
$$\hat{v}_{t}^{\text{prior}} = \text{ReLU}(M_{t-1} a_t)$$
$$e_t = \text{ReLU}(v_t) - \hat{v}_{t}^{\text{prior}}$$
$$M_t = \text{clamp}_{\ge 0}\left(\lambda M_{t-1} + \eta (e_t \, a_t^T)\right)$$
where $\text{clamp}_{\ge 0}(x) = \max(0, x)$ enforces Dale's biological principle / monosemantic excitatory synapses.

---

### 4. Readout and Prediction Mechanism

When probing the memory system with a query token $q \in \mathbb{R}^d$:

#### 4.1 Fast Weights Readout
The retrieved value estimate $\hat{v}_{\text{FW}} \in \mathbb{R}^d$ is generated via direct single-pass matrix-vector multiplication:
$$\hat{v}_{\text{FW}} = M_T \, q$$
If the probe is normalized or filtered through an output activation:
$$\hat{v}_{\text{FW}}^{\text{norm}} = \frac{\hat{v}_{\text{FW}}}{\max(\|\hat{v}_{\text{FW}}\|_2, \, 10^{-7})}$$

#### 4.2 KV-Cache (Scaled Dot-Product Attention) Baseline Readout
The Transformer computes attention scores across all stored keys, then computes the weighted average of stored values:
$$s_i = \frac{q^T k_i}{\sqrt{d}} \quad \text{for } i \in \{1, \dots, T\}$$
$$\alpha = \text{Softmax}([s_1, s_2, \dots, s_T]^T) \in \mathbb{R}^T \quad \text{where } \alpha_i = \frac{\exp(s_i)}{\sum_{j=1}^T \exp(s_j)}$$
$$\hat{v}_{\text{KV}} = \sum_{i=1}^T \alpha_i v_i = \mathcal{V}_T^T \alpha$$

---

### 5. Ground Truth & Exact Error Metrics ("Truth beside Estimate")

When probing with a historical key $q = k_p$ (probing the association stored at position $p \in \{1, \dots, T\}$):

#### 5.1 Ground Truth Target
$$v^* = v_p$$
The true, pristine value vector bound to key $k_p$ at step $p$.

#### 5.2 Loss & Discrepancy Metrics
The application evaluates and displays four exact mathematical quantities side-by-side:

1. **Euclidean Reconstruction Error ($L_2$ Loss)**:
   $$\mathcal{E}_{L2} = \|v^* - \hat{v}\|_2 = \sqrt{\sum_{j=1}^d (v^*_j - \hat{v}_j)^2}$$
2. **Cosine Retrieval Similarity**:
   $$\mathcal{S}_{\cos} = \frac{v^* \cdot \hat{v}}{\max(\|v^*\|_2 \|\hat{v}\|_2, \, 10^{-7})}$$
   - $\mathcal{S}_{\cos} = 1.000 \implies$ Perfect directional recovery.
   - $\mathcal{S}_{\cos} \le 0.000 \implies$ Total semantic distortion / inversion.
3. **Retrieval Accuracy Classification**:
   Given a dictionary of all active values $\{v_1, \dots, v_T\}$, classification succeeds if:
   $$\arg\max_{i \in \{1, \dots, T\}} (v_i \cdot \hat{v}) = p$$
   Displayed as a crisp binary verdict: `EXACT RETRIEVAL` (Green) or `CROSSTALK COLLISION` (Red).
4. **Crosstalk Interference Measure**:
   The analytical decomposition of the readout under Hebbian memory:
   $$\hat{v}_{\text{FW}} = M_T k_p = \sum_{t=1}^T (v_t k_t^T) k_p = v_p (k_p^T k_p) + \sum_{t \neq p} v_t (k_t^T k_p)$$
   Since $\|k_p\|_2 = 1$:
   $$\hat{v}_{\text{FW}} = \underbrace{v_p}_{\text{Signal}} + \underbrace{\sum_{t \neq p} v_t (k_t \cdot k_p)}_{\text{Crosstalk Noise}}$$
   - If keys are mutually orthogonal ($k_t \cdot k_p = 0, \, \forall t \neq p$), Crosstalk Noise $= \mathbf{0}$, guaranteeing exact recall!
   - If keys correlate ($k_t \cdot k_p = \cos \theta \neq 0$), crosstalk noise corrupts the signal in direct proportion to $\cos \theta$.

---

### 6. Theoretical Capacity Bounds & Failure Physics

#### 6.1 Linear Independence and Dimensional Capacity Limit
In an associative linear matrix $M \in \mathbb{R}^{d \times d}$:
- The maximum number of mutually orthogonal keys in $\mathbb{R}^d$ is strictly:
  $$C_{\max} = d$$
- When $T \le d$ and all $k_i$ are pairwise orthogonal ($k_i^T k_j = \delta_{ij}$):
  $$\|v_p - M_T k_p\|_2 = 0 \quad (\text{Zero error under Hebbian or Delta rule})$$
- When $T > d$, by the Pigeonhole Principle for vector spaces, the keys **must** become linearly dependent. Crosstalk is mathematically unavoidable in a linear matrix:
  $$\text{Noise Variance} \approx \frac{T - 1}{d}$$
  This is the fundamental failure boundary demonstrated live in Stage 3 and Stage 4.

#### 6.2 The Hopfield / Amari Information-Theoretic Bound
For random distributed binary/bipolar patterns:
$$C_{\text{Hopfield}} \approx \frac{d}{2 \ln d} \approx 0.14 d$$
The application graphically marks both the strict linear limit ($N = d$) and the soft statistical limit ($N \approx 0.14 d$) on all experimental curves.

---

### 7. Numerical Stability & Deterministic Initialization

1. **Deterministic PRNG**: Linear Congruential Generator (LCG) initialized with user-controlled seed:
   $$X_{n+1} = (1664525 \cdot X_n + 1013904223) \pmod{2^{32}}$$
   Guarantees that identical seed + parameter settings produce bit-for-bit identical vectors on Chrome, Firefox, Safari, and mobile WebKit.
2. **Gram-Schmidt Orthogonalization Pipeline**:
   To generate controllable key correlation:
   - Generate initial random basis $u_1, u_2 \in \mathbb{R}^d$.
   - Make $u_2$ orthogonal to $u_1$: $u_2^{\perp} = u_2 - (u_2 \cdot u_1) u_1$, then normalize.
   - For a user-chosen correlation angle $\theta \in [0^\circ, 90^\circ]$:
     $$k_1 = u_1$$
     $$k_2(\theta) = \cos(\theta) u_1 + \sin(\theta) u_2^{\perp}$$
     Thus: $k_1 \cdot k_2 = \cos(\theta)$ exactly!
     When $\theta = 90^\circ$, $k_1 \cdot k_2 = 0$ (perfect orthogonality).
     When $\theta = 0^\circ$, $k_1 = k_2$ (collinear collision).
3. **Epsilon Guards**: All vector normalizations divide by $\max(\|v\|_2, \, 10^{-7})$ to prevent division by zero or NaN propagation.
