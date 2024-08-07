import express from 'express';
import configureRoutes from './routes/index';

const app = express();
const port = process.env.PORT || 5000;

configureRoutes(app);

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
