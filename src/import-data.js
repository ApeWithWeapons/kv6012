// src/import-data.js
import fs from 'fs';
import xml2js from 'xml2js';
import sql from 'mssql';

async function run() {
  // 1. Read & parse XML
  const xml = fs.readFileSync('data/projects.xml', 'utf8');
  const { Projects } = await xml2js.parseStringPromise(xml, { explicitArray: false });

  // 2. Connect to Azure SQL
  await sql.connect(process.env.PROJECTS_DB);
  const table = new sql.Table('Projects');
  // 3. Define columns exactly as your table
  table.columns.add('project_id', sql.Int, { nullable: false });
  table.columns.add('project_name', sql.NVarChar(100), { nullable: false });
  // … add columns for every field …

  // 4. Bulk load rows
  Projects.Project.forEach(p => {
    table.rows.add(
      parseInt(p.project_id, 10),
      p.project_name,
      // … other fields …
    );
  });
  await new sql.Request().bulk(table);
  console.log('Imported', table.rows.length, 'projects');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
