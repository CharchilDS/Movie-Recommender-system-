// Global variables
let selectedMovie = '';
let typingTimer;
const typingDelay = 500; // milliseconds

// DOM Elements
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

// Event Listeners
movieSearch.addEventListener('input', handleInput);
movieSearch.addEventListener('keypress', handleEnterKey);

// Handle input with debouncing
function handleInput(e) {
    clearTimeout(typingTimer);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        hideSuggestions();
        return;
    }
    
    typingTimer = setTimeout(() => fetchSuggestions(query), typingDelay);
}

// Handle Enter key press
function handleEnterKey(e) {
    if (e.key === 'Enter') {
        searchMovie();
    }
}

// Fetch autocomplete suggestions
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
        console.error('Error fetching suggestions:', error);
    }
}

// Display autocomplete suggestions
function displaySuggestions(matches) {
    suggestions.innerHTML = '';
    
    matches.forEach(movie => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = movie;
        item.onclick = () => selectMovie(movie);
        suggestions.appendChild(item);
    });
    
    suggestions.classList.remove('hidden');
}

// Hide suggestions
function hideSuggestions() {
    suggestions.classList.add('hidden');
    suggestions.innerHTML = '';
}

// Select movie from suggestions
function selectMovie(movie) {
    selectedMovie = movie;
    movieSearch.value = movie;
    hideSuggestions();
    searchMovie();
}

// Main search function
async function searchMovie() {
    const query = movieSearch.value.trim();
    
    if (!query) {
        showError('Please enter a movie name');
        return;
    }
    
    // Hide previous results and errors
    hideError();
    hideResults();
    hideSuggestions();
    
    // Show loading state
    showLoading();
    setButtonLoading(true);
    
    try {
        const response = await fetch('/api/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ movie: query })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayResults(data.input_movie, data.recommendations);
        } else {
            showError(data.error || 'Movie not found. Please try another movie.');
        }
    } catch (error) {
        showError('An error occurred. Please try again.');
        console.error('Error:', error);
    } finally {
        hideLoading();
        setButtonLoading(false);
    }
}

// Display recommendations
function displayResults(inputMovie, recommendations) {
    // Show selected movie
    selectedMovieName.textContent = inputMovie;
    selectedMovieDiv.classList.remove('hidden');
    
    // Clear previous cards
    movieCards.innerHTML = '';
    
    // Create movie cards
    recommendations.forEach((movie, index) => {
        const card = createMovieCard(movie, index);
        movieCards.appendChild(card);
    });
    
    // Show results section
    results.classList.remove('hidden');
    
    // Smooth scroll to results
    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Create a movie card
function createMovieCard(movie, index) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    // Calculate similarity percentage
    const similarityPercent = Math.round(movie.similarity_score * 100);
    
    card.innerHTML = `
        <div class="movie-title">${movie.title}</div>
        <div class="similarity-section">
            <span class="similarity-label">Match</span>
            <div class="similarity-bar">
                <div class="similarity-fill" style="width: 0%;" data-width="${similarityPercent}%"></div>
            </div>
            <span class="similarity-score">${similarityPercent}%</span>
        </div>
    `;
    
    // Add click handler to get recommendations for this movie
    card.onclick = () => {
        movieSearch.value = movie.title;
        searchMovie();
    };
    
    // Animate similarity bar after a delay
    setTimeout(() => {
        const fill = card.querySelector('.similarity-fill');
        fill.style.width = fill.getAttribute('data-width');
    }, index * 100);
    
    return card;
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

// Hide error message
function hideError() {
    errorMessage.classList.add('hidden');
}

// Show loading state
function showLoading() {
    loading.classList.remove('hidden');
}

// Hide loading state
function hideLoading() {
    loading.classList.add('hidden');
}

// Hide results
function hideResults() {
    results.classList.add('hidden');
    selectedMovieDiv.classList.add('hidden');
}

// Set button loading state
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

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!movieSearch.contains(e.target) && !suggestions.contains(e.target)) {
        hideSuggestions();
    }
});
