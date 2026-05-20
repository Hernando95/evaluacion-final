export type User = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category_id: string;
  stock: number;
  unit: string;
  featured: boolean;
  discounted_price?: number | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  image: string | null;
};

export type CartItem = {
  id: string;
  product: Product;
  quantity: number;
};

export type Order = {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  created_at: string;
  address: string;
  payment_method: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product: Product;
  quantity: number;
  price: number;
};