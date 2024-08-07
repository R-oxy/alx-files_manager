import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import DBClient from '../utils/db';
import RedisClient from '../utils/redis';

class AuthController {
  static async getConnect(request, response) {
    const authorization = request.header('Authorization') || null;
    if (!authorization) return response.status(401).send({ error: 'Unauthorized' });

    const [email, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64')
      .toString('utf-8')
      .split(':');

    if (!email || !password) return response.status(401).send({ error: 'Unauthorized' });

    const hashedPassword = sha1(password);
    const user = await DBClient.db.collection('users').findOne({ email, password: hashedPassword });
    if (!user) return response.status(401).send({ error: 'Unauthorized' });

    const token = uuidv4();
    const redisKey = `auth_${token}`;
    await RedisClient.set(redisKey, user._id.toString(), 86400);

    return response.status(200).send({ token });
  }

  static async getDisconnect(request, response) {
    const token = request.header('X-Token') || null;
    if (!token) return response.status(401).send({ error: 'Unauthorized' });

    const redisKey = `auth_${token}`;
    const userId = await RedisClient.get(redisKey);
    if (!userId) return response.status(401).send({ error: 'Unauthorized' });

    await RedisClient.del(redisKey);
    return response.status(204).send();
  }
}

export default AuthController;
