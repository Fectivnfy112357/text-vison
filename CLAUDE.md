# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TextVision is a cloud-based AI content generation platform built on Volcano Engine's large models, supporting both image and video generation with a microservices architecture.

### Architecture
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand (state management)
- **Backend**: Spring Boot 2.7.x + MyBatis-Plus + MySQL 8.0 + JWT authentication
- **AI Models**: Doubao Seedream 3.0 (image) + Seedance 1.0 Lite (video)
- **Deployment**: Docker-ready with health checks and monitoring

## Quick Start Commands

### Environment Setup
```bash
# Install MySQL 8.0+ and create database
create database text_vision default character set utf8mb4 collate utf8mb4_unicode_ci;

# Install dependencies (run from project root)
cd front && npm install
cd ../back && mvn clean install
```

### Development
```bash
# Terminal 1: Backend
mvn spring-boot:run  # http://localhost:8999

# Terminal 2: Frontend
cd front && npm run dev  # http://localhost:5173

# Testing
npm run check        # TypeScript type checking
npm run lint         # ESLint code style
mvn test             # Backend unit tests
```

### Production Build
```bash
# Frontend
cd front && npm run build  # Outputs to dist/

# Backend
mvn clean package -DskipTests  # Creates text-vision-backend-1.0.0.jar
java -jar target/text-vision-backend-1.0.0.jar
```

## Core Architecture Patterns

### Backend Layer Architecture
```
com.textvision/
├── common/          # Shared utilities (pagination, response wrappers)
├── config/          # Spring configuration (MyBatis, Swagger, Web)
├── controller/      # REST APIs (User, Template, Content, ArtStyle)
├── dto/            # Request/Response DTOs
├── entity/         # JPA entities with MyBatis-Plus annotations
├── exception/      # Global exception handling with @ControllerAdvice
├── interceptor/    # JWT authentication via HandlerInterceptor
├── mapper/         # MyBatis XML mappers for complex queries
├── service/        
│   ├── impl/       # Service implementations with @Service
│   └── VolcanoApiService.java  # External AI service integration
└── util/           # JWT, password encryption, HTTP utilities
```

### Frontend Component Architecture
```
src/
├── components/      # Reusable UI components
│   ├── generate/   # Content generation components
│   ├── history/    # History management components
│   └── ui/         # Base UI primitives
├── pages/          # Route-based page components
├── store/          # Zustand stores (auth, templates, content)
├── lib/            # API client and utilities
└── hooks/          # Custom React hooks
```

## API Design Patterns

### Authentication Flow
- JWT tokens stored in localStorage
- Automatic token injection via request interceptor
- 401 handling with automatic logout

### Response Standardization
- All APIs return `{code: 200, message: "", data: {}}`
- Consistent error handling with HTTP status codes
- Pagination via `PageResult<T>` wrapper

### Key API Endpoints
```
# Authentication
POST /api/users/register
POST /api/users/login
GET  /api/users/profile

# Content Generation
POST /api/contents/generate        # AI content creation
GET  /api/contents                 # User history
GET  /api/contents/{id}            # Single content details

# Templates
GET  /api/templates                # Paginated templates
GET  /api/templates/categories     # Template categories
GET  /api/templates/popular        # Trending templates

# Art Styles
GET  /api/art-styles               # Available styles
```

## Configuration Management

### Backend (application.yml)
- **Database**: MySQL connection with HikariCP pooling
- **JWT**: 24-hour token expiration with configurable secret
- **AI Service**: Volcano Engine API keys and model endpoints
- **File Upload**: 10MB limit with type validation
- **Logging**: Structured logs to logs/text-vision.log

### Frontend Configuration
- **API Base**: Configured in lib/api.ts (currently points to 223.72.35.202:8999)
- **CORS**: Configured in vite.config.ts with allowed hosts
- **State Management**: Zustand stores for auth, templates, and generation state

## Database Schema

### Core Tables
- **user**: User accounts with password hashing
- **template**: Reusable prompt templates with metadata
- **generated_content**: Generated images/videos with status tracking
- **user_operation_log**: Audit trail for user actions
- **art_style**: Available artistic styles for generation

### MyBatis-Plus Conventions
- Logic delete via `deleted` field (0=active, 1=deleted)
- Auto camelCase to snake_case mapping
- Optimistic locking support
- Pagination via IPage<T>

## Development Workflow

### Adding New Features
1. **Backend**: Create entity → mapper → service → controller → DTOs
2. **Frontend**: Update store → create components → add API methods
3. **Testing**: Add unit tests → integration tests → manual testing

### Code Style Guidelines
- **Java**: Lombok for POJOs, consistent naming conventions
- **TypeScript**: Strict mode enabled, functional components preferred
- **Git**: Conventional commits (feat:, fix:, style:, etc.)

### Debugging
- **Backend**: Check logs/text-vision.log, use Swagger UI at /swagger-ui.html
- **Frontend**: React DevTools for component state, Zustand DevTools for stores
- **Network**: Browser dev tools for API debugging

## Deployment Checklist

### Environment Variables
```bash
# Backend
export SPRING_PROFILES_ACTIVE=prod
export DATABASE_URL=jdbc:mysql://prod-db:3306/text_vision
export JWT_SECRET=your-production-secret
export VOLCANO_API_KEY=your-production-key

# Frontend
export VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### Docker Deployment
```dockerfile
# Backend
FROM openjdk:8-jre-slim
COPY target/text-vision-backend-1.0.0.jar app.jar
EXPOSE 8999
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8999/actuator/health || exit 1
```

### Health Monitoring
- Health endpoint: http://localhost:8999/actuator/health
- Metrics endpoint: http://localhost:8999/actuator/metrics
- Log monitoring: tail -f logs/text-vision.log