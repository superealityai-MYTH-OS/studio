import torch
from jules_coder_lib.model import JulesCoderModel
from jules_coder_lib.layers import HolographicBinder

def test_jules_coder():
    vocab_size = 100
    dim = 64
    batch_size = 2
    seq_len = 10

    # Initialize model
    print(f"Initializing JulesCoderModel with vocab_size={vocab_size}, dim={dim}...")
    model = JulesCoderModel(vocab_size, dim, depth=2)

    # Create dummy input
    input_ids = torch.randint(0, vocab_size, (batch_size, seq_len))

    # Run forward pass
    print("Running forward pass...")
    logits = model(input_ids)
    print(f"Logits shape: {logits.shape}")

    # Check output shape
    assert logits.shape == (batch_size, seq_len, vocab_size), f"Expected {(batch_size, seq_len, vocab_size)}, got {logits.shape}"

    # Check output type (should be real magnitudes)
    assert not torch.is_complex(logits), "Logits should be real-valued magnitudes."

    # Test Binding
    print("Testing Holographic Binding...")
    binder = HolographicBinder()
    role = torch.randn(dim, dtype=torch.complex64)
    filler = torch.randn(dim, dtype=torch.complex64)
    bound = binder(role, filler)
    print(f"Bound vector shape: {bound.shape}")
    assert bound.shape == (dim,), f"Expected {(dim,)}, got {bound.shape}"
    assert torch.is_complex(bound), "Bound vector should be complex."

    print("All tests passed successfully!")

if __name__ == "__main__":
    test_jules_coder()
