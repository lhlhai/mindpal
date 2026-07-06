# MindPal - Your Second Brain

MindPal is an intelligent personal note-taking and task management application that helps you capture, organize, and retrieve your thoughts, tasks, and knowledge using AI-powered processing.

## Features

### 🧠 AI-Powered Entry Processing
- **Natural Language Input**: Enter notes, tasks, or events using natural language
- **Voice Input**: Capture entries using Web Speech API (microphone support)
- **Smart Parsing**: MiniMax-M3 AI automatically extracts and categorizes:
  - Entry type (task, event, knowledge, note)
  - Title and description
  - Date/time and end time
  - Priority level
  - Tags and people involved
  - Additional notes
- **Fallback Logic**: If AI processing fails, entries are saved as notes automatically

### 📊 Dashboard & Visualization
- **Dashboard**: View entries organized by:
  - Today's items
  - Upcoming (next 7 days)
  - Recently added
- **Calendar View**: Monthly calendar with color-coded entries by type
- **Entry List**: Browse all entries with advanced filtering and search

### 🔍 Search & Filter
- Filter by type (task, event, knowledge, note)
- Filter by status (pending, done, archived)
- Filter by tags
- Full-text search across all entries

### ⏰ Reminders & Notifications
- Create reminders for entries
- Automatic reminder detection
- In-app notifications
- Quiet hours support

### ⚙️ Settings & Preferences
- Timezone configuration
- Quiet hours (do not disturb)
- AI tone selection (professional, casual, creative, analytical, friendly)
- Data export (JSON/Markdown)

### 📱 Mobile-First Design
- Responsive layout optimized for mobile devices
- Neutral color palette with light blue accent
- Intuitive navigation
- Touch-friendly interface

## Tech Stack

- **Frontend**: React 19 + Tailwind CSS 4 + shadcn/ui
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL/TiDB with Drizzle ORM
- **AI**: MiniMax-M3 (via NVIDIA Build)
- **Authentication**: Manus OAuth
- **Voice**: Web Speech API

## Project Structure

```
mindpal/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and helpers
│   │   └── styles/        # Global styles
│   └── public/            # Static assets
├── server/                 # Express backend
│   ├── routers/           # tRPC procedure definitions
│   ├── lib/               # Server utilities
│   └── _core/             # Framework core
├── drizzle/               # Database schema & migrations
└── shared/                # Shared types & constants
```

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm package manager
- MySQL/TiDB database
- Manus OAuth credentials
- MiniMax API key (for AI processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mindpal
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create `.env.local` with:
   ```
   DATABASE_URL=mysql://user:password@localhost/mindpal
   JWT_SECRET=your-secret-key
   VITE_APP_ID=your-manus-app-id
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://portal.manus.im
   MINIMAX_API_KEY=your-minimax-api-key
   ```

4. **Set up database**
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`

## Usage

### Quick Add Entry
1. Click the **+** button in the bottom-right corner
2. Enter text or use the microphone button for voice input
3. AI will automatically process and categorize the entry
4. Confirm and save

### View Dashboard
- **Today**: See today's entries
- **Upcoming**: View entries for the next 7 days
- **Recently Added**: Browse recently created entries

### Browse All Entries
- Click **All Entries** to view all entries
- Use filters to narrow down by type, status, or tag
- Use search to find specific entries

### Edit Entry
1. Click on an entry to view details
2. Edit any field (title, type, priority, datetime, tags, people, notes)
3. Click **Save Changes**

### View Calendar
- Click **Calendar** to see a monthly calendar view
- Entries are color-coded by type
- Click on an entry to view details

### Manage Settings
- Click **Settings** to configure:
  - Timezone
  - Quiet hours
  - AI tone preference
  - Export data as JSON or Markdown

## API Documentation

### tRPC Routers

#### Entries Router (`trpc.entries.*`)
- `processEntry(rawText)` - Process and save a new entry
- `list(filters)` - Get entries with filtering
- `get(id)` - Get a specific entry
- `update(id, data)` - Update an entry
- `getToday()` - Get today's entries
- `getUpcoming()` - Get upcoming entries (7 days)
- `getRecent(limit)` - Get recently added entries
- `getTags()` - Get all tags
- `getSettings()` - Get user settings

#### Reminders Router (`trpc.reminders.*`)
- `create(entryId, remindAt, message)` - Create a reminder
- `list(entryId?, limit, offset)` - Get reminders
- `update(id, data)` - Update a reminder
- `delete(id)` - Delete a reminder
- `getPending(limit)` - Get pending reminders

#### Auth Router (`trpc.auth.*`)
- `me()` - Get current user
- `logout()` - Logout current user

## Development

### Run Tests
```bash
pnpm test
```

### Type Check
```bash
pnpm check
```

### Format Code
```bash
pnpm format
```

### Build for Production
```bash
pnpm build
pnpm start
```

## Features Roadmap

- [ ] Drag-and-drop to reschedule entries
- [ ] Tag management UI
- [ ] Full-text search with backend support
- [ ] Cron job for automated reminders
- [ ] Web Notifications API integration
- [ ] Dark mode support
- [ ] Collaborative sharing
- [ ] Mobile app (React Native)
- [ ] Browser extension

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions, please open an issue on GitHub or contact support.

## Acknowledgments

- Built with [React](https://react.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Backend framework [Express](https://expressjs.com)
- Type-safe RPC with [tRPC](https://trpc.io)
- Database ORM [Drizzle](https://orm.drizzle.team)
- AI processing with [MiniMax](https://www.minimaxi.com)
