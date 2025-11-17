import React, { useState, useEffect } from 'react';
import '../styles/MedicineAvailability.css';

interface Pharmacy {
  pharmacy_id: string;
  pharmacy_name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  village: string;
  distance: number;
  medicine_name: string;
  quantity: number;
  price: number;
  availability: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

interface SearchResult {
  success: boolean;
  medicine_name?: string;
  total_results?: number;
  pharmacies?: Pharmacy[];
  error?: string;
  available_medicines?: string[];
}

interface Props {
  userLocation?: { lat: number; lon: number };
}

const MedicineAvailability: React.FC<Props> = ({ userLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filterByAvailability, setFilterByAvailability] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'price'>('distance');

  // Fetch available medicines for autocomplete
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/symptoms');
        if (response.ok) {
          const data = await response.json();
          // In a real app, this would fetch medicine list
          setSuggestions(['Paracetamol', 'Ibuprofen', 'Aspirin', 'Metformin', 'Insulin', 'Azithromycin', 'Vitamin D', 'ORS Pack']);
        }
      } catch (err) {
        console.log('Could not fetch suggestions');
      }
    };
    fetchSuggestions();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter a medicine name');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      // Prepare query params
      const params = new URLSearchParams({
        medicine: searchQuery.trim()
      });

      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lon', userLocation.lon.toString());
      }

      const response = await fetch(`http://localhost:5000/api/medicine-search?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const data: SearchResult = await response.json();

      if (data.success && data.pharmacies) {
        setResults(data.pharmacies);
      } else {
        setError(data.error || 'No results found');
      }
    } catch (err) {
      setError('Failed to search for medicine. Make sure the server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results
    .filter(r => {
      if (filterByAvailability === 'all') return true;
      return r.availability === filterByAvailability;
    })
    .sort((a, b) => {
      if (sortBy === 'distance') return a.distance - b.distance;
      return a.price - b.price;
    });

  const getAvailabilityClass = (availability: string) => {
    switch (availability) {
      case 'In Stock':
        return 'in-stock';
      case 'Low Stock':
        return 'low-stock';
      case 'Out of Stock':
        return 'out-of-stock';
      default:
        return '';
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleGetDirections = (pharmacy: Pharmacy) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lon}&destination=${pharmacy.latitude},${pharmacy.longitude}&travelmode=driving`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="medicine-availability-container">
      <div className="medicine-header">
        <h1>Find Medicines</h1>
        <p>Search for medicine availability in nearby pharmacies</p>
      </div>

      <form onSubmit={handleSearch} className="medicine-search-form">
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Search medicine (e.g., Paracetamol)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Show suggestions while typing
              if (e.target.value.length > 0) {
                const filtered = suggestions.filter(s =>
                  s.toLowerCase().includes(e.target.value.toLowerCase())
                );
                // Could show dropdown here
              }
            }}
            className="medicine-search-input"
            list="medicine-suggestions"
            autoComplete="off"
          />
          <datalist id="medicine-suggestions">
            {suggestions.map((med, idx) => (
              <option key={idx} value={med} />
            ))}
          </datalist>
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-message">
          <strong>⚠ {error}</strong>
        </div>
      )}

      {results.length > 0 && (
        <div className="filter-section">
          <div className="filter-group">
            <label htmlFor="availability-filter">Filter by Availability:</label>
            <select
              id="availability-filter"
              value={filterByAvailability}
              onChange={(e) => setFilterByAvailability(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'distance' | 'price')}
              className="filter-select"
            >
              <option value="distance">Distance</option>
              <option value="price">Price</option>
            </select>
          </div>

          <div className="results-count">
            Found {filteredResults.length} pharmacy(ies)
          </div>
        </div>
      )}

      <div className="results-grid">
        {filteredResults.length > 0 ? (
          filteredResults.map((pharmacy) => (
            <div key={pharmacy.pharmacy_id} className="pharmacy-card">
              <div className="card-header">
                <h3>{pharmacy.pharmacy_name}</h3>
                <span className={`availability-badge ${getAvailabilityClass(pharmacy.availability)}`}>
                  {pharmacy.availability}
                </span>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="label">Location:</span>
                  <span className="value">{pharmacy.village}</span>
                </div>

                <div className="info-row">
                  <span className="label">Address:</span>
                  <span className="value">{pharmacy.address}</span>
                </div>

                <div className="medicine-details">
                  <div className="detail-item">
                    <span className="detail-label">Medicine:</span>
                    <span className="detail-value">{pharmacy.medicine_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Qty:</span>
                    <span className="detail-value">{pharmacy.quantity} units</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value">₹{pharmacy.price}</span>
                  </div>
                </div>

                {pharmacy.distance > 0 && (
                  <div className="distance-info">
                    📍 {pharmacy.distance.toFixed(1)} km away
                  </div>
                )}
              </div>

              <div className="card-actions">
                <button
                  className="action-btn call-btn"
                  onClick={() => handleCall(pharmacy.phone)}
                  title={`Call ${pharmacy.pharmacy_name}`}
                >
                  ☎ Call
                </button>
                {userLocation && (
                  <button
                    className="action-btn directions-btn"
                    onClick={() => handleGetDirections(pharmacy)}
                    title="Get directions"
                  >
                    🗺 Directions
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          !loading && results.length === 0 && searchQuery && (
            <div className="empty-state">
              <p>No results found. Try a different medicine name.</p>
              <p className="suggestion">Available medicines: Paracetamol, Ibuprofen, Aspirin, Metformin, Insulin, Azithromycin, Vitamin D, ORS Pack</p>
            </div>
          )
        )}
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Searching for pharmacies...</p>
        </div>
      )}
    </div>
  );
};

export default MedicineAvailability;
