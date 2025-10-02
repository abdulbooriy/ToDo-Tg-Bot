# ToDo Telegram Bot

A Telegram bot for managing personal to-do tasks with time tracking and priority levels, built with Grammy.js and PostgreSQL.

## Features

- **Add Tasks** - Create tasks with name, time, and priority level (low, medium, high)
- **Complete Tasks** - Mark tasks as completed
- **Delete Tasks** - Remove unwanted tasks
- **View All Tasks** - Display all your tasks with their details
- **Database Persistence** - All tasks are stored in PostgreSQL using Prisma ORM

## Tech Stack

- **Node.js** - Runtime environment (ES Modules)
- **Grammy.js** - Modern Telegram Bot framework
- **Prisma** - Next-generation ORM for database management
- **PostgreSQL** - Relational database
- **@grammyjs/conversations** - Conversational flows for interactive task creation
- **@grammyjs/runner** - Bot runner for efficient polling

## Prerequisites

Before running this bot, ensure you have:

- Node.js installed (v16 or higher)
- PostgreSQL database running
- A Telegram Bot Token (from [@BotFather](https://t.me/botfather))

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ToDo-Telegram-Bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory (or update the existing one):
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   BOT_TOKEN="your_telegram_bot_token_here"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

## Usage

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and bot introduction |
| `/add` | Start conversation to add a new task |
| `/tasks` | View all your tasks |
| `/complete` | Mark a task as completed |
| `/delete` | Delete a task |

## Adding a Task

When you use `/add`, the bot will ask you:

1. **Task Name** - Enter the name of your task
2. **Task Time** - Enter in format: `dd.mm.yy hh:mm` (e.g., `21.07.25 14:30`)
3. **Task Level** - Choose: `low`, `medium`, or `high`

## Database Schema

```prisma
model Todo {
  id        Int      @id @default(autoincrement())
  userId    BigInt
  taskName  String
  taskTime  DateTime
  taskLevel String?
  status    String   @default("faol")
  createdAt DateTime @default(now())
}
```

## Project Structure

```
ToDo-Telegram-Bot/
├── bot.js                 # Main bot application file
├── package.json           # Project dependencies and scripts
├── prisma/
│   ├── schema.prisma      # Database schema definition
│   └── migrations/        # Database migration files
├── .env                   # Environment variables (not in git)
├── .gitignore            # Git ignore rules
└── README.md             # Project documentation
```

## Scripts

- `npm start` - Run the bot with auto-restart on file changes
- `npm run dev` - Same as start (development mode)
- `npm test` - Run tests (not configured yet)

## Language

The bot interface is in Uzbek (Latin script).

## Notes

- The bot uses BigInt for user IDs to handle Telegram's large integer values
- All tasks are private to each user (based on their Telegram user ID)
- The date format expected is `dd.mm.yy hh:mm` (e.g., `21.07.25 14:30`)
- Task priority levels must be exactly: `low`, `medium`, or `high`

## License

ISC

## Author

Created as a personal task management bot for Telegram users.
