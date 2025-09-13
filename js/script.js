@@ .. @@
 // Global state
 let currentLocation = null;
 let uploadedPhoto = null;
+
// Initialize EmailJS
function initializeEmailJS() {
    // Replace 'YOUR_PUBLIC_KEY' with your actual EmailJS public key
    // Get this from your EmailJS dashboard at https://dashboard.emailjs.com/admin/account
    if (typeof emailjs !== 'undefined') {
        emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your actual public key
    }
+}
 
 // Utility functions
 function showToast(message, type = 'info') {
@@ .. @@
     }
 }
 
+// Convert file to base64
+function fileToBase64(file) {
+    return new Promise((resolve, reject) => {
+        const reader = new FileReader();
+        reader.readAsDataURL(file);
+        reader.onload = () => resolve(reader.result);
+        reader.onerror = error => reject(error);
+    });
+}
+
+// Submit order to Supabase
+async function submitOrderToSupabase(formData) {
+    if (!supabaseClient) {
+        // Fallback to localStorage if Supabase is not available
+        return submitOrderToLocalStorage(formData);
+    }
+
+    try {
+        const { error } = await supabaseClient
+            .from('customer_orders')
+            .insert({
+                first_name: formData.firstName,
+                last_name: formData.lastName,
+                email: formData.email,
+                phone: formData.phone || null,
+                address: formData.address,
+                city: formData.city,
+                state: formData.state,
+                zip_code: formData.zipCode,
+                house_photo_url: formData.housePhotoUrl || null,
+                location_latitude: formData.locationLatitude || null,
+                location_longitude: formData.locationLongitude || null,
+            });
+
+        if (error) {
+            console.error('Error submitting order:', error);
+            return { success: false, error: error.message };
+        }
+
+        return { success: true };
+    } catch (error) {
+        console.error('Error submitting order:', error);
+        return { success: false, error: 'Failed to submit order' };
+    }
+}
+
+// Fallback to localStorage
+function submitOrderToLocalStorage(formData) {
+    try {
+        const orders = JSON.parse(localStorage.getItem('audiomax_orders') || '[]');
+        const newOrder = {
+            id: Date.now().toString(),
+            ...formData,
+            created_at: new Date().toISOString(),
+            updated_at: new Date().toISOString()
+        };
+        orders.push(newOrder);
+        localStorage.setItem('audiomax_orders', JSON.stringify(orders));
+        return { success: true };
+    } catch (error) {
+        console.error('Error saving to localStorage:', error);
+        return { success: false, error: 'Failed to save order' };
+    }
+}
+
+// Get orders from Supabase
+async function getOrdersFromSupabase() {
+    if (!supabaseClient) {
+        // Fallback to localStorage if Supabase is not available
+        return getOrdersFromLocalStorage();
+    }
+
+    try {
+        const { data, error } = await supabaseClient
+            .from('customer_orders')
+            .select('*')
+            .order('created_at', { ascending: false });
+
+        if (error) {
+            console.error('Error fetching orders:', error);
+            return { success: false, error: error.message };
+        }
+
+        return { success: true, data: data || [] };
+    } catch (error) {
+        console.error('Error fetching orders:', error);
+        return { success: false, error: 'Failed to fetch orders' };
+    }
+}
+
+// Fallback to localStorage
+function getOrdersFromLocalStorage() {
+    try {
+        const orders = JSON.parse(localStorage.getItem('audiomax_orders') || '[]');
+        return { success: true, data: orders };
+    } catch (error) {
+        console.error('Error loading from localStorage:', error);
+        return { success: false, error: 'Failed to load orders' };
+    }
+}
+
 // Photo upload functionality
 function initializePhotoUpload() {
@@ .. @@
         if (file && file.size <= 2 * 1024 * 1024) { // 2MB limit
-            uploadedPhoto = file;
+            // Convert file to base64 for storage
+            uploadedPhoto = await fileToBase64(file);
             
             document.getElementById('photo-success').classList.remove('hidden');
@@ .. @@
 
 // Form submission
-function handleFormSubmit(event) {
+async function handleFormSubmit(event) {
     event.preventDefault();
     
     const formData = new FormData(event.target);
@@ .. @@
         return;
     }
     
-    const orderData = {
-        id: Date.now().toString(),
+    const orderData = {
         firstName: formData.get('firstName'),
         lastName: formData.get('lastName'),
         email: formData.get('email'),
@@ .. @@
         state: formData.get('state'),
         zipCode: formData.get('zipCode'),
-        housePhoto: uploadedPhoto,
+        housePhotoUrl: uploadedPhoto,
         locationLatitude: currentLocation?.latitude,
         locationLongitude: currentLocation?.longitude,
-        createdAt: new Date().toISOString()
     };
     
-    // Save to localStorage (in a real app, this would be sent to a server)
-    const orders = JSON.parse(localStorage.getItem('audiomax_orders') || '[]');
-    orders.push(orderData);
-    localStorage.setItem('audiomax_orders', JSON.stringify(orders));
+    // Submit order to Supabase
+    const result = await submitOrderToSupabase(orderData);
+    
+    if (!result.success) {
+        showToast(result.error || 'Failed to submit order', 'error');
+        return;
+    }
     
     // Show success modal
     document.getElementById('confirmation-email').textContent = orderData.email;
@@ .. @@
 }
 
 // Admin functionality
-function loadOrders() {
-    const orders = JSON.parse(localStorage.getItem('audiomax_orders') || '[]');
+async function loadOrders() {
+    const result = await getOrdersFromSupabase();
+    
+    if (!result.success) {
+        showToast(result.error || 'Failed to load orders', 'error');
+        return;
+    }
+    
+    const orders = result.data || [];
     const ordersList = document.getElementById('orders-list');
     
     if (orders.length === 0) {
@@ .. @@
         orders.forEach(order => {
             const orderCard = document.createElement('div');
             orderCard.className = 'order-card';
+            
+            const createdDate = new Date(order.created_at).toLocaleDateString();
+            const createdTime = new Date(order.created_at).toLocaleTimeString();
+            
             orderCard.innerHTML = `
                 <div class="order-header">
-                    <h4>Order #${order.id}</h4>
-                    <span class="order-date">${new Date(order.createdAt).toLocaleDateString()}</span>
+                    <h4>Order #${order.id.slice(0, 8)}</h4>
+                    <span class="order-date">${createdDate} ${createdTime}</span>
                 </div>
                 <div class="order-details">
-                    <p><strong>Customer:</strong> ${order.firstName} ${order.lastName}</p>
+                    <p><strong>Customer:</strong> ${order.first_name} ${order.last_name}</p>
                     <p><strong>Email:</strong> ${order.email}</p>
-                    <p><strong>Phone:</strong> ${order.phone || 'Not provided'}</p>
-                    <p><strong>Address:</strong> ${order.address}, ${order.city}, ${order.state} ${order.zipCode}</p>
-                    ${order.locationLatitude && order.locationLongitude ? 
-                        `<p><strong>Location:</strong> ${order.locationLatitude.toFixed(6)}, ${order.locationLongitude.toFixed(6)}</p>` : 
+                    <p><strong>Phone:</strong> ${order.phone || 'Not provided'}</p>
+                    <p><strong>Address:</strong> ${order.address}, ${order.city}, ${order.state} ${order.zip_code}</p>
+                    ${order.location_latitude && order.location_longitude ? 
+                        `<p><strong>Location:</strong> ${parseFloat(order.location_latitude).toFixed(6)}, ${parseFloat(order.location_longitude).toFixed(6)}</p>` : 
                         '<p><strong>Location:</strong> Not provided</p>'
                     }
-                    ${order.housePhoto ? '<p><strong>House Photo:</strong> Uploaded</p>' : '<p><strong>House Photo:</strong> Not provided</p>'}
+                    ${order.house_photo_url ? '<p><strong>House Photo:</strong> Uploaded</p>' : '<p><strong>House Photo:</strong> Not provided</p>'}
                 </div>
-                ${order.housePhoto ? `
+                ${order.house_photo_url ? `
                     <div class="order-photo">
-                        <img src="${URL.createObjectURL(order.housePhoto)}" alt="House photo" style="max-width: 200px; max-height: 150px; object-fit: cover; border-radius: 4px;">
+                        <img src="${order.house_photo_url}" alt="House photo" style="max-width: 200px; max-height: 150px; object-fit: cover; border-radius: 4px;">
                     </div>
                 ` : ''}
             `;
@@ .. @@
 // Initialize everything when DOM is loaded
 document.addEventListener('DOMContentLoaded', function() {
    // Initialize EmailJS
    initializeEmailJS();
+    
     // Initialize Lucide icons
     if (typeof lucide !== 'undefined') {
         lucide.createIcons();
@@ .. @@
     initializePhotoUpload();
     initializeLocationServices();
     initializeAdminPanel();
-});
+});