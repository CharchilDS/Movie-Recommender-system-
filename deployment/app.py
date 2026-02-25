from flask import Flask, request, jsonify, render_template
import pickle
import pandas as pd
import os
import json
from urllib.parse import quote_plus
from urllib.request import urlopen

app = Flask(__name__)

# Load the pickle files
movies = pickle.load(open('movie_list.pkl', 'rb'))
similarity = pickle.load(open('similarity.pkl', 'rb'))
TMDB_API_KEY = os.environ.get('TMDB_API_KEY', '').strip()
TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'
tmdb_cache = {}


def normalize_movies(payload):
    if isinstance(payload, pd.DataFrame):
        if 'title' in payload.columns:
            return payload
        if len(payload.columns) >= 1:
            renamed = payload.copy()
            renamed.columns = ['title'] + list(renamed.columns[1:])
            return renamed
        return pd.DataFrame(columns=['title'])

    if isinstance(payload, list):
        if not payload:
            return pd.DataFrame(columns=['title'])
        first = payload[0]
        if isinstance(first, dict):
            df = pd.DataFrame(payload)
            if 'title' not in df.columns and len(df.columns) > 0:
                first_col = df.columns[0]
                df = df.rename(columns={first_col: 'title'})
            return df[['title']] if 'title' in df.columns else pd.DataFrame(columns=['title'])
        return pd.DataFrame({'title': [str(item) for item in payload]})

    return pd.DataFrame(columns=['title'])


movies = normalize_movies(movies)


def fetch_tmdb_movie(title):
    if not TMDB_API_KEY:
        return None

    cache_key = title.strip().lower()
    if cache_key in tmdb_cache:
        return tmdb_cache[cache_key]

    try:
        search_url = (
            'https://api.themoviedb.org/3/search/movie'
            f'?api_key={TMDB_API_KEY}&query={quote_plus(title)}&include_adult=false'
        )
        with urlopen(search_url, timeout=4) as response:
            payload = json.loads(response.read().decode('utf-8'))

        results = payload.get('results') or []
        if not results:
            tmdb_cache[cache_key] = None
            return None

        best = results[0]
        release_date = best.get('release_date') or ''
        release_year = release_date[:4] if release_date else None
        poster_path = best.get('poster_path')
        backdrop_path = best.get('backdrop_path')

        movie_data = {
            'tmdb_id': best.get('id'),
            'overview': best.get('overview'),
            'release_year': release_year,
            'rating': best.get('vote_average'),
            'poster_url': f'{TMDB_IMAGE_BASE}/w500{poster_path}' if poster_path else None,
            'backdrop_url': f'{TMDB_IMAGE_BASE}/original{backdrop_path}' if backdrop_path else None
        }
        tmdb_cache[cache_key] = movie_data
        return movie_data
    except Exception:
        return None


def enrich_with_tmdb(movie_payload):
    tmdb = fetch_tmdb_movie(movie_payload.get('title', ''))
    if not tmdb:
        movie_payload.update({
            'tmdb_id': None,
            'overview': None,
            'release_year': None,
            'rating': None,
            'poster_url': None,
            'backdrop_url': None
        })
        return movie_payload

    movie_payload.update(tmdb)
    return movie_payload

# Recommendation function
def recommend(movie):
    try:
        # Find movie index
        index = movies[movies['title'] == movie].index[0]
        
        # Calculate distances
        distances = sorted(
            list(enumerate(similarity[index])),
            reverse=True,
            key=lambda x: x[1]
        )
        
        # Get top 5 recommendations
        recommended_movies = []
        for i in distances[1:6]:
            payload = {
                'title': movies.iloc[i[0]].title,
                'similarity_score': round(i[1], 4)
            }
            recommended_movies.append(enrich_with_tmdb(payload))
        
        return recommended_movies
    
    except IndexError:
        return None

# ============== WEBSITE ROUTES ==============

# Home page - serves the beautiful website
@app.route('/')
def home():
    return render_template('index.html')

# ============== API ROUTES ==============

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'message': 'Movie Recommender API is running!',
        'total_movies': len(movies),
        'tmdb_enabled': bool(TMDB_API_KEY)
    })

# Get all available movies (paginated)
@app.route('/api/movies', methods=['GET'])
def get_movies():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 50))
    
    movie_list = movies['title'].tolist()
    start = (page - 1) * per_page
    end = start + per_page
    
    return jsonify({
        'total_movies': len(movie_list),
        'page': page,
        'per_page': per_page,
        'movies': movie_list[start:end]
    })

# Search movies by partial name
@app.route('/api/search', methods=['GET'])
def search_movies():
    query = request.args.get('q', '').lower()
    
    if not query:
        return jsonify({'error': 'Please provide a search query using ?q=movie_name'}), 400
    
    # Find movies matching the query
    matching_movies = movies[
        movies['title'].str.lower().str.contains(query, na=False)
    ]['title'].tolist()
    
    return jsonify({
        'query': query,
        'total_matches': len(matching_movies),
        'matches': matching_movies[:20]  # Return top 20 matches
    })

# Main recommendation endpoint
@app.route('/api/recommend', methods=['POST'])
def get_recommendations():
    data = request.get_json()
    
    # Validate input
    if not data or 'movie' not in data:
        return jsonify({
            'error': 'Please provide a movie name in the request body',
            'example': {'movie': 'Avatar'}
        }), 400
    
    movie_name = data['movie']
    
    # Get recommendations
    recommendations = recommend(movie_name)
    
    if recommendations is None:
        return jsonify({
            'error': f'Movie "{movie_name}" not found in database',
            'suggestion': 'Use /api/search?q=movie_name endpoint to find available movies'
        }), 404

    input_movie_details = enrich_with_tmdb({'title': movie_name})
    
    return jsonify({
        'input_movie': movie_name,
        'input_movie_details': input_movie_details,
        'tmdb_enabled': bool(TMDB_API_KEY),
        'recommendations': recommendations
    })

# API documentation
@app.route('/api', methods=['GET'])
def api_docs():
    return jsonify({
        'message': 'Movie Recommender API Documentation',
        'version': '1.0.0',
        'endpoints': {
            'GET /api': 'API documentation (this page)',
            'GET /api/health': 'Check API health status',
            'GET /api/movies?page=1&per_page=50': 'Get paginated list of available movies',
            'GET /api/search?q=<query>': 'Search for movies by name',
            'POST /api/recommend': 'Get movie recommendations (body: {"movie": "Movie Name"})',
            'TMDB_API_KEY env var': 'Optional. If set, response includes poster/backdrop/rating metadata.'
        },
        'example_usage': {
            'search': '/api/search?q=avatar',
            'recommend': {
                'url': '/api/recommend',
                'method': 'POST',
                'body': {'movie': 'Avatar'}
            }
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
