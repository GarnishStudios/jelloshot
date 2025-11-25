# Call Sheet - Production Management Platform

## 🎬 Project Overview

Jello Shot AI
 is a web application designed to streamline production workflows by replacing manual, error-prone spreadsheet-based call sheet creation with an intuitive, efficient digital solution. The platform enables production teams to create, manage, and share call sheets instantly with flexible adjustments.

## 🎯 Problem Statement

Productions struggle with two repetitive workflows:
- **Call sheet creation**: Slow, manual, error-prone process using spreadsheets
- **Shot list management**: Difficult to reorganize, update times, and share changes in real-time

## 💡 Solution

A modern web application that allows users to:
- Create call sheets instantly
- Manage shot lists with drag-and-drop functionality
- Automatically calculate and update shot timings
- Organize multiple projects and shot lists
- Share and collaborate on production schedules

## 🏗 Technical Architecture

### Tech Stack

#### Frontend
- **Framework**: React 18.x with TypeScript
- **State Management**: Zustand or Redux Toolkit
- **Styling**: Tailwind CSS + shadcn/ui components
- **Drag & Drop**: @dnd-kit/sortable
- **HTTP Client**: Axios or Tanstack Query
- **Routing**: React Router v6
- **Build Tool**: Vite

#### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15+
- **ORM**: SQLAlchemy 2.0
- **Migration Tool**: Alembic
- **Authentication**: JWT with python-jose
- **Validation**: Pydantic v2
- **File Storage**: Local filesystem (MVP) / AWS S3 (production)
- **CORS**: FastAPI CORS middleware

#### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Environment Management**: python-dotenv, .env files
- **API Documentation**: OpenAPI/Swagger (built-in with FastAPI)
- **Testing**: pytest (backend), Jest + React Testing Library (frontend)

## 📊 Database Schema

### Entity Relationship Diagram

```
Users (1) ----< (N) Projects
Projects (1) ----< (N) Shotlists
Shotlists (1) ----< (N) ShotlistItems
```

### Tables

#### users
```sql
- id: UUID (PK)
- email: VARCHAR(255) UNIQUE NOT NULL
- username: VARCHAR(100) UNIQUE NOT NULL
- hashed_password: VARCHAR(255) NOT NULL
- full_name: VARCHAR(255)
- is_active: BOOLEAN DEFAULT true
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### projects
```sql
- id: UUID (PK)
- user_id: UUID (FK -> users.id)
- name: VARCHAR(255) NOT NULL
- description: TEXT
- production_company: VARCHAR(255)
- director: VARCHAR(255)
- producer: VARCHAR(255)
- status: ENUM('pre_production', 'production', 'post_production', 'completed')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### shotlists
```sql
- id: UUID (PK)
- project_id: UUID (FK -> projects.id)
- name: VARCHAR(255) NOT NULL
- shooting_date: DATE
- call_time: TIME
- wrap_time: TIME
- location: VARCHAR(500)
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### shotlist_items
```sql
- id: UUID (PK)
- shotlist_id: UUID (FK -> shotlists.id)
- shot_name: VARCHAR(100) NOT NULL
- shot_details: TEXT
- time_of_day: VARCHAR(50) -- 'dawn', 'morning', 'afternoon', 'evening', 'night'
- shot_duration: INTEGER -- in minutes
- start_time: TIME
- notes: TEXT
- shot_reference_image: VARCHAR(500) -- file path or URL
- order_index: INTEGER NOT NULL -- for maintaining sort order
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## 🔌 API Design

### Authentication Endpoints
```
POST   /api/auth/register     - User registration
POST   /api/auth/login        - User login
POST   /api/auth/refresh      - Refresh JWT token
GET    /api/auth/me           - Get current user
```

### Projects Endpoints
```
GET    /api/projects           - List user's projects
POST   /api/projects           - Create new project
GET    /api/projects/{id}      - Get project details
PUT    /api/projects/{id}      - Update project
DELETE /api/projects/{id}      - Delete project
```

### Shotlists Endpoints
```
GET    /api/projects/{project_id}/shotlists       - List project's shotlists
POST   /api/projects/{project_id}/shotlists       - Create shotlist
GET    /api/shotlists/{id}                        - Get shotlist details
PUT    /api/shotlists/{id}                        - Update shotlist
DELETE /api/shotlists/{id}                        - Delete shotlist
```

### Shotlist Items Endpoints
```
GET    /api/shotlists/{shotlist_id}/items         - List shotlist items
POST   /api/shotlists/{shotlist_id}/items         - Create item
GET    /api/shotlist-items/{id}                   - Get item details
PUT    /api/shotlist-items/{id}                   - Update item
DELETE /api/shotlist-items/{id}                   - Delete item
PUT    /api/shotlists/{shotlist_id}/items/reorder - Reorder items
POST   /api/shotlist-items/{id}/upload-image      - Upload reference image
```

## 🎨 Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── common/
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── LoadingSpinner.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── projects/
│   │   ├── ProjectList.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectForm.tsx
│   │   └── ProjectDetails.tsx
│   ├── shotlists/
│   │   ├── ShotlistList.tsx
│   │   ├── ShotlistCard.tsx
│   │   ├── ShotlistForm.tsx
│   │   └── ShotlistView.tsx
│   └── shotlist-items/
│       ├── ShotlistItemCard.tsx
│       ├── ShotlistItemForm.tsx
│       ├── ShotlistItemDetails.tsx
│       ├── DraggableList.tsx
│       └── TimeCalculator.tsx
├── pages/
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Projects.tsx
│   ├── ProjectDetail.tsx
│   ├── ShotlistDetail.tsx
│   └── NotFound.tsx
├── services/
│   ├── api.ts
│   ├── auth.service.ts
│   ├── projects.service.ts
│   ├── shotlists.service.ts
│   └── shotlist-items.service.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useProjects.ts
│   ├── useShotlists.ts
│   └── useDragAndDrop.ts
├── utils/
│   ├── timeCalculations.ts
│   ├── validators.ts
│   └── formatters.ts
└── types/
    └── index.ts
```

### Key Features Implementation

#### 1. Drag & Drop Functionality
- Use @dnd-kit/sortable for smooth drag interactions
- Optimistic UI updates during reordering
- Batch update API call on drop
- Auto-save with debouncing

#### 2. Auto Time Calculation
```typescript
// When items are reordered or duration changes:
function recalculateStartTimes(items: ShotlistItem[], callTime: string) {
  let currentTime = parseTime(callTime);

  return items.map(item => ({
    ...item,
    start_time: formatTime(currentTime),
    currentTime = addMinutes(currentTime, item.shot_duration)
  }));
}
```

#### 3. Expandable Cards
- Accordion-style UI for shot list items
- Lazy load full details on expand
- Inline editing capabilities
- Image preview with upload

## 📋 Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Set up project repository and folder structure
- [ ] Configure Docker and Docker Compose
- [ ] Set up PostgreSQL database
- [ ] Initialize FastAPI backend with basic configuration
- [ ] Initialize React frontend with Vite
- [ ] Set up environment variables and configuration

### Phase 2: Backend Core (Week 2)
- [ ] Implement database models with SQLAlchemy
- [ ] Create Alembic migrations
- [ ] Implement authentication system (JWT)
- [ ] Build CRUD operations for Users and Projects
- [ ] Add input validation with Pydantic
- [ ] Set up error handling and logging

### Phase 3: Backend Features (Week 3)
- [ ] Implement Shotlists CRUD operations
- [ ] Implement ShotlistItems CRUD operations
- [ ] Add reordering endpoint with automatic time calculation
- [ ] Implement file upload for reference images
- [ ] Add API documentation with Swagger
- [ ] Write unit tests for core functionality

### Phase 4: Frontend Foundation (Week 4)
- [ ] Set up routing with React Router
- [ ] Implement authentication flow (login/register)
- [ ] Create layout components and navigation
- [ ] Set up state management
- [ ] Configure API client and interceptors
- [ ] Implement protected routes

### Phase 5: Frontend Core Features (Week 5)
- [ ] Build Projects list and detail pages
- [ ] Implement Shotlists management interface
- [ ] Create draggable shotlist items component
- [ ] Implement expandable item cards
- [ ] Add time calculation logic
- [ ] Integrate with backend APIs

### Phase 6: Frontend Polish (Week 6)
- [ ] Add form validation and error handling
- [ ] Implement loading states and optimistic updates
- [ ] Add image upload and preview
- [ ] Implement auto-save functionality
- [ ] Add responsive design
- [ ] Create user feedback components (toasts, modals)

### Phase 7: Testing & Optimization (Week 7)
- [ ] Write comprehensive frontend tests
- [ ] Perform end-to-end testing
- [ ] Optimize database queries
- [ ] Add caching where appropriate
- [ ] Performance optimization (lazy loading, memoization)
- [ ] Security audit and fixes

### Phase 8: Deployment Preparation (Week 8)
- [ ] Set up production environment variables
- [ ] Configure production database
- [ ] Set up reverse proxy (nginx)
- [ ] Implement backup strategies
- [ ] Create deployment scripts
- [ ] Write user documentation

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optional but recommended)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-org/call-sheet.git
cd call-sheet
```

2. Set up backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your database credentials
alembic upgrade head
uvicorn main:app --reload
```

3. Set up frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

4. Using Docker (alternative)
```bash
docker-compose up
```

## 🔐 Security Considerations

- Implement rate limiting on API endpoints
- Use HTTPS in production
- Sanitize all user inputs
- Implement proper CORS configuration
- Store passwords using bcrypt hashing
- Use parameterized database queries
- Implement JWT token expiration and refresh
- Add file type validation for uploads
- Implement user permission levels (future enhancement)

## 🎯 MVP Success Criteria

- [x] Users can register and authenticate
- [x] Users can create and manage multiple projects
- [x] Users can create shotlists within projects
- [x] Users can add/edit/delete shotlist items
- [x] Drag-and-drop reordering works smoothly
- [x] Start times auto-calculate based on order and duration
- [x] Items are expandable to show all details
- [x] Basic image upload for references
- [x] Responsive design works on desktop and tablet

## 🔄 Future Enhancements

- Real-time collaboration with WebSockets
- Export to PDF/Excel formats
- Mobile app version
- Team management and permissions
- Calendar integration
- Weather API integration
- Location scouting features
- Budget tracking
- Cast and crew management
- Equipment tracking
- Push notifications for call time changes
- Offline mode with sync
- Template library for common shot setups

## 📝 License

MIT License - See LICENSE file for details

## 👥 Team

- Tech Lead: [Your Name]
- Backend Developer: TBD
- Frontend Developer: TBD
- UI/UX Designer: TBD

## 📞 Contact

For questions or support, please contact: [email@example.com]

---

*Last Updated: December 2024*
ON VERSION 1 

