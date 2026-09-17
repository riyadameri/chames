import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://riyadammmeri:OmGe6UeG1Q0hVJEq@ac-ujqhcf3-shard-00-00.7xu8hz3.mongodb.net:27017,ac-ujqhcf3-shard-00-01.7xu8hz3.mongodb.net:27017,ac-ujqhcf3-shard-00-02.7xu8hz3.mongodb.net:27017/?ssl=true&replicaSet=atlas-3anew8-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = process.env.MONGODB_DB_NAME || 'shames';

let client: MongoClient | null = null;
let dbInstance: Db | null = null;
let isConnecting = false;

export async function connectToMongoDB(): Promise<Db> {
  if (dbInstance) return dbInstance;
  if (isConnecting) {
    // Wait briefly if currently connecting
    await new Promise((res) => setTimeout(res, 400));
    if (dbInstance) return dbInstance;
  }

  isConnecting = true;
  try {
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    await client.connect();
    dbInstance = client.db(DB_NAME);
    console.log(`[MongoDB] Successfully connected directly to database: "${DB_NAME}"`);

    // Verify index on collections for quick lookup by 'id'
    const collections = ['users', 'activities', 'submissions', 'posts', 'clubs', 'notifications', 'blogs'];
    for (const colName of collections) {
      try {
        const col = dbInstance.collection(colName);
        await col.createIndex({ id: 1 }, { unique: true, background: true });
      } catch (idxErr) {
        // Index might already exist or collection empty
      }
    }

    return dbInstance;
  } catch (error: any) {
    console.error(`[MongoDB] Connection error to "${DB_NAME}":`, error.message);
    throw error;
  } finally {
    isConnecting = false;
  }
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
        database: DB_NAME,
        replicaSet: 'atlas-3anew8-shard-0',
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
      database: DB_NAME,
      replicaSet: 'atlas-3anew8-shard-0',
      pingMs,
      pingResult: ping,
      collections: collections.map(c => c.name),
      counts,
      timestamp: new Date().toISOString()
    };
  } catch (err: any) {
    return {
      connected: false,
      database: DB_NAME,
      replicaSet: 'atlas-3anew8-shard-0',
      error: err.message,
      timestamp: new Date().toISOString()
    };
  }
}
