## Prerequisites

Before setting up Tallyrus, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Python** (v3.11 or higher) - for Python services
- **Git** for version control

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd TallyrusMaybe/Tallyrus
```

### 2. Environment Setup

Create `.env` files in both backend and frontend directories using the provided examples:

**Backend Environment Variables** (`backend/.env`):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/tallyrus
SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
```

**Frontend Environment Variables** (`frontend/.env`):

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. Install Dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

**Python Server (if needed):**

```bash
cd backend/pythonserver
pip install -r requirements.txt
```

### 4. Start Development Servers

**Backend Server:**

```bash
cd backend
npm run dev
```

**Frontend Server:**

```bash
cd frontend
# For Windows:
npm start

# For macOS:
npm run startmac
```

**Python Server (optional):**

```bash
cd backend/pythonserver
python application.py
```

The application will be available at:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Python Service: `http://localhost:5001`

## Development Workflow

### Available Scripts

**Backend Scripts:**

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run Jest tests
- `npm run coverage` - Generate test coverage report

**Frontend Scripts:**

- `npm start` - Start development server (Windows)
- `npm run startmac` - Start development server (macOS)
- `npm run build` - Build for production
- `npm test` - Run tests

### API Endpoints

The backend provides the following main API routes:

- `/auth` - Authentication and user management
- `/openai` - AI-powered essay grading
- `/classroom` - Classroom management
- `/assignments` - Assignment CRUD operations
- `/files` - File upload and processing

### Key Technologies

**Frontend:**

- React 18 with functional components and hooks
- Tailwind CSS for styling
- Radix UI for accessible components
- React Router for navigation
- React Hook Form for form handling
- OpenAI integration for AI features

**Backend:**

- Express.js web framework
- Mongoose for MongoDB integration
- Passport.js for authentication
- Multer for file uploads
- Jest for testing
- OpenAI API integration

## Testing

### Running Tests

**Backend Tests:**

```bash
cd backend
npm test
```

**Test Coverage:**

```bash
cd backend
npm run coverage
```

Tests are located in the `backend/tests/` directory and use Jest as the testing framework.

## Deployment

### Production Build

**Frontend:**

```bash
cd frontend
npm run build
```

### Docker Deployment

The project includes Docker configuration for Jenkins CI/CD:

```bash
docker-compose up -d
```

This will start Jenkins on port 8081 for continuous integration and deployment.

### Environment Configuration

Ensure all production environment variables are properly configured:

- Database connection strings
- API keys (OpenAI, Google OAuth)
- CORS origins for production domains
- Session secrets

## Contributing

### Code Style

- Follow ESLint configuration for JavaScript/React code
- Use Prettier for code formatting
- Follow conventional commit messages
- Write tests for new features

### Development Guidelines

1. Create feature branches from `main`
2. Write comprehensive tests for new functionality
3. Update documentation for API changes
4. Ensure all tests pass before submitting PRs
5. Follow the existing code structure and patterns

## Troubleshooting

### Common Issues

**MongoDB Connection Issues:**

- Ensure MongoDB is running locally or check Atlas connection string
- Verify network connectivity and firewall settings

**Environment Variables:**

- Double-check all required environment variables are set
- Ensure `.env` files are in the correct directories

**Port Conflicts:**

- Default ports: Frontend (3000), Backend (5000), Python (5001)
- Change ports in environment variables if conflicts occur

**CORS Issues:**

- Verify frontend URL is included in backend CORS configuration
- Check for proper credentials handling in requests

## Support

For technical support or questions:

1. Check existing documentation and README files
2. Review the codebase for similar implementations
3. Consult the project's issue tracker
4. Contact the development team

## License

This project is proprietary software developed for educational institutions. Please refer to the Terms of Service for usage guidelines.

---

**Tallyrus** - Revolutionizing education through AI-powered essay grading.
