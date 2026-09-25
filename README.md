# Reelread

Turn PDFs and Markdown files into Instagram-Reels-style reading slides. Read vertically, swipe addictively, bookmark as you go.

## Quick Start

### 1. Set Up Supabase

- Create a free account at [supabase.com](https://supabase.com)
- Create a new project
- Run the SQL schema:
  - Go to SQL Editor
  - Create a new query
  - Copy-paste the contents of `SUPABASE_SCHEMA.sql`
  - Run it
- Create a storage bucket named `documents` (via Storage tab)
- Copy your **Project URL** and **Anon Key** (Settings → API)

### 2. Environment Setup

- Copy `.env.example` to `.env`
- Fill in your Supabase credentials:
  ```
  VITE_SUPABASE_URL=your_project_url
  VITE_SUPABASE_ANON_KEY=your_anon_key
  ```

### 3. Run Locally

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000) in your browser.

## Features

**Mobile-First Reader**
- 412×915px (Samsung Galaxy S24 Ultra) optimized
- Vertical scroll with CSS `scroll-snap-type: y mandatory`
- Snappy tap zones: top/bottom to navigate, middle to toggle UI

**Document Support**
- PDFs (client-side extraction with pdfjs-dist)
- Markdown (.md) with full syntax highlighting
- Plain text (.txt)

**Smart Chunking**
- Split PDFs/text by word count (60/100/150 words per slide)
- Split Markdown by `#` or `# and ##` headings
- Never breaks mid-sentence

**Reader Settings** (persistent per-user)
- Font size: 14–32px
- Font family: System Sans, Serif, Mono, OpenDyslexic
- Line height: 1.3 / 1.5 / 1.8 / 2.0
- Reading width: Narrow / Normal / Wide
- Themes: Light, Dark, Sepia, Solarized, High-contrast

**Bookmarks & Progress**
- Double-tap to bookmark (heart animation + haptic)
- Progress bar at bottom (pixel-accurate)
- Progress dots on right (Instagram story pips)
- Auto-hiding UI (2s idle)
- Keyboard: Arrow keys, j/k, Space

## Design

- **Deep charcoal theme**: #0E0E10 bg, #F2F2F0 text
- **Accent**: Warm amber (#F4B860) for bookmarks & active states
- **Fonts**: Fraunces (titles), Inter Tight (body), OpenDyslexic (accessibility)
- **Motion**: Framer Motion for subtle animations

## Tech Stack

- **TanStack Start + React 19** — Full-stack framework
- **Tailwind CSS v4** — Utility styling
- **Supabase** — Auth, database, file storage (RLS-protected)
- **pdfjs-dist** — Client-side PDF extraction (worker guard for SSR)
- **react-markdown + remark-gfm + rehype-highlight** — Markdown rendering with syntax highlighting
- **Framer Motion** — Animations
- **TypeScript** — Type safety

## Building For Production

```bash
npm run build
```

## Deploy

This project uses Nitro as a generic server adapter:

```bash
npm run build
node dist/server/index.mjs
```

For host-specific presets (Vercel, Netlify, Cloudflare, AWS Lambda, etc.), see https://v3.nitro.build/deploy.

## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you render `{children}` in the `shellComponent`.

Here is an example layout that includes a header:

```tsx
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  ),
})
```

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Server Functions

TanStack Start provides server functions that allow you to write server-side code that seamlessly integrates with your client components.

```tsx
import { createServerFn } from '@tanstack/react-start'

const getServerTime = createServerFn({
  method: 'GET',
}).handler(async () => {
  return new Date().toISOString()
})

// Use in a component
function MyComponent() {
  const [time, setTime] = useState('')
  
  useEffect(() => {
    getServerTime().then(setTime)
  }, [])
  
  return <div>Server time: {time}</div>
}
```

## API Routes

You can create API routes by using the `server` property in your route definitions:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: () => json({ message: 'Hello, World!' }),
    },
  },
})
```

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/people')({
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json()
  },
  component: PeopleComponent,
})

function PeopleComponent() {
  const data = Route.useLoaderData()
  return (
    <ul>
      {data.results.map((person) => (
        <li key={person.name}>{person.name}</li>
      ))}
    </ul>
  )
}
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).


# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.


# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).
