// functions/db.js
import client from "data-api-client";

import {
  sql00_dropAllTables,
  sql01_createCustomersTable,
  sql02_createProductsTable,
  sql03_createOrdersTable,
  sql04_seedCustomers,
  sql05_seedProducts,
  sql06_seedOrders
} from "./db-bootstrap-sqls.js";

const connection = client({
  secretArn: process.env.SECRET_ARN || "NOT_SET",
  resourceArn: process.env.CLUSTER_ARN || "NOT_SET",
  database: process.env.DB_NAME || "NOT_SET"
});

export async function runQuery(sql, params = {}) {
  if (!sql || !sql.trim()) return;
  return connection.query(sql, params);
}

// This is the "bootstrap" the breakout slide refers to
export async function bootstrapDatabase() {
  const statements = [
    sql00_dropAllTables,
    sql01_createCustomersTable,
    sql02_createProductsTable,
    sql03_createOrdersTable,
    sql04_seedCustomers,
    sql05_seedProducts,
    sql06_seedOrders
  ];

  for (const statement of statements) {
    await runQuery(statement);
  }

  // Return a numeric HTTP code, not a string, from the Lambda
  return 201;
}
