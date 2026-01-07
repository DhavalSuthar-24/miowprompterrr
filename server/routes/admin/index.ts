import { Router } from "express";

import statsRoutes from "./stats";
import contentRoutes from "./content";
import moreRoutes from "./more";
import moderationRoutes from "./moderation";

const router = Router();

// Dashboard & User Management
// GET /api/admin/stats, /stats/users, /stats/prompts
// GET/PUT /api/admin/users, /users/:id, /users/:id/role
router.use("/", statsRoutes);

// Content Management - Personalities, Presets, Tiers, Techniques
// /api/admin/content/personalities (CRUD)
// /api/admin/content/presets (CRUD)
// /api/admin/content/tiers (CRUD)
// /api/admin/content/techniques (CRUD)
router.use("/content", contentRoutes);

// Content Management - Task Types, Templates, Options
// /api/admin/more/task-types (CRUD)
// /api/admin/more/templates/reasoning (CRUD)
// /api/admin/more/templates/quick (CRUD)
// /api/admin/more/options (CRUD)
router.use("/more", moreRoutes);

// Moderation - Prompts, Comments, Tags
// /api/admin/moderation/prompts (list, status, featured)
// /api/admin/moderation/comments (list, delete)
// /api/admin/moderation/tags (list, update, delete, merge)
router.use("/moderation", moderationRoutes);

export default router;
