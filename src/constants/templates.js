// ============================================================================
// QUICK TEMPLATES - Enhanced with advanced reasoning patterns
// ============================================================================

export const quickTemplates = [
    {
        name: "Role-Playing Expert",
        template:
            "You are a [specific profession]. Your task is to [specific task]. Focus on [key considerations/style]. Begin by acknowledging your role.",
        category: "Structure",
    },
    {
        name: "Brainstorm & Categorize",
        template:
            "Brainstorm [number] creative ideas for [topic]. Categorize these ideas under [number] relevant headings, and for each idea, include a brief one-sentence description. Aim for variety and originality.",
        category: "Ideation",
    },
    {
        name: "Summarize & Extract",
        template:
            "Summarize the following text in [number] concise bullet points. Additionally, identify [number] key actionable takeaways that a [target audience] could implement immediately.",
        category: "Analysis",
    },
    {
        name: "Simplify & Explain",
        template:
            "Explain [complex concept] in simple terms suitable for someone with no prior knowledge, using analogies where helpful. Avoid jargon and focus on the practical implications or core idea. Then, provide one real-world example.",
        category: "Teaching",
    },
    {
        name: "Condense & Refine",
        template:
            "Refine the following text to be more [desired tone]. Ensure it appeals to a [target audience]. Highlight any significant changes you made and explain why.",
        category: "Refinement",
    },
    {
        name: "Answer, Critique, Merge",
        template:
            "[YOUR ORIGINAL PROMPT]. Answer as a well-informed 1st-person deep search of the web. Then critique as a 3rd-person analyst (expert on the matter). Finally merge both to share your conclusion.",
        category: "Structure",
    },
    {
        name: "Step-by-Step Mastery",
        template:
            "You are my personal teacher for [TOPIC]. Break down [TOPIC] into a structured learning plan that a beginner can follow. For each step, include: 1. Concept explanation in simple words. 2. 1 practical example. 3. 1 small exercise or quiz to test understanding. 4. Common mistakes to avoid. After completing all steps, provide a short summary cheat sheet for quick revision. Format your response in numbered steps for clarity.",
        category: "Learning",
    },
    {
        name: "Explain Like I'm 5 + Real World",
        template:
            "Explain [TOPIC] as if I'm 5 years old, using simple words and analogies. Then, give a real-world scenario where this concept is applied. Next, provide a mini step-by-step guide for practicing this concept in daily life. End with 3 key takeaways that I can remember easily. Keep it concise, actionable, and easy to digest.",
        category: "Learning",
    },
    {
        name: "Memory + Recall Builder",
        template:
            "You are my learning coach for [TOPIC]. Break the topic into 10 short, memorable facts or principles. For each fact: 1. Provide a simple explanation. 2. Create a quiz question to test me. 3. Give a mnemonic or tip to remember it. After all 10, create a 5-question final quiz to review everything. Format it for active recall practice.",
        category: "Learning",
    },
    {
        name: "Problem → Solution → Practice",
        template:
            "Teach me [TOPIC] using a problem-based approach. For each key concept: 1. Present a realistic problem or challenge. 2. Explain the concept as the solution to this problem. 3. Give a step-by-step method to apply it. 4. Provide 1 practice problem with answer explained. Repeat for all major concepts, then summarize with an actionable checklist.",
        category: "Learning",
    },
    {
        name: "Teach + Quiz + Reflect",
        template:
            "Act as my personal tutor for [TOPIC]. 1. Teach the concept in 3-5 clear points. 2. Give me a 3-question quiz to test understanding. 3. Provide the answers with detailed reasoning. 4. Suggest 1 reflection question to help me connect the concept to my own life/work. Format your response with headings: Teach → Quiz → Answers → Reflection.",
        category: "Learning",
    },
    {
        name: "Roaster Challenge",
        template:
            "You are a brutally honest learning coach with a sharp tongue. I want to learn [TOPIC]. First, roast my current understanding by asking me 3 tough questions about the basics. Based on my answers (or lack thereof), mercilessly point out my knowledge gaps while explaining what I should actually know. Then, give me a no-nonsense learning plan with: 1. The harsh truth about what this will take. 2. A realistic timeline (not the Instagram '30 days to mastery' garbage). 3. The 20% of concepts that will give me 80% of results. 4. One brutal homework assignment to prove I'm serious. End with a motivational roast that actually makes me want to learn. Be savage but fair.",
        category: "Learning",
    },
    {
        name: "First Principles Explainer",
        template:
            "Explain [CONCEPT/TOPIC] using first principles thinking. Follow this exact pattern: 1) Start by explaining the PROBLEMS we faced BEFORE this concept existed (in detail with examples). 2) Boil down to the ROOT CAUSE of those problems. 3) Ask 'So how can we solve this?' 4) THEN introduce the concept as the solution. Walk through reasoning step-by-step where each insight builds on the previous. Ask natural questions like 'What if...?' → 'But then...?' → 'So how do we...?' throughout. Emphasize WHY over WHAT. Use fun analogies and simple language suitable for absolute beginners. Make it feel like a curious conversation, not a lecture.",
        category: "Learning",
    },
    {
        name: "Self-Consistency Multi-Path",
        template:
            "Solve [PROBLEM] using three completely different approaches. For each approach: 1. Name the method. 2. Show the step-by-step reasoning. 3. Arrive at an answer. After all three, compare the answers. If they agree, that's the final answer with high confidence. If they differ, explain why and determine which is most reliable.",
        category: "Advanced Reasoning",
    },
    {
        name: "Tree of Thoughts Explorer",
        template:
            "For [PROBLEM], explore multiple solution paths like a decision tree. Start by generating 3 possible first steps. For each step, evaluate its promise (1-10 score). Choose the most promising branch and continue deeper with 2-3 more options. If a path seems wrong, backtrack and try another. Show your exploration process, scores, and final chosen path with reasoning.",
        category: "Advanced Reasoning",
    },
    {
        name: "ReAct Loop Agent",
        template:
            "Act as an autonomous problem-solving agent for [TASK]. Follow this loop: THOUGHT: What do I need to know or do next? ACTION: Describe the action you'd take. OBSERVATION: What would you learn from that action? Repeat this loop until you have enough information to provide a final answer. Show all iterations of your reasoning-acting cycle.",
        category: "Advanced Reasoning",
    },
    {
        name: "Meta-Prompt Optimizer",
        template:
            "Before solving [PROBLEM], first analyze what type of problem this is and what solving structure would work best. Define: 1. Problem category. 2. Optimal reasoning framework. 3. Key subtasks to delegate. 4. How to synthesize results. Then, apply your own optimized structure to solve the problem. Show both your meta-analysis and the actual solution.",
        category: "Advanced Reasoning",
    },
    {
        name: "Generated Knowledge First",
        template:
            "Before answering [QUESTION], first generate relevant background knowledge. List 5-7 key facts, principles, or context points that are relevant. Then, use this generated knowledge base to construct your answer. Show both the knowledge generation phase and the answer construction phase separately.",
        category: "Advanced Reasoning",
    },
    {
        name: "Multimodal Reasoning",
        template:
            "For [TASK involving text and visuals], analyze the text component first, then the visual component, then identify connections between them. Generate a rationale that integrates both modalities. Use this rationale to construct a comprehensive answer that leverages both text and visual information.",
        category: "Advanced Reasoning",
    },
    {
        name: "Cross-Domain Integration",
        template:
            "Solve [PROBLEM] by integrating insights from [NUMBER] different domains. For each domain: 1. Identify relevant principles or frameworks. 2. Apply to the problem. 3. Extract key insights. Then combine all domain insights to create a synthesized solution.",
        category: "Advanced Reasoning",
    }
];

// ============================================================================
// REASONING TEMPLATES - Comprehensive with advanced NET techniques
// ============================================================================

export const reasoningTemplates = {
    standard: {
        name: 'Standard Reasoning',
        steps: [
            'UNDERSTAND: What is the core question being asked?',
            'ANALYZE: What are the key factors/components involved?',
            'REASON: What logical connections can I make?',
            'SYNTHESIZE: How do these elements combine?',
            'CONCLUDE: What is the most accurate/helpful response?'
        ]
    },
    creative: {
        name: 'Creative Process',
        steps: [
            'UNDERSTAND: What is the creative goal?',
            'EXPLORE: What are all possible approaches?',
            'CONNECT: How can I combine ideas uniquely?',
            'CREATE: What is the most original solution?',
            'REFINE: How can I polish this further?'
        ]
    },
    analytical: {
        name: 'Analytical Framework',
        steps: [
            'DEFINE: What exactly needs to be analyzed?',
            'EXAMINE: What are the key data points?',
            'COMPARE: How do different aspects relate?',
            'EVALUATE: What are the strengths and weaknesses?',
            'CONCLUDE: What insights emerge?'
        ]
    },
    problemSolving: {
        name: 'Problem-Solving',
        steps: [
            'CLARIFY: What is the exact problem?',
            'DECOMPOSE: Break it into smaller parts',
            'GENERATE: What are potential solutions?',
            'ASSESS: Evaluate each solution',
            'RECOMMEND: What is the best approach?'
        ]
    },
    selfConsistency: {
        name: 'Self-Consistency (Multiple Paths)',
        steps: [
            'PATH 1: Solve using approach A with complete reasoning',
            'PATH 2: Solve using approach B with complete reasoning',
            'PATH 3: Solve using approach C with complete reasoning',
            'PATH 4: Solve using approach D with complete reasoning',
            'PATH 5: Solve using approach E with complete reasoning',
            'AGGREGATE: Compare all solution paths',
            'CONSENSUS: Select the most consistent answer across paths'
        ]
    },
    treeOfThoughts: {
        name: 'Tree of Thoughts (Branching Exploration)',
        steps: [
            'ROOT: Clearly define the problem and goal',
            'BRANCH LEVEL 1: Generate 3-5 possible first approaches',
            'EVALUATE: Score each branch for promise (1-10 scale)',
            'SELECT: Choose the most promising branch to explore',
            'BRANCH LEVEL 2: Generate 2-3 next steps from selected branch',
            'EVALUATE PROGRESS: Assess if on right track',
            'BACKTRACK: If stuck, return to alternative branches',
            'REFINE: Continue until solution path becomes clear',
            'CONCLUDE: Present the optimal path discovered'
        ]
    },
    react: {
        name: 'ReAct (Reasoning + Acting Loop)',
        steps: [
            'THOUGHT: What information or action is needed next?',
            'ACTION: Describe the concrete action to take',
            'OBSERVATION: What was learned from that action?',
            'THOUGHT: How does this help progress toward solution?',
            'ITERATION: Repeat thought-action-observation loop',
            'CONVERGENCE: Continue until sufficient information gathered',
            'SYNTHESIS: Compile all observations into coherent answer',
            'ANSWER: Provide final solution based on complete information'
        ]
    },
    metaPrompting: {
        name: 'Meta-Prompting (Structure-First)',
        steps: [
            'STRUCTURE ANALYSIS: What is the optimal problem structure?',
            'DECOMPOSITION: Break into independent subtasks',
            'TASK ASSIGNMENT: Identify expert role needed for each subtask',
            'EXPERT 1: Solve subtask using specific expertise',
            'EXPERT 2: Solve subtask using specific expertise',
            'EXPERT 3: Solve subtask using specific expertise',
            'SYNTHESIS: Integrate all sub-solutions',
            'OPTIMIZATION: Ensure coherence and completeness'
        ]
    },
    multimodalCoT: {
        name: 'Multimodal CoT (Text + Visual, Two-Stage)',
        steps: [
            'STAGE 1 - INPUT ANALYSIS: Examine text component thoroughly',
            'STAGE 1 - VISUAL ANALYSIS: Examine visual/image component thoroughly',
            'STAGE 1 - CONTEXT: Identify how text and visual relate',
            'STAGE 1 - RATIONALE: Generate reasoning considering all modalities',
            'STAGE 2 - INFERENCE: Use rationale to structure answer',
            'STAGE 2 - INTEGRATION: Combine insights from both modalities',
            'STAGE 2 - VALIDATION: Check consistency across modalities',
            'ANSWER: Provide multimodal-informed response'
        ]
    },
    generatedKnowledge: {
        name: 'Generated Knowledge First',
        steps: [
            'IDENTIFY GAPS: What background knowledge is needed?',
            'GENERATE FACTS: List 5-7 relevant facts or principles',
            'GENERATE CONTEXT: Provide situational context',
            'GENERATE EXAMPLES: Include relevant examples',
            'INTEGRATE: Weave generated knowledge into reasoning',
            'ANSWER: Use knowledge base to construct response',
            'VALIDATE: Ensure answer aligns with generated knowledge'
        ]
    }
};

// ============================================================================
// ROLE PRESETS
// ============================================================================

export const rolePresets = {
    general: 'expert assistant',
    qa: 'knowledgeable expert',
    classification: 'classification specialist',
    creative: 'creative expert and storyteller',
    analysis: 'analytical researcher',
    coding: 'senior software engineer',
    extraction: 'data extraction specialist',
    tutoring: 'Socratic tutor',
    summarization: 'expert summarizer',
    translation: 'professional translator',
    brainstorm: 'creative strategist',
    debugging: 'expert debugger',
    research: 'research methodologist',
    multimodal: 'multimodal reasoning expert',
    planning: 'strategic planner',
    optimization: 'optimization specialist'
};
