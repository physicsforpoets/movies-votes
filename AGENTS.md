# Movie Votes Application

A full-stack application for voting on movies during movie marathons. Users can browse movies, mark favorites, and vote for their top picks in voting rounds.

## Architecture

### Tech Stack

- **Frontend**: Vue 3 with Composition API
- **Backend**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Railway (automated deployments on push to main)
- **Movie Data**: The Movie Database (TMDB) API

### Project Structure

#### Backend (`/backend`)

- `index.js` - Express server entry point
- `prisma/` - Database schema and migrations
- `routes/` - API route handlers
  - `favoritesRoutes.js` - User favorites management
  - `listsRoutes.js` - Movie list operations
  - `lookupRoutes.js` - TMDB integration
  - `moviesRoutes.js` - Movie CRUD operations
  - `servicesRoutes.js` - Streaming service management
  - `usersRoutes.js` - User operations
  - `votesRoutes.js` - Voting functionality
- `util/TMDBUtil.js` - TMDB API utilities

#### Frontend (`/frontend`)

- `src/components/` - Reusable Vue components
  - `MovieCard.vue` - Movie card display with favorites toggle
  - `MovieDetail.vue` - Movie detail modal with watch status
  - `VoteForm.vue` - Voting form
  - `ResultsList.vue` - Voting results display
- `src/stores/` - Pinia stores for state management
  - `favorites.js` - Favorites state
  - `list.js` - Current list state
  - `votes.js` - Voting state
- `src/views/` - Page components
  - `GridView.vue` - Main movie grid view
  - `VotingView.vue` - Voting interface
  - `RankedView.vue` - Movie standings and watched list
  - `MovieAddView.vue` - Admin form for adding movies
- `src/config.json` - Hardcoded list ID (only 1 active list at a time)

## Core Features

### Movie Management

- Browse movies from a predefined list
- View movie details including description, ratings, trailers, and reviews
- Mark movies as favorites
- Filter and sort movies by title or release date
- Mark movies as watched/unwatched
- TMDB integration for additional movie metadata

### Favorites System

- Users can mark movies as favorites (heart icon)
- Favorites persist across sessions
- Favorites list is filtered to unwatched movies only

### Voting System

- **Voting Rounds**: Admin-controlled voting periods
- **Vote Limits**: Users can select up to 3 movies from their favorites per round
- **Active Rounds**: Only one voting round is active at a time
- **Standings**: Movies ranked by vote count
- Users see results when voting round is active but they've already voted

### User Management

- **No Authentication**: Simple anonymous user system
- Random device ID generated on client side
- Device ID passed as header on all API requests
- Each device gets its own favorites and votes

## Current Admin Capabilities

### Adding Movies (`MovieAddView.vue`)

- TMDB search integration
- Manual form entry for all movie fields
- Poster URL management (regular and secure)
- Rating selection (NR, G, PG, PG-13, R, NC-17)
- Service availability tags
- Add to list functionality

### Database Management

- Currently manual: Edit database directly to:
  - Toggle `votingActive` flag
  - Increment `votingRound` number
  - Manage movie data

## Planned Enhancements

### 1. Admin Voting Controls

**Status**: Planned  
**Description**: Create an admin form to:

- Toggle voting active/inactive
- Automatically increment voting round number
- End current round and announce winner

**Current Implementation**: Manual database edits

---

### 2. Real-time Notifications

**Status**: Planned  
**Description**: Implement real-time notifications using Socket.IO (or Railway-compatible alternative) to notify users when:

- Voting has started
- Voting has ended
- Winner has been announced

**Benefits**:

- Immediate notifications without page refresh
- Better user engagement
- Seamless voting experience

---

### 3. Tie-Breaker System

**Status**: Planned  
**Description**: When ending a voting round, if there's a tie:

- Automatically select a random winner from the tied movies
- Announce both the tie result and the randomly selected winner

**Use Case**: Fair resolution when multiple movies receive the same number of votes

---

## Configuration

### Environment Setup

The app uses a hardcoded list ID in `frontend/src/config.json`:

```json
{
  "listId": "21307903-10d0-4265-8ed1-40286c22eea4",
  "maxVotesPerRound": 3
}
```

### Database Schema

Key Prisma models:

- `Movie` - Movie information and metadata
- `List` - Collections of movies
- `User` - Device-based users
- `Favorite` - User's favorite movies
- `Vote` - User votes for specific rounds
- `Service` - Streaming service providers

## Deployment

- **Platform**: Railway
- **Automation**: Automatic deployment on push to `main` branch
- **Database**: PostgreSQL managed by Railway

## Development Notes

- No authentication system (device-based identification only)
- Single active list (hardcoded for simplicity)
- Admin tools currently minimal (manual DB edits)
- Designed for small groups (friends voting on movie nights)
