import express from 'express';
import rateLimit from 'express-rate-limit';
import { ArchitectOrchestrator } from '../../services/architect/ArchitectOrchestrator';
import { prisma } from '../../db';
import { GamificationService } from '../../services/gamificationService';
import { ProjectService } from '../../services/architect/ProjectService';
import { ChatOpenAI } from "@langchain/openai";
import { authenticate } from '../../middleware/auth';

const router = express.Router();

// Rate Limiters
const chatLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Limit each IP to 50 requests per windowMs
    message: "Too many AI requests from this IP, please try again after an hour"
});

/**
 * POST /architect/session
 * Create a new Architect Session
 */
router.post('/session', authenticate, async (req, res) => {
    try {
        const { title, projectDescription, personality } = req.body;
        // User is guaranteed by authenticate middleware
        const userId = req.user?.userId;
        
        const session = await prisma.agentSession.create({
            data: {
                userId: userId || null, // Should strictly be userId now
                title: title || "New Project",
                projectDescription: projectDescription || "",
                personality: personality || "startup-cto", // Default
                status: "ACTIVE",
                currentPhase: "RESEARCH_VALIDATE",
                messages: {
                    create: {
                        role: "system",
                        content: "Session initialized. Architect Mode active."
                    }
                }
            }
        });
        
        return res.json({ success: true, session });
    } catch (error: any) {
        console.error("[Architect API] Create Session Error:", error);
        return res.status(500).json({ error: error.message });
    }
});

/**
 * POST /architect/chat
 * Send a message to the Architect Agent
 */
router.post('/chat', authenticate, chatLimiter, async (req, res) => {
    try {
        const { sessionId, message } = req.body;
        const apiKey = req.headers['x-api-key'] as string || process.env.OPENAI_API_KEY || "";

        if (!sessionId || !message) {
            return res.status(400).json({ error: "Missing sessionId or message" });
        }
        
        if (!apiKey) {
             return res.status(400).json({ error: "Missing API Key" });
        }

        // 1. Load Session
        const session = await prisma.agentSession.findUnique({
            where: { id: sessionId },
            include: { messages: { orderBy: { createdAt: 'asc' } } } // Ordered for context
        });

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        // 2. Initialize Orchestrator with State
        // Map DB session to AgentState properties
        const orchestrator = new ArchitectOrchestrator(apiKey, {
            sessionId: session.id,
            currentPhase: session.currentPhase as any, // Cast to AgentPhase
            projectDescription: session.projectDescription || "",
            techStack: (session.techStack as string[]) || [],
            requirements: (session.requirements as string[]) || [],
            artifacts: (session.artifacts as any) || {},
            personality: session.personality || "startup-cto",
            // Hydrate memory from DB messages for context window management
            memory: session.messages.map(m => ({
                role: m.role as any,
                content: m.content,
                timestamp: m.createdAt.getTime(),
                metadata: m.metadata
            }))
        });

        // 3. Process Prompt
        const response = await orchestrator.processPrompt(message);

        // 4. Save User Message & AI Response to DB
        // (This part is fine, but we need to update session state too)
        
        // Save User Message
        await prisma.agentMessage.create({
            data: {
                sessionId,
                role: "user",
                content: message,
            }
        });

        if (response.success) {
            // Save Assistant Message
            await prisma.agentMessage.create({
                data: {
                    sessionId,
                    role: "assistant",
                    content: response.message, 
                    metadata: response.data || {},
                    // Phase 11: Analytics
                    tokenUsage: response.analytics?.tokenUsage,
                    latencyMs: response.analytics?.latencyMs
                }
            });
            
            // 5. CRITICAL: Persist Updated State (Artifacts, Stack, Phase)
            const finalState = orchestrator.getState();

            await prisma.agentSession.update({
                where: { id: sessionId },
                data: { 
                    currentPhase: response.nextPhase || session.currentPhase,
                    techStack: finalState.techStack as any, // Cast for Prisma JSON
                    requirements: finalState.requirements as any,
                    artifacts: finalState.artifacts as any,
                    // Note: We don't overwrite 'messages' here as they are relational,
                    // but we do update the 'head' state fields.
                }
             });
        }

        return res.json(response);

    } catch (error: any) {
        console.error("[Architect API] Chat Error:", error);
        return res.status(500).json({ error: error.message });
    }
});

/**
 * POST /architect/publish
 * Toggle public visibility and update tags
 */
router.post('/publish', authenticate, async (req, res) => {
    try {
        const { sessionId, isPublic, tags } = req.body;
        
        if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

        // Gamification Hook: Check if first time publishing
        if (isPublic) {
            const existing = await prisma.agentSession.findUnique({ where: { id: sessionId } });
            if (existing && !existing.isPublic && existing.userId) {
                await GamificationService.awardExperience(existing.userId, 20, 'PROMPT'); // 20 XP for publishing
            }
        }

        const session = await prisma.agentSession.update({
            where: { id: sessionId },
            data: { 
                isPublic: !!isPublic,
                tags: tags || []
            }
        });

        return res.json({ success: true, session });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * GET /architect/community
 * Browse public prompt architectures
 */
router.get('/community', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = 20;
        const tag = req.query.tag as string;

        const where: any = { isPublic: true };
        if (tag) {
            where.tags = { has: tag };
        }

        const sessions = await prisma.agentSession.findMany({
            where,
            orderBy: { forkCount: 'desc' }, // Popular first
            take: limit,
            skip: (page - 1) * limit,
            select: {
                id: true,
                title: true,
                projectDescription: true,
                tags: true,
                currentPhase: true,
                forkCount: true,
                updatedAt: true,
                artifacts: true, // Needed to show preview of "System Prompt"
                parentSessionId: true
            }
        });

        return res.json({ success: true, sessions });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * POST /architect/fork
 * Fork a public session into a new private workspace
 */
router.post('/fork', authenticate, async (req, res) => {
    try {
        const { sessionId, userId } = req.body; // sessionId = session to fork
        
        // 1. Get Original
        const original = await prisma.agentSession.findUnique({
             where: { id: sessionId },
             include: { messages: { where: { role: 'system' } } } // Get initial system prompt if any
        });

        if (!original) return res.status(404).json({ error: "Original session not found" });

        // 2. Increment Fork Count
        await prisma.agentSession.update({
            where: { id: sessionId },
            data: { forkCount: { increment: 1 } }
        });

        // 3. Create Clone
        const clone = await prisma.agentSession.create({
            data: {
                userId: userId || null,
                title: `${original.title} (Fork)`,
                projectDescription: original.projectDescription,
                status: "ACTIVE",
                currentPhase: original.currentPhase,
                techStack: original.techStack || undefined,
                requirements: original.requirements || undefined,
                artifacts: original.artifacts || undefined,
                phases: original.phases || undefined,
                isPublic: false, // Private by default
                parentSessionId: sessionId,
                messages: {
                    create: {
                        role: "system",
                        content: `Forked from session "${original.title}". All context and prompts have been cloned.`
                    }
                }
            }
        });

        // Gamification Hook: Award XP for forking
        if (userId) {
             await GamificationService.awardExperience(userId, 5, 'FORK');
        }

        return res.json({ success: true, session: clone });

    } catch (error: any) {
        console.error("[Architect API] Fork Error:", error);
        return res.status(500).json({ error: error.message });
    }
});

/**
 * GET /architect/files/:sessionId
 * Get the virtual file tree for a session
 */
router.get('/files/:sessionId', authenticate, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await prisma.agentSession.findUnique({ where: { id: sessionId } });
        
        if (!session) return res.status(404).json({ error: "Session not found" });

        const fileTree = ProjectService.generateFileTree(session);
        return res.json({ success: true, tree: fileTree });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * GET /architect/export/:sessionId
 * Download the project as a ZIP file
 */
router.get('/export/:sessionId', authenticate, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await prisma.agentSession.findUnique({ where: { id: sessionId } });

        if (!session) return res.status(404).json({ error: "Session not found" });

        const zipBuffer = ProjectService.generateZip(session);
        
        const safeTitle = session.title || "project";
        const fileName = `${safeTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.zip`;

        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', `attachment; filename=${fileName}`);
        res.set('Content-Length', zipBuffer.length.toString());
        
        return res.send(zipBuffer);
    } catch (error: any) {
        console.error("Export Error:", error);
        return res.status(500).json({ error: error.message });
    }
});

/**
 * POST /architect/playground
 * Simulate the generated agent with a specific system prompt
 */
router.post('/playground', authenticate, chatLimiter, async (req, res) => {
    try {
        const { systemPrompt, messages } = req.body;
        const apiKey = req.headers['x-api-key'] as string || process.env.OPENAI_API_KEY || "";

        if (!systemPrompt || !messages) {
            return res.status(400).json({ error: "Missing systemPrompt or messages" });
        }

        if (!apiKey) {
             return res.status(400).json({ error: "Missing API Key" });
        }

        const chat = new ChatOpenAI({
            openAIApiKey: apiKey,
            modelName: "gpt-4o",
            temperature: 0.7
        });

        // Construct LangChain messages
        const langchainMessages = [
            ["system", systemPrompt],
            ...messages.map((m: any) => [m.role === 'user' ? 'human' : 'ai', m.content])
        ];
        
        const response = await chat.invoke(langchainMessages);

        return res.json({ 
            success: true, 
            message: response.content,
            // Return usage if available in response metadata
            usage: response.response_metadata?.tokenUsage 
        });

    } catch (error: any) {
        console.error("[Playground] Simulation Error:", error);
        return res.status(500).json({ error: error.message });
    }
});

export default router;
