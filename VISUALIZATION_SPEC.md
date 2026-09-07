# FILE 06 — VISUALIZATION_SPEC.md
## Visualization Engine & Mathematical Data-to-Pixel Mapping

Every visual element in this application is directly driven by in-memory Float64 arrays computed in the browser. There are strictly zero decorative, random, or pre-rendered illustrations.

---

### 1. Visualization 01: The Synaptic Fast-Weight Matrix Heatmap ($M \in \mathbb{R}^{d \times d}$)

#### 1.1 Mathematical Source
The active 2D Float64 array $M_{i,j}$ for $i \in \{0, \dots, d-1\}$ (output dimension / value coordinate) and $j \in \{0, \dots, d-1\}$ (input dimension / key coordinate).

#### 1.2 Layout & Geometry
- A square canvas / SVG grid partitioned into $d \times d$ cells.
- Standard dimension: $d = 16 \implies 256$ distinct cells.
- Cell dimensions: $18 \text{ px} \times 18 \text{ px}$ with $1 \text{ px}$ separation.
- Outer container padding: $12 \text{ px}$.

#### 1.3 Color Palette & Dynamic Normalization
- A perceptually uniform diverging colormap mapping values continuously:
  - Negative Values ($M_{i,j} < 0$): Deep indigo/blue (`#1e3a8a` to `#60a5fa`).
  - Zero Baseline ($M_{i,j} \approx 0$): Neutral warm slate (`#0f172a` or `#1e293b`).
  - Positive Values ($M_{i,j} > 0$): Vibrant amber/orange (`#f59e0b` to `#fbbf24`).
- **Dynamic Normalization Factor**:
  $$M_{\max} = \max\left(0.1, \, \max_{i,j} |M_{i,j}|\right)$$
  Normalized intensity for cell $(i, j)$:
  $$\sigma_{i,j} = \frac{M_{i,j}}{M_{\max}} \in [-1.0, 1.0]$$
- **Hover Micro-Inspector**: Hovering any cell displays a crisp tooltip:
  `Synapse M[i=3, j=8]: +0.4281 (Hebbian association contribution)`

---

### 2. Visualization 02: "Truth Beside Estimate" Vector Comparison Panel

#### 2.1 Mathematical Source
Three synchronized 1D vectors of dimension $d$:
1. $v^* \in \mathbb{R}^d$ (Ground Truth Target Value)
2. $\hat{v}_{\text{FW}} \in \mathbb{R}^d$ (Fast Weight Recurrent Readout)
3. $\hat{v}_{\text{KV}} \in \mathbb{R}^d$ (Transformer Multi-Head Softmax Readout)

#### 2.2 Visual Representation: Paired Diverging Bar Graph
- $d$ columns along the X-axis (indexed $0$ through $d-1$).
- Y-axis spans $[-1.0, +1.0]$.
- For each dimension $j$:
  - Background ghost bar: Ground Truth $v^*_j$ (Neutral Slate with clear border `#64748b`).
  - Foreground solid bar: Estimated $\hat{v}_j$ (Emerald Green `#10b981` if $|v^*_j - \hat{v}_j| < 0.15$; Crimson Red `#ef4444` if discrepancy $\ge 0.15$).
- **Discrepancy Error Strip**: Immediately below the bar graph, a 1D difference strip displays local residuals:
  $$\delta_j = |v^*_j - \hat{v}_j|$$
  highlighting exactly which feature coordinates suffered crosstalk interference.

---

### 3. Visualization 03: Memory Footprint vs. Context Length Curve

#### 3.1 Mathematical Source
Analytical and empirically allocated memory footprint in bytes as a function of sequence length $T \in [1, 1024]$:
- Fast Weights Footprint:
  $$\text{Mem}_{\text{FW}}(T) = d^2 \times 4 \text{ bytes} \quad (\text{Horizontal line})$$
- KV-Cache Footprint:
  $$\text{Mem}_{\text{KV}}(T) = 2 \times T \times d \times 4 \text{ bytes} \quad (\text{Linear slope } 8d \text{ bytes/token})$$

#### 3.2 Visual Rendering (Interactive Dual-Line Chart)
- **X-axis**: Context Length $T$ (Logarithmic scale: $1, 4, 16, 64, 256, 1024, 4096$).
- **Y-axis**: Memory Consumed in Kilobytes ($0 \text{ KB}$ to $512 \text{ KB}$).
- **Crossover Point Indicator**: A dashed vertical marker at the exact sequence length where KV-cache exceeds Fast Weight storage:
  $$T_{\text{crossover}} = \frac{d}{2}$$
  For $d=16$, at $T > 8$ tokens, the KV-cache already consumes strictly more memory than the entire recurrent synaptic matrix!

---

### 4. Visualization 04: Retrieval Fidelity vs. Correlation Angle ($\theta$)

#### 4.1 Mathematical Source
Real-time computed cosine similarity $\mathcal{S}_{\cos}(\theta)$ sampled across $\theta \in [0^\circ, 90^\circ]$:
- Theoretical Hebbian Curve:
  $$\mathcal{S}_{\cos}^{\text{theory}}(\theta) = \frac{1}{\sqrt{1 + \cos^2(\theta)}}$$
- Empirical Fast Weight Curve: Directly sampled from live model readout.
- Empirical KV-Cache Softmax Curve: Softmax temperature-scaled attention output.

#### 4.2 Visual Rendering
- Interactive dot tracks the user's current slider position $\theta$ on the live curve.
- Shaded green region: `High Fidelity Retrieval` ($\mathcal{S}_{\cos} \ge 0.90$).
- Shaded amber region: `Degraded Retrieval / Hallucination` ($0.70 \le \mathcal{S}_{\cos} < 0.90$).
- Shaded red region: `Catastrophic Crosstalk` ($\mathcal{S}_{\cos} < 0.70$).

---

### 5. Visualization 05: Token Timeline & Probe Selector Strip

#### 5.1 Mathematical Source
The ordered sequence of stored associations $(k_1, v_1), (k_2, v_2), \dots, (k_N, v_N)$.

#### 5.2 Visual Rendering
- A clean horizontal ribbon of interactive token cards.
- Each card displays:
  - Token Index: `#1`, `#2`, ...
  - Key-Value Hash Icon or Color Swatch derived deterministically from vector values.
  - Active Probe Badge: Highlighted with an emerald ring if currently selected as query $q = k_p$.
  - Synaptic Retention Indicator: Mini vertical bar indicating $( \lambda^{N-p} \times 100 )\%$ retained weight.
