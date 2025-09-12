@@ .. @@
+// Import Supabase functions
+import { saveCustomerOrder, getAllOrders } from './supabase.js';
+
 // Global state
 let currentLocation = null;
 let uploadedPhoto = null;
@@ .. @@
     // Form submission handler
     document.getElementById('order-form').addEventListener('submit', async function(e) {
         e.preventDefault();
         
+        const submitButton = document.getElementById('submit-order');
+        const originalText = submitButton.textContent;
+        
+        // Show loading state
+        submitButton.textContent = 'Processing...';
+        submitButton.disabled = true;
+        
         // Validate required fields
         if (!uploadedPhoto) {
             showToast('Please upload a photo of your house');
+            submitButton.textContent = originalText;
+            submitButton.disabled = false;
             return;
         }
         
         if (!currentLocation) {
             showToast('Please allow location access to complete your order');
+            submitButton.textContent = originalText;
+            submitButton.disabled = false;
             return;
         }
         
-        // Get form data
-        const formData = new FormData(this);
-        const orderData = {
-            firstName: formData.get('firstName'),
-            lastName: formData.get('lastName'),
-            email: formData.get('email'),
-            phone: formData.get('phone'),
-            address: formData.get('address'),
-            city: formData.get('city'),
-            state: formData.get('state'),
-            zipCode: formData.get('zipCode'),
-            photo: uploadedPhoto,
-            location: currentLocation,
-            timestamp: new Date().toISOString()
-        };
-        
-        // Save to localStorage (in a real app, this would be sent to a server)
-        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
-        orders.push(orderData);
-        localStorage.setItem('orders', JSON.stringify(orders));
-        
-        // Show success modal
-        document.getElementById('confirmation-email').textContent = orderData.email;
-        showModal('success-modal');
-        
-        // Reset form
-        this.reset();
-        resetUploadState();
-        resetLocationState();
+        try {
+            // Get form data
+            const formData = new FormData(this);
+            const orderData = {
+                first_name: formData.get('firstName'),
+                last_name: formData.get('lastName'),
+                email: formData.get('email'),
+                phone: formData.get('phone') || null,
+                address: formData.get('address'),
+                city: formData.get('city'),
+                state: formData.get('state'),
+                zip_code: formData.get('zipCode'),
+                house_photo_url: uploadedPhoto, // Store as base64 or URL
+                location_latitude: currentLocation?.latitude || null,
+                location_longitude: currentLocation?.longitude || null
+            };
+            
+            // Save to Supabase
+            const savedOrder = await saveCustomerOrder(orderData);
+            console.log('Order saved successfully:', savedOrder);
+            
+            // Also save to localStorage as backup
+            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
+            orders.push({
+                ...orderData,
+                id: savedOrder.id,
+                timestamp: savedOrder.created_at
+            });
+            localStorage.setItem('orders', JSON.stringify(orders));
+            
+            // Show success modal
+            document.getElementById('confirmation-email').textContent = orderData.email;
+            showModal('success-modal');
+            
+            // Reset form
+            this.reset();
+            resetUploadState();
+            resetLocationState();
+            
+        } catch (error) {
+            console.error('Error submitting order:', error);
+            showToast('Failed to submit order. Please try again.');
+        } finally {
+            // Reset button state
+            submitButton.textContent = originalText;
+            submitButton.disabled = false;
+        }
     });
@@ .. @@
     // Admin functionality
     document.getElementById('admin-login-form').addEventListener('submit', async function(e) {
         e.preventDefault();
         
         const email = document.getElementById('admin-email').value;
         const password = document.getElementById('admin-password').value;
         
         // Simple admin authentication (in production, use proper authentication)
         if (email === 'aitrail92@gmail.com' && password === '909090') {
-            showAdminDashboard();
+            await showAdminDashboard();
         } else {
             showToast('Invalid credentials');
         }
     });
@@ .. @@
-    function showAdminDashboard() {
+    async function showAdminDashboard() {
         document.getElementById('admin-login').classList.add('hidden');
         document.getElementById('admin-dashboard').classList.remove('hidden');
-        loadOrders();
+        await loadOrders();
     }
     
-    function loadOrders() {
+    async function loadOrders() {
         const ordersList = document.getElementById('orders-list');
-        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
         
-        if (orders.length === 0) {
+        try {
+            // Try to load from Supabase first
+            const orders = await getAllOrders();
+            
+            if (orders.length === 0) {
+                ordersList.innerHTML = '<p class="no-orders">No orders found.</p>';
+                return;
+            }
+            
+            ordersList.innerHTML = orders.map(order => `
+                <div class="order-card">
+                    <div class="order-header">
+                        <h4>${order.first_name} ${order.last_name}</h4>
+                        <span class="order-date">${new Date(order.created_at).toLocaleDateString()}</span>
+                    </div>
+                    <div class="order-details">
+                        <p><strong>Email:</strong> ${order.email}</p>
+                        ${order.phone ? `<p><strong>Phone:</strong> ${order.phone}</p>` : ''}
+                        <p><strong>Address:</strong> ${order.address}, ${order.city}, ${order.state} ${order.zip_code}</p>
+                        ${order.location_latitude && order.location_longitude ? 
+                            `<p><strong>Location:</strong> ${order.location_latitude.toFixed(6)}, ${order.location_longitude.toFixed(6)}</p>` : 
+                            ''
+                        }
+                        ${order.house_photo_url ? 
+                            `<div class="order-photo">
+                                <strong>House Photo:</strong><br>
+                                <img src="${order.house_photo_url}" alt="House photo" style="max-width: 200px; max-height: 150px; border-radius: 4px; margin-top: 8px;">
+                            </div>` : 
+                            ''
+                        }
+                    </div>
+                </div>
+            `).join('');
+            
+        } catch (error) {
+            console.error('Error loading orders from Supabase:', error);
+            
+            // Fallback to localStorage
+            const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
+            
+            if (localOrders.length === 0) {
+                ordersList.innerHTML = '<p class="no-orders">No orders found.</p>';
+                return;
+            }
+            
+            ordersList.innerHTML = localOrders.map(order => `
+                <div class="order-card">
+                    <div class="order-header">
+                        <h4>${order.firstName || order.first_name} ${order.lastName || order.last_name}</h4>
+                        <span class="order-date">${new Date(order.timestamp || order.created_at).toLocaleDateString()}</span>
+                    </div>
+                    <div class="order-details">
+                        <p><strong>Email:</strong> ${order.email}</p>
+                        ${order.phone ? `<p><strong>Phone:</strong> ${order.phone}</p>` : ''}
+                        <p><strong>Address:</strong> ${order.address}, ${order.city}, ${order.state} ${order.zipCode || order.zip_code}</p>
+                        ${order.location ? 
+                            `<p><strong>Location:</strong> ${order.location.latitude.toFixed(6)}, ${order.location.longitude.toFixed(6)}</p>` : 
+                            ''
+                        }
+                        ${order.photo || order.house_photo_url ? 
+                            `<div class="order-photo">
+                                <strong>House Photo:</strong><br>
+                                <img src="${order.photo || order.house_photo_url}" alt="House photo" style="max-width: 200px; max-height: 150px; border-radius: 4px; margin-top: 8px;">
+                            </div>` : 
+                            ''
+                        }
+                    </div>
+                </div>
+            `).join('');
+        }
+    }
+    
+    // Legacy loadOrders function for localStorage fallback
+    function loadOrdersFromLocalStorage() {
+        const ordersList = document.getElementById('orders-list');
+        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
+        
+        if (orders.length === 0) {
             ordersList.innerHTML = '<p class="no-orders">No orders found.</p>';
             return;
         }
@@ .. @@
         ordersList.innerHTML = orders.map(order => `
             <div class="order-card">
                 <div class="order-header">
-                    <h4>${order.firstName} ${order.lastName}</h4>
+                    <h4>${order.firstName || order.first_name} ${order.lastName || order.last_name}</h4>
                     <span class="order-date">${new Date(order.timestamp).toLocaleDateString()}</span>
                 </div>
                 <div class="order-details">
                     <p><strong>Email:</strong> ${order.email}</p>
                     ${order.phone ? `<p><strong>Phone:</strong> ${order.phone}</p>` : ''}
-                    <p><strong>Address:</strong> ${order.address}, ${order.city}, ${order.state} ${order.zipCode}</p>
+                    <p><strong>Address:</strong> ${order.address}, ${order.city}, ${order.state} ${order.zipCode || order.zip_code}</p>
                     ${order.location ? 
                         `<p><strong>Location:</strong> ${order.location.latitude.toFixed(6)}, ${order.location.longitude.toFixed(6)}</p>` : 
                         ''
                     }
-                    ${order.photo ? 
+                    ${order.photo || order.house_photo_url ? 
                         `<div class="order-photo">
                             <strong>House Photo:</strong><br>
-                            <img src="${order.photo}" alt="House photo" style="max-width: 200px; max-height: 150px; border-radius: 4px; margin-top: 8px;">
+                            <img src="${order.photo || order.house_photo_url}" alt="House photo" style="max-width: 200px; max-height: 150px; border-radius: 4px; margin-top: 8px;">
                         </div>` : 
                         ''
                     }
@@ .. @@
         }).join('');
     }