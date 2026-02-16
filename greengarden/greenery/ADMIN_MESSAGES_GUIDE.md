# Admin Messages Feature - Setup Guide

## Overview
This feature allows **admins only** to post messages that **all users can view** but **cannot reply to**. This is separate from the regular user posts and comments system.

## What Was Created

### 1. **AdminMessages.jsx** (Admin Component)
- Location: `src/admin/AdminMessages.jsx`
- **Purpose**: Admin interface to create, view, and delete admin messages
- **Features**:
  - Form to post new messages (title + content)
  - Display all admin messages
  - Delete button for admins only

### 2. **AdminMessagesView.jsx** (User Component)
- Location: `src/components/AdminMessagesView.jsx`
- **Purpose**: Read-only view for users to see admin messages
- **Features**:
  - Display all admin messages in a user-friendly format
  - NO reply/comment functionality
  - Displays message timestamp

### 3. **Updated AdminDashboard.jsx**
- Added "Messages" tab to admin dashboard
- Added Mail icon import from lucide-react
- AdminMessages component integrated into the dashboard

### 4. **Updated HomePage.jsx**
- Added AdminMessagesView component to display admin messages to all users
- Appears on the home page below the hero section

### 5. **Database Migration: ADMIN_MESSAGES_SETUP.sql**
- Creates `admin_messages` table
- Sets up Row Level Security (RLS) policies:
  - ✅ Everyone can VIEW admin messages
  - ✅ Only admins can CREATE messages
  - ❌ Regular users CANNOT reply
  - ✅ Only admins can DELETE their own messages

---

## Setup Instructions

### Step 1: Run the SQL Migration
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `ADMIN_MESSAGES_SETUP.sql`
5. Run the query

**OR** if you already have a migration system:
- Add the SQL to your existing migrations

### Step 2: Verify the Components Are Integrated
The components have already been imported and added to:
- ✅ `AdminDashboard.jsx` - AdminMessages tab added
- ✅ `HomePage.jsx` - AdminMessagesView component added

### Step 3: Test the Feature

#### For Admins:
1. Log in as admin
2. Go to Admin Dashboard
3. Click the **"Messages"** tab
4. Create a new message with title and content
5. Messages should appear in the list below
6. Admins can delete their messages

#### For Regular Users:
1. Go to Home page
2. Scroll down to see **"Admin Messages"** section
3. View all admin messages
4. **NO reply/comment button** - this is read-only

---

## Important Notes

⚠️ **Admin Role Check**
The RLS policies assume you have a `profiles` table with a `role` column that can be set to `'admin'`. 

If your admin identification is different, update the policy in the SQL:
```sql
-- If using a different column name:
WHERE profiles.is_admin = true
-- OR if using a different approach:
WHERE profiles.user_type = 'administrator'
```

---

## Key Differences from User Posts

| Feature | User Posts (Post.jsx) | Admin Messages |
|---------|----------------------|-----------------|
| Who can create | Logged-in users | Admins only |
| Who can see | All users | All users |
| Reply/Comments | ✅ Yes, users can comment | ❌ No replies allowed |
| Database table | `posts` | `admin_messages` |
| Edit capability | Users can edit their own | Admins only |
| Visibility | Post feed | Home page + Admin panel |

---

## File Structure
```
greengarden/
├── src/
│   ├── admin/
│   │   ├── AdminMessages.jsx ✨ NEW
│   │   ├── AdminDashboard.jsx (UPDATED)
│   │   └── ...
│   ├── components/
│   │   ├── AdminMessagesView.jsx ✨ NEW
│   │   └── ...
│   └── pages/
│       ├── HomePage.jsx (UPDATED)
│       └── ...
└── ADMIN_MESSAGES_SETUP.sql ✨ NEW
```

---

## Troubleshooting

### Messages not appearing for users:
- Check if the `admin_messages` table exists in Supabase
- Verify RLS policies are set correctly
- Check browser console for errors

### Users can edit/delete admin messages:
- Check the RLS policies - they should prevent this
- Only admin_id matching auth.uid() should be able to delete

### Can't create messages as admin:
- Verify your profile has `role = 'admin'` in the profiles table
- Check the RLS policy for INSERT permission

---

## Future Enhancements
- Add message categories/tags
- Add scheduled message posting
- Add analytics (view count)
- Add pinned messages
- Add message search/filtering
