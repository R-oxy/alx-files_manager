import sha1 from 'sha1';
import DBClient from '../utils/db';
import RedisClient from '../utils/redis';
import Bull from 'bull';
import { ObjectId } from 'mongodb';

class UsersController {
  static async postNew(req, res) {
    const userQueue = new Bull('userQueue');

    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const existingUser = await DBClient.db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      const hashedPassword = sha1(password);
      const result = await DBClient.db.collection('users').insertOne({ email, password: hashedPassword });

      userQueue.add({ userId: result.insertedId });

      return res.status(201).json({ id: result.insertedId, email });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMe(req, res) {
    const token = req.header('X-Token');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const redisToken = await RedisClient.get(`auth_${token}`);
      if (!redisToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await DBClient.db.collection('users').findOne({ _id: ObjectId(redisToken) });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { _id, email } = user;
      return res.status(200).json({ id: _id, email });
    } catch (error) {
      console.error('Error retrieving user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default UsersController;
