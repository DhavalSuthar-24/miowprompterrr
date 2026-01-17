import express from 'express';
import { AnalyticsService } from '../../services/analyticsService';

const router = express.Router();

// GET /analytics/session/:sessionId
router.get('/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

        const analytics = await AnalyticsService.getSessionAnalytics(sessionId);
        return res.json({ success: true, data: analytics });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;
