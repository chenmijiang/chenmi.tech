# chenmi's Personal Website

This is the source code for chenmi's personal website, built with [Astro](https://astro.build) and deployed on [Vercel](https://vercel.com).

## About

I'm chenmi, a full-stack developer focused on scalable web applications, practical tooling, and AI-assisted workflows. This website hosts my writing, notes, and project updates.

## Project Structure

```text
├── public/               # Static assets (images, fonts, favicon)
│   ├── assets/          # Images for blog posts
│   └── fonts/           # Web fonts
├── src/
│   ├── assets/          # Icons and images used in components
│   ├── components/      # Reusable UI components
│   │   └── ui/          # React components
│   ├── content/         # Content collections
│   │   └── blog/ # Blog posts in Markdown format (organized by year)
│   ├── layouts/         # Page layouts and templates
│   ├── pages/           # Routes and pages
│   ├── styles/          # Global styles and CSS
│   └── utils/           # Utility functions
├── astro.config.mjs     # Astro configuration
├── vercel.json          # Vercel deployment and CSP configuration
├── package.json         # Project dependencies and scripts
├── tailwind.config.mjs  # Tailwind CSS configuration
└── LICENSE              # Dual license (CC BY 4.0 + MIT)
```

## Commands

| Command           | Action                                      |
| :---------------- | :------------------------------------------ |
| `npm install`     | Installs dependencies                       |
| `npm run dev`     | Starts local dev server at `localhost:4321` |
| `npm run build`   | Build the production site to `./dist/`      |
| `npm run preview` | Preview the build locally, before deploying |
| `npm run test`    | Run tests in watch mode                     |
| `npm run test:run`| Run tests once (used by CI)                 |

## Testing

This project uses [Vitest](https://vitest.dev/) for testing.

```text
├── __tests__/              # Test root directory (outside src/)
│   ├── utils/             # Utility function tests
│   ├── components/ui/      # React component tests
│   └── setup.ts           # Test setup (jest-dom matchers)
├── vitest.config.ts        # Vitest configuration
└── src/                   # Source code (no test files)
```

**Key points:**
- Tests are located in `__tests__/` root directory, not alongside source files
- React component tests use `// @vitest-environment jsdom` directive
- Run tests: `npm run test:run`
- Test coverage: `npm run test:coverage`

## Deployment

This site is set up for easy deployment on Vercel. Just connect your GitHub repository to Vercel, and it will automatically build and deploy the site when changes are pushed.

## License

This repository uses dual licensing:

- **Documentation & Blog Posts**: Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)
- **Code & Code Snippets**: Licensed under the [MIT License](LICENSE)

See the [LICENSE](LICENSE) file for full details.

## Credits

This site started from an open-source personal site reference and has been adapted into chenmi's own publishing setup.
