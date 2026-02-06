#  Movie Recommender System

A beautiful, modern web application that recommends movies based on content similarity using Machine Learning.

##  Features

- **Smart Recommendations**: Get 5 similar movie recommendations based on any movie
- **Autocomplete Search**: Real-time search suggestions as you type
- **Beautiful UI**: Clean, modern, and responsive design
- **Interactive Cards**: Click any recommended movie to get its recommendations
- **REST API**: Full API access for developers
- **Fast & Efficient**: Pre-computed similarity matrix for instant results

##  Tech Stack

**Backend:**
- Python 3.9+
- Flask (Web framework)
- Pandas (Data processing)
- Scikit-learn (Machine Learning)

**Frontend:**
- HTML5
- CSS3 (Modern Minimalist design)
- Vanilla JavaScript (No frameworks!)

**ML Algorithm:**
- Content-Based Filtering
- Cosine Similarity
- CountVectorizer (Bag of Words)

##  Project Structure

```
movie-recommender-api/
├── app.py                      # Main Flask application
├── movie_list.pkl              # Processed movie data
├── similarity.pkl              # Pre-computed similarity matrix
├── requirements.txt            # Python dependencies
├── .gitignore                  # Git ignore rules
├── Dockerfile                  # Docker configuration
├── templates/
│   └── index.html             # Main webpage
├── static/
│   ├── css/
│   │   └── style.css          # Styling
│   └── js/
│       └── script.js          # Frontend logic
└── README.md                   # This file
```

##  Quick Start

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Your pickle files (`movie_list.pkl` and `similarity.pkl`)

### Installation

1. **Clone or download this repository**

2. **Add your pickle files**
   - Copy `movie_list.pkl` to the project root
   - Copy `similarity.pkl` to the project root

3. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Open your browser**
   - Navigate to: `http://localhost:5000`
   - Start searching for movies!

## 📡 API Documentation

### Base URL
```
http://localhost:5000
```

### Endpoints

#### 1. Get Recommendations
```http
POST /api/recommend
Content-Type: application/json

{
  "movie": "Avatar"
}
```

**Response:**
```json
{
  "input_movie": "Avatar",
  "recommendations": [
    {
      "title": "Guardians of the Galaxy",
      "similarity_score": 0.2156
    },
    ...
  ]
}
```

#### 2. Search Movies
```http
GET /api/search?q=avatar
```

**Response:**
```json
{
  "query": "avatar",
  "total_matches": 5,
  "matches": ["Avatar", "The Last Airbender", ...]
}
```

#### 3. Get All Movies
```http
GET /api/movies?page=1&per_page=50
```

#### 4. Health Check
```http
GET /api/health
```

### Example using curl:

```bash
# Get recommendations
curl -X POST http://localhost:5000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"movie": "Inception"}'

# Search for movies
curl "http://localhost:5000/api/search?q=dark%20knight"
```

##  How It Works

1. **Data Processing**: Movies are processed to extract key features (genres, cast, crew, keywords, overview)
2. **Feature Engineering**: Features are combined into a single "tags" column
3. **Vectorization**: CountVectorizer converts text into numerical vectors
4. **Similarity Calculation**: Cosine similarity measures how similar movies are
5. **Recommendations**: Top 5 most similar movies are returned

##  Docker Deployment

```bash
# Build image
docker build -t movie-recommender .

# Run container
docker run -p 5000:5000 movie-recommender
```

##  Cloud Deployment

### Deploy to Render:

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your GitHub repository
4. Render will auto-deploy!

### Deploy to Railway:

1. Push code to GitHub
2. Create new project on Railway
3. Connect repository
4. Deploy automatically

##  Customization

### Change the color scheme:
Edit `static/css/style.css` and modify the CSS variables:

```css
:root {
    --primary-color: #4F46E5;  /* Change this */
    --primary-dark: #4338CA;
    --primary-light: #6366F1;
}
```

### Add more recommendations:
In `app.py`, change the number in the `recommend()` function:

```python
for i in distances[1:6]:  # Change 6 to any number
```

##  Dataset

- **Source**: TMDB 5000 Movie Dataset (Kaggle)
- **Movies**: 4,806 movies
- **Features**: Genres, Cast, Crew, Keywords, Overview

##  Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Improve documentation
- Submit pull requests

##  License

This project is open source and available for educational purposes.

##  Author

Built by **Charchil**
- GitHub: [@CharchilDS](https://github.com/CharchilDS)

##  Acknowledgments

- TMDB for the movie dataset
- Kaggle community
- Flask documentation
- All open-source contributors

---

** If you found this helpful, please star the repository!**
