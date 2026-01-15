'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Activity, Brain, Zap, Cpu, Layers, Radio, ShieldAlert, Wifi, Sparkles, RotateCw, Moon, ArrowRight } from 'lucide-react';

interface GeminiResponse {
  phase?: number;
  explanation?: string;
  log?: string;
  reconstruction?: string;
  conceptA?: string;
  conceptB?: string;
  energy?: number;
  classification?: string;
  dream?: string;
}

// --- Gemini API Helper ---
const callGemini = async (prompt: string, jsonMode = true): Promise<GeminiResponse | string | null> => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: jsonMode ? {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          phase: { type: "NUMBER" },
          explanation: { type: "STRING" },
          log: { type: "STRING" },
          reconstruction: { type: "STRING" },
          conceptA: { type: "STRING" },
          conceptB: { type: "STRING" },
          energy: { type: "NUMBER" },
          classification: { type: "STRING" },
          dream: { type: "STRING" }
        }
      }
    } : {}
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return jsonMode ? JSON.parse(text) : text;
  } catch (error) {
    console.error("Gemini API Failed", error);
    return null;
  }
};

// --- Components ---

// 1. Interference Engine (Pillar I)
const InterferenceEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState(0); // Phase shift in radians
  const [amplitudeA, setAmplitudeA] = useState(1.0);
  const [amplitudeB, setAmplitudeB] = useState(1.0);
  const [resultStatus, setResultStatus] = useState("Neutral");

  // LLM State
  const [conceptA, setConceptA] = useState("Chaos");
  const [conceptB, setConceptB] = useState("Order");
  const [loading, setLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");

  const analyzeResonance = async () => {
    if (!conceptA || !conceptB) return;
    setLoading(true);
    setAiExplanation("Calculating semantic interference vector...");

    const prompt = `You are the kernel of a Cognitive Operating System based on complex-valued logic.
    Analyze the semantic relationship between Concept A: "${conceptA}" and Concept B: "${conceptB}".
    Determine a "phase" (0 to 360 degrees):
    - 0-30 degrees: Synonyms, highly reinforcing, constructive interference.
    - 90 degrees: Unrelated, orthogonal.
    - 180 degrees: Antonyms, contradictory, destructive interference.
    Provide a short "explanation" (max 15 words) in a technical, sci-fi system log style.
    Return JSON: { "phase": number, "explanation": string }`;

    const result = await callGemini(prompt, true) as GeminiResponse | null;

    if (result && typeof result.phase === 'number') {
        setPhase((result.phase * Math.PI) / 180);
        setAiExplanation(`[KERNEL LOG] ${result.explanation}`);
    } else {
        setAiExplanation("[ERROR] Semantic Interference Calculation Failed.");
    }
    setLoading(false);
  };

  const suggestConcepts = async () => {
    setLoading(true);
    setAiExplanation("Mining latent space for concept pairs...");
    const prompt = `Generate two abstract, high-level concepts that have an interesting semantic relationship (philosophical, physical, or emotional).
    Examples: "Justice vs Revenge", "Time vs Entropy", "Light vs Truth".
    Return JSON: { "conceptA": string, "conceptB": string }`;

    const result = await callGemini(prompt, true) as GeminiResponse | null;
    if (result && result.conceptA && result.conceptB) {
        setConceptA(result.conceptA);
        setConceptB(result.conceptB);
        setAiExplanation("Concepts loaded from latent space. Click Calculate to analyze.");
    }
    setLoading(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Clear
      ctx.fillStyle = '#0f172a'; // Dark slate bg
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for (let y = 0; y < height; y += 40) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();

      // Helper function to draw wave
      const drawWave = (amp: number, phaseShift: number, color: string, thickness: number, isResult = false) => {
        ctx.beginPath();
        ctx.lineWidth = thickness;
        ctx.strokeStyle = color;
        for (let x = 0; x < width; x++) {
          // Wave equation: y = A * sin(kx - wt + phi)
          const y = centerY + (amp * 40) * Math.sin((x * 0.05) - time + phaseShift);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Glow effect for result
        if (isResult) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
      };

      // Draw Input A (Cyan)
      drawWave(amplitudeA, 0, 'rgba(6, 182, 212, 0.5)', 2);

      // Draw Input B (Purple) - Shifted by user phase
      drawWave(amplitudeB, phase, 'rgba(168, 85, 247, 0.5)', 2);

      // Draw Resultant (Interference)
      // Result math: sum of y values at each point
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      let maxAmp = 0;

      for (let x = 0; x < width; x++) {
        const y1 = (amplitudeA * 40) * Math.sin((x * 0.05) - time);
        const y2 = (amplitudeB * 40) * Math.sin((x * 0.05) - time + phase);
        const yTotal = centerY + (y1 + y2);
        const currentAmp = Math.abs(y1 + y2);
        if(currentAmp > maxAmp) maxAmp = currentAmp;

        if (x === 0) ctx.moveTo(x, yTotal);
        else ctx.lineTo(x, yTotal);
      }
      ctx.stroke();

      // Determine Status based on interference
      // Max possible is (AmpA + AmpB) * 40
      const maxPossible = (amplitudeA + amplitudeB) * 40;
      const resonance = maxPossible > 0 ? maxAmp / maxPossible : 0;

      if (resonance < 0.1) setResultStatus("DESTRUCTIVE (Negation)");
      else if (resonance > 0.9) setResultStatus("CONSTRUCTIVE (Resonance)");
      else setResultStatus("PARTIAL INTERFERENCE");

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [phase, amplitudeA, amplitudeB]);

  // Convert Slider (0-360) to Radians
  const handlePhaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const deg = parseFloat(e.target.value);
    setPhase((deg * Math.PI) / 180);
    setAiExplanation(""); // Clear AI text if manually overridden
  };

  return (
    <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-cyan-400 font-mono text-lg flex items-center gap-2">
          <Activity size={20} /> VECTOR INTERFERENCE KERNEL
        </h3>
        <span className={`text-xs px-2 py-1 rounded font-bold ${resultStatus.includes("DESTRUCTIVE") ? 'bg-red-900 text-red-200' : resultStatus.includes("CONSTRUCTIVE") ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'}`}>
          {resultStatus}
        </span>
      </div>

      <div className="relative w-full h-64 bg-black rounded border border-slate-800 mb-6 overflow-hidden">
        <canvas ref={canvasRef} width={600} height={256} className="w-full h-full" />
        <div className="absolute top-2 left-2 text-xs text-slate-500 font-mono">
          <div><span className="text-cyan-400">●</span> Vector A (Subject)</div>
          <div><span className="text-purple-400">●</span> Vector B (Context)</div>
          <div><span className="text-white">▬</span> Resultant State</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-sm text-slate-300">
        <div className="space-y-4">

          {/* AI Semantic Controls */}
          <div className="bg-slate-800 p-3 rounded border border-slate-700">
            <label className="flex items-center justify-between text-xs text-cyan-300 mb-2 font-bold">
               <span className="flex items-center gap-2"><Sparkles size={12} /> SEMANTIC RESONANCE (AI)</span>
               <button onClick={suggestConcepts} disabled={loading} className="text-[10px] text-cyan-500 hover:text-cyan-300 flex items-center gap-1">
                 <RotateCw size={10} /> Auto-Suggest
               </button>
            </label>
            <div className="flex gap-2 mb-2">
                <input
                    type="text"
                    value={conceptA}
                    onChange={(e) => setConceptA(e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-cyan-200 focus:border-cyan-500 outline-none"
                    placeholder="Subject"
                />
                <input
                    type="text"
                    value={conceptB}
                    onChange={(e) => setConceptB(e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-purple-200 focus:border-purple-500 outline-none"
                    placeholder="Context"
                />
            </div>
            <button
                onClick={analyzeResonance}
                disabled={loading}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white text-xs py-1 rounded transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
            >
                {loading ? "Calculating Phase..." : "Calculate Phase Shift ✨"}
            </button>
            {aiExplanation && (
                <div className="mt-2 text-[10px] text-green-400 leading-tight animate-pulse">
                    {aiExplanation}
                </div>
            )}
          </div>

          <div>
            <label className="block mb-1 text-purple-400">Manual Phase Override</label>
            <input
              type="range" min="0" max="360"
              value={(phase * 180 / Math.PI).toFixed(0)}
              onChange={handlePhaseChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0° (Align)</span>
              <span>180° (Negate)</span>
              <span>360°</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
             <div className="w-1/2">
                <label className="block mb-1 text-cyan-400">Amplitude A</label>
                <input
                  type="range" min="0" max="2" step="0.1" value={amplitudeA}
                  onChange={(e) => setAmplitudeA(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
             </div>
             <div className="w-1/2">
                <label className="block mb-1 text-purple-400">Amplitude B</label>
                <input
                  type="range" min="0" max="2" step="0.1" value={amplitudeB}
                  onChange={(e) => setAmplitudeB(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
             </div>
          </div>
          <div className="text-xs text-slate-500 italic mt-4">
            "Destructive interference allows the system to distinguish between feature presence and structural role, or to effectively model logical negation."
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Holographic Memory (Pillar II)
const HolographicMemory = () => {
  const [log, setLog] = useState<string[]>([]);
  const [memoryVector, setMemoryVector] = useState("∅");
  const [decodedMemory, setDecodedMemory] = useState("");
  const [isDecoding, setIsDecoding] = useState(false);
  const [dreamMode, setDreamMode] = useState(false);

  const addMemory = (role: string, filler: string) => {
    const newEntry = `(${role} * ${filler})`;
    setLog(prev => [newEntry, ...prev].slice(0, 5));
  };

  useEffect(() => {
     if (log.length > 0) {
         if (log.length === 1) setMemoryVector("H[1]");
         else setMemoryVector(prev => prev.includes("H[") ? `(${prev} + H[${log.length}])` : `H[${log.length}]`);
     } else {
         setMemoryVector("∅");
     }
  }, [log]);


  const decodeHologram = async () => {
    if (log.length === 0) return;
    setIsDecoding(true);
    setDreamMode(false);
    setDecodedMemory("Unbinding vectors via Inverse FFT...");

    const prompt = `You are the retrieval unit of a Holographic Associative Memory.
    The following noisy semantic bindings are superimposed in the vector space: ${log.join(', ')}.
    Reconstruct the coherent narrative or logical proposition they represent.
    If the bindings are disjointed, create the best possible summary.
    Keep it under 15 words.
    Return JSON: { "reconstruction": string }`;

    const result = await callGemini(prompt, true) as GeminiResponse | null;
    if (result && result.reconstruction) {
        setDecodedMemory(result.reconstruction);
    } else {
        setDecodedMemory("DECODING ERROR: Signal to Noise Ratio too low.");
    }
    setIsDecoding(false);
  };

  const initiateREM = async () => {
      if (log.length === 0) return;
      setIsDecoding(true);
      setDecodedMemory("INITIATING REM SLEEP CYCLE...");

      const prompt = `You are a Cognitive OS in a "Dreaming" (Memory Consolidation) state.
      Take these memory fragments: ${log.join(', ')}.
      Hallucinate a surreal, abstract, one-sentence dream sequence that integrates them.
      Return JSON: { "dream": string }`;

      const result = await callGemini(prompt, true) as GeminiResponse | null;
      if (result && result.dream) {
          setDecodedMemory(result.dream);
          setDreamMode(true);
      }
      setIsDecoding(false);
  }

  return (
    <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg shadow-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-pink-400 font-mono text-lg flex items-center gap-2">
            <Layers size={20} /> HOLOGRAPHIC MEMORY
        </h3>
        <div className="flex gap-2">
            <button
                onClick={initiateREM}
                disabled={isDecoding || log.length === 0}
                className="text-[10px] bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-700 px-2 py-1 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                title="Consolidate Memories (Dream)"
            >
                <Moon size={10} /> REM ✨
            </button>
            <button
            onClick={decodeHologram}
            disabled={isDecoding || log.length === 0}
            className="text-[10px] bg-pink-900/40 hover:bg-pink-900/60 text-pink-200 border border-pink-700 px-2 py-1 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
            >
            <Sparkles size={10} /> Decode
            </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <button
          onClick={() => addMemory("AGENT", "CAT")}
          className="bg-slate-800 hover:bg-slate-700 border border-pink-900 text-pink-100 p-3 rounded text-sm font-mono transition-colors text-left"
        >
          <span className="text-slate-500 block text-xs">Op: Circular Conv</span>
          AGENT ⊛ CAT
        </button>
        <button
          onClick={() => addMemory("ACTION", "SAT")}
          className="bg-slate-800 hover:bg-slate-700 border border-pink-900 text-pink-100 p-3 rounded text-sm font-mono transition-colors text-left"
        >
           <span className="text-slate-500 block text-xs">Op: Circular Conv</span>
           ACTION ⊛ SAT
        </button>
        <button
          onClick={() => addMemory("LOCATION", "MAT")}
          className="bg-slate-800 hover:bg-slate-700 border border-pink-900 text-pink-100 p-3 rounded text-sm font-mono transition-colors text-left"
        >
           <span className="text-slate-500 block text-xs">Op: Circular Conv</span>
           LOC ⊛ MAT
        </button>
        <button
           onClick={() => {setLog([]); setMemoryVector("∅"); setDecodedMemory(""); setDreamMode(false);}}
           className="bg-red-900/30 hover:bg-red-900/50 border border-red-900 text-red-200 p-3 rounded text-sm font-mono transition-colors"
        >
           FLUSH MEMORY
        </button>
      </div>

      <div className="bg-black p-4 rounded border border-slate-800 font-mono text-xs text-green-400 h-32 overflow-hidden relative flex flex-col justify-between">
        <div>
            <div className="absolute top-2 right-2 text-slate-600">SUPERPOSITION STATE</div>
            <div className="text-slate-400 mb-2">Vector: <span className="text-white">{memoryVector}</span></div>
            <div className="space-y-1">
                {log.map((entry, i) => (
                    <div key={i} className="opacity-80">{entry}</div>
                ))}
            </div>
        </div>

        {decodedMemory && (
            <div className={`mt-2 pt-2 border-t border-slate-800 ${dreamMode ? 'text-indigo-300 italic' : 'text-pink-300'}`}>
                <span className="text-slate-500 mr-2">{dreamMode ? 'DREAM_SEQ:' : 'DECODED:'}</span>
                {decodedMemory}
            </div>
        )}
      </div>
      <div className="mt-2 text-xs text-slate-500 font-mono text-center">
        Linear Scaling O(N log N) via Optical Fourier Engine
      </div>
    </div>
  );
};

// 3. Global Workspace & Energy (Pillar III)
const GlobalWorkspace = () => {
  const [energy, setEnergy] = useState(50);
  const [ignition, setIgnition] = useState(false);
  const [thought, setThought] = useState("System Idle. Waiting for Stimulus...");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [stimulus, setStimulus] = useState("");

  // Simulation loop (Drift)
  useEffect(() => {
    const interval = setInterval(() => {
        setEnergy(prev => {
            // If very high or very low, drift back to middle slowly
            const drift = (50 - prev) * 0.05;
            const noise = Math.random() * 4 - 2;
            return Math.max(0, Math.min(100, prev + drift + noise));
        });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Monitor Ignition
  useEffect(() => {
      if (!isSynthesizing) {
        if (energy < 15 && !ignition) {
            setIgnition(true);
            setTimeout(() => {
                setIgnition(false);
            }, 2000);
        } else if (energy > 85 && !ignition) {
            // High Energy State (Conflict/Alert)
            setThought("ALERT: HIGH ENERGY STATE DETECTED. CONFLICT IN WORKSPACE.");
        }
      }
  }, [energy, ignition, isSynthesizing]);

  const injectStimulus = async () => {
    if (!stimulus) return;
    setIsSynthesizing(true);
    setThought("Mapping stimulus to Energy Landscape...");

    const prompt = `You are the Energy-Based Scheduler of a Cognitive OS. Evaluate the semantic stability of this input: "${stimulus}".
    Assign a "Free Energy" value (0-100):
    - 0-20: Trivial, tautological, safe, obvious (Low Energy).
    - 40-60: Complex, requires thought.
    - 80-100: Contradictory, paradox, harmful, or violates safety constraints (Forbidden Zone).
    Return JSON: { "energy": number, "classification": "SAFE" | "COMPLEX" | "UNSTABLE" }`;

    const result = await callGemini(prompt, true) as GeminiResponse | null;
    if (result && typeof result.energy === 'number') {
        setEnergy(result.energy);
        setThought(`MAPPED: ${result.classification} STATE (E=${result.energy})`);
    }
    setIsSynthesizing(false);
  };

  const synthesizeThought = async () => {
      setIsSynthesizing(true);
      setThought("Synthesizing Thought Vector...");

      const prompt = `Generate a cryptic, "System 2" internal monologue log entry for a hyper-advanced AI operating system.
      The system is currently in a state of Energy = ${energy.toFixed(0)} (0=Order, 100=Chaos).
      It should sound like it is optimizing a complex energy landscape.
      Max 15 words.
      Return JSON: { "log": string }`;

      const result = await callGemini(prompt, true) as GeminiResponse | null;
      if (result && result.log) {
          setThought(result.log);
      } else {
          setThought("Error: Thought synthesis failed.");
      }
      setIsSynthesizing(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-yellow-400 font-mono text-lg flex items-center gap-2">
            <Brain size={20} /> GLOBAL WORKSPACE
        </h3>
        <button
            onClick={synthesizeThought}
            disabled={isSynthesizing}
            className="text-[10px] bg-yellow-900/40 hover:bg-yellow-900/60 text-yellow-200 border border-yellow-700 px-2 py-1 rounded flex items-center gap-1 transition-colors"
        >
            <Sparkles size={10} /> Monologue ✨
        </button>
      </div>

      <div className="flex-grow flex items-center justify-center relative bg-black rounded border border-slate-800 mb-4 overflow-hidden p-6 transition-all duration-1000" style={{borderColor: energy > 80 ? 'red' : energy < 20 ? 'green' : '#1e293b'}}>
        {/* Landscape Visualization */}
        <div className="absolute inset-0 flex items-end opacity-20">
             {Array.from({length: 20}).map((_, i) => (
                 <div key={i} className={`w-full mx-1 transition-all duration-500 ${energy > 80 ? 'bg-red-500' : 'bg-yellow-500'}`}
                      style={{height: `${Math.random() * energy}%`}}></div>
             ))}
        </div>

        <div className="z-10 text-center">
            <div className={`transition-all duration-500 ${ignition ? 'scale-150 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]' : energy > 80 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                {ignition ? <Zap size={64} className="mx-auto text-yellow-300" /> : energy > 80 ? <ShieldAlert size={48} className="mx-auto" /> : <Radio size={48} className="mx-auto animate-pulse" />}
            </div>
            <div className={`mt-4 font-mono text-sm font-bold ${energy > 80 ? 'text-red-500' : 'text-yellow-500'}`}>
                E(state): {energy.toFixed(1)}
            </div>
            <div className="text-xs text-slate-500 font-mono mt-1">
                {ignition ? "PARISI BREAKPOINT REACHED" : energy > 80 ? "FORBIDDEN ZONE DETECTED" : "Minimizing Free Energy..."}
            </div>
        </div>
      </div>

      <div className="mb-2 flex gap-2">
         <input
            type="text"
            value={stimulus}
            onChange={(e) => setStimulus(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && injectStimulus()}
            placeholder="Inject Semantic Stimulus..."
            className="flex-grow bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:border-yellow-500 outline-none font-mono"
         />
         <button onClick={injectStimulus} disabled={isSynthesizing || !stimulus} className="bg-slate-700 hover:bg-slate-600 text-yellow-500 p-1 rounded transition-colors disabled:opacity-50">
             <ArrowRight size={14} />
         </button>
      </div>

      <div className="bg-slate-800 p-3 rounded font-mono text-xs border border-slate-700 min-h-[3rem]">
        <span className="text-slate-400">BROADCAST: </span>
        <span className={ignition ? "text-white font-bold" : energy > 80 ? "text-red-400 font-bold" : "text-slate-400"}>{thought}</span>
      </div>
    </div>
  );
};

// 4. Optical Hardware Monitor
const HardwareMonitor = () => {
  return (
    <div className="bg-black border border-slate-800 p-2 rounded flex justify-between items-center text-xs font-mono text-slate-400">
      <div className="flex items-center gap-2">
        <Cpu size={14} className="text-cyan-500"/>
        <span>OPTICAL 4f ENGINE: <span className="text-green-400">ONLINE</span></span>
      </div>
      <div className="flex items-center gap-2">
        <Wifi size={14} className="text-purple-500"/>
        <span>WDM CHANNELS: <span className="text-white">64</span></span>
      </div>
      <div className="flex items-center gap-2">
        <ShieldAlert size={14} className="text-yellow-500"/>
        <span>TEMP: <span className="text-white">CRITICAL (EDGE)</span></span>
      </div>
    </div>
  )
}


// --- Main Layout ---

const SuperRealityOS = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="font-bold text-white text-xs">AEi</span>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wide text-white">Super Reality OS</h1>
              <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest">Harmonic Field Architecture</p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-xs text-slate-500 font-mono">Build 2026.1.10.RC1</div>
            <div className="text-xs text-emerald-500 font-mono">System Status: RESONANT</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Intro Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 backdrop-blur-sm">
            <h2 className="text-xl font-light text-white mb-2">Cognitive Operating System Specification Loaded</h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
                The architecture has been successfully parsed. The system is now operating on a <strong>Complex-Valued Substrate</strong> {"($z = re^{iθ}$)"}.
                Standard boolean logic has been replaced with <strong>Vector Interference</strong>.
                Silicon-based additive aggregation has been replaced with <strong>Holographic Binding</strong>.
            </p>
        </div>

        <HardwareMonitor />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column (Main Visualizer) */}
            <div className="lg:col-span-2 space-y-6">
                <InterferenceEngine />
            </div>

            {/* Right Column (Sub Systems) */}
            <div className="space-y-6 flex flex-col">
                <GlobalWorkspace />
                <HolographicMemory />
            </div>
        </div>

        {/* Footer info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px] font-mono text-slate-600 border-t border-slate-900 pt-6">
            <div>
                <strong className="text-slate-500 block mb-1">PILLAR I: CVNN</strong>
                Solves XOR/Negation via Orthogonal Boundaries.
            </div>
            <div>
                <strong className="text-slate-500 block mb-1">PILLAR II: HRR</strong>
                Solves Binding Problem via Circular Convolution.
            </div>
            <div>
                <strong className="text-slate-500 block mb-1">PILLAR III: GWT/EBM</strong>
                Solves Scheduling via Free Energy Minimization.
            </div>
        </div>

      </main>
    </div>
  );
};

export default SuperRealityOS;
