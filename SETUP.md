# Quick Setup Guide

## Step 1: Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=postgresql://neondb_owner:npg_oZewh0Ev2tgY@ep-mute-feather-a1hz76kl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

GITHUB_PAT_TOKEN=your_github_token_here

CRON_SECRET=any_random_string_for_production
```

**Important**: Replace `your_github_token_here` with your actual GitHub Personal Access Token.

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Initialize Database

Run one of these commands:

```bash
# Option 1: Using npm script
npm run init-db

# Option 2: If server is running, visit:
# http://localhost:3000/api/init
```

## Step 4: Start the Application

```bash
npm run dev
```

Visit `http://localhost:3000`

## Step 5: Add Your First Student

1. Click "Add Student" button
2. Enter GitHub username
3. Optionally add student name and email
4. Click "Add Student"

## Step 6: Add Repositories

1. Find the student card
2. Click "View Details"
3. Click "+ Add Repository"
4. Enter repository URL (e.g., `owner/repo` or full GitHub URL)
5. Optionally select an organization
6. Click "Add Repository"

## Step 7: Sync Contributions

Click "Sync Now" on any student card to fetch contributions immediately.

## Daily Sync

The app automatically syncs all repositories daily at 2 AM. You can also:

- **Manual sync**: Click "Sync Now" on any student card
- **Sync via API**: `POST /api/sync` with `{ "student_id": 1 }`
- **Run sync script**: `npm run sync`

## Troubleshooting

### Database Connection Error

- Verify `DATABASE_URL` is correct
- Check if database is accessible
- Ensure SSL mode is set correctly

### GitHub API Rate Limit

- Add `GITHUB_PAT_TOKEN` to `.env.local`
- Without token: 60 requests/hour
- With token: 5,000 requests/hour

### Sync Not Working

- Check GitHub username is correct
- Verify repository is public
- Check API rate limits
- Review sync logs in the database
