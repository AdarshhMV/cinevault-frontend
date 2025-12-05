import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import '../App.css'; // Use your existing styles

function SkeletonCard() {
  return (
    <SkeletonTheme baseColor="#1e1e1e" highlightColor="#2a2a2a">
      <div className="movie-card">
        {/* Fake Poster */}
        <div style={{ height: '350px' }}>
          <Skeleton height={350} style={{ borderRadius: '12px 12px 0 0' }} />
        </div>
        
        <div className="card-content">
          {/* Fake Title */}
          <h3 className="card-title">
            <Skeleton width={`80%`} />
          </h3>
          
          {/* Fake Buttons */}
          <div style={{ marginTop: '15px' }}>
            <Skeleton height={40} style={{ marginBottom: '8px', borderRadius: '5px' }} />
            <Skeleton height={40} style={{ borderRadius: '5px' }} />
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}

export default SkeletonCard;