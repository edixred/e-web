# LinguaRead - MVP Specification

## 1. Project Overview

**Project Name:** LinguaRead  
**Type:** Web Application (PWA)  
**Core Functionality:** Language learning platform with parallel reading and synchronized audio, inspired by Beelinguapp  
**Target Users:** English learners (Spanish speakers) at levels A1-C1

---

## 2. UI/UX Specification

### Layout Structure

**Pages:**
1. **Landing/Home** - Hero section, features, CTA
2. **Dashboard** - User library, progress, recommended stories
3. **Reader** - Parallel reading interface with audio player
4. **Auth Pages** - Login/Register

**Responsive Breakpoints:**
- Mobile: < 640px (single column, stacked translations)
- Tablet: 640px - 1024px (side-by-side with reduced margins)
- Desktop: > 1024px (full side-by-side view)

### Visual Design

**Color Palette:**
- Primary: `#3B82F6` (Blue-500)
- Primary Dark: `#1E40AF` (Blue-800)
- Secondary: `#10B981` (Emerald-500)
- Accent: `#F59E0B` (Amber-500)
- Background: `#F8FAFC` (Slate-50)
- Surface: `#FFFFFF`
- Text Primary: `#1E293B` (Slate-800)
- Text Secondary: `#64748B` (Slate-500)
- Active Sentence: `#FEF3C7` (Amber-100)
- Border: `#E2E8F0` (Slate-200)

**Typography:**
- Font Family: `Inter`, system-ui, sans-serif
- English Text: 18px (body), 24px (headings)
- Spanish Translation: 16px (body), 20px (headings)
- Line Height: 1.75 for readability

**Spacing System:**
- Base unit: 4px
- Container max-width: 1280px
- Section padding: 24px (mobile), 48px (desktop)
- Card padding: 16px

### Components

**Navigation:**
- Fixed header with logo, nav links, user menu
- Mobile: hamburger menu with slide-out drawer

**Story Cards:**
- Thumbnail, title, difficulty badge, progress bar
- Hover: subtle scale (1.02) and shadow elevation

**Reader Interface:**
- Split view: English (left/top) | Spanish (right/bottom)
- Active sentence highlighted with background color
- Audio waveform visualization
- Play/Pause, speed control (0.5x-1.5x), progress scrubber

**Audio Player:**
- Floating bottom bar on mobile
- Inline on desktop
- Controls: play/pause, skip back 5s, skip forward 5s, speed, volume

**Progress Indicators:**
- Circular progress for overall completion
- Linear progress for current story
- Streak counter for daily usage

---

## 3. Functionality Specification

### Core Features

**F1: User Authentication**
- Email/password registration and login
- JWT tokens with Redis session storage
- Password reset flow (email)

**F2: Story Generation**
- API integration with OpenAI/Anthropic for generating:
  - Short stories (500-1500 words)
  - Parallel translations (English-Spanish)
  - Difficulty-appropriate vocabulary
- Difficulty levels: A1, A2, B1, B2, C1
- Story categories: Adventure, Science Fiction, Romance, Mystery

**F3: Audio Synchronization**
- Text-to-Speech API (ElevenLabs/Azure)
- Word-level timestamps for highlighting
- Audio caching in Redis
- Offline playback capability (PWA)

**F4: Parallel Reading**
- Side-by-side or stacked view (responsive)
- Auto-scroll following active sentence
- Click sentence to jump to audio position
- Vocabulary highlighting (tap to see definition)

**F5: Progress Tracking**
- Save reading position per story
- Track completed stories
- Learning statistics (time spent, words read)
- Achievement system

**F6: Content Library**
- Browse by difficulty
- Search by title/keyword
- Recommended stories based on level
- Favorites/bookmarks

### User Interactions & Flows

**Registration Flow:**
1. User enters email, password, name
2. System validates and creates account
3. User redirected to dashboard
4. Onboarding: select proficiency level

**Reading Flow:**
1. User selects story from library
2. Story loads with cached audio/translation (or generates)
3. User presses play → audio starts, first sentence highlights
4. Audio progresses → sentences highlight in sync
5. User can pause, adjust speed, tap sentence
6. On completion: progress saved, next story suggested

### Data Models

**User:**
- id, email, password_hash, name, level, created_at, updated_at

**Story:**
- id, title_en, title_es, content_en, content_es, level, category, audio_url, created_at

**ReadingProgress:**
- id, user_id, story_id, current_position, completed, completed_at

**UserSettings:**
- id, user_id, theme, font_size, auto_scroll, playback_speed

---

## 4. Technical Architecture

### Backend (FastAPI)

**Endpoints:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /stories` - List stories (paginated, filterable)
- `GET /stories/{id}` - Get story details
- `POST /stories/generate` - Generate new story (AI)
- `GET /stories/{id}/audio` - Get audio with timestamps
- `GET /user/progress` - Get user progress
- `PUT /user/progress/{story_id}` - Update reading progress
- `GET /user/stats` - Get learning statistics

**Services:**
- `AuthService` - JWT, password hashing
- `StoryService` - CRUD, caching
- `AIService` - OpenAI/Anthropic integration
- `AudioService` - TTS, timestamp generation

### Frontend (React + Tailwind)

**State Management:**
- React Context for auth state
- React Query for server state
- Local storage for preferences

**Key Components:**
- `App` - Router, providers
- `Layout` - Header, navigation
- `StoryCard` - Story preview
- `Reader` - Main reading interface
- `AudioPlayer` - Audio controls
- `ProgressRing` - Circular progress

### Infrastructure

**Docker Services:**
- `frontend` - React build + Nginx
- `backend` - FastAPI uvicorn
- `postgres` - PostgreSQL 15
- `redis` - Redis 7

---

## 5. Acceptance Criteria

- [ ] User can register and login
- [ ] Dashboard displays story library
- [ ] Story generation creates parallel content
- [ ] Audio plays synchronized with text highlighting
- [ ] Reading progress is persisted
- [ ] Application is responsive (mobile-first)
- [ ] Docker compose starts all services
- [ ] PWA is installable on Android
- [ ] All environment variables documented in .env.example
