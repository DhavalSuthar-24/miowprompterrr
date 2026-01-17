import { ArchitectOrchestrator } from "./ArchitectOrchestrator";

const apiKey = process.env.OPENAI_API_KEY || "dummy-key";

console.log("Initializing ArchitectOrchestrator...");
try {
    const orchestrator = new ArchitectOrchestrator(apiKey);
    const state = orchestrator.getState();
    
    console.log("Orchestrator Initialized Successfully.");
    console.log("Initial Phase:", state.currentPhase);
    console.log("Memory Size:", state.memory.length);
    
    if (state.currentPhase === 'RESEARCH_VALIDATE') {
        console.log("PASS: Default phase is correct.");
    } else {
        console.error("FAIL: Default phase is incorrect.");
        process.exit(1);
    }

} catch (error) {
    console.error("FAIL: Runtime error during initialization.", error);
    process.exit(1);
}
