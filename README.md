# LockBox - Secure Password Manager

LockBox is a secure password manager application that allows users to store, manage, and access their passwords in one place. The application is built with React for the frontend and PHP for the backend, with MySQL as the database.

## Features

- User authentication (login, register, forgot password)
- Secure password storage
- Password generator with customizable options
- Dark mode support
- Search functionality for passwords
- Copy passwords to clipboard
- Responsive design for all devices

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Axios for API requests
- Tailwind CSS for styling
- React Icons for icons
- React Hot Toast for notifications

### Backend
- PHP
- MySQL database
- PHPMailer for email functionality

## Project Structure

```
php_project/
├── Lock Box/              # PHP Backend
│   ├── LockBox.php        # Main API endpoint
│   ├── conn.php           # Database connection
│   ├── libraryx.php       # Utility functions
│   └── PHPMailer-master/  # Email library
├── public/                # Public assets
├── src/                   # React frontend
│   ├── components/        # React components
│   │   ├── AddPassword.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── Login.jsx
│   ├── services/          # API services
│   │   └── api.js         # API client
│   ├── App.jsx            # Main application component
│   └── index.js           # Entry point
└── package.json           # Dependencies
```

## Setup Instructions

### Prerequisites
- Node.js and npm
- PHP 7.4 or higher
- MySQL database
- XAMPP, WAMP, or similar local server

### Database Setup
1. Create a MySQL database
2. Import the `drishtiprabha.sql` file from the `Lock Box` directory
3. Update the database connection details in `Lock Box/conn.php`

### Backend Setup
1. Place the `Lock Box` directory in your web server's document root (e.g., `htdocs` for XAMPP)
2. Configure your web server to serve the PHP files

### Frontend Setup
1. Install dependencies:
   ```
   npm install
   ```
2. Start the development server:
   ```
   npm start
   ```
3. The application will be available at `http://localhost:3000`

## API Endpoints

The backend provides the following API endpoints:

- `validate`: Authenticate a user
- `add_user`: Register a new user
- `send_mail_otp`: Send password reset OTP
- `add_pass`: Add a new password
- `get_pass`: Retrieve all passwords for a user

## Security Considerations

- Passwords are stored in the database (in a real-world application, they should be encrypted)
- API key authentication is implemented
- Form validation is performed on both client and server sides
- HTTPS should be used in production

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- PHPMailer for email functionality
- React and the React community for the frontend framework
- Tailwind CSS for the styling framework 