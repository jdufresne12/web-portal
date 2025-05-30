# Axis Sponsor Portal

A Next.js web application for managing sponsor and advertiser content in the Axis mobile application. Built for Axis employees and administrators to create, edit, and manage sponsor entries with associated media assets.

## Features

- **Sponsor Management** - Create and manage four types of sponsors (Title, Hot Flash, Redeem Shop, Star Store)
- **Media Upload** - Upload and validate images/videos with automatic S3 storage
- **Google Authentication** - Secure login using Google OAuth
- **Real-time Sync** - Automatic synchronization with mobile application
- **Form Validation** - Comprehensive validation for all sponsor data
- **Responsive Design** - Modern dark theme with mobile-friendly interface

## Tech Stack

- **Frontend**: React 19, Next.js 15, TypeScript, Tailwind CSS 4
- **Authentication**: Firebase Auth with Google OAuth
- **Backend**: Swift Vapor API, PostgreSQL Database
- **Storage**: AWS S3 for media assets
- **State Management**: React Context API

## Prerequisites

- Node.js 18+ and npm
- Google Cloud Platform account (for OAuth)
- AWS account (for S3 storage)
- Access to Axis backend API

## Getting Started

### 1. Clone the repository

```bash
git clone [repository-url]
cd axis-sponsor-portal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Contact the development team for a `.env` file. Place this file inside the root directory of the project

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/
│   ├── api/                 # Next.js API routes (proxy layer)
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React Context providers
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── [id]/               # Dynamic edit pages
│   ├── add-sponsor/        # Add sponsor page
│   └── login/              # Authentication page
├── lib/
│   ├── api/                # API client functions
│   └── config/             # Configuration files
└── middleware.ts           # Authentication middleware
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Authentication

The application uses Google OAuth for authentication. Users must have:

- A Google account registered in the Axis mobile application
- Appropriate permissions to access the sponsor portal

## Data Types

The application manages four sponsor/advertiser types:

- **Title** - Main sponsor entries (uses `sponsors` table)
- **Hot Flash** - Time-limited promotions (uses `sponsors` table)
- **Redeem Shop** - Point redemption products (uses `products` table)
- **Star Store** - Level-restricted products (uses `products` table)

## Media Requirements

### Images

- **Format**: JPEG only
- **Aspect Ratios**: 16:9 or 9:16 (depending on section)
- **Minimum Resolution**: 1000x562px (16:9) or 563x1000px (9:16)

### Videos

- **Format**: MP4, MOV
- **Aspect Ratios**: 16:9 or 9:16
- **Minimum Resolution**: 640x480px

## API Integration

The application uses a proxy pattern where Next.js API routes forward requests to the Swift Vapor backend. All API calls are authenticated using HTTP-only cookies.

## Deployment

### Environment Variables

Ensure all environment variables are configured in your deployment environment.

### Build Process

```bash
npm run build
npm run start
```

### Production Considerations

- Configure CORS for backend API
- Set up proper S3 bucket policies
- Ensure SSL certificates are installed
- Configure Firebase project for production domain

## Troubleshooting

### Common Issues

**Authentication Loops**

- Verify Firebase configuration
- Check cookie settings and domain configuration

**Media Upload Failures**

- Confirm S3 credentials and bucket permissions
- Verify file format and size requirements

**API Connection Issues**

- Check backend API URL and accessibility
- Verify authentication token configuration

## Contributing

1. Follow TypeScript strict mode requirements
2. Use ESLint for code formatting
3. Test all form validations thoroughly
4. Ensure responsive design compatibility

## Support

For technical issues or questions about the Axis Sponsor Portal, contact the development team or refer to the comprehensive technical documentation.

---

**Note**: This application is for internal Axis use only and requires proper authentication and authorization to access.
