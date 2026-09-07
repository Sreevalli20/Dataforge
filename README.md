DataForge 2026 — Interactive Frontier AI Learning Experience

An interactive educational application created for DataForge 2026 — Pathway Track, focused on making one frontier-AI concept understandable through genuine, real-time computation.

## Project Status

✅ **Complete & Production-Ready**

The application is fully implemented with:

- **Genuinely interactive** real-time computation
- **Computationally live** Float64 linear algebra engine (8 bytes per element)
- **Scientifically grounded** mathematical mechanisms
- **Browser-accessible** 100% client-side execution
- **Reproducible** deterministic PRNG with seed control
- **Explicit distinctions** between toy model and published research

## Core Concept: Synaptic Plasticity vs. KV-Cache

This application explores **Associative Memory and Fast Weights (Synaptic Plasticity as Short-Term Memory)** within post-Transformer architectures, specifically grounded in the mathematical principles of Pathway's **Dragon Hatchling (BDH)** and **BDH-CQ (Continuous Query)** architectures.

### Central Falsifiable Claim

> *"A fixed-size recurrent synaptic weight matrix M_t ∈ ℝ^(d×d) updated via local online plasticity (Hebbian / Delta rule) achieves strict O(1) memory consumption per token and retrieves bound key-value associations (k → v) with near-zero error (‖v - v̂‖₂ < 10⁻⁴) when keys are orthogonal and total associations N ≤ d; however, as key angular distance decreases (θ → 0) or context sequence length exceeds the dimensional capacity (N > d), sequential updates induce catastrophic crosstalk interference, whereas an unbounded KV-cache maintains invariant retrieval fidelity at the cost of strictly linear O(T·d) memory growth."*

### Interactive Learning Journey

The application guides learners through 7 stages:

1. **Observe**: Zero-overhead associative memory with single key-value pair
2. **Predict**: Orthogonal memory superposition with multiple associations
3. **Break the System**: Induce interference catastrophe via correlated keys
4. **Repair via Delta Rule**: Local backpropagation error correction
5. **Head-to-Head Comparison**: Fast Weights vs. KV-Cache memory scaling
6. **Frontier BDH Connection**: Dragon Hatchling non-negative sparse plasticity
7. **Open Research Sandbox**: Unrestricted parameter exploration

## Computational Honesty

The project distinguishes between different evidence levels:

- **[DIRECT COMPUTATION]**: Calculations performed live in JavaScript (Float64 typed arrays, 8 bytes per element)
- **[EDUCATIONAL TOY MODEL]**: Single-layer associative plasticity substrate (NOT the official BDH model)
- **[PUBLISHED RESEARCH RESULT]**: Quantities from peer-reviewed literature (Hopfield bounds, BDH scaling)
- **[THEORETICAL BOUND]**: Formal mathematical asymptotes (O(1) vs O(T·d) scaling)

## Technology Stack

- **Framework**: React 19 + Vite 6 + TypeScript 5.8
- **Styling**: Tailwind CSS v4 (neutral high-contrast typography)
- **Math Engine**: In-memory Float64 dense matrix/vector operations (8 bytes per element)
- **State Management**: Reactive custom React hooks with deterministic PRNG
- **Visualization**: SVG vector canvas & HTML5 Canvas for real-time heatmaps
- **Testing**: Jest with ts-jest for computational correctness validation

**Zero backend, database, authentication, or external AI API required.**

## Repository Structure

```
Dataforge/
├── src/
│   ├── components/          # React UI components
│   │   ├── ControlsPanel.tsx
│   │   ├── SynapticHeatmap.tsx
│   │   ├── TruthBesideEstimate.tsx
│   │   ├── CrosstalkGraph.tsx
│   │   ├── MemoryGauges.tsx
│   │   ├── TokenTimeline.tsx
│   │   ├── GuidedStageEngine.tsx
│   │   └── SpecViewerModal.tsx
│   ├── lib/
│   │   ├── linearAlgebra.ts      # Core Float64 math engine
│   │   ├── memoryEngine.ts       # Experiment simulation
│   │   ├── linearAlgebra.test.ts # Mathematical invariant tests
│   │   └── memoryEngine.test.ts  # Pipeline correctness tests
│   ├── types.ts              # TypeScript definitions
│   ├── App.tsx               # Main application
│   ├── main.tsx              # Entry point
│   └── index.css             # Accessibility styles
├── public/
├── dist/                     # Production build output
├── package.json
├── vite.config.ts
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Run Tests

```bash
npm test
```

Tests cover:
- Mathematical invariants (vector normalization, orthogonality, dimensional invariance)
- Computational primitives (outer products, matrix-vector multiplication, softmax)
- Memory engine correctness (single-association reconstruction, capacity limits, determinism)
- Algorithm differentiation (Hebbian vs. Delta Rule vs. BDH Sparse)
- Memory footprint calculations (Float64 byte accuracy)

### Type Checking

```bash
npm run lint
```

### Build for Production

```bash
npm run build
```

The production build outputs to `dist/` and is Vercel-compatible.

## Scientific Scope

This project focuses on **one approved DataForge concept**: associative fast weights as an alternative to KV-cache memory in Transformers.

### Mathematical Mechanism

The application implements three plasticity update rules:

1. **Pure Hebbian**: ΔM = η(v k^T)
2. **Delta Rule**: ΔM = η(v - Mk)k^T (local error correction)
3. **BDH Sparse Dale**: ΔM = clamp≥0(λM + η(ReLU(v) - M ReLU(k)) ReLU(k)^T)

### Memory Footprint Calculations

All memory calculations use Float64Array (8 bytes per element):

- **Fast Weights**: d × d × 8 bytes (constant O(1))
  - For d=16: 16 × 16 × 8 = 2,048 bytes (2 KB)
- **KV-Cache**: 2 × N × d × 8 bytes (linear O(T·d))
  - For N=4096, d=16: 2 × 4096 × 16 × 8 = 1,048,576 bytes (1,024 KB)

### BDH / BDH-CQ Connection

The educational toy model connects to Pathway's Dragon Hatchling architecture through:

- **O(1) recurrent memory** vs. O(T·d) KV-cache scaling
- **Local synaptic plasticity** vs. static transformer weights
- **Non-negative sparse activations** (Dale's principle) for crosstalk suppression
- **Multi-layer hierarchical distribution** (explained as BDH innovation beyond our single-layer toy)

**Important**: This application runs an independent educational implementation of the core mathematical mechanism. It is explicitly labeled as an "Educational Toy Model" and does not claim to run the official Pathway BDH checkpoint.

## Reproducibility

Experiments are fully reproducible via:

- Deterministic LCG PRNG with user-controlled seed
- Exact mathematical equations implemented in Float64
- All parameters visible and adjustable
- Export capability for experimental state

## Performance

- **Target latency**: <1.5ms for full recompute (d=16, N=16)
- **60 fps interaction**: No UI freezing during computation
- **Cold-start load**: <400ms to interactive Stage 1

## Accessibility

The application supports:

- Keyboard navigation with visible focus states
- Semantic HTML controls with ARIA labels
- Reduced-motion preferences
- High-contrast mode support
- Responsive mobile layouts
- Non-color-only correctness indicators
- Textual explanations of visual information

## Deployment

The application is designed for Vercel deployment:

- Zero server dependencies
- No environment secrets required
- Static build output
- Works from public URL without authentication

### Vercel Deployment Instructions

1. Push repository to GitHub
2. Import project in Vercel
3. Build command: `npm run build`
4. Output directory: `dist`
5. No environment variables required

## Research Sources

Primary research sources:

- Ba et al. (2016) "Using Fast Weights to Attend to the Recent Past"
- Schlag et al. (2021) "Linear Transformers are Secretly Fast Weight Programmers"
- Pathway Research (2024-2025) "The Equations of Reasoning: The Dragon Hatchling Architecture"
- Pathway Research (2025) "BDH-CQ: Continuous Query Workflows"
- Hopfield (1982) "Neural Networks and Physical Systems with Emergent Collective Computational Abilities"

## AI Assistance Disclosure

This project was developed with AI assistance (Cascade). All AI-assisted code, research assistance, and writing assistance is disclosed per competition requirements. The registered team remains responsible for understanding, testing, validating, and defending the implementation.

## License

To be finalized according to the licenses of original code, dependencies, datasets, graphics, fonts, and other reused material.

## Credits

**DataForge 2026 — Pathway Track**

Repository: https://github.com/Sreevalli20/Dataforge