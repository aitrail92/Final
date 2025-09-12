// Supabase client configuration
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please connect to Supabase first.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to save customer order
export async function saveCustomerOrder(orderData) {
  try {
    const { data, error } = await supabase
      .from('customer_orders')
      .insert([orderData])
      .select()
      .single();

    if (error) {
      console.error('Error saving order:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to save customer order:', error);
    throw error;
  }
}

// Helper function to get all orders (for admin)
export async function getAllOrders() {
  try {
    const { data, error } = await supabase
      .from('customer_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    throw error;
  }
}