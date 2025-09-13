import './style.css'
import { supabase } from './lib/supabase'
import { submitOrder, getOrders } from './lib/orders'
import type { OrderFormData } from './lib/supabase'

// Global state
let currentLocation: { latitude: number; longitude: number } | null = null
let uploadedPhoto: string | null = null

// Utility functions
function showToast(message: string, type: 'info' | 'error' | 'success' = 'info') {
  const toast = document.getElementById('toast')
  const toastMessage = document.getElementById('toast-message')
  
  if (toast && toastMessage) {
    toastMessage.textContent = message
    toast.className = `toast ${type}`
    toast.classList.remove('hidden')
    
    setTimeout(() => {
      toast.classList.add('hidden')
    }, 5000)
  }
}

// Convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

// Photo upload functionality
function initializePhotoUpload() {
  const fileInput = document.getElementById('house-photo') as HTMLInputElement
  const uploadBtn = document.getElementById('upload-btn')
  const photoSuccess = document.getElementById('photo-success')
  const removePhotoBtn = document.getElementById('remove-photo')
  
  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => {
      fileInput.click()
    })
  }
  
  if (fileInput) {
    fileInput.addEventListener('change', async (event) => {
      const target = event.target as HTMLInputElement
      const file = target.files?.[0]
      
      if (file && file.size <= 2 * 1024 * 1024) { // 2MB limit
        try {
          uploadedPhoto = await fileToBase64(file)
          photoSuccess?.classList.remove('hidden')
          showToast('Photo uploaded successfully', 'success')
        } catch (error) {
          showToast('Failed to process photo', 'error')
        }
      } else if (file) {
        showToast('Photo must be less than 2MB', 'error')
        target.value = ''
      }
    })
  }
  
  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', () => {
      uploadedPhoto = null
      if (fileInput) fileInput.value = ''
      photoSuccess?.classList.add('hidden')
      showToast('Photo removed', 'info')
    })
  }
}

// Location services
function initializeLocationServices() {
  const locationBtn = document.getElementById('location-btn')
  const locationRequesting = document.getElementById('location-requesting')
  const locationSuccess = document.getElementById('location-success')
  const locationDenied = document.getElementById('location-denied')
  
  if (locationBtn) {
    locationBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        showToast('Geolocation is not supported by this browser', 'error')
        return
      }
      
      locationRequesting?.classList.remove('hidden')
      locationSuccess?.classList.add('hidden')
      locationDenied?.classList.add('hidden')
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          
          locationRequesting?.classList.add('hidden')
          locationSuccess?.classList.remove('hidden')
          showToast('Location captured successfully', 'success')
        },
        (error) => {
          locationRequesting?.classList.add('hidden')
          locationDenied?.classList.remove('hidden')
          showToast('Location access denied', 'error')
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    })
  }
}

// Form submission
async function handleFormSubmit(event: Event) {
  event.preventDefault()
  
  const form = event.target as HTMLFormElement
  const formData = new FormData(form)
  
  // Validation
  if (!uploadedPhoto) {
    showToast('Please upload a photo of your house', 'error')
    return
  }
  
  if (!currentLocation) {
    showToast('Please allow location access', 'error')
    return
  }
  
  const orderData: OrderFormData = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string || undefined,
    address: formData.get('address') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    zipCode: formData.get('zipCode') as string,
    housePhotoUrl: uploadedPhoto,
    locationLatitude: currentLocation.latitude,
    locationLongitude: currentLocation.longitude,
  }
  
  // Submit order
  const result = await submitOrder(orderData)
  
  if (!result.success) {
    showToast(result.error || 'Failed to submit order', 'error')
    return
  }
  
  // Show success modal
  const confirmationEmail = document.getElementById('confirmation-email')
  if (confirmationEmail) {
    confirmationEmail.textContent = orderData.email
  }
  
  const successModal = document.getElementById('success-modal')
  successModal?.classList.remove('hidden')
  
  // Reset form
  form.reset()
  uploadedPhoto = null
  currentLocation = null
  document.getElementById('photo-success')?.classList.add('hidden')
  document.getElementById('location-success')?.classList.add('hidden')
  
  showToast('Order submitted successfully!', 'success')
}

// Admin functionality
async function loadOrders() {
  const result = await getOrders()
  
  if (!result.success) {
    showToast(result.error || 'Failed to load orders', 'error')
    return
  }
  
  const orders = result.data || []
  const ordersList = document.getElementById('orders-list')
  
  if (!ordersList) return
  
  if (orders.length === 0) {
    ordersList.innerHTML = '<p class="no-orders">No orders found.</p>'
  } else {
    ordersList.innerHTML = ''
    orders.forEach(order => {
      const orderCard = document.createElement('div')
      orderCard.className = 'order-card'
      
      const createdDate = new Date(order.created_at).toLocaleDateString()
      const createdTime = new Date(order.created_at).toLocaleTimeString()
      
      orderCard.innerHTML = `
        <div class="order-header">
          <h4>Order #${order.id.slice(0, 8)}</h4>
          <span class="order-date">${createdDate} ${createdTime}</span>
        </div>
        <div class="order-details">
          <p><strong>Customer:</strong> ${order.first_name} ${order.last_name}</p>
          <p><strong>Email:</strong> ${order.email}</p>
          <p><strong>Phone:</strong> ${order.phone || 'Not provided'}</p>
          <p><strong>Address:</strong> ${order.address}, ${order.city}, ${order.state} ${order.zip_code}</p>
          ${order.location_latitude && order.location_longitude ? 
            `<p><strong>Location:</strong> ${parseFloat(order.location_latitude.toString()).toFixed(6)}, ${parseFloat(order.location_longitude.toString()).toFixed(6)}</p>` : 
            '<p><strong>Location:</strong> Not provided</p>'
          }
          ${order.house_photo_url ? '<p><strong>House Photo:</strong> Uploaded</p>' : '<p><strong>House Photo:</strong> Not provided</p>'}
        </div>
        ${order.house_photo_url ? `
          <div class="order-photo">
            <img src="${order.house_photo_url}" alt="House photo" style="max-width: 200px; max-height: 150px; object-fit: cover; border-radius: 4px;">
          </div>
        ` : ''}
      `
      ordersList.appendChild(orderCard)
    })
  }
}

function initializeAdminPanel() {
  const adminBtn = document.getElementById('admin-btn')
  const adminModal = document.getElementById('admin-modal')
  const closeAdminBtn = document.getElementById('close-admin')
  const adminLoginForm = document.getElementById('admin-login-form')
  const adminLogin = document.getElementById('admin-login')
  const adminDashboard = document.getElementById('admin-dashboard')
  const adminLogoutBtn = document.getElementById('admin-logout')
  
  if (adminBtn && adminModal) {
    adminBtn.addEventListener('click', () => {
      adminModal.classList.remove('hidden')
    })
  }
  
  if (closeAdminBtn && adminModal) {
    closeAdminBtn.addEventListener('click', () => {
      adminModal.classList.add('hidden')
    })
  }
  
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (event) => {
      event.preventDefault()
      
      const formData = new FormData(event.target as HTMLFormElement)
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      
      // Simple demo authentication
      if (email === 'aitrail92@gmail.com' && password === '909090') {
        adminLogin?.classList.add('hidden')
        adminDashboard?.classList.remove('hidden')
        loadOrders()
        showToast('Admin login successful', 'success')
      } else {
        showToast('Invalid credentials', 'error')
      }
    })
  }
  
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      adminLogin?.classList.remove('hidden')
      adminDashboard?.classList.add('hidden')
      
      // Reset form
      const form = adminLoginForm as HTMLFormElement
      if (form) form.reset()
    })
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons()
  }
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute('href')!)
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        })
      }
    })
  })
  
  // Header scroll effect
  const header = document.getElementById('header')
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled')
      } else {
        header.classList.remove('scrolled')
      }
    })
  }
  
  // CTA button clicks
  const ctaButtons = document.querySelectorAll('#header-cta, #order-now-btn')
  ctaButtons.forEach(button => {
    button.addEventListener('click', () => {
      const orderSection = document.getElementById('order-section')
      if (orderSection) {
        orderSection.scrollIntoView({ behavior: 'smooth' })
      }
    })
  })
  
  // Learn more button
  const learnMoreBtn = document.getElementById('learn-more-btn')
  if (learnMoreBtn) {
    learnMoreBtn.addEventListener('click', () => {
      const featuresSection = document.getElementById('features')
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' })
      }
    })
  }
  
  // Form submission
  const orderForm = document.getElementById('order-form')
  if (orderForm) {
    orderForm.addEventListener('submit', handleFormSubmit)
  }
  
  // Success modal close
  const closeSuccessBtn = document.getElementById('close-success')
  const successModal = document.getElementById('success-modal')
  if (closeSuccessBtn && successModal) {
    closeSuccessBtn.addEventListener('click', () => {
      successModal.classList.add('hidden')
    })
  }
  
  // Toast close
  const closeToastBtn = document.getElementById('close-toast')
  const toast = document.getElementById('toast')
  if (closeToastBtn && toast) {
    closeToastBtn.addEventListener('click', () => {
      toast.classList.add('hidden')
    })
  }
  
  // Initialize components
  initializePhotoUpload()
  initializeLocationServices()
  initializeAdminPanel()
})