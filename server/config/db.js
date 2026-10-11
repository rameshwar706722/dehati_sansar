import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

dotenv.config({
  path: fileURLToPath(new URL('../.env', import.meta.url)),
});

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,

  ssl: {
    ca: fs.readFileSync(
      new URL('../certs/ca.pem', import.meta.url)
    ),
    rejectUnauthorized: true,
    verifyIdentity: true,
  },

  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});