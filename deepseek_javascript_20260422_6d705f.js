// Placeholder for future offline speech recognition & synthesis
export const voiceSystem = {
    startListening: () => { console.log("[Voice] startListening (offline-ready)"); },
    processSpeech: async (audioBlob) => { console.log("[Voice] processSpeech placeholder"); return ""; },
    generateVoiceOutput: (text) => { console.log(`[Voice] would speak: ${text}`); }
};