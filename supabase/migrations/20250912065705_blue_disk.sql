/*
  # Create customer orders table

  1. New Tables
    - `customer_orders`
      - `id` (uuid, primary key)
      - `first_name` (text, required)
      - `last_name` (text, required)
      - `email` (text, required)
      - `phone` (text, optional)
      - `address` (text, required)
      - `city` (text, required)
      - `state` (text, required)
      - `zip_code` (text, required)
      - `house_photo_url` (text, optional - for uploaded photos)
      - `location_latitude` (numeric, optional)
      - `location_longitude` (numeric, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `customer_orders` table
    - Add policy for public insert access (for form submissions)
    - Add policy for authenticated users to read all data (for admin access)

  3. Notes
    - This table stores all customer order information from the AudioMax Pro form
    - Photos will be stored as base64 data or file URLs
    - Location data is optional and captured via browser geolocation API
*/

CREATE TABLE IF NOT EXISTS customer_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  house_photo_url text,
  location_latitude numeric,
  location_longitude numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;

-- Allow public to insert orders (for form submissions)
CREATE POLICY "Anyone can submit orders"
  ON customer_orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read all orders (for admin dashboard)
CREATE POLICY "Authenticated users can read all orders"
  ON customer_orders
  FOR SELECT
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_orders_updated_at
  BEFORE UPDATE ON customer_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();