# AudioMax Pro - Premium Speaker Sales Platform

## Overview

AudioMax Pro is a premium speaker e-commerce application designed as a single-page landing site with a clean, modern aesthetic inspired by Apple's product pages and Shopify's single-product layouts. The application features a sleek black and orange color scheme, showcasing a premium wireless Bluetooth speaker with comprehensive product presentation, customer order forms, and administrative capabilities. The system is built to handle both static deployment and full-stack functionality with React/Express architecture.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and component-based development
- **Routing**: Wouter for lightweight client-side routing with single-page application structure
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **Component System**: Shadcn/ui built on Radix UI primitives providing accessible, customizable components
- **Styling**: Tailwind CSS with custom design system implementing brand guidelines (deep black #1A1A1A primary, vibrant orange #FF6B35 accent)
- **Build System**: Vite for fast development experience and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **API Design**: RESTful endpoints for order management and admin authentication
- **Data Storage**: In-memory Map-based storage for development with Drizzle ORM configuration for PostgreSQL production
- **Authentication**: JWT-based admin authentication with HTTP-only cookies for security
- **File Handling**: Multer middleware for photo upload functionality with local storage

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Schema**: Customer orders table with comprehensive fields including contact information, delivery address, optional photo uploads, and geolocation data
- **Validation**: Zod schemas for runtime validation and TypeScript type inference across frontend and backend
- **Migrations**: Drizzle-kit for database schema management and version control

### Design System Implementation
- **Color Palette**: Primary deep black (#1A1A1A), secondary vibrant orange (#FF6B35), with neutral backgrounds for clean product presentation
- **Typography**: Inter font family with proper hierarchy and responsive scaling
- **Layout System**: 20px base spacing with Tailwind's spacing scale for consistent visual rhythm
- **Component Theming**: CSS custom properties supporting light/dark mode themes

### Product Presentation Strategy
- **Hero Section**: Large product imagery with compelling copy, clear pricing display, and prominent call-to-action
- **Feature Showcase**: Grid-based feature cards highlighting technical specifications and benefits
- **Product Gallery**: Multiple product angles with hover effects and detailed descriptions
- **Order Form**: Streamlined checkout process with form validation, photo upload, and location services

### Static Deployment Capability
- **Conversion Strategy**: Static HTML/CSS/JS version available for deployment on GitHub Pages, Netlify, or Vercel
- **Functionality Simulation**: JavaScript implementation replicating React functionality for order forms, admin panel, and interactive features
- **Asset Management**: Optimized images and consistent styling across static and dynamic versions

## External Dependencies

### Frontend Libraries
- **@tanstack/react-query**: Server state management and API caching
- **wouter**: Lightweight routing for single-page application navigation
- **@radix-ui/***: Accessible component primitives for UI elements
- **lucide-react**: Icon library for consistent iconography
- **class-variance-authority**: Component variant management
- **tailwind-merge**: Utility class merging and optimization

### Backend Services
- **@neondatabase/serverless**: PostgreSQL database connection for production deployment
- **jsonwebtoken**: JWT token generation and verification for admin authentication
- **cookie-parser**: HTTP cookie parsing middleware
- **multer**: File upload handling for photo submissions

### Development Tools
- **Vite**: Build tool and development server with hot module replacement
- **TypeScript**: Type safety across the entire application stack
- **Drizzle-kit**: Database migration and schema management
- **esbuild**: Fast JavaScript bundling for production builds

### Static Deployment Resources
- **Google Fonts API**: Inter font family loading
- **Lucide CDN**: Icon library for static version
- **Modern browser APIs**: Geolocation, File API, and Fetch for enhanced functionality