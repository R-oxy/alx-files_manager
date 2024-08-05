# 0x04. Files manager

## Back-end

* **JavaScript**
* **ES6**
* **NoSQL**
* **MongoDB**
* **Redis**
* **NodeJS**
* **ExpressJS**
* **Kue**

## Project Overview

This project is a culmination of the back-end trimester's learning objectives: authentication, NodeJS, MongoDB, Redis, pagination, and background processing. The goal is to build a simple platform for uploading and viewing files with the following features:

* User authentication via token
* File listing
* File uploading
* File permission management
* File viewing
* Image thumbnail generation

You have some flexibility in implementation, such as file organization and utilizing the `utils` folder.

## Resources

* **Node JS getting started**
* **Process API doc**
* **Express getting started**
* **Mocha documentation**
* **Nodemon documentation**
* **MongoDB**
* **Bull**
* **Image thumbnail**
* **Mime-Types**
* **Redis**

## Learning Objectives

By the end of this project, you should be able to explain:

* Creating an API with Express
* User authentication
* Storing data in MongoDB
* Storing temporary data in Redis
* Setting up and using a background worker

## Requirements

* **Editors:** vi, vim, emacs, Visual Studio Code
* **Environment:** Ubuntu 18.04 LTS, Node (version 12.x.x)
* **Newline:** All files should end with a new line
* **README.md:** Mandatory at the root of the project folder
* **Extension:** Use the `.js` extension
* **Linting:** Code will be checked with ESLint

## Provided Files

* `package.json`
* `.eslintrc.js`
* `babel.config.js`
* `utils/redis.js` (Redis utility class)
* `utils/db.js` (MongoDB utility class)
* `server.js` (Express server)
* `routes/index.js` (API endpoints)
* `controllers/AppController.js` (Status and stats endpoints)
* `controllers/UsersController.js` (User management endpoints)
* `controllers/AuthController.js` (Authentication endpoints)
* `controllers/FilesController.js` (File management endpoints)
* `worker.js` (Background worker for tasks)
* `tests/` (Directory for tests)

## Tasks

1.  **Redis Utils:** Create a `RedisClient` class in `utils/redis.js`.
2.  **MongoDB Utils:** Create a `DBClient` class in `utils/db.js`.
3.  **First API:** Set up Express server and basic API endpoints in `server.js`, `routes/index.js`, and `controllers/AppController.js`.
4.  **Create a new user:** Implement `POST /users` endpoint in `controllers/UsersController.js`.
5.  **Authenticate a user:** Implement authentication endpoints in `controllers/AuthController.js`.
6.  **First file:** Implement `POST /files` endpoint for file upload in `controllers/FilesController.js`.
7.  **Get and list file:** Implement `GET /files/:id` and `GET /files` endpoints in `controllers/FilesController.js`.
8.  **File publish/unpublish:** Implement `PUT /files/:id/publish` and `PUT /files/:id/unpublish` endpoints in `controllers/FilesController.js`.
9.  **File data:** Implement `GET /files/:id/data` endpoint in `controllers/FilesController.js`.
10. **Image Thumbnails:** Update `POST /files` and `GET /files/:id/data` for image thumbnail generation using a background worker (`worker.js`).
11. **Tests! (Advanced):** Write tests for Redis, MongoDB utilities, and API endpoints.
12. **New user - welcome email (Advanced):** Send welcome emails via a background job when new users are created.

**Note:** Remember to run `npm install` after cloning the repository.
