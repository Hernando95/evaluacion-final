/*
  # Initial schema for Mercado Express app

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `phone` (text)
      - `address` (text)
      - `created_at` (timestamp)
      
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `image` (text)
    
    - `products`
      - `id` (uuid, primary key) 
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `image` (text)
      - `category_id` (uuid, foreign key)
      - `stock` (integer)
      - `unit` (text)
      - `featured` (boolean)
      - `discounted_price` (numeric)
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `status` (text)
      - `total` (numeric)
      - `created_at` (timestamp)
      - `address` (text)
      - `payment_method` (text)
      - `notes` (text)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `price` (numeric)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data
    - Add policies for administrators to manage all data
*/

-- Create users table to store user profiles
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  phone text,
  address text,
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image text
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  image text,
  category_id uuid REFERENCES categories ON DELETE SET NULL,
  stock integer NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'unidad',
  featured boolean DEFAULT false,
  discounted_price numeric,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure discounted price is less than regular price
  CONSTRAINT discounted_price_less_than_price CHECK (discounted_price IS NULL OR discounted_price < price)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  total numeric NOT NULL CHECK (total >= 0),
  created_at timestamptz DEFAULT now(),
  address text,
  payment_method text,
  notes text
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0)
);

-- Add index for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Categories: everyone can read, only admins can write
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO authenticated, anon
  USING (true);

-- Products: everyone can read, only admins can write
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  TO authenticated, anon
  USING (true);

-- Users: users can only read and update their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Orders: users can only see their own orders
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Order items: users can see items for their orders
CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for their orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Insert sample data for categories
INSERT INTO categories (name, image)
VALUES 
  ('Frutas y Verduras', 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg'),
  ('Lácteos', 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg'),
  ('Carnes', 'https://images.pexels.com/photos/1927377/pexels-photo-1927377.jpeg'),
  ('Panadería', 'https://images.pexels.com/photos/1070946/pexels-photo-1070946.jpeg'),
  ('Bebidas', 'https://images.pexels.com/photos/2983100/pexels-photo-2983100.jpeg'),
  ('Limpieza', 'https://images.pexels.com/photos/4239032/pexels-photo-4239032.jpeg');

-- Insert sample products
INSERT INTO products (name, description, price, image, category_id, stock, unit, featured, discounted_price)
SELECT
  'Manzanas Rojas', 
  'Manzanas frescas y dulces, perfectas para comer directamente o usar en postres.',
  2.99,
  'https://images.pexels.com/photos/1510392/pexels-photo-1510392.jpeg',
  id,
  100,
  'kg',
  true,
  2.49
FROM categories WHERE name = 'Frutas y Verduras'
UNION ALL
SELECT
  'Leche Entera', 
  'Leche fresca y cremosa de vacas alimentadas con pasto.',
  1.99,
  'https://images.pexels.com/photos/5779611/pexels-photo-5779611.jpeg',
  id,
  50,
  'litro',
  true,
  null
FROM categories WHERE name = 'Lácteos'
UNION ALL
SELECT
  'Pechuga de Pollo', 
  'Pechuga de pollo fresca y sin hueso.',
  5.99,
  'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg',
  id,
  30,
  'kg',
  false,
  4.99
FROM categories WHERE name = 'Carnes'
UNION ALL
SELECT
  'Pan Integral', 
  'Pan integral recién horneado con granos enteros.',
  3.49,
  'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg',
  id,
  20,
  'unidad',
  false,
  null
FROM categories WHERE name = 'Panadería'
UNION ALL
SELECT
  'Agua Mineral', 
  'Agua mineral natural sin gas.',
  1.29,
  'https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg',
  id,
  100,
  'botella',
  true,
  0.99
FROM categories WHERE name = 'Bebidas'
UNION ALL
SELECT
  'Detergente Líquido', 
  'Detergente líquido concentrado para ropa.',
  4.99,
  'https://images.pexels.com/photos/5217273/pexels-photo-5217273.jpeg',
  id,
  40,
  'botella',
  false,
  null
FROM categories WHERE name = 'Limpieza'
UNION ALL
SELECT
  'Plátanos', 
  'Plátanos orgánicos y maduros.',
  1.99,
  'https://images.pexels.com/photos/1166648/pexels-photo-1166648.jpeg',
  id,
  80,
  'kg',
  false,
  1.79
FROM categories WHERE name = 'Frutas y Verduras'
UNION ALL
SELECT
  'Yogurt Natural', 
  'Yogurt natural sin azúcar añadido.',
  2.49,
  'https://images.pexels.com/photos/373882/pexels-photo-373882.jpeg',
  id,
  25,
  'unidad',
  true,
  null
FROM categories WHERE name = 'Lácteos'
UNION ALL
SELECT
  'Filete de Res', 
  'Filete de res premium, corte especial.',
  12.99,
  'https://images.pexels.com/photos/1307658/pexels-photo-1307658.jpeg',
  id,
  15,
  'kg',
  true,
  10.99
FROM categories WHERE name = 'Carnes'
UNION ALL
SELECT
  'Baguette', 
  'Baguette tradicional, recién horneada.',
  1.99,
  'https://images.pexels.com/photos/2569839/pexels-photo-2569839.jpeg',
  id,
  30,
  'unidad',
  false,
  null
FROM categories WHERE name = 'Panadería';