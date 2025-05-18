// src/controllers/dataModule.js
import sql from 'mssql';

export async function getProjects() {
  console.log('→ dataModule.getProjects()');
  console.log('   using connection:', process.env.PROJECTS_DB ? '[FOUND]' : '[MISSING]');
  const pool = await sql.connect(process.env.PROJECTS_DB);
  console.log('   connected, running query');
  const result = await pool.request().query('SELECT * FROM Projects');
  console.log('   query complete, rows:', result.recordset.length);
  return result.recordset;
}
