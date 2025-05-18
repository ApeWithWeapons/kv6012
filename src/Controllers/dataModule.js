// src/controllers/dataModule.js
import sql from 'mssql';

export async function getProjects() {
  const pool = await sql.connect(process.env.PROJECTS_DB);
  const result = await pool.request().query('SELECT * FROM Projects');
  return result.recordset;
}
