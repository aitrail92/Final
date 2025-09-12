// Import Supabase functions
import { saveCustomerOrder, getAllOrders } from './supabase.js';

// Global state
let currentLocation = null;
let uploadedPhoto = null;
let isAdminLoggedIn = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Set up event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Smooth scrolling for navigation
    document.getElementById('header-cta').addEventListener('click', () => {
        document.getElementById('order-section').scrollIntoView({ behavior: 'smooth' });
    });
    
    document.getElementById('order-now-btn').addEventListener('click', () => {
        document.getElementById('order-section').scrollIntoView({ behavior: 'smooth' });
    });
    
    document.getElementById('learn-more-btn').addEventListener('click', () => {
        document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
    });

    // Photo upload functionality
    const fileInput = document.getElementById('house-photo');
    const uploadBtn = document.getElementById('upload-btn');
    
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', handlePhotoUpload);
    
    document.getElementById('remove-photo').addEventListener('click', () => {
        resetUploadState();
    });

    // Location functionality
    document.getElementById('location-btn').addEventListener('click', requestLocation);

    // Modal functionality
    document.getElementById('admin-btn').addEventListener('click', () => {
        showModal('admin-modal');
    });
    
    document.getElementById('close-admin').addEventListener('click', () => {
        hideModal('admin-modal');
        resetAdminPanel();
    });
    
    document.getElementById('close-success').addEventListener('click', () => {
        hideModal('success-modal');
    });
    
    document.getElementById('close-toast').addEventListener('click', () => {
        hideToast();
    });
    
    // Admin logout
    document.getElementById('admin-logout').addEventListener('click', () => {
        resetAdminPanel();
    });
}

// Photo upload handler
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showToast('Please upload a valid image file (JPEG, PNG, WebP)');
        return;
    }
    
    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
        showToast('Image size must be less than 2MB');
        return;
    }
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedPhoto = e.target.result;
        showUploadSuccess();
    };
    reader.readAsDataURL(file);
}

function showUploadSuccess() {
    document.getElementById('upload-btn').classList.add('hidden');
    document.getElementById('photo-success').classList.remove('hidden');
}

function resetUploadState() {
    uploadedPhoto = null;
    document.getElementById('house-photo').value = '';
    document.getElementById('upload-btn').classList.remove('hidden');
    document.getElementById('photo-success').classList.add('hidden');
}

// Location functionality
function requestLocation() {
    const locationBtn = document.getElementById('location-btn');
    const requesting = document.getElementById('location-requesting');
    const success = document.getElementById('location-success');
    const denied = document.getElementById('location-denied');
    
    // Hide all status messages
    requesting.classList.add('hidden');
    success.classList.add('hidden');
    denied.classList.add('hidden');
    
    // Show requesting state
    locationBtn.classList.add('hidden');
    requesting.classList.remove('hidden');
    
    if (!navigator.geolocation) {
        showLocationDenied();
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            currentLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            showLocationSuccess();
        },
        (error) => {
            console.error('Geolocation error:', error);
            showLocationDenied();
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}

function showLocationSuccess() {
    document.getElementById('location-requesting').classList.add('hidden');
    document.getElementById('location-success').classList.remove('hidden');
}

function showLocationDenied() {
    document.getElementById('location-requesting').classList.add('hidden');
    document.getElementById('location-denied').classList.remove('hidden');
}

function resetLocationState() {
    currentLocation = null;
    document.getElementById('location-btn').classList.remove('hidden');
    document.getElementById('location-requesting').classList.add('hidden');
    document.getElementById('location-success').classList.add('hidden');
    document.getElementById('location-denied').classList.add('hidden');
}

// Modal functionality
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    document.body.style.overflow = '';
}

// Toast functionality
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideToast();
    }, 5000);
}

function hideToast() {
    document.getElementById('toast').classList.add('hidden');
}
    // Form submission handler
    document.getElementById('order-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = document.getElementById('submit-order');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.textContent = 'Processing...';
        submitButton.disabled = true;
        
        // Validate required fields
        if (!uploadedPhoto) {
            showToast('Please upload a photo of your house');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            return;
        }
        
        if (!currentLocation) {
            showToast('Please allow location access to complete your order');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            return;
        }
        
        try {
            // Get form data
            const formData = new FormData(this);
            const orderData = {
                first_name: formData.get('firstName'),
                last_name: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone') || null,
                address: formData.get('address'),
                city: formData.get('city'),
                state: formData.get('state'),
                zip_code: formData.get('zipCode'),
                house_photo_url: uploadedPhoto, // Store as base64 or URL
                location_latitude: currentLocation?.latitude || null,
                location_longitude: currentLocation?.longitude || null
            };
            
            // Save to Supabase
            const savedOrder = await saveCustomerOrder(orderData);
            console.log('Order saved successfully:', savedOrder);
            
            // Also save to localStorage as backup
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            orders.push({
                ...orderData,
                id: savedOrder.id,
                timestamp: savedOrder.created_at
            });
            localStorage.setItem('orders', JSON.stringify(orders));
            
            // Show success modal
            document.getElementById('confirmation-email').textContent = orderData.email;
            showModal('success-modal');
            
            // Reset form
            this.reset();
            resetUploadState();
            resetLocationState();
            
        } catch (error) {
            console.error('Error submitting order:', error);
            showToast('Failed to submit order. Please try again.');
        } finally {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });

    // Admin functionality
    document.getElementById('admin-login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        try {
            // Simple admin authentication (in production, use proper authentication)
            if (email === 'aitrail92@gmail.com' && password === '909090') {
                isAdminLoggedIn = true;
                await showAdminDashboard();
                // Clear login form
                document.getElementById('admin-login-form').reset();
            } else {
                showToast('Invalid admin credentials. Please try again.');
            }
        } catch (error) {
            console.error('Admin login error:', error);
            showToast('Login failed. Please try again.');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    async function showAdminDashboard() {
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        await loadOrders();
    }
    
    async function loadOrders() {
        const ordersList = document.getElementById('orders-list');
        
        // Show loading state
        ordersList.innerHTML = '<div class="loading-orders">Loading orders from database...</div>';
        
        try {
            // Load orders from Supabase
            const orders = await getAllOrders();
            console.log('Loaded orders from Supabase:', orders);
            
            if (orders.length === 0) {
                ordersList.innerHTML = `
                    <div class="no-orders">
                        <i data-lucide="inbox" class="no-orders-icon"></i>
                        <h3>No Orders Yet</h3>
                        <p>Customer orders will appear here once they start placing orders.</p>
                    </div>
                `;
                // Re-initialize icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
                return;
            }
            
            // Display orders from Supabase
            ordersList.innerHTML = orders.map((order, index) => `
                <div class="order-card">
                    <div class="order-header">
                        <div class="order-customer">
                            <h4>${order.first_name} ${order.last_name}</h4>
                            <span class="order-id">Order #${String(index + 1).padStart(3, '0')}</span>
                        </div>
                        <span class="order-date">${new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</span>
                    </div>
                    <div class="order-details">
                        <div class="order-contact">
                            <p><i data-lucide="mail" class="detail-icon"></i> ${order.email}</p>
                            ${order.phone ? `<p><i data-lucide="phone" class="detail-icon"></i> ${order.phone}</p>` : ''}
                        </div>
                        <div class="order-address">
                            <p><i data-lucide="map-pin" class="detail-icon"></i> ${order.address}</p>
                            <p class="address-line">${order.city}, ${order.state} ${order.zip_code}</p>
                        </div>
                        ${order.location_latitude && order.location_longitude ? 
                            `<div class="order-location">
                                <p><i data-lucide="navigation" class="detail-icon"></i> GPS: ${Number(order.location_latitude).toFixed(6)}, ${Number(order.location_longitude).toFixed(6)}</p>
                                <a href="https://maps.google.com/?q=${order.location_latitude},${order.location_longitude}" target="_blank" class="maps-link">
                                    <i data-lucide="external-link" class="detail-icon"></i> View on Maps
                                </a>
                            </div>` : 
                            ''
                        }
                        ${order.house_photo_url ? 
                            `<div class="order-photo">
                                <p><i data-lucide="camera" class="detail-icon"></i> House Photo:</p>
                                <img src="${order.house_photo_url}" alt="Customer's house" class="house-photo" onclick="openPhotoModal('${order.house_photo_url}')">
                            </div>` : 
                            ''
                        }
                    </div>
                </div>
            `).join('');
            
            // Re-initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
        } catch (error) {
            console.error('Error loading orders from Supabase:', error);
            showToast('Failed to load orders from database');
            
            // Show error state
            ordersList.innerHTML = `
                <div class="error-orders">
                    <i data-lucide="alert-circle" class="error-icon"></i>
                    <h3>Failed to Load Orders</h3>
                    <p>Unable to connect to the database. Please check your connection and try again.</p>
                    <button onclick="loadOrders()" class="btn btn-outline">
                        <i data-lucide="refresh-cw" class="icon-sm"></i>
                        Retry
                    </button>
                </div>
            `;
            
            // Re-initialize icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }
    

    function resetAdminPanel() {
        isAdminLoggedIn = false;
        document.getElementById('admin-login').classList.remove('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
        document.getElementById('admin-login-form').reset();
    }
    
    // Photo modal functionality
    function openPhotoModal(photoUrl) {
        // Create modal if it doesn't exist
        let photoModal = document.getElementById('photo-modal');
        if (!photoModal) {
            photoModal = document.createElement('div');
            photoModal.id = 'photo-modal';
            photoModal.className = 'modal';
            photoModal.innerHTML = `
                <div class="modal-content photo-modal-content">
                    <button class="close-btn" onclick="closePhotoModal()">
                        <i data-lucide="x"></i>
                    </button>
                    <img id="modal-photo" src="" alt="House photo" class="modal-photo">
                </div>
            `;
            document.body.appendChild(photoModal);
        }
        
        document.getElementById('modal-photo').src = photoUrl;
        showModal('photo-modal');
        
        // Re-initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    // Make functions globally available
    window.openPhotoModal = openPhotoModal;
    window.closePhotoModal = function() {
        hideModal('photo-modal');
    };
    window.loadOrders = loadOrders;
    
    // Auto-refresh orders every 30 seconds when admin is logged in
    setInterval(() => {
        if (isAdminLoggedIn && !document.getElementById('admin-dashboard').classList.contains('hidden')) {
            loadOrders();
        }
    }, 30000);

// Make sure all functions are available globally for onclick handlers
window.showModal = showModal;
window.hideModal = hideModal;
window.showToast = showToast;
window.resetAdminPanel = resetAdminPanel;

// Initialize icons when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});