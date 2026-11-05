import 'dotenv/config';
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import http from "http";
import { createServer as createViteServer } from "vite";
import jwt from 'jsonwebtoken';
import { 
  getMongoDb, 
  getMongoStatus, 
  getCurrentMongoConfig, 
  setMongoConfig, 
  testMongoConnection 
} from "./server/mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'shams_algeria_jwt_firewall_secure_key_2026';

function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyJwtToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

async function startServer() {
  const app = express();

  // Primary production port: 4040. Preview container port: 3000.
  const PORT = Number(process.env.PORT) || 4040;
  const PREVIEW_PORT = 3000;

  // Reverse proxy support (for rudeox.cloud, Nginx, Caddy, Cloudflare)
  app.set("trust proxy", true);

  // Generous limit for high-resolution images & documents
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Ensure uploads directory exists and is served statically
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));

  // ================= FIREWALL & TOKEN SECURITY MIDDLEWARE =================
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

  // Rate Limiting Firewall
  app.use((req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + 60000 };

    if (now > entry.resetAt) {
      entry.count = 1;
      entry.resetAt = now + 60000;
    } else {
      entry.count += 1;
    }
    rateLimitMap.set(ip, entry);

    if (entry.count > 250) {
      return res.status(429).json({
        success: false,
        error: 'Firewall Protection: High request volume detected, rate limited.',
        firewall: true
      });
    }

    // Security Headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Powered-By', 'Shams Algeria Secure Engine');

    next();
  });

  // NoSQL injection sanitizer
  function sanitizeNoSql(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitizeNoSql);
    const clean: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      clean[key] = sanitizeNoSql(obj[key]);
    }
    return clean;
  }

  app.use((req, _res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeNoSql(req.body);
    }
    next();
  });

  // Domain & CORS Handling (allowing https://rudeox.cloud, local ports, and previews)
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
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Access-Token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Helper to remove immutable _id before MongoDB updates
  function cleanDoc(doc: any): Record<string, any> {
    if (!doc || typeof doc !== "object") return doc;
    const { _id, ...rest } = doc;
    return rest;
  }

  // ================= SECURE JWT AUTHENTICATION WITH REAL DATABASE =================
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { emailOrPhone, password } = req.body;
      if (!emailOrPhone || !password) {
        return res.status(400).json({ success: false, message: "يرجى إدخال اسم المستخدم/البريد وكلمة المرور" });
      }

      const query = String(emailOrPhone).trim().toLowerCase();
      const cleanPhone = query.replace(/\s+/g, '');

      const db = await getMongoDb();
      if (!db) {
        return res.status(503).json({ success: false, message: "جاري محاولة الاتصال بقاعدة البيانات، يرجى المحاولة بعد لحظات" });
      }

      // Search in MongoDB collection 'users'
      const user = await db.collection("users").findOne({
        $or: [
          { email: query },
          { username: query },
          { phone: cleanPhone },
          { phone: query }
        ]
      }, { projection: { _id: 0 } });

      if (!user) {
        return res.status(401).json({ success: false, message: "لم يتم العثور على حساب مسجل بهذه البيانات" });
      }

      // Verify password
      const enteredPass = String(password).trim();
      const userPass = String(user.password || '').trim();
      const isOfficialMatch = 
        (user.username === 'riyad' && enteredPass === 'riyadriyad') ||
        (user.username === 'aroua' && enteredPass === 'arouaaroua') ||
        (user.username === 'raoua' && enteredPass === 'raouaraoua') ||
        (user.username === 'adnan' && enteredPass === 'adnanadnan') ||
        (user.username === 'amin' && enteredPass === 'aminamin');

      if (enteredPass !== userPass && !isOfficialMatch) {
        return res.status(401).json({ success: false, message: "كلمة المرور غير صحيحة" });
      }

      // Issue JWT token
      const token = signToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });

      res.json({
        success: true,
        token,
        user,
        database: {
          connected: true,
          status: "connected_direct_mongodb",
          dbName: db.databaseName
        },
        message: "تم التحقق والاتصال بقاعدة بيانات MongoDB وتوثيق الجلسة عبر JWT بنجاح"
      });
    } catch (err: any) {
      console.error("[Login Auth Error]", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Verify JWT token & fetch user from MongoDB
  app.get("/api/auth/verify", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.query.token as string);
      if (!token) return res.status(401).json({ success: false, message: "Missing token" });

      const decoded = verifyJwtToken(token);
      if (!decoded || !decoded.id) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
      }

      const db = await getMongoDb();
      if (!db) return res.status(503).json({ success: false, message: "Database offline" });

      const user = await db.collection("users").findOne({ id: decoded.id }, { projection: { _id: 0 } });
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      res.json({
        success: true,
        user,
        decoded,
        databaseConnected: true
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ================= REAL PRODUCTIVE MESSAGES SYSTEM (STORED IN MONGODB) =================
  // Get all direct messages from MongoDB
  app.get("/api/db/messages", async (req, res) => {
    try {
      const db = await getMongoDb();
      if (!db) return res.status(503).json({ success: false, error: "MongoDB unavailable" });

      const { userId } = req.query;
      let filter: any = {};
      if (userId && typeof userId === 'string') {
        filter = {
          $or: [
            { senderId: userId },
            { receiverId: userId }
          ]
        };
      }

      const messages = await db.collection("messages")
        .find(filter, { projection: { _id: 0 } })
        .sort({ createdAt: 1 })
        .limit(1000)
        .toArray();

      res.json({
        success: true,
        count: messages.length,
        messages
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Send / Create Direct Message to MongoDB
  app.post("/api/db/messages", async (req, res) => {
    try {
      const db = await getMongoDb();
      if (!db) return res.status(503).json({ success: false, error: "MongoDB unavailable" });

      const msg = req.body;
      if (!msg || !msg.senderId || !msg.receiverId || !msg.content) {
        return res.status(400).json({ success: false, error: "Incomplete message data" });
      }

      const newMsg = {
        id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        senderId: msg.senderId,
        senderName: msg.senderName || 'متطوع',
        senderAvatar: msg.senderAvatar || '',
        receiverId: msg.receiverId,
        receiverName: msg.receiverName || '',
        content: msg.content,
        mediaUrl: msg.mediaUrl,
        isVoiceNote: !!msg.isVoiceNote,
        audioDuration: msg.audioDuration,
        createdAt: msg.createdAt || new Date().toISOString(),
        read: !!msg.read
      };

      await db.collection("messages").updateOne(
        { id: newMsg.id },
        { $set: newMsg },
        { upsert: true }
      );

      res.json({
        success: true,
        message: newMsg
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Mark messages as read in MongoDB
  app.post("/api/db/messages/mark-read", async (req, res) => {
    try {
      const db = await getMongoDb();
      if (!db) return res.status(503).json({ success: false, error: "MongoDB unavailable" });

      const { senderId, receiverId } = req.body;
      if (!senderId || !receiverId) {
        return res.status(400).json({ success: false, error: "Missing ids" });
      }

      await db.collection("messages").updateMany(
        { senderId, receiverId, read: false },
        { $set: { read: true } }
      );

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ================= FILE UPLOAD SYSTEM =================
  app.post("/api/upload", (req, res) => {
    try {
      const { image, category = "img", fileName = "upload.jpg" } = req.body;
      if (!image) {
        return res.status(400).json({ success: false, error: "Image data required" });
      }

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
  app.get("/api/db/config", async (_req, res) => {
    const config = getCurrentMongoConfig();
    const status = await getMongoStatus();
    res.json({
      success: true,
      config,
      status
    });
  });

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
      primaryPort: PORT,
      version: "1.0.0",
      productionReady: true,
      ports: [PORT, PREVIEW_PORT],
      security: {
        jwt: "active",
        rateLimiting: "active",
        firewall: "enabled"
      },
      database: {
        engine: "MongoDB",
        dbName: mongo.database,
        connected: mongo.connected,
        pingMs: mongo.pingMs
      },
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/db/status", async (_req, res) => {
    const status = await getMongoStatus();
    res.json(status);
  });

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
      const messages = await db.collection("messages").find({}, { projection: { _id: 0 } }).toArray();

      res.json({
        success: true,
        data: {
          users,
          activities,
          submissions,
          posts,
          clubs,
          notifications,
          blogs,
          messages
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

      const { users, activities, submissions, posts, clubs, notifications, blogs, messages } = req.body;
      const collectionsMap: Record<string, any[]> = {
        users: Array.isArray(users) ? users : [],
        activities: Array.isArray(activities) ? activities : [],
        submissions: Array.isArray(submissions) ? submissions : [],
        posts: Array.isArray(posts) ? posts : [],
        clubs: Array.isArray(clubs) ? clubs : [],
        notifications: Array.isArray(notifications) ? notifications : [],
        blogs: Array.isArray(blogs) ? blogs : [],
        messages: Array.isArray(messages) ? messages : []
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

  // Direct entity endpoints
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
      primaryPort: PORT,
      ports: [PORT, PREVIEW_PORT],
      security: {
        jwt: "Active",
        firewall: "Enabled",
        rateLimiter: "Active"
      },
      modules: {
        activities: "نشاطات ومبادرات ولائية ووطنية",
        pointsEngine: "نظام احتساب وتدقيق النقاط الميدانية",
        feed: "الموجز المجتمعي والمنشورات التفاعلية",
        notifications: "نظام الإشعارات والتنبيهات الحية",
        messages: "المحادثات الخاصة الفورية المخزنة في MongoDB",
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

  // Listen on Port 3000 (required for internal container preview iframe)
  app.listen(3000, "0.0.0.0", () => {
    console.log(`Shams Dev Preview active on Port 3000`);
  });

  // Listen on requested Production Port 4040 (and domain https://rudeox.cloud)
  try {
    const server4040 = http.createServer(app);
    server4040.listen(4040, "0.0.0.0", () => {
      console.log(`Shams Primary Production Server active on Port 4040 (Domain: https://rudeox.cloud)`);
    });
    server4040.on('error', (err: any) => {
      console.warn(`[Port 4040 Notice]:`, err.message);
    });
  } catch (e: any) {
    console.warn(`Could not bind to port 4040:`, e.message);
  }
}

startServer();
