import torch
import torch.nn as nn
import numpy as np
import torch.fft as fft

class HarmonicEmbedding(nn.Module):
    def __init__(self, num_embeddings, embedding_dim):
        super().__init__()
        self.embedding_dim = embedding_dim

        # Magnitude: Initialized to 1 (normalized energy)
        # We learn 'presence' (r) separately from 'relation' (theta)
        self.magnitude = nn.Parameter(torch.ones(num_embeddings, embedding_dim))

        # Phase: Initialized uniformly between -pi and pi
        # This creates the "superposition" potential
        self.phase = nn.Parameter(
            torch.rand(num_embeddings, embedding_dim) * 2 * np.pi - np.pi
        )

    def forward(self, indices):
        mag = self.magnitude[indices]
        pha = self.phase[indices]

        # Euler's Formula: z = r * e^(i*theta)
        # We use polar coordinates construction
        real = mag * torch.cos(pha)
        imag = mag * torch.sin(pha)

        return torch.complex(real, imag)

class HolographicBinder(nn.Module):
    def __init__(self):
        super().__init__()

    def bind(self, role_vector, filler_vector):
        """
        Binds a role (e.g., 'Function Name') to a filler (e.g., 'main').
        Operation: Circular Convolution via FFT.
        """
        # 1. Fourier Transform
        f_role = fft.fft(role_vector)
        f_filler = fft.fft(filler_vector)

        # 2. Element-wise Multiplication (Binding in Freq Domain)
        # This is where the 'Holographic' mixing occurs.
        # Information is distributed across the entire spectrum.
        f_bound = f_role * f_filler

        # 3. Inverse Fourier Transform
        bound_vector = fft.ifft(f_bound)

        # Note: In pure Harmonic Field, we typically keep it complex.
        return bound_vector

    def forward(self, role_vector, filler_vector):
        return self.bind(role_vector, filler_vector)

class InterferenceLogicGate(nn.Module):
    def __init__(self, dim):
        super().__init__()
        # Complex Linear Weights
        self.weight = nn.Parameter(torch.randn(dim, dim, dtype=torch.complex64))
        self.bias = nn.Parameter(torch.randn(dim, dtype=torch.complex64))

        # Phase-Preserving Activation (ModReLU)
        self.threshold = nn.Parameter(torch.tensor(0.5))

    def complex_relu(self, z):
        """
        ModReLU: Rectifies magnitude, preserves phase.
        logic: if |z| + b > 0 then (|z|+b) * z/|z| else 0
        """
        mag = torch.abs(z)
        phase = torch.angle(z)

        # Logic Gate Thresholding
        # If interference is destructive (cancellation), mag drops below threshold.
        # This forces the output to 0, implementing the 'False' state of the gate.
        activated_mag = torch.relu(mag + self.threshold)

        return activated_mag * torch.exp(1j * phase)

    def forward(self, z_input):
        # 1. Complex Linear Transformation (Rotation + Scaling)
        # Wz + b
        linear_out = torch.matmul(z_input, self.weight) + self.bias

        # 2. Interference Activation
        # This is where the 'Computation' happens.
        return self.complex_relu(linear_out)

class TeleportationAttention(nn.Module):
    def __init__(self, dim, beta=1.0):
        super().__init__()
        self.beta = beta # Inverse Temperature (Control parameter for Ignition)
        # Using Complex Linear Layers
        self.q_proj = nn.Linear(dim, dim, dtype=torch.complex64)
        self.k_proj = nn.Linear(dim, dim, dtype=torch.complex64)
        self.v_proj = nn.Linear(dim, dim, dtype=torch.complex64)

    def forward(self, x):
        Q = self.q_proj(x)
        K = self.k_proj(x)
        V = self.v_proj(x)

        # Energy Function: E = -Re(Q * K_conjugate)
        # Measures alignment in the Semantic Hilbert Space
        energy = -torch.real(torch.matmul(Q, K.conj().transpose(-2, -1)))

        # Ignition / Teleportation
        # As Beta increases, the distribution sharpens drastically (Collapse).
        # This simulates the 'Winner-Take-All' dynamic of Global Workspace Ignition.
        attn_weights = torch.softmax(-self.beta * energy, dim=-1)

        # Broadcast
        out = torch.matmul(attn_weights.type(torch.complex64), V)
        return out
