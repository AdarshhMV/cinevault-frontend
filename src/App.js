import React, { useState, useEffect } from 'react';
import MovieCard from './components/MovieCard';
import Login from './components/Login';
import SkeletonCard from './components/SkeletonCard';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // --- UI STATES ---
  const [view, setView] = useState('home'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // --- DATA STATES ---
  const [movies, setMovies] = useState([]);       
  const [topMovies, setTopMovies] = useState([]); 
  const [savedMovies, setSavedMovies] = useState([]); 
  
  // Recommendation States
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [favGenre, setFavGenre] = useState("");

  const API_KEY = "de8c3435"; 
  // 🚀 LIVE BACKEND URL
  const API_BASE_URL = "https://cinevault-api-mcpa.onrender.com";

  // 1. AUTH CHECK
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setSavedMovies([]);
    setRecommendedMovies([]);
  };

  // 2. FETCH SAVED MOVIES (Django)
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchSavedMovies = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/api/my-movies/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            setSavedMovies(data);
        }
      } catch (err) { console.error(err); }
    };
    fetchSavedMovies();
  }, [isAuthenticated, view]); 

  // 3. FETCH TOP MOVIES (HOMEPAGE)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const topMovieIds = ['tt0468569', 'tt1375666', 'tt0133093', 'tt0068646', 'tt0109830', 'tt0111161', 'tt0816692', 'tt0110912'];

    const fetchTopMovies = async () => {
        if (topMovies.length > 0) return;
        setIsLoading(true);
        try {
            const promises = topMovieIds.map(id => 
                fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`).then(res => res.json())
            );
            const results = await Promise.all(promises);
            const formatted = results.map(item => ({
                id: item.imdbID,
                title: item.Title,
                rating: item.imdbRating, 
                posterUrl: item.Poster !== "N/A" ? item.Poster : 'https://via.placeholder.com/200x300',
                genre: item.Genre
            }));
            setTopMovies(formatted);
        } catch (err) { console.error(err); } 
        finally { setIsLoading(false); }
    };

    fetchTopMovies();
  }, [isAuthenticated, topMovies.length]);

  // 4. FETCH RECOMMENDATIONS (AI ENGINE)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchRecommendations = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/recommendations/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setFavGenre(data.genre); 

                const promises = data.movies.map(id => 
                    fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`).then(res => res.json())
                );
                const results = await Promise.all(promises);
                
                const formatted = results.map(item => ({
                    id: item.imdbID,
                    title: item.Title,
                    rating: item.imdbRating, 
                    posterUrl: item.Poster !== "N/A" ? item.Poster : 'https://via.placeholder.com/200x300',
                    genre: item.Genre
                }));
                
                setRecommendedMovies(formatted);
            }
        } catch (err) { console.error(err); }
    };

    fetchRecommendations();
  }, [isAuthenticated, savedMovies]); 

  // 5. SEARCH FUNCTION
  useEffect(() => {
    if (!isAuthenticated || view !== 'search') return;

    const fetchSearchMovies = async () => {
      setIsLoading(true);
      try {
        if (!searchTerm) { setMovies([]); setIsLoading(false); return; }
        const url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.Response === "True") {
            const formattedMovies = data.Search.map(item => ({
              id: item.imdbID,
              title: item.Title,
              rating: "N/A", 
              posterUrl: item.Poster !== "N/A" ? item.Poster : 'https://via.placeholder.com/200x300',
              genre: "Unknown"
            }));
            setMovies(formattedMovies);
        } else {
            setMovies([]);
        }
      } catch (err) { console.error(err); } 
      finally { setIsLoading(false); }
    };
    
    const timeoutId = setTimeout(() => fetchSearchMovies(), 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, isAuthenticated, view]);

  // 6. MERGE DATA HELPER
  const mergeWithSaved = (list) => {
    return list.map(movie => {
        const saved = savedMovies.find(s => s.title === movie.title);
        return {
          ...movie,
          genre: saved ? saved.genre : movie.genre,
          onWatchList: saved ? saved.on_watchlist : false,
          isWatched: saved ? saved.is_watched : false,
          userRating: saved ? saved.rating : 0
        };
    });
  };

  // --- FILTER LISTS ---
  const getWatchList = () => {
    return savedMovies
        .filter(movie => movie.on_watchlist === true) 
        .map(movie => ({
            id: movie.id, 
            title: movie.title,
            posterUrl: movie.poster_url,
            rating: movie.rating,
            genre: movie.genre,
            onWatchList: true,
            isWatched: movie.is_watched,
            userRating: movie.rating
        }));
  };

  const getWatchedList = () => {
    return savedMovies
        .filter(movie => movie.is_watched === true) 
        .map(movie => ({
            id: movie.id, 
            title: movie.title,
            posterUrl: movie.poster_url,
            rating: movie.rating,
            genre: movie.genre,
            onWatchList: movie.on_watchlist,
            isWatched: true,
            userRating: movie.rating
        }));
  };

  // --- RENDER ---
  if (!isAuthenticated) return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;

  return (
    <div className="app-container">
      <ToastContainer position="bottom-right" theme="dark" autoClose={3000} />

      <div className="header">
          <div style={{display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap'}}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#e50914' }}>CineVault</h1>
            <nav className="nav-tabs">
                <button className={`nav-btn ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')}>Home</button>
                <button className={`nav-btn ${view === 'search' ? 'active' : ''}`} onClick={() => setView('search')}>Search</button>
                <button className={`nav-btn ${view === 'watchlist' ? 'active' : ''}`} onClick={() => setView('watchlist')}>Watchlist</button>
                <button className={`nav-btn ${view === 'watched' ? 'active' : ''}`} onClick={() => setView('watched')}>History</button>
            </nav>
          </div>
          <button onClick={handleLogout} className="btn btn-logout" style={{ width: 'auto' }}>Logout</button>
      </div>

      {/* --- HOME VIEW --- */}
      {view === 'home' && (
          <div className="view-container">
              
              {/* RECOMMENDED SECTION */}
              {isLoading && topMovies.length === 0 ? (
                 <div className="movie-grid">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                 </div>
              ) : (
                 recommendedMovies.length > 0 && (
                  <div style={{marginBottom: '50px'}}>
                      <h2 style={{color: '#46d369', marginBottom: '20px', textAlign: 'left', marginLeft: '20px'}}>
                        ✨ Because you watch <span style={{color: '#fff'}}>{favGenre}</span>
                      </h2>
                      <div className="movie-grid">
                        {mergeWithSaved(recommendedMovies)
                            .filter(movie => !movie.isWatched) // ⬅️ Hides movies marked as "Watched"
                            .map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                        ))}
                      </div>
                  </div>
                 )
              )}

              {/* TOP PICKS SECTION */}
              <h2 style={{marginBottom: '20px', textAlign: 'left', marginLeft: '20px'}}>🔥 Top Picks of All Time</h2>
              <div className="movie-grid">
                {isLoading && topMovies.length === 0 ? (
                    [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
                ) : (
                    mergeWithSaved(topMovies)
                        .filter(movie => !movie.isWatched) // ⬅️ Hides movies marked as "Watched"
                        .map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                    ))
                )}
                
                {!isLoading && topMovies.length > 0 && mergeWithSaved(topMovies).filter(m => !m.isWatched).length === 0 && (
                    <p>Wow! You've seen all our top picks. Check back later for more!</p>
                )}
              </div>
          </div>
      )}

      {/* --- SEARCH VIEW --- */}
      {view === 'search' && (
          <div className="view-container">
              <input className="search-input" type="text" placeholder="Search for movies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
              <div style={{ marginTop: '40px' }}>
                {isLoading ? (
                  <div className="movie-grid">
                    {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : (
                  <div className="movie-grid">
                    {movies.length > 0 ? mergeWithSaved(movies).map((movie) => <MovieCard key={movie.id} movie={movie} />) : <p style={{marginTop: '20px'}}>Type something to find a movie!</p>}
                  </div>
                )}
              </div>
          </div>
      )}

      {/* --- WATCHLIST VIEW --- */}
      {view === 'watchlist' && (
          <div className="view-container">
              <h2>📝 My Watchlist</h2>
              <div className="movie-grid">
                  {getWatchList().length > 0 ? getWatchList().map(movie => <MovieCard key={movie.id} movie={movie} />) : <p>Your watchlist is empty.</p>}
              </div>
          </div>
      )}

      {/* --- WATCHED VIEW --- */}
      {view === 'watched' && (
          <div className="view-container">
              <h2>✅ Already Watched History</h2>
              <div className="movie-grid">
                  {getWatchedList().length > 0 ? getWatchedList().map(movie => <MovieCard key={movie.id} movie={movie} />) : <p>No watched history yet.</p>}
              </div>
          </div>
      )}

    </div>
  );
}

export default App;