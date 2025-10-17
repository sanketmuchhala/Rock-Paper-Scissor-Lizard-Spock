# Multiplayer Setup Guide

This document explains how to set up and deploy the multiplayer functionality for the Rock Paper Scissors Lizard Spock game.

## Architecture

The multiplayer system uses:
- **Vercel KV (Redis)** for serverless state management
- **HTTP Polling** for real-time updates (no WebSockets needed)
- **Next.js API Routes** for serverless backend
- **Client-side polling** at 1-3 second intervals

## Local Development Setup

### 1. Install Dependencies

Dependencies are already installed via `npm install`. The key packages are:
- `@vercel/kv` - Vercel KV client
- `nanoid` - Room code generation

### 2. Set Up Vercel KV

You need a Vercel KV database for local development:

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link your project: `vercel link`
4. Create a KV store in Vercel dashboard:
   - Go to https://vercel.com/dashboard
   - Navigate to Storage tab
   - Click "Create Database" → "KV"
   - Name it (e.g., "rpsls-game-state")
5. Pull environment variables: `vercel env pull .env.local`

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and you'll see the new "Multiplayer" option!

## Testing Locally

1. Open two browser windows (or use incognito mode for the second)
2. Window 1: Click "Multiplayer" → "Create Room"
3. Copy the room code
4. Window 2: Click "Multiplayer" → "Join Room" → Enter code
5. Play the game!

## Production Deployment

### 1. Deploy to Vercel

```bash
vercel --prod
```

### 2. Set Up KV in Production

The KV environment variables will automatically be available in production once you've created the KV store in your Vercel dashboard.

### 3. Verify Deployment

1. Visit your deployed URL
2. Test creating and joining rooms
3. Check Vercel logs if there are any issues

## Features

### User Flow
1. **Username Entry** - Users enter their display name
2. **Create Room** - Generates a 6-character room code
3. **Join Room** - Enter a room code to join
4. **Browse Rooms** - See all available rooms
5. **Game Play** - Real-time synchronized gameplay

### Room Management
- Rooms auto-expire after 30 minutes of inactivity
- Maximum 2 players per room
- Automatic cleanup of finished games

### Polling Strategy
- **Active play**: 2 seconds
- **Waiting for opponent move**: 2 seconds
- **Between rounds**: 5 seconds
- **Game finished**: 5 seconds

## API Endpoints

- `POST /api/multiplayer/create-room` - Create a new game room
- `POST /api/multiplayer/join-room` - Join an existing room
- `GET /api/multiplayer/rooms` - List available rooms
- `GET /api/multiplayer/room-status` - Poll for room updates
- `POST /api/multiplayer/submit-move` - Submit a game move
- `POST /api/multiplayer/next-round` - Start the next round
- `DELETE /api/multiplayer/leave-room` - Leave a room

## Troubleshooting

### "Failed to create room"
- Check that your KV environment variables are set correctly
- Verify KV store exists in Vercel dashboard

### "Room not found"
- Rooms expire after 30 minutes
- Check that the room code is correct (6 characters, uppercase)

### Polling not working
- Check browser console for errors
- Verify API routes are responding (check Network tab)
- Ensure room code and player ID are valid

### Connection issues
- The app will show a red WiFi icon if disconnected
- It will auto-retry up to 5 times with exponential backoff
- Refresh the page if connection is persistently lost

## Performance Optimizations

- Adaptive polling frequency based on game state
- Efficient Redis queries with proper TTL
- Optimistic UI updates
- Request deduplication

## Security

- Room codes are random 6-character strings (over 2 billion combinations)
- Player IDs are unique and validated
- All inputs are sanitized
- Rate limiting via Vercel's built-in protection

## Future Enhancements

Potential improvements:
- Chat messages (4 predefined messages)
- Spectator mode
- Private rooms with passwords
- Matchmaking system
- Leaderboards
- Game history

## Support

For issues or questions:
1. Check the Vercel logs
2. Review this documentation
3. Check the GitHub issues
