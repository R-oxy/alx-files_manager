import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${host}:${port}`;

class DBClient {
  constructor() {
    this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    this.db = null;
    this.connecting = this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(database);
      console.log('MongoDB client connected to the server');
    } catch (err) {
      console.error('MongoDB client not connected to the server:', err);
      this.db = null;
    }
  }

  async isAlive() {
    await this.connecting;
    if (!this.db) {
      throw new Error('DB client not connected');
    }
    try {
      await this.db.command({ ping: 1 });
      return true;
    } catch (err) {
      console.error('MongoDB client not connected to the server:', err);
      return false;
    }
  }

  async nbUsers() {
    await this.connecting;
    if (!this.db) {
      throw new Error('DB client not connected');
    }
    try {
      return await this.db.collection('users').countDocuments();
    } catch (err) {
      console.error('Error counting users:', err);
      return 0;
    }
  }

  async nbFiles() {
    await this.connecting;
    if (!this.db) {
      throw new Error('DB client not connected');
    }
    try {
      return await this.db.collection('files').countDocuments();
    } catch (err) {
      console.error('Error counting files:', err);
      return 0;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
