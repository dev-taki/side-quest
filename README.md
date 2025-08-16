# Side Quest - Mobile PWA Authentication System

A modern Next.js Progressive Web App (PWA) with secure authentication and admin panel functionality, optimized for mobile devices.

## Features

### 📱 Mobile-First PWA
- **Progressive Web App**: Installable on mobile devices
- **Mobile-Optimized UI**: Touch-friendly interface with proper spacing
- **Offline Support**: Service worker for caching and offline functionality
- **App-like Experience**: Standalone mode with custom icons
- **Install Prompt**: Native install prompt for mobile devices

### 🔐 Authentication System
- **Signup**: Create new accounts with validation
- **Login**: Secure user authentication
- **Token-based**: JWT token storage in localStorage
- **Form Validation**: Custom validation for all fields
- **Error Handling**: Comprehensive error messages

### 🎨 Beautiful Mobile UI
- **Mobile-First Design**: Optimized for touch interactions
- **Purple Theme**: Primary color #8c52ff
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Beautiful iconography
- **Gradient Backgrounds**: Eye-catching visual appeal
- **Touch-Friendly**: Large buttons and proper spacing

### 🛡️ Security Features
- **Input Validation**: 
  - Name: Required field
  - Email: Required and valid email format
  - Password: Minimum 8 characters with letters
- **API Integration**: Secure communication with Xano backend
- **Route Protection**: Middleware-based route guards
- **Token Management**: Secure token storage and retrieval

### 📱 Mobile Navigation
- **Hamburger Menu**: Mobile-friendly navigation
- **Slide-out Sidebar**: Admin panel navigation
- **Touch Gestures**: Swipe-friendly interactions
- **Responsive Design**: Optimized for all screen sizes

## PWA Features

### Installation
- **Add to Home Screen**: Users can install the app on their devices
- **App Shortcuts**: Quick access to login and admin panel
- **Offline Functionality**: Basic offline support with service worker
- **App Icons**: Custom SVG icons for different sizes

### Mobile Optimizations
- **Viewport Meta**: Proper mobile viewport settings
- **Touch Targets**: Minimum 44px touch targets
- **Font Sizes**: Readable text sizes on mobile
- **Spacing**: Proper spacing for touch interactions

## API Endpoints

### Signup
```
POST https://xwqm-zvzg-uzfr.n7e.xano.io/api:X2pOe3_k/auth/signup
Content-Type: application/json

{
  "name": "side quest",
  "email": "admin@sidequestokc.com",
  "password": "Test123456@"
}
```

### Login
```
POST https://xwqm-zvzg-uzfr.n7e.xano.io/api:X2pOe3_k/auth/login
Content-Type: application/json

{
  "email": "sajjad@gmail.com",
  "password": "Test1234567@"
}
```

## Routes

### Public Routes
- `/` - Home page with authentication status
- `/signup` - User registration
- `/login` - User authentication

### Protected Routes
- `/admin` - Admin dashboard (requires authentication)

## Validation Rules

### Signup Form
- **Name**: Required field
- **Email**: Required, must be valid email format
- **Password**: Required, minimum 8 characters with letters

### Login Form
- **Email**: Required, must be valid email format
- **Password**: Required, minimum 8 characters with letters

## Error Handling

The application handles various error scenarios:

- **Duplicate Email**: "Duplicate record detected. Please check your input and try again."
- **Invalid Credentials**: Clear error messages for login failures
- **Validation Errors**: Real-time form validation with helpful messages
- **Network Errors**: Graceful handling of API connection issues

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:3000`

4. **Install PWA** (Mobile)
   - Open in mobile browser
   - Tap "Add to Home Screen" when prompted
   - Or use browser menu to install

## Project Structure

```
side-quest/
├── app/
│   ├── components/
│   │   ├── AuthForm.tsx          # Mobile-optimized auth form
│   │   └── PWAInstall.tsx        # PWA install prompt
│   ├── services/
│   │   └── authService.ts        # API service layer
│   ├── signup/
│   │   └── page.tsx              # Mobile signup page
│   ├── login/
│   │   └── page.tsx              # Mobile login page
│   ├── admin/
│   │   └── page.tsx              # Mobile admin dashboard
│   ├── layout.tsx                # PWA-enabled layout
│   ├── page.tsx                  # Mobile home page
│   └── globals.css               # Global styles
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   ├── icon-192x192.svg          # PWA icon
│   └── icon-512x512.svg          # PWA icon
├── middleware.ts                 # Route protection
├── package.json
└── README.md
```

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **PWA**: Progressive Web App features
- **Service Worker**: Offline functionality
- **Custom Validation**: Form validation without external libraries

## Mobile Features

### Touch Interactions
- **Large Buttons**: Minimum 44px touch targets
- **Proper Spacing**: Adequate spacing between interactive elements
- **Swipe Gestures**: Mobile-friendly navigation
- **Haptic Feedback**: Visual feedback for interactions

### Performance
- **Optimized Images**: SVG icons for better performance
- **Lazy Loading**: Efficient resource loading
- **Caching**: Service worker for offline support
- **Fast Loading**: Optimized for mobile networks

## Help & Support

The application includes comprehensive help sections:

- **Getting Started Guide**: For new users
- **Admin Access**: Information about admin privileges
- **Support Links**: Contact information and FAQ
- **Error Messages**: Clear guidance for common issues
- **Install Instructions**: PWA installation guide

## Security Considerations

- **Token Storage**: Secure localStorage usage
- **Input Sanitization**: Proper validation and sanitization
- **Route Protection**: Middleware-based authentication checks
- **Error Handling**: Secure error messages without information leakage
- **HTTPS**: Required for PWA functionality

## Future Enhancements

- **Push Notifications**: Real-time notifications
- **Background Sync**: Offline data synchronization
- **Advanced Caching**: Intelligent caching strategies
- **Biometric Auth**: Fingerprint/face recognition
- **Dark Mode**: Theme switching
- **Multi-language**: Internationalization support
- **Advanced Analytics**: User behavior tracking
- **A/B Testing**: Feature experimentation
