// functions/db-bootstrap-sqls.js

// 0. Drop tables in dependency order (child → parent)
export const sql00_dropAllTables = `
  DROP TABLE IF EXISTS
    orders,
    products,
    customers
  CASCADE;
`;

// 1. Create tables

export const sql01_createCustomersTable = `
  CREATE TABLE IF NOT EXISTS customers (
    id     SERIAL PRIMARY KEY,
    name   TEXT NOT NULL,
    email  TEXT NOT NULL UNIQUE
  );
`;

export const sql02_createProductsTable = `
  CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    price_pence INTEGER NOT NULL,
    pdf_url     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`;

export const sql03_createOrdersTable = `
  CREATE TABLE IF NOT EXISTS orders (
    id          SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    product_id  INTEGER NOT NULL REFERENCES products(id),
    quantity    INTEGER NOT NULL DEFAULT 1,
    order_status TEXT NOT NULL DEFAULT 'PLACED',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`;

// 2. Seed data

export const sql04_seedCustomers = `
  INSERT INTO customers (name, email) VALUES
    ('Alice Baker',   'alice@example.com'),
    ('Bob Dough',     'bob@example.com'),
    ('Cara Crumble',  'cara@example.com')
  ON CONFLICT (email) DO NOTHING;
`;

export const sql05_seedProducts = `
  INSERT INTO products (name, description, price_pence, pdf_url) VALUES
    ('Blueberry Muffin',
     'Soft muffin packed with blueberries',
     275,
     'blueberry_muffin.pdf'),

    ('Butter Croissant',
     'Flaky, buttery croissant',
     275,
     'butter_croissant.pdf'),

    ('Chocolate Brownie',
     'Rich chocolate brownie slice',
     295,
     'chocolate_brownie.pdf'),

    ('Cinnamon Bun',
     'Soft bun with cinnamon sugar swirl',
     350,
     'cinnamon_bun.pdf'),

    ('French Baguette',
     'Classic crusty French baguette',
     250,
     'french_baguette.pdf'),

    ('Pain Au Chocolat',
     'Laminated pastry with dark chocolate',
     295,
     'pain_au_chocolat.pdf'),

    ('Sausage Roll',
     'Puff pastry roll with seasoned sausage filling',
     250,
     'sausage_roll.pdf'),

    ('Sourdough Loaf',
     'Slow-fermented sourdough loaf, baked daily',
     495,
     'sourdough_loaf.pdf'),

    ('Vegan Banana Bread',
     'Moist banana loaf made with plant-based ingredients',
     325,
     'vegan_banana_bread.pdf'),

    ('Victoria Sponge Slice',
     'Classic vanilla sponge with jam and cream',
     325,
     'victoria_sponge_slice.pdf')
  ON CONFLICT DO NOTHING;
`;

export const sql06_seedOrders = `
  INSERT INTO orders (customer_id, product_id, quantity, order_status)
  SELECT c.id, p.id, o.quantity, o.order_status
  FROM (
    VALUES
      (1, 1, 2, 'PLACED'),      -- customer 1, Blueberry Muffin
      (1, 3, 1, 'DISPATCHED'),  -- customer 1, Chocolate Brownie
      (2, 8, 1, 'PLACED'),      -- customer 2, Sourdough Loaf
      (3, 10, 2, 'PLACED')      -- customer 3, Victoria Sponge Slice
  ) AS o(customer_idx, product_idx, quantity, order_status)
  JOIN customers c ON c.id = o.customer_idx
  JOIN products  p ON p.id = o.product_idx;
`;
