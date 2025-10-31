# Application Routes

## Public Pages

All public pages are accessible without authentication.

### Homepage
- **URL**: `/`
- **Description**: Landing page with hero section, leaderboard preview, and features
- **Features**:
  - Hero section with college branding
  - Top 10 leaderboard
  - Statistics cards (contributors, PRs, organizations)
  - Call-to-action buttons

### Students List
- **URL**: `/students`
- **Description**: Browse all students with search and sort
- **Features**:
  - Searchable table (by name, username, email)
  - Sort by PRs or name
  - Shows merged PR count per student
  - Last sync timestamp
  - Direct links to student details

### Student Details
- **URL**: `/students/[id]`
- **Description**: Individual student profile with all merged PRs
- **Organization Structure**:
  ```
  Student Name (@username)
  └── Summary Stats (Total PRs, Organizations, Repositories)
      └── Organization 1 (e.g., "openMF")
          └── Repository 1 (e.g., "web-app")
              ├── PR #123: Title [Link to GitHub]
              ├── PR #456: Title [Link to GitHub]
              └── ...
          └── Repository 2
              └── ...
      └── Organization 2
          └── ...
  ```
- **Features**:
  - Breadcrumb navigation (Home > Students > Name)
  - Manual sync button
  - Summary statistics
  - Organized by org → repo → PR
  - Direct GitHub links for each PR

### Organizations List
- **URL**: `/organizations`
- **Description**: Browse all open-source organizations
- **Features**:
  - Grid of organization cards
  - Search by organization name
  - Sort by PRs, students, or name
  - Stats per organization:
    - Total merged PRs
    - Contributing students count
    - Repository count

### Organization Details
- **URL**: `/organizations/[id]`
- **Description**: Organization profile with repositories and contributors
- **Tabs**:
  1. **Repositories**: Shows all repos with merged PRs
     - Each repo lists all PRs with student attribution
  2. **Students**: Lists all contributing students
     - Shows PR count per student
- **Features**:
  - Breadcrumb navigation (Home > Organizations > Name)
  - GitHub organization link
  - Summary statistics
  - Tabbed interface

### Leaderboard
- **URL**: `/leaderboard`
- **Description**: Full leaderboard with advanced filtering
- **Features**:
  - Top 3 podium display with medal colors
  - Full ranked table
  - Filters:
    - Time period (All Time / This Month)
    - Organization (All / Specific)
    - Limit (Top 10/25/50/100)
  - Rank badges with gradient colors

## Admin Pages

Administrative pages for managing students, repositories, and organizations.

### Admin Dashboard
- **URL**: `/admin`
- **Description**: Admin home page with statistics and quick links
- **Features**:
  - Overview statistics (students, organizations, repositories)
  - Quick links to management pages
  - Usage tips

### Manage Students
- **URL**: `/admin/students`
- **Description**: Add, edit, or delete students
- **Features**:
  - List all students
  - Add new student form
  - Edit student information
  - Delete students (with confirmation)
  - Link to manage each student's repositories

### Manage Repositories
- **URL**: `/admin/students/[id]/repositories`
- **Description**: Manage repositories for a specific student
- **Features**:
  - List all repositories for the student
  - Add new repository (supports multiple URL formats)
  - Associate repository with organization
  - Manual sync button per repository
  - Delete repositories
  - Breadcrumb navigation

### Manage Organizations
- **URL**: `/admin/organizations`
- **Description**: Add or view organizations
- **Features**:
  - Grid view of organizations
  - Add new organization form
  - Display name and GitHub org name
  - Links to view on GitHub
  - Links to organization detail pages

## API Routes

### Leaderboard
- `GET /api/leaderboard?limit=10&month=2025-10&organization_id=1`
  - Returns ranked list of students by merged PRs
  - Query parameters:
    - `limit`: Number of results (default: 10)
    - `month`: Filter by month (format: YYYY-MM)
    - `organization_id`: Filter by organization

### Students
- `GET /api/students` - List all students (basic info)
- `GET /api/students/stats` - List all students with merged PR counts
- `GET /api/students/[id]` - Get single student details
- `GET /api/students/[id]/prs` - Get student's PRs organized by org/repo
- `POST /api/students` - Create new student
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

### Organizations
- `GET /api/organizations` - List all organizations (basic info)
- `GET /api/organizations/stats` - List all organizations with stats
- `GET /api/organizations/[id]/details` - Get organization with repos and PRs
- `POST /api/organizations` - Create new organization

### Repositories
- `GET /api/repositories?studentId=[id]` - List student repositories
- `POST /api/repositories` - Add repository
- `DELETE /api/repositories/[id]` - Remove repository

### Sync
- `POST /api/sync` - Sync contributions for student or repository
  - Body: `{ "student_id": 1 }` or `{ "repository_id": 1 }`

### Statistics (Legacy)
- `GET /api/stats` - Get all student stats (includes commits/issues)
- `GET /api/stats?studentId=[id]` - Get specific student stats

### Cron
- `GET /api/cron?secret=[CRON_SECRET]` - Trigger daily sync

### Database
- `GET /api/init` - Initialize database schema

## Navigation Structure

```
Home (/)
├── Students (/students)
│   └── Student Details (/students/[id])
├── Organizations (/organizations)
│   └── Organization Details (/organizations/[id])
├── Leaderboard (/leaderboard)
└── Admin (/admin)
    ├── Manage Students (/admin/students)
    │   └── Manage Repositories (/admin/students/[id]/repositories)
    └── Manage Organizations (/admin/organizations)
```

## Example URLs

Based on the repo link example: `https://github.com/openMF/web-app`

### Student View
```
/students/123
└── Organization: openMF
    └── Repository: web-app
        └── PR #45: Add new feature
            [Link to https://github.com/openMF/web-app/pull/45]
```

### Organization View
```
/organizations/5  (where organization.github_org_name = "openMF")
└── Repositories Tab
    └── web-app
        └── All PRs from all students
```

## Deep Linking

All routes support deep linking:
- Bookmark any page
- Share direct links to student profiles
- Link to specific organization pages
- Browser back/forward navigation works correctly

