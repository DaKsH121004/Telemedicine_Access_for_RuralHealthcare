import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

const EmergencySOS: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/helplines`).then(r => r.json()).then(j => { if (j.success) setData(j.data); }).catch(() => {});
  }, []);

  return (
    <div className="p-4 bg-red-50 rounded">
      <h2 className="text-2xl font-bold text-red-700 mb-2">Emergency SOS</h2>
      <p className="mb-4">Quick access to emergency numbers and nearby hospitals. (Data configurable later)</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold text-lg">Emergency Numbers</h3>
          <ul className="mt-2">
            {(data?.emergency_numbers || []).map((e: any, i: number) => (
              <li key={i} className="py-1"><strong>{e.name}:</strong> <span className="ml-2 text-black">{e.number}</span></li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold text-lg">Nearby Hospitals</h3>
          <ul className="mt-2">
            {(data?.nearby_hospitals || []).map((h: any, i: number) => (
              <li key={i} className="py-1"><strong>{h.name}:</strong> <span className="ml-2 text-black">{h.phone} ({h.distance_km} km)</span></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">This is a framework area — you will provide emergency data later.</div>
    </div>
  );
};

export default EmergencySOS;
