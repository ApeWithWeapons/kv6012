// src/data.js
const sql = require('mssql');

const config = {
  connectionString: process.env.Default,
  options: { encrypt: true, enableArithAbort: true }
};

async function getProjects() {
  if (!global.dbPool) {
    global.dbPool = await sql.connect(config);
  }
  const result = await global.dbPool.request()
    .query(`
      SELECT p.ProjectId, p.Title, p.Description,
             r.ResourceId, r.Name, r.Quantity
      FROM Projects p
      LEFT JOIN Resources r ON p.ProjectId = r.ProjectId
    `);

  const projectsMap = new Map();
  for (const row of result.recordset) {
    if (!projectsMap.has(row.ProjectId)) {
      projectsMap.set(row.ProjectId, {
        projectId:  row.ProjectId,
        title:      row.Title,
        description:row.Description,
        resources:  []
      });
    }
    if (row.ResourceId !== null) {
      projectsMap.get(row.ProjectId).resources.push({
        resourceId: row.ResourceId,
        name:       row.Name,
        quantity:   row.Quantity
      });
    }
  }
  return Array.from(projectsMap.values());
}

module.exports = { getProjects };
