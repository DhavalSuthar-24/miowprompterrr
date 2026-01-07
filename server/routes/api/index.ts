import { Router } from "express";

// Configuration APIs (Phase 6)
import personalitiesRoutes from "./personalities";
import presetsRoutes from "./presets";
import tiersRoutes from "./tiers";
import taskTypesRoutes from "./taskTypes";
import templatesRoutes from "./templates";
import optionsRoutes from "./options";
import configRoutes from "./config";

// Community APIs (Phase 7)
import tagsRoutes from "./tags";
import promptsRoutes from "./prompts";
import votesRoutes from "./votes";
import commentsRoutes from "./comments";
import usersRoutes from "./users";

const router = Router();

// ============================================================================
// PHASE 6: CONFIGURATION ENDPOINTS
// ============================================================================
router.use("/personalities", personalitiesRoutes);
router.use("/presets", presetsRoutes);
router.use("/tiers", tiersRoutes);
router.use("/task-types", taskTypesRoutes);
router.use("/templates", templatesRoutes);
router.use("/options", optionsRoutes);
router.use("/config", configRoutes);

// ============================================================================
// PHASE 7: COMMUNITY ENDPOINTS
// ============================================================================
router.use("/tags", tagsRoutes);
router.use("/prompts", promptsRoutes);
router.use("/comments", commentsRoutes);
router.use("/users", usersRoutes);

// Feed endpoint (from users.ts)
router.use("/feed", usersRoutes);

// Vote endpoints (nested under prompts and comments)
router.use("/", votesRoutes);

export default router;
