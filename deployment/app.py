from flask import Flask, request, jsonify, render_template
import pickle
import pandas as pd
import os
import requests

app = Flask(__name__)

# Function to download pickle files from Google Drive
def download_file_from_google_drive(file_id, destination):
    """Download a file from Google Drive."""
    if os.path.exists(destination):
        print(f"✓ {destination} already exists, skipping download")
        return
    
    print(f"⬇️  Downloading {destination}... (this may take 1-2 minutes)")
    URL = "https://drive.google.com/uc?export=download"
    
    session = requests.Session()
    response = session.get(URL, params={'id': file_id, 'confirm': 't'}, stream=True)
    
    # Save file
    total_size = 0
    with open(destination, "wb") as f:
        for chunk in response.iter_content(32768):
            if chunk:
                f.write(chunk)
                total_size += len(chunk)
                # Print progress every 10MB
                if total_size % (10 * 1024 * 1024) < 32768:
                    print(f"   Downloaded {total_size // (1024*1024)}MB...")
    
    print(f" {destination} downloaded successfully! ({total_size // (1024*1024)}MB)")

# Google Drive file IDs (CORRECT ORDER)
MOVIE_LIST_FILE_ID = "11klM3WOI0qPIhQmdBq2Xx6mIFcYWEsni"  # movie_list.pkl
SIMILARITY_FILE_ID = "1o0mAJh76uWc3uMkORz6e2o_afXMghLBA"  # similarity.pkl

# Download pickle files if they don't exist
print("Checking for pickle files...")
download_file_from_google_drive(MOVIE_LIST_FILE_ID, 'movie_list.pkl')
download_file_from_google_drive(SIMILARITY_FILE_ID, 'similarity.pkl')

# Load the pickle files
print("Loading pickle files...")
movie_list = pickle.load(open('movie_list.pkl', 'rb'))  # list of dicts
movies = pd.DataFrame(movie_list)                       # convert to DataFrame
similarity = pickle.load(open('similarity.pkl', 'rb'))
print(f"✓ Loaded {len(movies)} movies successfully!")

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
            recommended_movies.append({
                'title': movies.iloc[i[0]].title,
                'similarity_score': round(i[1], 4)
            })
        
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
        'total_movies': len(movies)
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
    
    return jsonify({
        'input_movie': movie_name,
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
            'POST /api/recommend': 'Get movie recommendations (body: {"movie": "Movie Name"})'
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
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
