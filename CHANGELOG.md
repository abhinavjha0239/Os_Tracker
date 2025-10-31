# Changelog - PR-Focused Redesign

## Major Changes

### UI/UX Overhaul

The application has been completely redesigned to focus on **merged pull requests only** and use **separate pages** instead of modal overlays.

#### New Page Structure

1. **Homepage** (`/`)
   - Hero section with college branding
   - Top 10 leaderboard preview
   - Feature highlights
   - Call-to-action buttons

2. **Students Page** (`/students`)
   - Searchable table of all students
   - Shows only merged PR counts
   - Sort by name or PR count
   - Filter by search query

3. **Student Details Page** (`/students/[id]`)
   - Student information and summary stats
   - PRs organized by: **Organization → Repository → PR Links**
   - Excludes commit and contribution counts
   - Manual sync button
   - Breadcrumb navigation

4. **Organizations Page** (`/organizations`)
   - Grid view of all organizations
   - Stats: merged PRs, student count, repo count
   - Search and sort functionality

5. **Organization Details Page** (`/organizations/[id]`)
   - Tabbed view: Repositories | Students
   - Repositories tab: Shows all repos with PRs
   - Students tab: List of contributing students
   - Each PR includes student attribution

6. **Leaderboard Page** (`/leaderboard`)
   - Top 3 podium display
   - Full ranked table
   - Filters: time period, organization, top N
   - Medal colors for top 3 positions

### New API Endpoints

#### Leaderboard API
- `GET /api/leaderboard` - Returns ranked students by merged PRs
  - Query params: `limit`, `month`, `organization_id`

#### Students API (Enhanced)
- `GET /api/students/stats` - All students with merged PR counts only
- `GET /api/students/[id]/prs` - Student's PRs organized by org/repo

#### Organizations API (Enhanced)
- `GET /api/organizations/stats` - All organizations with stats
- `GET /api/organizations/[id]/details` - Full organization data with repos and PRs

### Design Improvements

#### Navigation
- Persistent top navigation bar on all pages
- Links: Home | Students | Organizations | Leaderboard
- Mobile-responsive hamburger menu
- Active page highlighting

#### Footer
- Quick links section
- About information
- Acknowledgements
- Terms and privacy links

#### Color Scheme
- Gradient headers (blue-to-purple)
- Color-coded stats:
  - Green: Merged PRs
  - Blue: Students/Organizations
  - Purple: Repositories
- Medal colors for rankings:
  - 🥇 Gold (1st place)
  - 🥈 Silver (2nd place)
  - 🥉 Bronze (3rd place)

#### Responsive Design
- Mobile-first approach
- Stacked layouts on mobile
- Touch-friendly buttons
- Readable typography on all screen sizes

### Data Model Changes

No database schema changes were required. The existing data model already supports:
- Tracking merged PRs (via `state = 'merged'` in contributions table)
- Organization associations
- Repository relationships

The sync logic already properly identifies merged PRs using GitHub's `merged_at` field.

### Removed Components

The following components were removed as they're no longer needed:
- `ContributionsList.tsx` - Replaced by dedicated pages
- `RepoCard.tsx` - Integrated into org/student pages
- `StatsChart.tsx` - Charts not needed for PR-only view
- `StudentCard.tsx` - Replaced by student list table
- `StudentForm.tsx` - Management forms moved to admin flow
- `UserProfile.tsx` - Integrated into student details
- `RepoForm.tsx` - Not part of main UI

### New Components

- `Navigation.tsx` - Top navigation bar with routing
- `Footer.tsx` - Footer with links and info

### Key Features

#### Focus on Merged PRs Only
- All metrics show **only merged pull requests**
- Commit and issue counts are no longer displayed in the main UI
- Legacy API endpoints still available for backwards compatibility

#### Organization-First Structure
- Student details organize PRs by organization first
- Easy to see contributions to major open-source projects
- Example: openMF/web-app links properly to GitHub

#### No Modal Overlays
- All views are full pages with their own routes
- Better for SEO and bookmarking
- Cleaner navigation with browser back/forward

#### Enhanced Leaderboard
- Time-based filtering (all-time, this month)
- Organization-specific rankings
- Configurable top N (10, 25, 50, 100)

## Migration Notes

### For Users

No action required. The database and sync functionality remain unchanged. Simply navigate to the new pages:
- Home: `/`
- Students: `/students`
- Organizations: `/organizations`
- Leaderboard: `/leaderboard`

### For Developers

If you've built integrations using the API:
- Old `/api/stats` endpoint still works (includes commits/issues)
- Use new endpoints for PR-focused data:
  - `/api/leaderboard` for rankings
  - `/api/students/stats` for PR counts only
  - `/api/students/[id]/prs` for organized PR data

## Testing Checklist

- [ ] Homepage loads and displays leaderboard
- [ ] Navigation works on all pages
- [ ] Student list page shows all students with PR counts
- [ ] Student detail page organizes PRs by org → repo
- [ ] Organization list shows stats correctly
- [ ] Organization detail page shows repos and students
- [ ] Leaderboard filtering works (time, org, limit)
- [ ] Sync button works on student detail pages
- [ ] Mobile responsive on all pages
- [ ] Dark mode works correctly
- [ ] Links to GitHub work properly

## Future Enhancements

Potential improvements for future versions:
- Admin panel for managing students/repos
- Bulk import/export functionality
- Advanced analytics dashboard
- Email notifications for new PRs
- Integration with college authentication
- Department/semester filtering
- Contribution timeline visualization
- PR review statistics

