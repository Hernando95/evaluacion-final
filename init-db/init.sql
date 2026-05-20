-- Mock Supabase Auth schema
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE
);

-- Users profiles
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  phone text,
  address text, 
  created_at timestamptz DEFAULT now()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image text
);

-- Products
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
  CONSTRAINT discounted_price_less_than_price CHECK (discounted_price IS NULL OR discounted_price < price)
);

-- Orders
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

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0)
);

-- Sample Data
INSERT INTO categories (name, image) VALUES 
('Frutas y Verduras', 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg'),
('Lácteos', 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg');
