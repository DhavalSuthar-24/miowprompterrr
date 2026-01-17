import express from 'express';
import { GamificationService } from '../../services/gamificationService';

const router = express.Router();

// GET /gamification/stats?userId=...
router.get('/stats', async (req, res) => {
    try {
        const userId = req.query.userId as string;
        if (!userId) return res.status(400).json({ error: "userId required" });

        const stats = await GamificationService.getUserStats(userId);
        const badges = await GamificationService.getBadges(userId);

        return res.json({ success: true, data: { stats, badges } });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;
