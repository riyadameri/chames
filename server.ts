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

  // Empty all volunteer projects and posters from database
  app.post("/api/db/clear-activities-and-posts", async (_req, res) => {
    try {
      const db = await getMongoDb();
      if (!db) return res.status(503).json({ success: false, message: "MongoDB unavailable" });
      await db.collection("activities").deleteMany({});
      await db.collection("posts").deleteMany({});
      await db.collection("submissions").deleteMany({});
      await db.collection("blogs").deleteMany({});
      res.json({ success: true, message: "تم تفريغ كافة المشاريع والبوسترات والإثباتات بنجاح." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Helper to remove immutable _id before MongoDB updates
  function cleanDoc(doc: any): Record<string, any> {
    if (!doc || typeof doc !== "object") return doc;
    const { _id, ...rest } = doc;
    return rest;
  }

  // Bootstrap data from MongoDB database 'shames'
  app.get("/api/db/bootstrap", async (_req, res) => {
    try {
      const db = await getMongoDb();
      if (!db) {
        return res.status(503).json({ success: false, message: "MongoDB not connected" });
      }

      const users = await db.collection("users").find({}, { projection: { _id: 0 } }).toArray();
      const activities = await db.collection("activities").find({}, { projection: { _id: 0 } }).toArray();
      const submissions = await db.collection("submissions").find({}, { projection: { _id: 0 } }).toArray();
      const posts = await db.collection("posts").find({}, { projection: { _id: 0 } }).toArray();
      const clubs = await db.collection("clubs").find({}, { projection: { _id: 0 } }).toArray();
      const notifications = await db.collection("notifications").find({}, { projection: { _id: 0 } }).toArray();
      const blogs = await db.collection("blogs").find({}, { projection: { _id: 0 } }).toArray();

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
        const validItems = items.filter(item => item && (item.id || item._id));
        if (validItems.length > 0) {
          const col = db.collection(colName);
          const ops = validItems.map(item => {
            const itemId = item.id || item._id;
            const clean = cleanDoc(item);
            return {
              updateOne: {
                filter: { id: itemId },
                update: { $set: { ...clean, id: itemId } },
                upsert: true
              }
            };
          });
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

      const cleanUser = cleanDoc(user);
      await db.collection("users").updateOne({ id: user.id }, { $set: { ...cleanUser, id: user.id } }, { upsert: true });
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

      const cleanClub = cleanDoc(club);
      await db.collection("clubs").updateOne({ id: club.id }, { $set: { ...cleanClub, id: club.id } }, { upsert: true });
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

      const cleanActivity = cleanDoc(activity);
      await db.collection("activities").updateOne({ id: activity.id }, { $set: { ...cleanActivity, id: activity.id } }, { upsert: true });
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

      const cleanSubmission = cleanDoc(submission);
      await db.collection("submissions").updateOne({ id: submission.id }, { $set: { ...cleanSubmission, id: submission.id } }, { upsert: true });
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

      const cleanPost = cleanDoc(post);
      await db.collection("posts").updateOne({ id: post.id }, { $set: { ...cleanPost, id: post.id } }, { upsert: true });
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

