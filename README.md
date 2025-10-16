# RPSLS: Hyperlink Edition

[![Test](https://github.com/your-username/Rock-Paper-Scissor-Lizard-Spock/actions/workflows/test.yml/badge.svg)](https://github.com/your-username/Rock-Paper-Scissor-Lizard-Spock/actions/workflows/test.yml)

**Pick a hand. Bend the odds.**

A production-ready, mobile-first web app to play Rock–Paper–Scissors–Lizard–Spock online with a Big Bang Theory twist.

## Features

- 🎮 **Real-time multiplayer**: Create or join rooms with a 6-digit code
- 📋 **Room browser**: Browse and join available rooms
- 🤖 **Computer gameplay**: Play against a random computer opponent
- 👥 **Hotseat mode**: Two players on the same device (offline mode)
- 📱 **Mobile-first design**: Optimized for iOS/Android with large touch targets
- ⚫ **Minimalist black/white design**: Clean, elegant interface
- 🎭 **Big Bang Theory references**: Bazinga! and other Sheldon quotes
- ⚡ **Lightning fast**: Built with Next.js 14 App Router and Edge Runtime
- 🔒 **Secure**: HMAC-based anti-cheat system
- 🔄 **Realtime**: WebSocket connections with Supabase fallback
- 🎵 **Immersive**: Sound effects and micro-interactions
- 📴 **Offline support**: PWA with Hotseat Mode for local play
- 🧪 **Well-tested**: Unit tests with Vitest and Testing Library
- 🧹 **Automatic cleanup**: Game sessions deleted after completion

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Validation**: Zod
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library
- **Realtime**: WebSockets (Vercel) with Supabase fallback
- **Deployment**: Vercel

## Game Rules

Rock-Paper-Scissors-Lizard-Spock follows these rules:

- ✊ Rock crushes ✌️ Scissors and 🤏 Lizard
- ✋ Paper covers ✊ Rock and 🙏 disproves 🖖 Spock
- ✌️ Scissors cuts ✋ Paper and 🤏 decapitates Lizard
- 🤏 Lizard poisons 🖖 Spock and eats ✋ Paper
- 🖖 Spock vaporizes ✊ Rock and smashes ✌️ Scissors

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_WS_ADAPTER=vercel
# For Supabase fallback:
# NEXT_PUBLIC_WS_ADAPTER=supabase
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Game Modes

1. **Multiplayer**: Create or join rooms for real-time gameplay
2. **Room Browser**: Browse available rooms and join with one click
3. **Computer**: Play against a random computer opponent
4. **Hotseat**: Two players on the same device (offline mode)

## Deployment

### Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Adapter Switching

To switch between Vercel WebSocket and Supabase Realtime:

1. Set `NEXT_PUBLIC_WS_ADAPTER` to `vercel` or `supabase`
2. For Supabase, also provide `SUPABASE_URL` and `SUPABASE_ANON_KEY`

## Architecture

```
app/              # Next.js pages and routes
components/       # React components
lib/              # Business logic and utilities
server/           # WebSocket server handlers
types/            # TypeScript types
public/           # Static assets
__tests__/        # Unit tests
```

## API Endpoints

- `POST /api/websocket` - Handle room creation, joining, and listing
- `GET /api/status` - Get server status

## PWA & Offline Support

The app works offline with Hotseat Mode for two players on one device. Install it on mobile devices for the full experience.

## Development

```bash
# Run development server
npm run dev

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run

# Lint code
npm run lint
```

## Testing

- Unit tests for game logic
- Integration tests for WebSocket events
- Accessibility checks
- Performance benchmarks

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - see LICENSE file for details.