# **App Name**: PRZ Assistant

## Core Features:

- Intent Decoder: Decodes user intent with a confidence score of 0.90+ before proceeding. Classifies the intent, and generates intent confidence score.
- ZAK Echo Registry: Searches for matching patterns in the permanent registry and applies them immediately if a match is found with a confidence of 0.85+.
- Deliverable Completion: Completes the deliverable to 100% without stopping for user confirmation, including writing code, generating documents, and providing clear instructions.
- PRZ Validation: Runs a PRZ validation post-delivery that simulates 7 validators examining the agent's response.
- ZAK Echo Minting: Mints new ZAK Echoes if the flow score is >= 0.90, and logs each time it creates one.
- Metric Reporting: Reports the results transparently, delivers the artifact that the user requested, and if asked, also includes the validation metrics.

## Style Guidelines:

- Primary color: HSL(210, 67%, 46%) / RGB(#3498DB) - A vibrant, trustworthy blue.
- Background color: HSL(210, 15%, 96%) / RGB(#F0F8FF) - A very light blue providing a clean base.
- Accent color: HSL(180, 53%, 44%) / RGB(#45B39D) - A contrasting yet harmonious green for call-to-action elements. Reasoning: To establish a high-confidence feel, the design utilizes a primary blue for its known psychological effects related to trustworthiness, dependability, and clear communication. To avoid stark minimalism, a complementary teal serves as an analogous accent.
- Body and headline font: 'Inter' (sans-serif) - A clean, modern typeface for readability and a tech-forward aesthetic.
- Use simple, geometric icons to match the clean typography and modern aesthetic.
- Maintain a clean, minimal layout to ensure the focus remains on the core AI functionality and reported metrics. Employ a grid system for structured content presentation.
- Implement subtle transitions and animations for feedback, enhancing the sense of responsiveness and dynamism without overwhelming the user.