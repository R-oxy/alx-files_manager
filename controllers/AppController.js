import RedisClient from '../utils/redis';
import DBClient from '../utils/db';

class AppController {
  static async getStatus(req, res) {
    try {
      const status = {
        redis: await RedisClient.isAlive(),
        db: await DBClient.isAlive(),
      };
      return res.status(200).json(status);
    } catch (error) {
      console.error('Error fetching status:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = {
        users: await DBClient.nbUsers(),
        files: await DBClient.nbFiles(),
      };
      return res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default AppController;
