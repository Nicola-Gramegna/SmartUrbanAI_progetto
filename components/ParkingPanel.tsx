import React, { useState } from 'react';
import { dbService } from '../services/databaseService';
import { StatoParcheggio } from '../types';

interface ParkingPanelProps {
  onUpdate: () => void; // Callback per aggiornare la UI generale
}

const ParkingPanel: React.FC<ParkingPanelProps> = ({ onUpdate }) => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

  const currentUser = dbService.getCurrentUser();

  // Logica Check-in come da Diagramma di Sequenza
  const handleCheckIn = () => {
    if (!code) {
      setMessage({ text: "Inserisci un codice valido.", type: 'error' });
      return;
    }

    const park = dbService.getParcheggioById(code);

    // Alt: Parcheggio libero & Esistente
    if (park && park.stato === StatoParcheggio.LIBERO) {
        if (currentUser?.parcheggioAttuale) {
            setMessage({ text: "Hai già un parcheggio attivo. Fai checkout prima.", type: 'error' });
            return;
        }
        
        // UpdateStato
        dbService.updateStatoParcheggio(code, StatoParcheggio.OCCUPATO);
        setMessage({ text: `Check-in effettuato con successo su ${code}!`, type: 'success' });
        setCode('');
        onUpdate();
    } else {
        // else (Parcheggio Occupato o inesistente)
        setMessage({ text: "Codice non valido o parcheggio già occupato.", type: 'error' });
    }
  };

  // Logica Check-out
  const handleCheckOut = () => {
     if (!code) {
      setMessage({ text: "Inserisci il codice per liberare il posto.", type: 'error' });
      return;
    }

    const park = dbService.getParcheggioById(code);
    
    // Alt: Parcheggio Occupato & Esistente
    if (park && park.stato === StatoParcheggio.OCCUPATO) {
        // Verifica che sia l'utente corretto (semplificato)
        if (currentUser?.parcheggioAttuale !== code) {
             setMessage({ text: "Non stai occupando questo parcheggio.", type: 'error' });
             return;
        }

        // UpdateStato
        dbService.updateStatoParcheggio(code, StatoParcheggio.LIBERO);
        setMessage({ text: `Check-out effettuato. Parcheggio ${code} liberato!`, type: 'success' });
        setCode('');
        onUpdate();
    } else {
        setMessage({ text: "Il parcheggio è già libero o non esiste.", type: 'error' });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-blue-600">Gestione Sosta</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Codice Parcheggio (es. P_001)
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Inserisci ID..."
        />
      </div>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleCheckIn}
          className="flex-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition"
        >
          Check-In
        </button>
        <button
          onClick={handleCheckOut}
          className="flex-1 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition"
        >
          Check-Out
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded text-sm ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 
            message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {message.text}
        </div>
      )}

      {currentUser?.parcheggioAttuale && (
          <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded">
              Stai occupando: <strong>{currentUser.parcheggioAttuale}</strong>
          </div>
      )}
    </div>
  );
};

export default ParkingPanel;