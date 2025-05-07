# Pine Bridge

A full-stack web application with separate frontend and backend services.

## Project Structure

```
.
├── fe/                 # Frontend application
│   ├── src/           # Source code
│   ├── shared/        # Shared components and utilities
│   └── ...            # Configuration files
│
└── be/                # Backend application
    ├── src/           # Source code
    ├── shared/        # Shared utilities
    ├── db/            # Database related files
    └── ...            # Configuration files
```

## Frontend (fe/)

The frontend is built with:
- TypeScript
- Vite
- Tailwind CSS
- React (based on the configuration files)

### Setup

1. Navigate to the frontend directory:
   ```bash
   cd fe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Backend (be/)

The backend is built with:
- TypeScript
- Node.js
- Express (based on the project structure)

### Setup

1. Navigate to the backend directory:
   ```bash
   cd be
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Development

- Frontend runs on: `http://localhost:5173` (default Vite port)
- Backend runs on: `http://localhost:3000` (typical Express port)

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

[Add your license information here] 