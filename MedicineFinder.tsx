import React, { useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

const MedicineFinder: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/medicine-search?medicine=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.pharmacies || []);
      } else {
        setError(data.error || 'No results');
      }
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Medicine Availability</h2>
      <div className="flex gap-2 mb-3">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search medicine (e.g., paracetamol)" className="flex-1 p-2 border rounded" />
        <button onClick={search} className="px-4 py-2 bg-blue-600 text-white rounded">Search</button>
      </div>

      {loading && <div>Searching...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div>
        {results.map((p, idx) => (
          <div key={idx} className="p-3 mb-2 border rounded">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-gray-600">{p.address}</div>
              </div>
              <div className="text-right">
                <div className={p.in_stock ? 'text-green-600' : 'text-red-600'}>
                  {p.in_stock ? `In stock (${p.stock})` : 'Out of stock'}
                </div>
                <div className="text-sm text-gray-500">{p.distance_km} km</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-500">Map view will be integrated here (framework placeholder).</div>
    </div>
  );
};

export default MedicineFinder;
