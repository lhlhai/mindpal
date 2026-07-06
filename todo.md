# MindPal - Project TODO

## Phase 1: Database & Schema Setup
- [x] Create entries table with all required fields (id, user_id, raw_text, processed_json, type, title, datetime, end_datetime, priority, status, tags, people, notes, embedding, created_at, updated_at)
- [x] Create reminders table (id, entry_id, remind_at, message, sent, created_at)
- [x] Create tags table (id, name, color, user_id)
- [x] Create settings table for user preferences (user_id, quiet_hours_start, quiet_hours_end, timezone, ai_tone)
- [x] Generate and apply database migrations

## Phase 2: API & AI Integration
- [x] Set up MiniMax-M3 API client in lib/ai-client.ts
- [x] Add error handling and fallback logic for AI failures
- [x] Write tests for AI client fallback logic
- [x] Add embedding field to entries table
- [x] Create entries router with processEntry, list, get, update procedures
- [x] Implement getToday, getUpcoming, getRecent procedures
- [x] Implement getTags and getSettings procedures
- [ ] Create /api/send-reminders endpoint (GET) - cron job for checking and sending reminders
- [ ] Create /api/search endpoint (GET) - full-text search
- [ ] Set up Vercel Cron Jobs configuration in vercel.json

## Phase 3: Frontend - Dashboard & Quick Dump
- [x] Design color palette and theme (neutral base + light blue accent)
- [x] Update global styles in client/src/index.css
- [x] Create QuickAddModal component with textarea and microphone button
- [x] Implement Web Speech API integration for voice input
- [x] Create floating action button (+) component
- [x] Build Dashboard page with three sections: Today, Upcoming (7 days), Recently Added
- [x] Create EntryCard component for displaying entries
- [x] Add Done button/toggle for entries
- [ ] Implement real-time updates using Supabase subscriptions

## Phase 4: Frontend - Management Pages
- [x] Create EntryList page (/entries) with card view
- [x] Implement filter bar (by type, tag, status)
- [x] Implement full-text search functionality
- [x] Create EntryDetail page (/entries/:id)
- [x] Build entry editor form (all editable fields)
- [ ] Create reminder management UI
- [x] Build Calendar View page (/calendar) with month view (fixed layout)
- [ ] Implement drag-and-drop for changing entry dates
- [ ] Create TagManager page for managing tags
- [x] Build Settings page (/settings) with user preferences
- [x] Implement data export functionality (JSON/Markdown with localStorage)

## Phase 5: Reminders & Cron Jobs
- [x] Create reminders router procedures (create, list, update, delete, getPending)
- [ ] Implement reminder management UI in EntryDetail
- [ ] Configure Vercel Cron Jobs to call /api/send-reminders every 5 minutes
- [ ] Implement in-app notification system
- [ ] Add Web Notifications API support
- [ ] Implement logic to skip reminders for completed entries
- [ ] Add reminder history tracking

## Phase 6: Testing & Optimization
- [ ] Write unit tests for API endpoints
- [ ] Write tests for AI processing logic
- [ ] Test reminder system functionality
- [ ] Test mobile responsiveness
- [ ] Optimize bundle size
- [ ] Test authentication flow
- [ ] Performance testing and optimization

## Phase 7: Deployment & Documentation
- [ ] Set up environment variables (MINIMAX_API_KEY, SUPABASE_URL, etc.)
- [ ] Create comprehensive README with setup instructions
- [ ] Test deployment to Vercel
- [ ] Verify Supabase integration
- [ ] Final QA and bug fixes
- [ ] Create checkpoint and prepare for delivery

## Additional Tasks
- [ ] Configure Manus OAuth integration
- [ ] Set up Supabase real-time subscriptions
- [ ] Implement timezone handling
- [ ] Add input validation and sanitization
- [ ] Implement rate limiting for API endpoints
