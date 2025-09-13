import { supabase } from './supabase'
import type { OrderFormData, CustomerOrder } from './supabase'

export async function submitOrder(orderData: OrderFormData): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('customer_orders')
      .insert({
        first_name: orderData.firstName,
        last_name: orderData.lastName,
        email: orderData.email,
        phone: orderData.phone || null,
        address: orderData.address,
        city: orderData.city,
        state: orderData.state,
        zip_code: orderData.zipCode,
        house_photo_url: orderData.housePhotoUrl || null,
        location_latitude: orderData.locationLatitude || null,
        location_longitude: orderData.locationLongitude || null,
      })

    if (error) {
      console.error('Error submitting order:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error submitting order:', error)
    return { success: false, error: 'Failed to submit order' }
  }
}

export async function getOrders(): Promise<{ success: boolean; data?: CustomerOrder[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('customer_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return { success: false, error: 'Failed to fetch orders' }
  }
}