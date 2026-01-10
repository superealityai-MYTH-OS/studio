import torch
import torch.nn as nn
from .layers import HarmonicEmbedding, TeleportationAttention, InterferenceLogicGate, HolographicBinder

class HarmonicBlock(nn.Module):
    def __init__(self, dim, beta=1.0):
        super().__init__()
        self.attn = TeleportationAttention(dim, beta=beta)
        self.ilg = InterferenceLogicGate(dim)

    def forward(self, x):
        # Attention
        attn_out = self.attn(x)
        # Residual connection is standard in transformers, though not explicitly mentioned,
        # it is usually implied for deep networks. I will add it for stability.
        x = x + attn_out

        # Interference Logic Gate (FFN equivalent)
        ilg_out = self.ilg(x)
        x = x + ilg_out

        return x

class JulesCoderModel(nn.Module):
    def __init__(self, vocab_size, dim, depth=4, beta=1.0):
        super().__init__()
        self.embedding = HarmonicEmbedding(vocab_size, dim)
        self.layers = nn.ModuleList([HarmonicBlock(dim, beta=beta) for _ in range(depth)])
        self.binder = HolographicBinder() # Available for structural binding tasks

        # Final projection to vocab? The text doesn't specify the output head.
        # Usually we project back to vocab size.
        # Since we are in complex space, we probably need a complex-to-real projection or magnitude check.
        # "The system "teleports" (collapses) into the deepest basin—the most coherent interpretation"
        # I will implement a simple projection for now to complete the loop.
        self.output_head = nn.Linear(dim, vocab_size, dtype=torch.complex64)

    def forward(self, input_ids):
        # input_ids: [Batch, Seq]
        x = self.embedding(input_ids)

        for layer in self.layers:
            x = layer(x)

        logits_complex = self.output_head(x)
        # Taking magnitude for probability/logit
        logits = torch.abs(logits_complex)
        return logits

    def bind_structure(self, role_vec, filler_vec):
        return self.binder(role_vec, filler_vec)
