import { MongoClient, Db } from 'mongodb';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'db-config.json');

const DEFAULT_URI = process.env.MONGODB_URI || 'mongodb://riyadammmeri:OmGe6UeG1Q0hVJEq@ac-ujqhcf3-shard-00-00.7xu8hz3.mongodb.net:27017,ac-ujqhcf3-shard-00-01.7xu8hz3.mongodb.net:27017,ac-ujqhcf3-shard-00-02.7xu8hz3.mongodb.net:27017/?ssl=true&replicaSet=atlas-3anew8-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';
const DEFAULT_DB_NAME = process.env.MONGODB_DB_NAME || 'shames';

let currentUri = DEFAULT_URI;
let currentDbName = DEFAULT_DB_NAME;

// Load persisted custom config if available
try {
  if (fs.existsSync(CONFIG_PATH)) {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.uri) currentUri = parsed.uri;
    if (parsed.database) currentDbName = parsed.database;
  }
} catch (e) {
  console.warn('[MongoDB Config] Warning reading db-config.json:', e);
}

let client: MongoClient | null = null;
let dbInstance: Db | null = null;
let isConnecting = false;

export function getCurrentMongoConfig() {
  return {
    uri: currentUri,
    database: currentDbName,
    maskedUri: currentUri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:••••••••@')
  };
}

export async function connectToMongoDB(): Promise<Db> {
  if (dbInstance) return dbInstance;
  if (isConnecting) {
    await new Promise((res) => setTimeout(res, 400));
    if (dbInstance) return dbInstance;
  }

  isConnecting = true;
  try {
    client = new MongoClient(currentUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    await client.connect();
    dbInstance = client.db(currentDbName);
    console.log(`[MongoDB] Successfully connected to database: "${currentDbName}"`);

    // Verify index on collections for quick lookup by 'id'
    const collections = ['users', 'activities', 'submissions', 'posts', 'clubs', 'notifications', 'blogs'];
    for (const colName of collections) {
      try {
        const col = dbInstance.collection(colName);
        await col.createIndex({ id: 1 }, { unique: true, background: true });
      } catch (idxErr) {
        // Index might already exist
      }
    }

    return dbInstance;
  } catch (error: any) {
    console.error(`[MongoDB] Connection error to "${currentDbName}":`, error.message);
    throw error;
  } finally {
    isConnecting = false;
  }
}

export async function setMongoConfig(newUri: string, newDbName: string) {
  if (!newUri || !newUri.trim()) {
    throw new Error('رابط الاتصال بـ MongoDB مطلوب');
  }

  const cleanUri = newUri.trim();
  const cleanDb = (newDbName || 'shames').trim();

  // Test the connection before switching permanently
  const testClient = new MongoClient(cleanUri, {
    serverSelectionTimeoutMS: 6000,
    connectTimeoutMS: 8000,
  });
  await testClient.connect();
  const testDb = testClient.db(cleanDb);
  await testDb.command({ ping: 1 });
  await testClient.close();

  // Close existing client
  if (client) {
    try {
      await client.close();
    } catch {}
    client = null;
    dbInstance = null;
  }

  currentUri = cleanUri;
  currentDbName = cleanDb;

  // Persist to data/db-config.json
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ uri: currentUri, database: currentDbName, updatedAt: new Date().toISOString() }, null, 2));
  } catch (err) {
    console.warn('[MongoDB Config] Error saving db-config.json:', err);
  }

  // Connect to new DB and initialize
  const newDb = await connectToMongoDB();
  const status = await getMongoStatus();

  return {
    success: true,
    message: `تم ضبط والاتصال بنجاح بقاعدة البيانات "${currentDbName}"`,
    status
  };
}

export async function testMongoConnection(uriToTest: string, dbToTest: string) {
  const cleanUri = uriToTest.trim();
  const cleanDb = (dbToTest || 'shames').trim();

  const testClient = new MongoClient(cleanUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 7000,
  });

  const start = Date.now();
  await testClient.connect();
  const db = testClient.db(cleanDb);
  const ping = await db.command({ ping: 1 });
  const collections = await db.listCollections().toArray();
  const pingMs = Date.now() - start;
  await testClient.close();

  return {
    success: true,
    pingMs,
    pingResult: ping,
    database: cleanDb,
    collections: collections.map(c => c.name)
  };
}

export async function getMongoDb(): Promise<Db | null> {
  try {
    return await connectToMongoDB();
  } catch {
    return null;
  }
}

export async function getMongoStatus() {
  const start = Date.now();
  try {
    const db = await getMongoDb();
    if (!db) {
      return {
        connected: false,
        database: currentDbName,
        uri: currentUri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:••••••••@'),
        error: 'Could not connect to MongoDB Atlas'
      };
    }

    const ping = await db.command({ ping: 1 });
    const pingMs = Date.now() - start;
    const collections = await db.listCollections().toArray();
    
    // Count docs in main collections
    const counts: Record<string, number> = {};
    for (const col of collections) {
      counts[col.name] = await db.collection(col.name).countDocuments();
    }

    return {
      connected: true,
      database: currentDbName,
      uri: currentUri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:••••••••@'),
      pingMs,
      pingResult: ping,
      collections: collections.map(c => c.name),
      counts,
      timestamp: new Date().toISOString()
    };
  } catch (err: any) {
    return {
      connected: false,
      database: currentDbName,
      uri: currentUri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:••••••••@'),
      error: err.message,
      timestamp: new Date().toISOString()
    };
  }
}
