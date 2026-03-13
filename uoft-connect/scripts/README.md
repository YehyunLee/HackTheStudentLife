# Database Management Scripts

Scripts to manage DynamoDB data for UofT Connect.

## Prerequisites

Make sure you have AWS credentials configured with access to the DynamoDB tables:
- `uoft-connect-posts`
- `uoft-connect-users`
- `uoft-connect-messages`

## Available Commands

### Seed Database with Mock Data
```bash
npm run db:seed
```
Populates the database with mock users and posts. Includes:
- **5 Users**: 2 professors and 3 students
- **4 Posts**: Research opportunities, study groups, and project collaborations
- Realistic interactions (likes, replies)

### Clear All Data
```bash
npm run db:clear
```
⚠️ **WARNING**: Deletes ALL data from all tables. Use with caution!

### Reset Database (Clear + Seed)
```bash
npm run db:reset
```
Clears all existing data and then seeds with fresh mock data. Perfect for:
- Preparing for presentations
- Resetting to a clean demo state
- Testing from scratch

## Mock Data Overview

### Professors
- **Dr. John Smith** (`john.smith@utoronto.ca`) - ML/AI researcher
- **Dr. Lisa Chen** (`lisa.chen@cs.toronto.edu`) - HCI/UX researcher

### Students
- **Thomas Lee** (`thomas.lee@mail.utoronto.ca`) - 3rd year CS
- **Sarah Kim** (`sarah.kim@mail.utoronto.ca`) - 4th year CS
- **Alex Wong** (`alex.wong@mail.utoronto.ca`) - 2nd year CS

### Posts Include
- Research opportunities from professors
- Study group requests
- Project collaboration posts
- Realistic replies and interactions

## Usage for Presentations

**Before your presentation:**
```bash
npm run db:reset
```

This ensures you have clean, consistent demo data every time.

## Notes

- Scripts use the AWS SDK and require proper credentials
- Region is set to `us-west-2`
- All timestamps are dynamically generated for realistic data
- Mock data includes proper role assignments (professor vs student)
