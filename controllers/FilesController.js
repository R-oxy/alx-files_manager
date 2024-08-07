import { v4 as uuidv4 } from 'uuid';
import RedisClient from '../utils/redis';
import DBClient from '../utils/db';
import fs from 'fs/promises';
import mime from 'mime-types';
import Bull from 'bull';
import { ObjectId } from 'mongodb';

const fileQueue = new Bull('fileQueue');

class FilesController {
  static async postUpload(request, response) {
    try {
      const token = request.header('X-Token') || null;
      if (!token) return response.status(401).send({ error: 'Unauthorized' });

      const redisToken = await RedisClient.get(`auth_${token}`);
      if (!redisToken) return response.status(401).send({ error: 'Unauthorized' });

      const user = await DBClient.db.collection('users').findOne({ _id: ObjectId(redisToken) });
      if (!user) return response.status(401).send({ error: 'Unauthorized' });

      const { name, type, data, isPublic = false, parentId = '0' } = request.body;
      if (!name) return response.status(400).send({ error: 'Missing name' });
      if (!type || !['folder', 'file', 'image'].includes(type)) return response.status(400).send({ error: 'Missing type' });
      if (!data && ['file', 'image'].includes(type)) return response.status(400).send({ error: 'Missing data' });

      let fileParentId = parentId === '0' ? 0 : parentId;
      if (fileParentId !== 0) {
        const parentFile = await DBClient.db.collection('files').findOne({ _id: ObjectId(fileParentId) });
        if (!parentFile) return response.status(400).send({ error: 'Parent not found' });
        if (parentFile.type !== 'folder') return response.status(400).send({ error: 'Parent is not a folder' });
      }

      const fileDataDb = {
        userId: user._id,
        name,
        type,
        isPublic,
        parentId: fileParentId,
      };

      if (type === 'folder') {
        await DBClient.db.collection('files').insertOne(fileDataDb);
        return response.status(201).send(fileDataDb);
      }

      const pathDir = process.env.FOLDER_PATH || '/tmp/files_manager';
      const fileUuid = uuidv4();
      const filePath = `${pathDir}/${fileUuid}`;
      const buff = Buffer.from(data, 'base64');

      await fs.mkdir(pathDir, { recursive: true });
      await fs.writeFile(filePath, buff);

      fileDataDb.localPath = filePath;
      await DBClient.db.collection('files').insertOne(fileDataDb);

      fileQueue.add({
        userId: fileDataDb.userId,
        fileId: fileDataDb._id,
      });

      return response.status(201).send(fileDataDb);
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  }

  static async getShow(request, response) {
    try {
      const token = request.header('X-Token') || null;
      if (!token) return response.status(401).send({ error: 'Unauthorized' });

      const redisToken = await RedisClient.get(`auth_${token}`);
      if (!redisToken) return response.status(401).send({ error: 'Unauthorized' });

      const user = await DBClient.db.collection('users').findOne({ _id: ObjectId(redisToken) });
      if (!user) return response.status(401).send({ error: 'Unauthorized' });

      const idFile = request.params.id || '';
      const fileDocument = await DBClient.db.collection('files').findOne({ _id: ObjectId(idFile), userId: user._id });
      if (!fileDocument) return response.status(404).send({ error: 'Not found' });

      return response.send(fileDocument);
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  }

  static async getIndex(request, response) {
    try {
      const token = request.header('X-Token') || null;
      if (!token) return response.status(401).send({ error: 'Unauthorized' });

      const redisToken = await RedisClient.get(`auth_${token}`);
      if (!redisToken) return response.status(401).send({ error: 'Unauthorized' });

      const user = await DBClient.db.collection('users').findOne({ _id: ObjectId(redisToken) });
      if (!user) return response.status(401).send({ error: 'Unauthorized' });

      const parentId = request.query.parentId || 0;
      const page = parseInt(request.query.page, 10) || 0;

      const match = parentId === 0 ? {} : { parentId: ObjectId(parentId) };
      const files = await DBClient.db.collection('files')
        .aggregate([
          { $match: match },
          { $skip: page * 20 },
          { $limit: 20 },
        ])
        .toArray();

      return response.send(files);
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  }

  static async putPublish(request, response) {
    try {
      const token = request.header('X-Token') || null;
      if (!token) return response.status(401).send({ error: 'Unauthorized' });

      const redisToken = await RedisClient.get(`auth_${token}`);
      if (!redisToken) return response.status(401).send({ error: 'Unauthorized' });

      const user = await DBClient.db.collection('users').findOne({ _id: ObjectId(redisToken) });
      if (!user) return response.status(401).send({ error: 'Unauthorized' });

      const idFile = request.params.id || '';
      const updateResult = await DBClient.db.collection('files').updateOne(
        { _id: ObjectId(idFile), userId: user._id },
        { $set: { isPublic: true } }
      );

      if (updateResult.matchedCount === 0) return response.status(404).send({ error: 'Not found' });

      const fileDocument = await DBClient.db.collection('files').findOne({ _id: ObjectId(idFile), userId: user._id });
      return response.send(fileDocument);
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  }

  static async putUnpublish(request, response) {
    try {
      const token = request.header('X-Token') || null;
      if (!token) return response.status(401).send({ error: 'Unauthorized' });

      const redisToken = await RedisClient.get(`auth_${token}`);
      if (!redisToken) return response.status(401).send({ error: 'Unauthorized' });

      const user = await DBClient.db.collection('users').findOne({ _id: ObjectId(redisToken) });
      if (!user) return response.status(401).send({ error: 'Unauthorized' });

      const idFile = request.params.id || '';
      const updateResult = await DBClient.db.collection('files').updateOne(
        { _id: ObjectId(idFile), userId: user._id },
        { $set: { isPublic: false } }
      );

      if (updateResult.matchedCount === 0) return response.status(404).send({ error: 'Not found' });

      const fileDocument = await DBClient.db.collection('files').findOne({ _id: ObjectId(idFile), userId: user._id });
      return response.send(fileDocument);
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  }

  static async getFile(request, response) {
    try {
      const idFile = request.params.id || '';
      const size = request.query.size || 0;

      const fileDocument = await DBClient.db.collection('files').findOne({ _id: ObjectId(idFile) });
      if (!fileDocument) return response.status(404).send({ error: 'Not found' });

      const { isPublic, userId, type, localPath, name } = fileDocument;

      const token = request.header('X-Token') || null;
      let owner = false;

      if (token) {
        const redisToken = await RedisClient.get(`auth_${token}`);
        if (redisToken) {
          const user = await DBClient.db.collection('users').findOne({ _id: ObjectId(redisToken) });
          if (user && user._id.toString() === userId.toString()) owner = true;
        }
      }

      if (!isPublic && !owner) return response.status(404).send({ error: 'Not found' });
      if (type === 'folder') return response.status(400).send({ error: 'A folder doesn\'t have content' });

      const realPath = size === 0 ? localPath : `${localPath}_${size}`;

      try {
        const dataFile = await fs.readFile(realPath);
        const mimeType = mime.contentType(name);
        response.setHeader('Content-Type', mimeType);
        return response.send(dataFile);
      } catch {
        return response.status(404).send({ error: 'Not found' });
      }
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  }
}

export default FilesController;
