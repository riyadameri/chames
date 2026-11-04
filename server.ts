import 'dotenv/config';
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { 
  getMongoDb, 
  getMongoStatus, 
  getCurrentMongoConfig, 
  setMongoConfig, 
  testMongoConnection 
} from "./server/mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Ports configuration: listen on PORT (or 3000 for preview) AND port 4040 for external reverse proxy
  const PRIMARY_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const SECONDARY_PORT = 4040;

  // Reverse proxy support (for rudeox.cloud, Nginx, Cloudflare)
  app.set("trust proxy", true);

  // Generous limit for high-resolution images
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Ensure uploads directory exists and is served statically
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));

  // Domain & CORS Handling (allowing https://rudeox.cloud and previews)
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowed = [
      'https://rudeox.cloud',
      'http://rudeox.cloud',
      'https://www.rudeox.cloud',
      'http://www.rudeox.cloud'
    ];

    if (origin) {
      if (
        allowed.includes(origin) || 
        origin.endsWith('.rudeox.cloud') || 
        origin.includes('run.app') || 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1')
      ) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      } else {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ================= FILE UPLOAD SYSTEM (REAL FILES FOR PRODUCTIVE APP) =================
  app.post("/api/upload", (req, res) => {
    try {
      const { image, category = "img", fileName = "upload.jpg" } = req.body;
      if (!image) {
        return res.status(400).json({ success: false, error: "Image data required" });
      }

      // Check if dataUrl format
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      let ext = "jpg";

      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        if (mimeType.includes("png")) ext = "png";
        else if (mimeType.includes("webp")) ext = "webp";
        else if (mimeType.includes("gif")) ext = "gif";
        buffer = Buffer.from(matches[2], "base64");
      } else {
        // Assume already raw base64
        buffer = Buffer.from(image, "base64");
      }

      const safeCategory = String(category).replace(/[^a-z0-9_-]/gi, "");
      const generatedName = `${safeCategory}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const filePath = path.join(uploadsDir, generatedName);

      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${generatedName}`;
      res.json({
        success: true,
        url: publicUrl,
        size: buffer.length,
        fileName: generatedName,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("[Upload Error]", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ================= DATABASE CONFIGURATION APIS =================
  // Get current DB configuration
  app.get("/api/db/config", async (_req, res) => {
    const config = getCurrentMongoConfig();
    const status = await getMongoStatus();
    res.json({
      success: true,
      config,
      status
    });
  });

  // Test custom DB connection
  app.post("/api/db/test-config", async (req, res) => {
    try {
      const { uri, database } = req.body;
      if (!uri) return res.status(400).json({ success: false, error: "MongoDB URI is required" });
      const result = await testMongoConnection(uri, database || "shames");
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Update DB configuration live
  app.post("/api/db/config", async (req, res) => {
    try {
      const { uri, database } = req.body;
      if (!uri) return res.status(400).json({ success: false, error: "MongoDB URI is required" });
      const result = await setMongoConfig(uri, database || "shames");
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Health Endpoint
  app.get("/api/health", async (_req, res) => {
    const mongo = await getMongoStatus();
    res.json({
      status: "ok",
      platform: "منصة شمس التطوع - وزارة الشباب والرياضة",
      domain: "rudeox.cloud",
      version: "1.0.0",
      productionReady: true,
      ports: [PRIMARY_PORT, SECONDARY_PORT],
      database: {
        engine: "MongoDB",
        dbName: mongo.database,
        connected: mongo.connected,
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

  // Bootstrap data from MongoDB
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

  // Batch Sync data directly to MongoDB
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
      res.json({ success: true, id: user.id });
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
      res.json({ success: true, deletedId: id });
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
      res.json({ success: true, id: club.id });
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
      res.json({ success: true, deletedId: id });
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
      res.json({ success: true, id: activity.id });
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
      res.json({ success: true, id: submission.id });
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
      res.json({ success: true, id: post.id });
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
      res.json({ success: true, deletedId: id });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/stats", (_req, res) => {
    res.json({
      success: true,
      serverTime: new Date().toISOString(),
      domain: "https://rudeox.cloud/",
      ports: [PRIMARY_PORT, SECONDARY_PORT],
      modules: {
        activities: "نشاطات ومبادرات ولائية ووطنية",
        pointsEngine: "نظام احتساب وتدقيق النقاط الميدانية",
        feed: "الموجز المجتمعي والمنشورات التفاعلية",
        notifications: "نظام الإشعارات والتنبيهات الحية",
        profiles: "الملفات الشخصية والأغلفة وتوثيق الهوية",
        database: "MongoDB Atlas Direct Connection"
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

  // Primary listener (default 3000 for preview / process.env.PORT)
  const server = app.listen(PRIMARY_PORT, "0.0.0.0", () => {
    console.log(`Shams Volunteering Platform backend running on port ${PRIMARY_PORT}`);
  });

  // Dual listener for Port 4040 if not already primary
  if (PRIMARY_PORT !== SECONDARY_PORT) {
    try {
      const server4040 = app.listen(SECONDARY_PORT, "0.0.0.0", () => {
        console.log(`Shams Platform also actively listening on Port ${SECONDARY_PORT} (Domain: https://rudeox.cloud/)`);
      });
      server4040.on('error', (err: any) => {
        console.warn(`[Port ${SECONDARY_PORT} Listener Notice]:`, err.message);
      });
    } catch (e: any) {
      console.warn(`Could not bind to port ${SECONDARY_PORT}:`, e.message);
    }
  }
}

startServer();
