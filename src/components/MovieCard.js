import React, { useState } from 'react';
import '../App.css';
import { toast } from 'react-toastify'; 

function MovieCard({ movie }) {
  const [onWatchList, setOnWatchList] = useState(movie.onWatchList || false);
  const [isWatched, setIsWatched] = useState(movie.isWatched || false);
  const [userRating, setUserRating] = useState(movie.userRating || 0);

  const API_KEY = "de8c3435"; 
  // 🚀 LIVE BACKEND URL (This fixes the connection refused error)
  const API_BASE_URL = "https://cinevault-api-mcpa.onrender.com";

  const saveToDjango = async (updates) => {
    const token = localStorage.getItem('accessToken');
    
    // 1. GENRE FETCHING LOGIC
    // If we don't know the genre (e.g. from search results), fetch it now!
    let genreToSave = movie.genre;
    if (!genreToSave || genreToSave === "Unknown") {
        try {
            const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.id}`);
            const details = await res.json();
            genreToSave = details.Genre || "Unknown";
        } catch (e) {
            console.log("Could not fetch genre");
        }
    }

    const dataToSend = {
      title: movie.title,
      poster_url: movie.posterUrl,
      genre: genreToSave, // ⬅️ Sending Genre to Django
      on_watchlist: updates.onWatchList !== undefined ? updates.onWatchList : onWatchList,
      is_watched: updates.isWatched !== undefined ? updates.isWatched : isWatched,
      rating: updates.rating !== undefined ? updates.rating : userRating
    };

    try {
      // ⬇️ UPDATED to use the Live URL
      await fetch(`${API_BASE_URL}/api/save-movie/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend),
      });
    } catch (error) {
      toast.error("Failed to save!");
      console.error(error);
    }
  };

  const handleWatchListClick = () => {
    const newValue = !onWatchList;
    setOnWatchList(newValue);
    
    if (newValue) {
        setIsWatched(false);
        toast.success("Added to Watchlist! 📝"); 
    } else {
        toast.info("Removed from Watchlist");
    }

    saveToDjango({ 
        onWatchList: newValue,
        isWatched: newValue ? false : isWatched 
    });
  };

  const handleWatchedClick = () => {
    const newValue = !isWatched;
    setIsWatched(newValue);

    if (newValue) {
        setOnWatchList(false);
        toast.success("Marked as Watched! ✅"); 
    }

    saveToDjango({ 
        isWatched: newValue,
        onWatchList: newValue ? false : onWatchList
    });
  };

  const handleRatingChange = (e) => {
    const val = parseInt(e.target.value);
    setUserRating(val);
    saveToDjango({ rating: val });
  };

  return (
    <div className="movie-card">
      <img src={movie.posterUrl} alt={movie.title} />
      
      <div className="card-content">
        <h3 className="card-title">{movie.title}</h3>
        
        {/* Watchlist Button */}
        <button 
          onClick={handleWatchListClick}
          className={`btn ${onWatchList ? 'btn-watchlist-active' : 'btn-primary'}`}
        >
          {onWatchList ? 'In Watchlist' : 'Add to Watchlist'}
        </button>

        {/* Already Watched Button */}
        <button 
          onClick={handleWatchedClick}
          className={`btn ${isWatched ? 'btn-watched-active' : 'btn-primary'}`}
        >
          {isWatched ? 'Seen' : 'Mark as Seen'}
        </button>

        {/* Rating Section */}
        {isWatched && (
          <div style={{ marginTop: '15px', borderTop: '1px solid #333', paddingTop: '10px' }}>
              <label style={{ fontSize: '0.9rem', color: '#b3b3b3', marginRight: '5px' }}>Rating:</label>
              <input type="number" min="1" max="10" value={userRating} onChange={handleRatingChange} 
                style={{ width: '40px', background: '#333', border: 'none', color: 'white', padding: '5px', borderRadius: '4px', textAlign: 'center' }}
              />
              <span style={{color: '#b3b3b3', marginLeft: '5px'}}>/10</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieCard;