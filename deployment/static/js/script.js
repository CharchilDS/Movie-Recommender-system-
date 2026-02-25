let selectedMovie = '';
let typingTimer;
const typingDelay = 350;

const movieSearch = document.getElementById('movieSearch');
const searchBtn = document.getElementById('searchBtn');
const suggestions = document.getElementById('suggestions');
const errorMessage = document.getElementById('errorMessage');
const selectedMovieDiv = document.getElementById('selectedMovie');
const selectedMovieName = document.getElementById('selectedMovieName');
const results = document.getElementById('results');
const movieCards = document.getElementById('movieCards');
const loading = document.getElementById('loading');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const heroTitle = document.getElementById('heroTitle');
const heroSubtitle = document.getElementById('heroSubtitle');
const heroSection = document.querySelector('.hero');

movieSearch.addEventListener('input', handleInput);
movieSearch.addEventListener('keypress', handleEnterKey);

function handleInput(e) {
    clearTimeout(typingTimer);
    const query = e.target.value.trim();

    if (query.length < 2) {
        hideSuggestions();
        return;
    }

    typingTimer = setTimeout(() => fetchSuggestions(query), typingDelay);
}

function handleEnterKey(e) {
    if (e.key === 'Enter') {
        searchMovie();
    }
}

async function fetchSuggestions(query) {
    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.matches && data.matches.length > 0) {
            displaySuggestions(data.matches);
        } else {
            hideSuggestions();
        }
    } catch (error) {
        hideSuggestions();
        console.error('Error fetching suggestions:', error);
    }
}

function displaySuggestions(matches) {
    suggestions.innerHTML = '';

    matches.slice(0, 10).forEach((movie) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = movie;
        item.onclick = () => selectMovie(movie);
        suggestions.appendChild(item);
    });

    suggestions.classList.remove('hidden');
}

function hideSuggestions() {
    suggestions.classList.add('hidden');
    suggestions.innerHTML = '';
}

function selectMovie(movie) {
    selectedMovie = movie;
    movieSearch.value = movie;
    hideSuggestions();
    searchMovie();
}

async function searchMovie() {
    const query = movieSearch.value.trim();

    if (!query) {
        showError('Please enter a movie name.');
        return;
    }

    hideError();
    hideResults();
    hideSuggestions();

    showLoading();
    setButtonLoading(true);

    try {
        const response = await fetch('/api/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movie: query })
        });

        const data = await response.json();

        if (response.ok) {
            selectedMovie = data.input_movie;
            displayResults(data.input_movie, data.recommendations);
            updateHero(data.input_movie, data.input_movie_details);
        } else {
            showError(data.error || 'Movie not found. Please try another one.');
        }
    } catch (error) {
        showError('Network error. Please try again.');
        console.error('Error:', error);
    } finally {
        hideLoading();
        setButtonLoading(false);
    }
}

function displayResults(inputMovie, recommendations) {
    selectedMovieName.textContent = inputMovie;
    selectedMovieDiv.classList.remove('hidden');

    movieCards.innerHTML = '';

    recommendations.forEach((movie, index) => {
        const card = createMovieCard(movie, index);
        movieCards.appendChild(card);
    });

    results.classList.remove('hidden');
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function createMovieCard(movie, index) {
    const card = document.createElement('div');
    card.className = 'movie-card card-enter';
    card.style.animationDelay = `${index * 70}ms`;

    const similarityPercent = Math.max(0, Math.min(100, Math.round(movie.similarity_score * 100)));
    const gradient = titleGradient(movie.title);
    const meta = movieMeta(movie, similarityPercent);

    card.innerHTML = `
        <div class="movie-poster">
            <span class="poster-rank">${index + 1}</span>
            <span class="poster-initial">${escapeHtml(movie.title[0] || 'M')}</span>
            <div class="poster-glow"></div>
            <div class="poster-title">${escapeHtml(movie.title)}</div>
        </div>
        <div class="movie-info">
            <div class="meta-chips">
                <span class="chip chip-genre">${meta.genre}</span>
                <span class="chip">${meta.year}</span>
                <span class="chip">${meta.runtime}</span>
            </div>
            <div class="similarity-section">
                <span class="similarity-label">Match</span>
                <div class="similarity-bar">
                    <div class="similarity-fill" style="width:0" data-width="${similarityPercent}%"></div>
                </div>
                <span class="similarity-score">${similarityPercent}%</span>
            </div>
        </div>
    `;

    const poster = card.querySelector('.movie-poster');
    applyPosterBackground(poster, movie.poster_url, gradient, movie.title);

    card.onclick = () => {
        movieSearch.value = movie.title;
        searchMovie();
    };

    setTimeout(() => {
        const fill = card.querySelector('.similarity-fill');
        fill.style.width = fill.dataset.width;
    }, 70 * index + 100);

    return card;
}

function updateHero(movieName, movieDetails) {
    heroTitle.textContent = movieName;
    heroSubtitle.textContent = 'Because you watched "' + movieName + '", here are your next best picks.';

    const seed = hashString(movieName);
    const hueA = Math.abs(seed) % 360;
    const hueB = (hueA + 50) % 360;

    if (heroSection) {
        heroSection.style.setProperty('--hero-a', `hsla(${hueA}, 86%, 55%, 0.46)`);
        heroSection.style.setProperty('--hero-b', `hsla(${hueB}, 80%, 46%, 0.28)`);
        const backdropUrl = movieDetails && movieDetails.backdrop_url
            ? movieDetails.backdrop_url
            : localAiBackdropPath(movieName);
        heroSection.style.setProperty('--hero-image', `url("${backdropUrl}")`);
    }
}

function applyPosterBackground(element, posterUrl, fallbackGradient, title) {
    if (posterUrl) {
        element.classList.add('has-image');
        element.style.backgroundImage = `linear-gradient(to top, rgba(4, 5, 9, 0.82) 8%, rgba(4, 5, 9, 0.1) 62%), url("${posterUrl}")`;
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center';
        return;
    }

    const aiPoster = localAiPosterPath(title);
    if (aiPoster) {
        element.classList.add('has-image');
        element.style.backgroundImage = `linear-gradient(to top, rgba(4, 5, 9, 0.82) 8%, rgba(4, 5, 9, 0.1) 62%), url("${aiPoster}")`;
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center';
        return;
    }

    element.style.background = fallbackGradient;
}

function localAiPosterPath(title) {
    const posters = [
        '/static/ai-posters/poster-01.svg',
        '/static/ai-posters/poster-02.svg',
        '/static/ai-posters/poster-03.svg',
        '/static/ai-posters/poster-04.svg',
        '/static/ai-posters/poster-05.svg',
        '/static/ai-posters/poster-06.svg'
    ];

    if (!title) {
        return posters[0];
    }

    const idx = Math.abs(hashString(title)) % posters.length;
    return posters[idx];
}

function localAiBackdropPath(title) {
    const backdrops = [
        '/static/ai-backdrops/backdrop-01.svg',
        '/static/ai-backdrops/backdrop-02.svg',
        '/static/ai-backdrops/backdrop-03.svg',
        '/static/ai-backdrops/backdrop-04.svg',
        '/static/ai-backdrops/backdrop-05.svg',
        '/static/ai-backdrops/backdrop-06.svg'
    ];

    if (!title) {
        return backdrops[0];
    }

    const idx = Math.abs(hashString(title)) % backdrops.length;
    return backdrops[idx];
}

function fauxMeta(title, score) {
    const genres = ['Sci-Fi', 'Thriller', 'Drama', 'Action', 'Fantasy', 'Adventure', 'Mystery', 'Comedy'];
    const seed = Math.abs(hashString(title));
    const year = 1984 + (seed % 40);
    const runtime = 88 + (seed % 58);
    const genre = genres[seed % genres.length];

    if (score >= 80) {
        return { year, runtime: `${runtime}m`, genre: 'Top Match' };
    }

    return { year, runtime: `${runtime}m`, genre };
}

function movieMeta(movie, score) {
    const fallback = fauxMeta(movie.title, score);
    const rating = typeof movie.rating === 'number' ? movie.rating.toFixed(1) : null;

    return {
        genre: fallback.genre,
        year: movie.release_year || fallback.year,
        runtime: rating ? `${rating}★` : fallback.runtime
    };
}

function hashString(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

function titleGradient(title) {
    const seed = Math.abs(hashString(title));
    const hue1 = seed % 360;
    const hue2 = (hue1 + 65) % 360;
    return `linear-gradient(140deg, hsl(${hue1} 70% 46%) 0%, hsl(${hue2} 68% 26%) 100%)`;
}

function escapeHtml(text) {
    return text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function hideResults() {
    results.classList.add('hidden');
    selectedMovieDiv.classList.add('hidden');
}

function setButtonLoading(isLoading) {
    if (isLoading) {
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        searchBtn.disabled = true;
    } else {
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
        searchBtn.disabled = false;
    }
}

document.addEventListener('click', (e) => {
    if (!movieSearch.contains(e.target) && !suggestions.contains(e.target)) {
        hideSuggestions();
    }
});
