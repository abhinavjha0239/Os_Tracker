# Organization & Repository Management Workflow

## Problem Fixed
- **Issue**: Organization pages showing 0 PRs even though students had contributions
- **Root Cause**: 
  1. Sync limited to 100 items per page (GitHub API pagination not implemented)
  2. Organization queries only finding student-owned repos, not org repos they contributed to
  3. No UI to add repositories to organizations

## Solution Implemented

### 1. Fixed Sync Pagination ✅
- **Before**: Only synced first 100 PRs/commits/issues
- **After**: Fetches ALL contributions with automatic pagination
- Students with 100+ PRs will now have complete data

### 2. Fixed Organization Queries ✅
- **Before**: Only found repos where `student_id = organization_member`
- **After**: Finds repos by:
  - `organization_id` (direct link)
  - `owner` matching organization's GitHub name (e.g., "openMF")
- **Result**: Contributions to organization repos now appear correctly

### 3. New Repository Management UI ✅

## How To Use

### Step 1: Add Organization
1. Go to **Admin Console** → **Organizations**
2. Click **"+ Add Organization"**
3. Enter:
   - **Display Name**: `Mifos Initiative`
   - **GitHub Org Name**: `openMF`
4. Click **Add Organization**

### Step 2: Add Repositories to Organization
1. On the Organizations admin page, click **"Manage Repos"** for your organization
2. Click **"+ Add Repository"**
3. Enter:
   - **Repository URL**: `https://github.com/openMF/web-app`
   - **Link to Student**: Select the student (e.g., Shubham Kumar)
4. Click **Add Repository**

### Step 3: Sync Contributions
1. Go to the **student's profile page** (e.g., `/students/1`)
2. Click **"Sync Now"** button
3. Wait for sync to complete (now fetches ALL pages, not just first 100)
4. Refresh to see updated counts

### Step 4: View Results
- **Organization Page**: Shows all PRs from all students to that org's repos
- **Student Page**: Shows all PRs by that student
- **Leaderboard**: Ranks all students by merged PRs

## Expected Results for Anant Singh

After running sync on `PalisadoesFoundation/talawa-admin`:
- ✅ Should see **23+ merged PRs** (not just 11)
- ✅ Organization page shows all contributors
- ✅ Repository page shows all PRs

## API Endpoints

### Fetch repositories by organization:
```
GET /api/repositories?organization_id=1
```

### Add repository to organization:
```
POST /api/repositories
{
  "student_id": 1,
  "repo_url": "https://github.com/openMF/web-app",
  "organization_id": 1
}
```

### Sync all repos for a student:
```
POST /api/sync
{
  "student_id": 1
}
```

## Notes

- **Pagination**: Sync now handles repos with 100+ PRs automatically
- **Multi-student repos**: Same repo can be linked to multiple students
- **Organization matching**: Repos are found by both `organization_id` and GitHub owner name
- **Sync time**: Larger repos will take longer (API rate limits apply)

## Troubleshooting

### Organization shows 0 PRs but student has contributions:
1. Verify repository is linked to organization (check `organization_id` or `owner` matches)
2. Run sync on student profile
3. Check if PRs are marked as "merged" in database

### Sync returns 404:
1. Ensure repository is added via admin console
2. Verify student is linked to the repository
3. Check student's GitHub username is correct

### Incomplete data after sync:
1. Check GitHub API rate limits
2. Re-run sync after waiting
3. Check console for specific error messages

