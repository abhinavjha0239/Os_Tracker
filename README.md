# OS Tracker - Open Source Contribution Tracker

A modern web application to track and celebrate open-source pull request contributions from students across your college. Monitor merged PRs, view leaderboards, and showcase student achievements in real-world projects. Built with Next.js, PostgreSQL (NeonDB), and featuring automatic daily sync.

## Features

- **🏆 Leaderboard**: Rank students by merged pull requests with filtering options
- **👥 Student Profiles**: Dedicated pages showing contributions organized by organization → repository → PR
- **🏢 Organization Views**: Track contributions across different open-source organizations
- **📊 PR-Focused Metrics**: Focus exclusively on merged pull requests (not commits)
- **🔄 Automatic Daily Sync**: Scheduled sync runs daily at 2 AM
- **🎨 Modern UI**: Beautiful, responsive design with dark mode support
- **📱 Mobile Responsive**: Optimized for all screen sizes
- **🔍 Search & Filter**: Find students and organizations easily

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (NeonDB)
- **Charts**: Recharts
- **GitHub API**: Octokit
- **Cron Jobs**: node-cron (for development) / Vercel Cron (for production)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (NeonDB recommended)

### Installation

1. Clone the repository and navigate to the project directory:
```bash
cd os
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Database connection (NeonDB or any PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# GitHub Personal Access Token (optional but recommended)
# Get one at: https://github.com/settings/tokens
# Without a token: 60 requests/hour
# With a token: 5,000 requests/hour
GITHUB_PAT_TOKEN=your_github_personal_access_token

# Optional: Secret for cron endpoint (if deploying to production)
CRON_SECRET=your_random_secret_string
```

4. Initialize the database:

```bash
# Option 1: Using npm script
npm run init-db

# Option 2: Call the API endpoint (if server is running)
# Visit http://localhost:3000/api/init
```

### Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Initialize the database (if not done already):
   - Visit `http://localhost:3000/api/init` or run `npm run init-db`

## Usage

### Navigation

The application has five main sections accessible from the navigation bar:

- **Home**: Hero section with leaderboard preview and key statistics
- **Students**: Browse all students, search, and filter by various criteria
- **Organizations**: View all open-source organizations and their contributions
- **Leaderboard**: Full leaderboard with advanced filtering (time period, organization)
- **Admin**: Management dashboard for students, repositories, and organizations

### Admin Section

The admin section provides tools to manage the system:

#### Managing Students (`/admin/students`)
1. Click "Admin" in the navigation bar
2. Click "Manage Students" or navigate to `/admin/students`
3. Add a new student:
   - Click "+ Add Student"
   - Enter GitHub username (required)
   - Optionally add full name and email
   - Click "Add Student"
4. Edit or delete existing students using the action buttons
5. Click "Manage Repos" to add repositories for a student

#### Managing Repositories (`/admin/students/[id]/repositories`)
1. From the student management page, click "Manage Repos" for a student
2. Add a repository:
   - Click "+ Add Repository"
   - Enter repository URL (supports multiple formats):
     - `owner/repo` (e.g., `openMF/web-app`)
     - `https://github.com/owner/repo`
     - `https://github.com/owner/repo.git`
   - Optionally select an organization
   - Click "Add Repository"
3. Sync a repository to fetch latest contributions (click "Sync" button)
4. Delete repositories as needed

#### Managing Organizations (`/admin/organizations`)
1. Navigate to `/admin/organizations`
2. Add a new organization:
   - Click "+ Add Organization"
   - Enter display name (e.g., "Mifos Initiative")
   - Enter GitHub organization name (e.g., "openMF")
   - Click "Add Organization"
3. View organizations and their GitHub links

### Viewing Student Contributions

1. Navigate to the **Students** page
2. Use search to find specific students or browse the list
3. Click "View Details" on any student
4. View their contributions organized by:
   - Organization
   - Repository within each organization
   - Individual merged PRs with links

### Syncing Contributions

- **Manual Sync**: Click "Sync Now" on student detail pages
- **Automatic Sync**: Runs daily at 2 AM (via cron job)
- Only merged pull requests are counted in statistics

### Organization View

1. Navigate to the **Organizations** page
2. View statistics for each organization (PRs, students, repositories)
3. Click on an organization to see:
   - All repositories with contributions
   - All PRs merged in each repository
   - List of contributing students

## Database Schema

- **students**: Student information (GitHub username, name, email)
- **organizations**: Organization information
- **repositories**: Repository tracking per student
- **contributions**: Individual contributions (commits, PRs, issues)
- **sync_logs**: Sync operation history

## API Endpoints

### Students
- `GET /api/students` - List all students
- `POST /api/students` - Create a student
- `GET /api/students/[id]` - Get student details
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student
- `GET /api/students/stats` - Get all students with PR counts
- `GET /api/students/[id]/prs` - Get student's PRs organized by org/repo

### Organizations
- `GET /api/organizations` - List all organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/stats` - Get all organizations with stats
- `GET /api/organizations/[id]/details` - Get organization with repos and PRs

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard of top students
  - Query params: `limit`, `month`, `organization_id`

### Repositories
- `GET /api/repositories?studentId=[id]` - List repositories
- `POST /api/repositories` - Add repository
- `DELETE /api/repositories/[id]` - Remove repository

### Statistics (Legacy)
- `GET /api/stats` - Get stats for all students (includes commits/issues)
- `GET /api/stats?studentId=[id]` - Get stats for a specific student

### Sync
- `POST /api/sync` - Sync contributions
  - Body: `{ "student_id": 1 }` or `{ "repository_id": 1 }`

### Cron
- `GET /api/cron` - Daily sync endpoint (requires CRON_SECRET)

## Daily Sync Setup

### Development (Local)
The sync script can be run manually:
```bash
npm run sync
```

### Production (Vercel)
1. Add `CRON_SECRET` to environment variables
2. Deploy - the `vercel.json` file configures automatic daily sync at 2 AM

### Other Platforms
Set up a cron job to call `/api/cron?secret=your_secret` daily

## Supported Repository URL Formats

- `owner/repo` (e.g., `facebook/react`)
- `https://github.com/owner/repo`
- `https://github.com/owner/repo.git`

## Rate Limiting

GitHub API has rate limits:
- **Without authentication**: 60 requests/hour
- **With personal access token**: 5,000 requests/hour

The app handles rate limits gracefully and will display appropriate error messages.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── students/
│   │   │   ├── route.ts              # Student CRUD operations
│   │   │   ├── stats/route.ts        # Student stats with PR counts
│   │   │   └── [id]/
│   │   │       ├── route.ts          # Single student operations
│   │   │       └── prs/route.ts      # Student PRs by org/repo
│   │   ├── organizations/
│   │   │   ├── route.ts              # Organization CRUD
│   │   │   ├── stats/route.ts        # Organization stats
│   │   │   └── [id]/
│   │   │       └── details/route.ts  # Org repos & PRs
│   │   ├── leaderboard/route.ts      # Leaderboard API
│   │   ├── repositories/             # Repository management
│   │   ├── stats/                    # Legacy stats API
│   │   ├── sync/                     # Sync API
│   │   ├── cron/                     # Cron endpoint
│   │   └── init/                     # Database initialization
│   ├── students/
│   │   ├── page.tsx                  # Students list page
│   │   └── [id]/page.tsx             # Student detail page
│   ├── organizations/
│   │   ├── page.tsx                  # Organizations list page
│   │   └── [id]/page.tsx             # Organization detail page
│   ├── leaderboard/page.tsx          # Full leaderboard page
│   ├── page.tsx                      # Homepage with hero & leaderboard
│   ├── layout.tsx                    # Root layout with nav & footer
│   └── globals.css                   # Global styles
├── components/
│   ├── Navigation.tsx                # Top navigation bar
│   └── Footer.tsx                    # Footer component
├── lib/
│   ├── db.ts                         # Database connection
│   ├── db-types.ts                   # TypeScript types
│   ├── github.ts                     # GitHub API utilities
│   ├── sync.ts                       # Sync logic (tracks merged PRs)
│   ├── cron-sync.ts                  # Cron sync function
│   └── cron-job.ts                   # Cron job setup
├── scripts/
│   ├── init-db.ts                    # Database initialization script
│   └── sync-contributions.ts         # Manual sync script
└── package.json
```

## Building for Production

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT