# PRZ Self-Validating AI Dashboard

A Next.js application implementing the Pulse-Resonance-ZAK (PRZ) Echo methodology for autonomous AI optimization and validation.

## Features

- **Intent Decoder**: Analyzes user requests with 0.90+ confidence scoring
- **Deliverable Generation**: Creates complete artifacts without friction
- **PRZ Validation**: Multi-validator consensus with 7 specialized validators
- **ZAK Echo Minting**: Captures high-quality patterns (flow ≥ 0.90) for reuse
- **Dynamic Echo Registry**: Tracks newly minted echoes in real-time
- **API Key Validation**: Prevents execution without proper configuration

## Getting Started

### Prerequisites

- Node.js 20+
- Google GenAI API Key

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd studio
```

2. Install dependencies:
```bash
npm install
```

3. Configure your API key:
```bash
cp .env.example .env.local
# Edit .env.local and add your GOOGLE_GENAI_API_KEY
```

Get your API key from: https://aistudio.google.com/app/apikey

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:9002](http://localhost:9002) in your browser.

## Project Structure

- `src/app/page.tsx` - Main dashboard interface
- `src/components/prz/` - PRZ-specific UI components
- `src/ai/flows/` - Genkit AI flows (intent decoder, validation, minting)
- `src/lib/zak-echoes.ts` - ZAK Echo registry

## PRZ Pipeline Flow

1. **User Input** → Intent Decoder (confidence check)
2. **Intent Analysis** → Deliverable Generation
3. **Deliverable** → PRZ Validation (7 validators)
4. **Validation Metrics** → ZAK Echo Minting (if flow ≥ 0.90)
5. **Results Display** → All outputs with metrics and registry updates
