# Planning Guide

A demonstration platform showcasing AI-powered dating profile compatibility matching, where users can create a detailed profile and see how an intelligent matching algorithm evaluates compatibility with other profiles based on multiple factors.

**Experience Qualities**: 
1. **Intelligent** - The AI matching feels thoughtful and considers meaningful compatibility factors beyond surface-level attributes
2. **Transparent** - Users understand why matches are suggested through clear explanations of compatibility factors
3. **Exploratory** - The interface invites discovery of how different profile attributes affect compatibility scores

**Complexity Level**: Light Application (multiple features with basic state)
This is a profile-building and compatibility demonstration tool with AI integration, showing match scores and explanations without requiring full authentication or chat infrastructure.

## Essential Features

### Profile Creation
- **Functionality**: Multi-step form capturing user values, preferences, interests, lifestyle, work schedule, industry, education, and languages
- **Purpose**: Build a comprehensive profile that enables meaningful compatibility analysis
- **Trigger**: User clicks "Create Your Profile" on landing
- **Progression**: Welcome screen → Basic info (name, bio) → Values & Interests → Lifestyle & Work → Optional details (astrology, dietary preferences) → Review & Save → View matches
- **Success criteria**: Profile saved to persistent storage, all required fields validated, user can edit later

### AI Compatibility Matching
- **Functionality**: Uses Azure OpenAI to calculate multi-factor compatibility scores between user profile and sample profiles
- **Purpose**: Demonstrate intelligent matching beyond simple keyword matching
- **Trigger**: Profile completion or clicking "Find Matches"
- **Progression**: Analyze profile → Compare with sample profiles → Calculate scores (0-1) → Filter above threshold (0.70) → Display ranked matches with explanations
- **Success criteria**: Matches display within 3 seconds, scores are consistent, explanations are relevant and specific

### Match Explanations
- **Functionality**: AI generates clear, specific reasons why each match was suggested
- **Purpose**: Build trust and help users understand the matching logic
- **Trigger**: Viewing a match card
- **Progression**: User sees match → Compatibility score displayed → Key factors highlighted → Detailed explanation available on expand
- **Success criteria**: Explanations reference specific shared attributes, feel personalized, avoid generic phrases

### Daily Horoscope (Optional Feature)
- **Functionality**: AI-generated daily horoscope based on user's birth date (if provided)
- **Purpose**: Add personality and engagement for users who opt into astrology features
- **Trigger**: User navigates to Horoscope tab (if birth date provided)
- **Progression**: Open horoscope view → See personalized daily reading → Optional synastry check with matches
- **Success criteria**: Horoscope feels personalized, changes daily, synastry explains astrological compatibility

### Profile Editing
- **Functionality**: Update any profile information and re-trigger matching
- **Purpose**: Allow experimentation and profile refinement
- **Trigger**: Click "Edit Profile" button
- **Progression**: View current profile → Modify any field → Save → Matches automatically refresh
- **Success criteria**: Changes persist, matches update immediately, no data loss

## Edge Case Handling

- **Incomplete Profiles**: Display progress indicator and disable matching until required fields complete
- **No Matches Above Threshold**: Show encouraging message suggesting profile refinement or threshold adjustment
- **AI API Failures**: Graceful fallback with retry option and cached results when possible
- **Extremely Long Text Inputs**: Character limits with clear feedback, truncation in preview cards
- **Missing Optional Data**: Compatibility algorithm adapts to available data without penalizing blanks
- **Invalid Dates**: Date validation with helpful error messages for birth date field

## Design Direction

The design should evoke warmth, trust, and sophistication - feeling modern and intelligent without being clinical. Think warm sunset gradients meeting clean geometric patterns, inviting exploration while maintaining a premium, safe feeling. The aesthetic should balance playfulness (for the dating context) with seriousness (for the AI-powered matching), creating an environment that feels both fun and credible.

## Color Selection

A warm, sophisticated palette centered on coral and deep plum, evoking romance and trust while maintaining modern appeal.

- **Primary Color**: Deep Plum `oklch(0.45 0.15 320)` - Represents depth, sophistication, and emotional connection; used for primary CTAs and headers
- **Secondary Colors**: 
  - Soft Coral `oklch(0.75 0.12 35)` - Warmth and approachability for secondary buttons and accents
  - Warm Cream `oklch(0.96 0.02 85)` - Gentle background that doesn't compete with content
- **Accent Color**: Vibrant Fuchsia `oklch(0.65 0.25 330)` - High-energy highlight for match scores, hearts, and important CTAs
- **Foreground/Background Pairings**: 
  - Primary (Deep Plum): White text `oklch(0.98 0 0)` - Ratio 9.2:1 ✓
  - Accent (Vibrant Fuchsia): White text `oklch(0.98 0 0)` - Ratio 5.8:1 ✓
  - Background (Warm Cream): Dark Purple `oklch(0.25 0.08 320)` - Ratio 13.5:1 ✓
  - Secondary (Soft Coral): Dark text `oklch(0.25 0.08 320)` - Ratio 8.1:1 ✓

## Font Selection

Typography should feel contemporary, warm, and approachable while maintaining excellent readability - a humanist sans-serif that conveys both friendliness and credibility.

**Primary Typeface**: Plus Jakarta Sans - A modern geometric humanist sans with friendly personality and excellent screen legibility

- **Typographic Hierarchy**: 
  - H1 (App Title/Welcome): Plus Jakarta Sans Bold / 36px / -0.02em letter spacing / line-height 1.1
  - H2 (Section Headers): Plus Jakarta Sans Bold / 24px / -0.01em / line-height 1.2
  - H3 (Card Titles): Plus Jakarta Sans Semibold / 18px / normal / line-height 1.3
  - Body (Descriptions): Plus Jakarta Sans Regular / 15px / normal / line-height 1.6
  - Small (Labels/Metadata): Plus Jakarta Sans Medium / 13px / normal / line-height 1.4
  - Scores/Numbers: Plus Jakarta Sans Bold / 32px / -0.02em / line-height 1

## Animations

Animations should create moments of delight during key interactions while maintaining subtlety - celebrating match discoveries with gentle enthusiasm, guiding users through profile creation with smooth transitions, and providing satisfying feedback on all interactions. Profile cards should lift and glow slightly on hover, compatibility scores should animate in with a counting effect, and page transitions should feel like graceful forward progress rather than jarring jumps.

**Key Animation Moments**:
- Match cards: Gentle scale + shadow on hover (150ms ease-out)
- Compatibility score: Count-up animation when revealed (800ms)
- Form step transitions: Slide + fade (300ms ease-in-out)
- Save success: Checkmark with scale bounce (400ms spring)
- Match discovery: Staggered fade-in cascade for match list (100ms delay between items)

## Component Selection

- **Components**: 
  - Forms: Input, Label, Textarea, Select for profile creation
  - Cards: Card component for match displays and profile sections
  - Buttons: Primary (filled primary color), Secondary (outlined), Destructive (for delete/remove)
  - Dialogs: Dialog for match details and explanations
  - Tabs: For organizing profile sections (About, Lifestyle, Preferences, Matches)
  - Progress: Progress bar for profile completion
  - Badge: For displaying tags (interests, languages, dietary preferences)
  - Slider: For optional numeric inputs (e.g., importance weights)
  - Scroll Area: For long lists of matches
  - Skeleton: Loading states during AI computation
  
- **Customizations**: 
  - Match compatibility indicator: Custom circular progress ring showing score percentage
  - Profile completion tracker: Custom multi-step indicator with checkmarks
  - Interest tag selector: Custom multi-select with visual tag chips
  
- **States**: 
  - Buttons: Default with gradient, hover with lift + glow, active with slight press, disabled with 50% opacity
  - Inputs: Default with subtle border, focus with accent glow ring, filled with check icon, error with red border + message
  - Match cards: Default with shadow, hover with lift + accent border, loading with skeleton pulse
  
- **Icon Selection**: 
  - Heart (filled/outlined) for matches and favorites
  - User, Users for profile sections
  - Briefcase for work/career
  - GraduationCap for education
  - Globe for languages
  - Calendar for schedule
  - Sparkle for AI features
  - Moon for horoscope
  - MagnifyingGlass for discovery
  - PencilSimple for editing
  
- **Spacing**: 
  - Page padding: px-6 (mobile), px-12 (desktop)
  - Section gaps: gap-8 for major sections, gap-4 for related groups
  - Card padding: p-6
  - Form field spacing: space-y-4
  - Button padding: px-6 py-3 (default), px-4 py-2 (small)
  
- **Mobile**: 
  - Single column layout throughout (mobile-first)
  - Match cards stack vertically with full width on mobile
  - Tabs convert to scrollable horizontal row on mobile
  - Form inputs expand to full width
  - Sticky header with app name on mobile
  - Bottom sheet for match details (using Drawer component) instead of centered dialog
  - Reduce padding to px-4 on mobile for more content space
