import { Router } from "express";
import { agentService } from "../../services/agentService";
import { z } from "zod";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.post("/run", authenticate, async (req, res) => {
  try {
    const { prompt, apiKey, model } = z.object({
        prompt: z.string().min(1),
        apiKey: z.string().min(1, "API Key is required for the autonomous agent"),
        model: z.string().optional()
    }).parse(req.body);

    // userId is guaranteed by authenticate middleware
    const userId = req.user!.userId;

    const result = await agentService.runAutonomousAgent(prompt, apiKey, userId, model);
    
    return res.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
        return res.status(400).json({ error: (error as z.ZodError).errors });
    }
    console.error("Agent Route Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

export default router;
