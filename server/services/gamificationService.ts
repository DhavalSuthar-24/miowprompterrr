import { prisma } from "../db";

export class GamificationService {
    /**
     * Get User Stats, creating if not exists
     */
    static async getUserStats(userId: string) {
        if (!userId) throw new Error("userId required");
        let stats = await prisma.userStats.findUnique({ where: { userId } });
        if (!stats) {
            stats = await prisma.userStats.create({ data: { userId } });
        }
        return stats;
    }

    /**
     * Add Experience/Reputation and handle Badge Checks
     */
    static async awardExperience(userId: string, amount: number, actionType: 'PROMPT' | 'FORK' | 'COMMENT') {
        const stats = await this.getUserStats(userId);
        
        const updateData: any = {
            reputation: { increment: amount },
            lastActiveAt: new Date()
        };

        if (actionType === 'PROMPT') updateData.promptCount = { increment: 1 };
        // if (actionType === 'COMMENT') updateData.commentCount = { increment: 1 };

        const updated = await prisma.userStats.update({
            where: { id: stats.id },
            data: updateData
        });
        
        await this.checkBadges(userId, updated);
        return updated;
    }

    private static async checkBadges(userId: string, stats: any) {
        const badgesToAward: string[] = [];
        
        // --- Badge Criteria ---
        // 1. "Novice Architect" - First Prompt
        if (stats.promptCount >= 1) badgesToAward.push("novice-architect");
        
        // 2. "Master Planner" - 10 Prompts
        if (stats.promptCount >= 10) badgesToAward.push("master-planner");
        
        // 3. "Community Pillar" - 100 Reputation
        if (stats.reputation >= 100) badgesToAward.push("community-pillar");

        for (const slug of badgesToAward) {
             // 1. Ensure Badge Exists (Idempotent seed)
             let badge = await prisma.badge.findUnique({ where: { slug } });
             if (!badge) {
                 // Auto-create badge definition if missing (Lazy Seeding)
                 badge = await prisma.badge.create({
                     data: {
                         slug,
                         name: slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
                         description: `Awarded for matching ${slug} criteria`,
                         icon: "🏆",
                         criteria: {}
                     }
                 });
             }

             // 2. Check overlap
             const existing = await prisma.userBadge.findUnique({
                 where: { userId_badgeId: { userId, badgeId: badge.id } }
             });

             if (!existing) {
                 await prisma.userBadge.create({
                     data: { userId, badgeId: badge.id }
                 });
             }
        }
    }
    
    static async getBadges(userId: string) {
        return prisma.userBadge.findMany({
             where: { userId },
             include: { badge: true }
        });
    }
}
