import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_KEY, TMDB_BASE_URL } from "../apiConfig";

function Dashboard() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [totalMovies, setTotalMovies] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  // Fetch movies and genres on load
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const movieResponse = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
          params: {
            api_key: API_KEY,
            sort_by: "popularity.desc",
          },
        });
        setMovies(movieResponse.data.results);
        setFilteredMovies(movieResponse.data.results);
        calculateStats(movieResponse.data.results);
      } catch (error) {
        console.error("Error fetching movie data:", error);
      }
    };

    const fetchGenres = async () => {
      try {
        const genreResponse = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
          params: { api_key: API_KEY },
        });
        setGenres(genreResponse.data.genres);
      } catch (error) {
        console.error("Error fetching genre data:", error);
      }
    };

    fetchMovies();
    fetchGenres();
  }, []);

  // Calculate total movies and average rating
  const calculateStats = (moviesList) => {
    const total = moviesList.length;
    const average =
      moviesList.reduce((sum, movie) => sum + movie.vote_average, 0) / total;
    setTotalMovies(total);
    setAverageRating(average.toFixed(1));
  };

  // Search and filter movies
  useEffect(() => {
    let results = movies.filter((movie) =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedGenre) {
      results = results.filter((movie) =>
        movie.genre_ids.includes(parseInt(selectedGenre))
      );
    }

    if (selectedYear) {
      results = results.filter(
        (movie) => movie.release_date && movie.release_date.includes(selectedYear)
      );
    }

    setFilteredMovies(results);
    calculateStats(results);
  }, [searchTerm, selectedGenre, selectedYear, movies]);

  return (
    <div>
      <h1>Movie Dashboard</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search for a movie..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginRight: "10px", padding: "5px" }}
      />

      {/* Genre Filter */}
      <select
        value={selectedGenre}
        onChange={(e) => setSelectedGenre(e.target.value)}
        style={{ marginRight: "10px", padding: "5px" }}
      >
        <option value="">All Genres</option>
        {genres.map((genre) => (
          <option key={genre.id} value={genre.id}>
            {genre.name}
          </option>
        ))}
      </select>

      {/* Release Year Filter */}
      <input
        type="number"
        placeholder="Release Year"
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        style={{ marginRight: "10px", padding: "5px" }}
      />

      {/* Summary Statistics */}
      <div className="summary">
        <p>Total Movies: {totalMovies}</p>
        <p>Average Rating: {averageRating}</p>
      </div>

      {/* Movie List */}
      <div className="movie-list">
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => (
            <div key={movie.id} className="movie-card">
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                className="movie-poster"
              />
              <h3>{movie.title}</h3>
              <p>Rating: {movie.vote_average}</p>
              <p>Release Date: {movie.release_date}</p>
            </div>
          ))
        ) : (
          <p>No movies found</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
