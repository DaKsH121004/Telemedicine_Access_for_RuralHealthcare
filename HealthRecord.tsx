import React, { useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

const HealthRecord: React.FC = () => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const save = async () => {
    setStatus('saving');
    try {
      const res = await fetch(`${API_BASE}/health-record`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: 'local_user', title, notes })
      });
      const j = await res.json();
      if (j.success) setStatus('saved'); else setStatus('error');
    } catch (e) { setStatus('error'); }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Health Record</h2>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Record title" className="w-full p-2 border rounded mb-2" />
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes / observations" className="w-full p-2 border rounded mb-2" rows={6} />
      <div className="flex gap-2">
        <button onClick={save} className="px-4 py-2 bg-green-600 text-white rounded">Save Record</button>
        <div className="text-sm text-gray-600">{status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : status === 'error' ? 'Error saving' : ''}</div>
      </div>
      <div className="mt-3 text-sm text-gray-500">Saved records are stored locally (framework).</div>
    </div>
  );
};

export default HealthRecord;
