# CineSeeker

CineSeeker is a modern, responsive movie recommendation website built with HTML, CSS, and vanilla JavaScript. It uses The Movie Database (TMDB) API to display live movie data, show detailed movie pages, manage favorites with local storage, and provide a polished browsing experience suitable for a web development internship portfolio.

## Features

- Trending, popular, top rated, and upcoming movie sections
- Search-as-you-type with debounce and clear button
- Movie details page with cast, director, trailer, and recommendations
- Favorites stored in browser local storage
- Dark mode with persistent preference
- Responsive glassmorphism UI with skeleton loaders and animations
- Recently viewed movies and copy/share movie link actions
- Accessible semantic markup and keyboard-friendly controls

## Folder Structure

```
CineSeeker/
├── index.html
├── movie.html
├── favorites.html
├── about.html
├── css/
│   ├── style.css
│   ├── responsive.css
│   └── variables.css
├── js/
│   ├── config.js
│   ├── api.js
│   ├── main.js
│   ├── movie.js
│   ├── favorites.js
│   ├── theme.js
│   ├── utils.js
│   └── components.js
├── assets/
│   ├── images/
│   └── icons/
└── README.md
```

## Installation

1. Clone or download the repository.
2. Open the project folder in VS Code or your preferred editor.
3. Serve the files using a local static server such as Live Server.

## TMDB API Setup

1. Create a TMDB account.
2. Generate an API key from your TMDB profile.
3. Open [js/config.js](js/config.js) and replace `YOUR_TMDB_API_KEY` with your real key.
4. Refresh the site to load live API data.

If no key is provided, the site falls back to bundled demo movie data so the project still works offline.

## Deployment

You can deploy CineSeeker to GitHub Pages or Vercel as a static site. No backend is required.

## Screenshots

Add screenshots of the home page, movie details page, favorites page, and mobile navigation here.

## Future Improvements

- Infinite scrolling for large movie lists
- Genre-specific landing pages
- User accounts and cloud sync
- Advanced recommendation ranking
- Server-side image optimization

## Acknowledgements

- TMDB for movie data and artwork
- Google Fonts for the Poppins font family

## License

This project is provided for educational and portfolio use.
