# 🎬 Movie Recommender System

An end-to-end Machine Learning project that recommends movies based on content similarity, complete with a beautiful web interface for users to interact with the recommendation engine.

![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0.2-green.svg)
![ML](https://img.shields.io/badge/ML-Content--Based%20Filtering-orange.svg)
![Status](https://img.shields.io/badge/Status-Live-success.svg)

## 🔗 Live Demo

**✨ Try it now:** [https://movie-recommender-thy4.onrender.com](https://movie-recommender-thy4.onrender.com)

The application is fully deployed and accessible to everyone! Search for your favorite movies and get personalized recommendations powered by Machine Learning.

---


## 🌟 Project Overview

This project demonstrates the complete Machine Learning lifecycle:
1. **Data Processing & Feature Engineering**
2. **Model Training** (Content-Based Filtering using Cosine Similarity)
3. **Model Deployment** (Flask Web Application with REST API)
4. **Production Deployment** (Docker + Cloud hosting)

---

## 📂 Project Structure

```
Movie-Recommender-system/
│
├── 📓 GROUP28.ipynb              # Jupyter notebook with ML model training
├── 📄 Report.pdf                 # Detailed project report
├── 📊 Movie recommender.pptx     # Project presentation
│
└── 🚀 deployment/                # Production-ready web application
    ├── app.py                    # Flask API backend
    ├── templates/                # HTML frontend
    ├── static/                   # CSS & JavaScript
    ├── Dockerfile                # Container configuration
    ├── requirements.txt          # Python dependencies
    └── README.md                 # Deployment documentation
```

---

## ✨ Features

### Machine Learning
- **Algorithm**: Content-Based Filtering
- **Similarity Metric**: Cosine Similarity
- **Features Used**: Genres, Cast, Crew, Keywords, Overview
- **Dataset**: TMDB 5000 Movie Dataset (4,806 movies)

### Web Application
- 🎨 Beautiful, modern, responsive UI
- 🔍 Real-time autocomplete search
- ⚡ Instant recommendations
- 📊 Similarity scores with visual indicators
- 🖱️ Interactive movie cards
- 📱 Mobile-friendly design
- 🎯 Click any recommendation to explore similar movies

### API Endpoints
- `POST /api/recommend` - Get movie recommendations
- `GET /api/search` - Search for movies
- `GET /api/movies` - List all available movies
- `GET /api/health` - API health check

---

## 🚀 Quick Start

### Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/CharchilDS/Movie-Recommender-system-.git
   cd Movie-Recommender-system-/deployment
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Open browser**
   ```
   http://localhost:5000
   ```

> **Note**: The pickle files (`movie_list.pkl` and `similarity.pkl`) are automatically downloaded from Google Drive on first run.

### Using Docker

```bash
cd deployment
docker build -t movie-recommender .
docker run -p 5000:5000 movie-recommender
```

---

## 📊 How It Works

1. **Data Processing**: Extract features from movie metadata (genres, cast, crew, keywords, plot)
2. **Feature Engineering**: Combine all features into a single "tags" column
3. **Vectorization**: Convert text to numerical vectors using CountVectorizer (5000 features)
4. **Similarity Matrix**: Calculate cosine similarity between all movies (4806 x 4806 matrix)
5. **Recommendations**: Return top 5 most similar movies based on similarity scores

### Example Workflow:
```
User searches "Spider-Man"
    ↓
System finds movie in database
    ↓
Retrieves pre-computed similarity scores
    ↓
Returns top 5 similar movies:
  • Spider-Man 3 (45% match)
  • Spider-Man 2 (40% match)
  • The Amazing Spider-Man 2 (30% match)
  • The Amazing Spider-Man (28% match)
  • Arachnophobia (24% match)
```

---

## 🛠️ Tech Stack

**Machine Learning:**
- Python 3.11
- Pandas 2.2.2 (Data processing)
- Scikit-learn 1.4.2 (ML algorithms)
- NumPy 1.26.4 (Numerical computations)

**Web Application:**
- Flask 3.0.2 (Backend framework)
- Gunicorn 21.2.0 (Production server)
- HTML5/CSS3 (Frontend)
- Vanilla JavaScript (Interactivity)
- Responsive design (Mobile-first)

**Deployment:**
- Docker (Containerization)
- Render (Cloud platform)
- Google Drive (Model storage)

---

## 🎯 Project Highlights

- ✅ Complete ML pipeline from data to deployment
- ✅ Production-ready Flask REST API
- ✅ Beautiful, user-friendly web interface
- ✅ Docker support for easy deployment
- ✅ Optimized for cloud deployment (external model storage)
- ✅ Comprehensive documentation
- ✅ Clean, maintainable code
- ✅ **Live and accessible to everyone!**

---

## 💡 Technical Challenges Solved

### Challenge 1: Large Model Files (430MB)
**Problem**: Pickle files too large for Git and free hosting  
**Solution**: Store models on Google Drive, download on app startup, cache for subsequent requests

### Challenge 2: Memory Constraints
**Problem**: Free tier hosting has 512MB RAM limit  
**Solution**: Optimized dependencies, used slim Docker images, efficient loading

### Challenge 3: NumPy/Pandas Compatibility
**Problem**: Pickle files created with different library versions  
**Solution**: Pinned exact versions in requirements.txt, rebuilt models with compatible versions

---

## 📚 Documentation

- **ML Model Training**: See `GROUP28.ipynb` for the complete data processing and model training pipeline
- **Project Report**: See `Report.pdf` for detailed project documentation
- **Deployment Guide**: See `deployment/README.md` for deployment instructions and API documentation
- **Presentation**: See `Movie recommender.pptx` for project presentation
- **Live Demo**: [https://movie-recommender-thy4.onrender.com](https://movie-recommender-thy4.onrender.com)

---

## 🔮 Future Enhancements

- [ ] Add movie posters from TMDB API
- [ ] Implement collaborative filtering (user-based recommendations)
- [ ] Add user ratings and reviews
- [ ] Show movie trailers (YouTube integration)
- [ ] Implement user accounts and favorites
- [ ] Add genre-based filtering
- [ ] A/B testing for recommendation algorithms
- [ ] Dark mode toggle
- [ ] Multi-language support

---

## 🎓 What I Learned

This project taught me valuable lessons about:
- ✅ End-to-end ML deployment workflow
- ✅ Production-ready code practices
- ✅ Docker containerization
- ✅ Cloud deployment challenges
- ✅ Handling large ML models in production
- ✅ REST API design and implementation
- ✅ Frontend-backend integration
- ✅ Git workflows and version control
- ✅ Problem-solving under constraints

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

## 📝 License

This project is open source and available for educational purposes.

---

## 👤 Author

**Charchil**
- GitHub: [@CharchilDS](https://github.com/CharchilDS)

---

## 🙏 Acknowledgments

- TMDB for the movie dataset
- Kaggle community for dataset hosting
- Flask and Scikit-learn documentation
- Render for free hosting
- All open-source contributors

---

## 📊 Project Stats

- **4,806** movies in database
- **5,000** features per movie
- **23+ million** similarity calculations
- **~430MB** total model size
- **100%** deployed and functional

---

**⭐ If you found this project helpful, please star the repository!**

**🔗 Try the live demo:** [https://movie-recommender-thy4.onrender.com](https://movie-recommender-thy4.onrender.com)

---

*Built with ❤️ using Flask & Machine Learning*
