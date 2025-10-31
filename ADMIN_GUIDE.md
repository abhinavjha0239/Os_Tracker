# Admin Guide

Complete guide for managing the OS Tracker system.

## Accessing Admin Panel

Navigate to the **Admin** link in the main navigation bar, or visit `/admin` directly.

## Admin Dashboard

The admin dashboard (`/admin`) provides:
- Overview statistics (total students, organizations, repositories)
- Quick links to management pages
- Helpful tips for using the system

## Managing Students

### Adding a Student

1. Navigate to **Admin > Manage Students** (`/admin/students`)
2. Click **"+ Add Student"** button
3. Fill in the form:
   - **GitHub Username** (Required): The student's GitHub username without @ symbol
     - Example: `shubhamkumar9199`
   - **Full Name** (Optional): Student's real name
     - Example: `Shubham Kumar`
   - **Email** (Optional): Student's email address
     - Example: `student@college.edu`
4. Click **"Add Student"**

### Editing a Student

1. Go to the students list (`/admin/students`)
2. Find the student you want to edit
3. Click the **"Edit"** button
4. Update the information
5. Click **"Update Student"**

### Deleting a Student

1. Go to the students list (`/admin/students`)
2. Find the student you want to delete
3. Click the **"Delete"** button
4. Confirm the deletion

⚠️ **Warning**: Deleting a student will also delete:
- All their repositories
- All their contributions
- All sync logs

This action cannot be undone!

## Managing Repositories

### Adding a Repository to a Student

1. Go to **Admin > Manage Students** (`/admin/students`)
2. Find the student
3. Click **"Manage Repos"** button
4. Click **"+ Add Repository"**
5. Fill in the form:
   - **Repository URL** (Required): Supports multiple formats:
     - `owner/repo` → `openMF/web-app`
     - Full URL → `https://github.com/openMF/web-app`
     - Git URL → `https://github.com/openMF/web-app.git`
   - **Organization** (Optional): Select if the repository belongs to an organization
6. Click **"Add Repository"**

### Syncing a Repository

After adding a repository, you need to sync it to fetch contributions:

1. On the repository management page
2. Find the repository
3. Click the **"Sync"** button
4. Wait for the sync to complete
5. Check the student details page to see the contributions

The sync process will:
- Fetch all commits by the student
- Fetch all pull requests created by the student
- Fetch all issues created by the student
- Only merged PRs will be counted in leaderboard/statistics

### Deleting a Repository

1. Go to the repository management page for a student
2. Find the repository
3. Click the **"Delete"** button
4. Confirm the deletion

⚠️ **Warning**: Deleting a repository will also delete all contributions tracked for that repository.

## Managing Organizations

### Adding an Organization

1. Navigate to **Admin > Manage Organizations** (`/admin/organizations`)
2. Click **"+ Add Organization"**
3. Fill in the form:
   - **Display Name** (Required): Full name of the organization
     - Example: `Mifos Initiative`
   - **GitHub Organization Name** (Required): GitHub username of the organization
     - Example: `openMF` (from github.com/openMF)
4. Click **"Add Organization"**

### Why Organizations?

Organizations help:
- Group related repositories together
- Filter contributions by organization
- Show organization-wise statistics
- Display contributions in a structured way (Org → Repo → PR)

### Example: Adding openMF Organization

For the repository `https://github.com/openMF/web-app`:

1. Add the organization first:
   - Display Name: `Mifos Initiative`
   - GitHub Org Name: `openMF`

2. Then when adding the repository `openMF/web-app`:
   - Select "Mifos Initiative" from the organization dropdown
   - This links the repository to the organization

## Workflow: Adding a New Student

Complete workflow from start to finish:

### Step 1: Add the Student
```
Admin > Manage Students > Add Student
- GitHub Username: shubhamkumar9199
- Full Name: Shubham Kumar
- Email: shubham@college.edu
```

### Step 2: Add Organizations (if not already added)
```
Admin > Manage Organizations > Add Organization
- Name: Mifos Initiative
- GitHub Org: openMF
```

### Step 3: Add Repositories
```
Admin > Manage Students > Manage Repos (for Shubham)
- Repository: openMF/web-app
- Organization: Mifos Initiative

Repeat for other repositories:
- Repository: facebook/react
- Organization: (None)
```

### Step 4: Sync Repositories
```
For each repository, click "Sync" button
Wait for sync to complete
```

### Step 5: Verify
```
Go to Students page (/students)
Find Shubham Kumar
Click "View Details"
Check that PRs are showing up organized by org/repo
```

## Repository URL Formats

All these formats are supported:

```
✅ owner/repo
   Example: openMF/web-app

✅ https://github.com/owner/repo
   Example: https://github.com/openMF/web-app

✅ https://github.com/owner/repo.git
   Example: https://github.com/openMF/web-app.git

❌ Just the repo name
   Example: web-app (WRONG - needs owner)

❌ With @ symbol
   Example: @openMF/web-app (WRONG - no @ symbol)
```

## Syncing

### Manual Sync

You can manually sync:
1. **Individual Repository**: Click "Sync" on the repository in admin panel
2. **All Student Repos**: Click "Sync Now" on student details page

### Automatic Sync

The system automatically syncs all repositories:
- **Daily at 2 AM** (server time)
- Triggered via cron job
- Runs in the background

## Best Practices

### 1. Add Organizations First
- Before adding repositories, add the organizations
- This allows you to properly categorize repositories
- Makes it easier to filter and organize contributions

### 2. Use Consistent Naming
- Use official organization names for Display Name
- Use exact GitHub usernames for GitHub Org Name
- This ensures links work correctly

### 3. Sync After Adding
- Always sync immediately after adding a repository
- This ensures contributions appear in the system
- Check student details page to verify

### 4. Regular Maintenance
- Periodically check for students who have left
- Remove unused repositories
- Update student information as needed

### 5. GitHub Rate Limits
- Without GitHub token: 60 requests/hour
- With GitHub token: 5,000 requests/hour
- Add `GITHUB_PAT_TOKEN` to `.env.local` for better limits

## Troubleshooting

### "Student not found" error
- Ensure the GitHub username is correct
- Check that the student hasn't been deleted
- Try re-adding the student

### Sync fails
- Check GitHub API rate limits
- Verify repository exists and is public
- Ensure GitHub username matches repository contributor
- Check `.env.local` for `GITHUB_PAT_TOKEN`

### No PRs showing up after sync
- Verify the student has actually created PRs in that repository
- Check that PRs are merged (only merged PRs count)
- Verify the GitHub username matches exactly
- Check the repository owner/name is correct

### Organization link broken
- Verify `github_org_name` matches the actual GitHub organization
- Example: For github.com/openMF, use "openMF" (case-sensitive)

## Security Note

⚠️ **Important**: This admin panel has no authentication. In production:
- Add authentication middleware
- Restrict access to admin routes
- Implement role-based access control
- Add audit logging for admin actions

For development/internal use, you can:
- Use network-level restrictions (VPN, IP whitelist)
- Add basic HTTP authentication
- Implement college authentication system

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check server logs for API errors
3. Verify database connection
4. Check GitHub API rate limits
5. Review the CHANGELOG.md for recent changes

## API Endpoints for Admins

While the UI provides everything you need, you can also use these API endpoints directly:

### Students
- `POST /api/students` - Create student
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

### Repositories
- `POST /api/repositories` - Add repository
- `DELETE /api/repositories/[id]` - Delete repository

### Organizations
- `POST /api/organizations` - Create organization

### Sync
- `POST /api/sync` - Trigger sync
  - Body: `{ "student_id": 1 }` or `{ "repository_id": 1 }`

See the [API documentation](README.md#api-endpoints) for complete details.

