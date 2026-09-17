import 'dotenv/config';
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { getMongoDb, getMongoStatus } from "./server/mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // API Routes
  app.get("/api/health", async (_req, res) => {
    const mongo = await getMongoStatus();
    res.json({
      status: "ok",
      platform: "منصة شمس التطوع - وزارة الشباب والرياضة",
      version: "1.0.0",
      productionReady: true,
      database: {
        engine: "MongoDB",
        dbName: mongo.database,
        connected: mongo.connected,
        replicaSet: mongo.replicaSet,
        pingMs: mongo.pingMs
      },
      timestamp: new Date().toISOString()
    });
  });

  // MongoDB Status Endpoint
  app.get("/api/db/status", async (_req, res) => {
    const status = await getMongoStatus();
    res.json(status);
  });

  // Bootstrap data from MongoDB database 'shames'
  app.get("/api/db/bootstrap", async (_req, res) => {
    try {
      const db = await getMongoDb();
      if (!db) {
        return res.status(503).json({ success: false, message: "MongoDB not connected" });
      }

      const users = await db.collection("users").find({}).toArray();
      const activities = await db.collection("activities").find({}).toArray();
      const submissions = await db.collection("submissions").find({}).toArray();
      const posts = await db.collection("posts").find({}).toArray();
      const clubs = await db.collection("clubs").find({}).toArray();
      const notifications = await db.collection("notifications").find({}).toArray();
      const blogs = await db.collection("blogs").find({}).toArray();

      res.json({
        success: true,
        database: "shames",
        data: {
          users,
          activities,
          submissions,
          posts,
          clubs,
          notifications,
          blogs
        }
      });
    } catch (err: any) {
      console.error("[MongoDB Bootstrap Error]", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Batch Sync data directly to MongoDB database 'shames'
  app.post("/api/db/sync-batch", async (req, res) => {
    try {
      const db = await getMongoDb();
      if (!db) {
        return res.status(503).json({ success: false, message: "MongoDB not connected" });
      }

      const { users, activities, submissions, posts, clubs, notifications, blogs } = req.body;
      const collectionsMap: Record<string, any[]> = {
        users: Array.isArray(users) ? users : [],
        activities: Array.isArray(activities) ? activities : [],
        submissions: Array.isArray(submissions) ? submissions : [],
        posts: Array.isArray(posts) ? posts : [],
        clubs: Array.isArray(clubs) ? clubs : [],
        notifications: Array.isArray(notifications) ? notifications : [],
        blogs: Array.isArray(blogs) ? blogs : []
      };

      const syncSummary: Record<string, number> = {};

      for (const [colName, items] of Object.entries(collectionsMap)) {
        if (items.length > 0) {
          const col = db.collection(colName);
          const ops = items.map(item => ({
            updateOne: {
              filter: { id: item.id },
              update: { $set: item },
              upsert: true
            }
          }));
          const result = await col.bulkWrite(ops, { ordered: false });
          syncSummary[colName] = (result.upsertedCount || 0) + (result.modifiedCount || 0) + (result.matchedCount || 0);
        }
      }

      res.json({
        success: true,
        database: "shames",
        syncSummary,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("[MongoDB Sync Error]", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Direct User upsert / delete
  app.post("/api/db/users", async (req, res) => {
    try {
      const db = await getMongoDb();
      if (!db) return res.status(503).json({ success: false, error: "MongoDB unavailable" });
      const user = req.body;
      if (!user || !user.id) return res.status(400).json({ success: false, error: "Missing user id" });

      await db.collection("users").updateOne({ id: user.id }, { $set: user }, { upsert: true });
      res.json({ success: true, database: "shames", id: user.id });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete("/api/db/users/:id", async (req, res) => {
    try {
      const db = await getMongoDb();
      if (!db) return res.status(503).json({ success: false, error: "MongoDB unavailable" });
      const { id } = req.params;
      await db.collection("users").deleteOne({ id });
      res.json({ success: true, database: "shames", deletedId: id });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Direct Club upsert / delete
  app.post("/api/db/clubs", async (req, res) => {
    try {
      const db = await getMongoDb();
      if (!db) return res.status(503).json({ success: false, error: "MongoDB unavailable" });
      const club = req.body;
      if (!club || !club.id) return res.status(400).json({ success: false, error: "Missing club id" });

      await db.collection("clubs").updateOne({ id: club.id }, { $set: club }, { upsert: true });
      res.json({ success: true, database: "shames", id: club.id });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete("/api/db/clubs/:id", async (req, res) => {
    try {
      const db = await getMongoDb();
      if (!db) return res.status(503).json({ success: false, error: "MongoDB unavailable" });
      const { id } = req.params;
      await db.collection("clubs").deleteOne({ id });
      res.json({ success: true, database: "shames", deletedId: id });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Direct Activity upsert
  app.post("/api/db/activities", async (req, res) => {
    try {
      const db = await getMongoDb();
      if (!db) return res.status(503).json({ success: false, error: "MongoDB unavailable" });
      const activity = req.body;
      if (!activity || !activity.id) return res.status(400).json({ success: false, error: "Missing activity id" });

      await db.collection("activities").updateOne({ id: activity.id }, { $set: activity }, { upsert: true });
      res.json({ success: true, database: "shames", id: activity.id });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Direct Submission upsert
  app.post("/api/db/submissions", async (req, res) => {
    try {
      const db = await getMongoDb();
      if (!db) return res.status(503).json({ success: false, error: "MongoDB unavailable" });
      const submission = req.body;
      if (!submission || !submission.id) return res.status(400).json({ success: false, error: "Missing submission id" });

      await db.collection("submissions").updateOne({ id: submission.id }, { $set: submission }, { upsert: true });
      res.json({ success: true, database: "shames", id: submission.id });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Direct Post upsert / delete
  app.post("/api/db/posts", async (req, res) => {
    try {
      const db = await getMongoDb();
      if (!db) return res.status(503).json({ success: false, error: "MongoDB unavailable" });
      const post = req.body;
      if (!post || !post.id) return res.status(400).json({ success: false, error: "Missing post id" });

      await db.collection("posts").updateOne({ id: post.id }, { $set: post }, { upsert: true });
      res.json({ success: true, database: "shames", id: post.id });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete("/api/db/posts/:id", async (req, res) => {
    try {
      const db = await getMongoDb();
      if (!db) return res.status(503).json({ success: false, error: "MongoDB unavailable" });
      const { id } = req.params;
      await db.collection("posts").deleteOne({ id });
      res.json({ success: true, database: "shames", deletedId: id });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/stats", (_req, res) => {
    res.json({
      success: true,
      serverTime: new Date().toISOString(),
      modules: {
        activities: "نشاطات ومبادرات ولائية ووطنية",
        pointsEngine: "نظام احتساب وتدقيق النقاط الميدانية",
        feed: "الموجز المجتمعي والمنشورات التفاعلية",
        notifications: "نظام الإشعارات والتنبيهات الحية",
        profiles: "الملفات الشخصية والأغلفة وتوثيق الهوية",
        database: "MongoDB Atlas Direct Connection (shames)"
      }
    });
  });

  // Vite middleware for development vs Static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Shams Volunteering Platform backend running on port ${PORT}`);
  });
}

startServer();

