// Authentication handler with MongoDB backend API

// Check if user is already logged in
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    return (token && user) ? JSON.parse(user) : null;
}

// Protected page check - redirect to login if not authenticated
function requireAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        // Store the current page URL to redirect back after login
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/html/login.html';
        return false;
    }
    return true;
}

// Display message helpers
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
    if (successDiv) {
        successDiv.style.display = 'none';
    }
}

function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
    }
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function hideMessages() {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
}

// Handle Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessages();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store auth token and user info
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify({
                    id: data.user.id,
                    username: data.user.username,
                    email: data.user.email,
                    name: data.user.username // Use username as display name
                }));
                
                showSuccess('Login successful! Redirecting...');
                
                // Redirect to intended page or dashboard after 1 second
                setTimeout(() => {
                    const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
                    sessionStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirectUrl || '/html/dashboard.html';
                }, 1000);
            } else {
                showError(data.error || 'Invalid credentials. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Failed to connect to server. Please try again.');
        }
    });
}

// Handle Signup
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessages();

        const username = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (password !== confirmPassword) {
            showError('Passwords do not match!');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters long.');
            return;
        }

        try {
            const response = await fetch('/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess('Account created successfully! Redirecting to login...');
                
                // Redirect to login after 1.5 seconds
                setTimeout(() => {
                    window.location.href = '/html/login.html';
                }, 1500);
            } else {
                showError(data.error || 'Failed to create account. Please try again.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            showError('Failed to connect to server. Please try again.');
        }
    });
}

// Handle Logout
async function logout() {
    const token = localStorage.getItem('authToken');
    
    if (token) {
        try {
            // Call backend logout endpoint
            await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('redirectAfterLogin');
    
    // Redirect to login
    window.location.href = '/html/login.html';
}

// Update navbar if user is logged in
function updateNavbar() {
    const user = checkAuth();
    const navLinks = document.querySelector('.nav-links');
    
    if (user && navLinks) {
        // On dashboard (protected page) - show welcome message
        if (window.location.pathname.includes('dashboard.html')) {
            // Check if welcome message already exists
            const existingWelcome = navLinks.querySelector('.user-welcome');
            if (!existingWelcome) {
                const userInfo = document.createElement('li');
                userInfo.className = 'user-welcome';
                userInfo.innerHTML = `<span style="color: #4a5568; font-weight: 500;">Welcome, ${user.name}!</span>`;
                navLinks.appendChild(userInfo);
            }
        } else {
            // On landing page - remove login/signup, show welcome and logout
            const loginLink = navLinks.querySelector('a[href="/html/login.html"], a[href="login.html"]');
            const signupLink = navLinks.querySelector('a[href="/html/signup.html"], a[href="signup.html"]');
            
            if (loginLink) loginLink.parentElement.remove();
            if (signupLink) signupLink.parentElement.remove();
            
            // Add welcome message and logout if not already present
            const existingWelcome = navLinks.querySelector('.user-welcome');
            if (!existingWelcome) {
                const userInfo = document.createElement('li');
                userInfo.className = 'user-welcome';
                userInfo.innerHTML = `<span style="color: #4a5568; font-weight: 500;">Welcome, ${user.name}!</span>`;
                navLinks.appendChild(userInfo);
                
                const logoutBtn = document.createElement('li');
                logoutBtn.innerHTML = `<a href="#" onclick="logout(); return false;" style="color: #e53e3e;">Logout</a>`;
                navLinks.appendChild(logoutBtn);
            }
        }
    } else if (!user && navLinks) {
        // If not logged in, remove dashboard link from landing page
        if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
            const dashboardLink = navLinks.querySelector('a[href="/html/dashboard.html"], a[href="dashboard.html"]');
            if (dashboardLink) dashboardLink.parentElement.remove();
        }
    }
}

// Initialize navbar on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});
