import { prisma } from "../db";

// Pricing constants (e.g. GPT-4o)
const PRICING = {
    INPUT_PER_1K: 0.005,
    OUTPUT_PER_1K: 0.015
};

export class AnalyticsService {
    /**
     * Estimate token count (Simple heuristic: 4 chars = 1 token)
     * For production, use 'tiktoken' or similar.
     */
    static estimateTokens(text: string): number {
        if (!text) return 0;
        return Math.ceil(text.length / 4);
    }

    /**
     * Calculate cost based on tokens and role
     */
    static calculateCost(tokens: number, role: 'user' | 'assistant' | 'system'): number {
        const rate = role === 'assistant' ? PRICING.OUTPUT_PER_1K : PRICING.INPUT_PER_1K;
        return (tokens / 1000) * rate;
    }

    /**
     * Get Session Analytics
     */
    static async getSessionAnalytics(sessionId: string) {
        const messages = await prisma.agentMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' }
        });

        let totalTokens = 0;
        let totalCost = 0;
        let totalLatency = 0;
        let interactionCount = 0;

        const timeline = messages.map(msg => {
            const tokens = msg.tokenUsage || this.estimateTokens(msg.content);
            const cost = this.calculateCost(tokens, msg.role as any);
            
            totalTokens += tokens;
            totalCost += cost;
            if (msg.latencyMs) {
                totalLatency += msg.latencyMs;
                interactionCount++;
            }

            return {
                id: msg.id,
                role: msg.role,
                tokens,
                cost,
                latency: msg.latencyMs || 0,
                createdAt: msg.createdAt
            };
        });

        return {
            summary: {
                totalTokens,
                totalCost: Number(totalCost.toFixed(4)),
                avgLatencyMs: interactionCount > 0 ? Math.round(totalLatency / interactionCount) : 0,
                messageCount: messages.length
            },
            timeline
        };
    }
}
