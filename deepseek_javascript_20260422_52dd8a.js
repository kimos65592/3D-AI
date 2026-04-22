import * as ort from 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.1/dist/ort.min.js';

let session = null;
let tokenizerMap = null; // simple word->index for our decision model

export async function initAIEngine() {
    console.log("Loading offline AI model from /models/model.onnx");
    try {
        // Load ONNX model
        session = await ort.InferenceSession.create('/models/model.onnx');
        // Load tokenizer (simple JSON mapping)
        const tokenResp = await fetch('/models/tokenizer.json');
        tokenizerMap = await tokenResp.json();
        console.log("AI Engine ready. Model loaded locally.");
    } catch(e) {
        console.error("Failed to load AI model. Ensure model.onnx and tokenizer.json exist in /models/", e);
        // Fallback dummy AI for demo – but real AI expected
        session = null;
    }
}

// Convert input text to input tensor based on tokenizer vocabulary
function textToInputVector(text) {
    if (!tokenizerMap || !tokenizerMap.vocab) {
        // fallback: simple bag of words on 20 keywords (if no tokenizer)
        const keywords = ['hello', 'look', 'left', 'right', 'talk', 'arm', 'head', 'idle', 'move', 'listen', 'think', 'open', 'mouth', 'raise', 'wave', 'sad', 'happy', 'angry', 'greet', 'nod'];
        const vec = new Array(keywords.length).fill(0);
        const lower = text.toLowerCase();
        keywords.forEach((kw, idx) => {
            if (lower.includes(kw)) vec[idx] = 1;
        });
        return vec;
    }
    // Use provided vocab (word to index)
    const words = text.toLowerCase().split(/\s+/);
    const vocab = tokenizerMap.vocab;
    const vector = new Array(Object.keys(vocab).length).fill(0);
    for (let w of words) {
        if (vocab[w] !== undefined) vector[vocab[w]] = 1;
    }
    return vector;
}

export async function getAIBehavior(userText) {
    if (!session) {
        console.warn("AI model not loaded, using fallback rule (but real AI required)");
        // Fallback for demo only, real app will have model
        const fallbackBehaviors = ["IDLE", "LOOK_LEFT", "LOOK_RIGHT", "MOVE_HEAD", "OPEN_MOUTH", "RAISE_ARM"];
        return fallbackBehaviors[Math.floor(Math.random() * fallbackBehaviors.length)];
    }
    
    // Prepare input tensor
    const inputVec = textToInputVector(userText);
    const inputTensor = new ort.Tensor('float32', Float32Array.from(inputVec), [1, inputVec.length]);
    
    // Run inference
    const feeds = { input: inputTensor };
    const results = await session.run(feeds);
    const output = results.output; // shape [1, num_classes]
    const probs = Array.from(output.data);
    const classIdx = probs.indexOf(Math.max(...probs));
    
    // Map index to behavior label (must match model training)
    const behaviorLabels = ["IDLE", "LOOK_LEFT", "LOOK_RIGHT", "MOVE_HEAD", "OPEN_MOUTH", "RAISE_ARM", "LISTEN", "THINK"];
    return behaviorLabels[classIdx] || "IDLE";
}