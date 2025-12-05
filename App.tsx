import React, { useEffect, useState } from 'react';
import ChatPanel from './components/ChatPanel';
import ParkingPanel from './components/ParkingPanel';
import { dbService } from './services/databaseService';
import { Parcheggio, StatoParcheggio } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // States for Login form (Simulated)
  const [email, setEmail] = useState('mario@example.com');
  const [pwd, setPwd] = useState('password123');
  const [loginError, setLoginError] = useState('');
  
  // Dashboard State
  const [parcheggi, setParcheggi] = useState<Parcheggio[]>([]);

  useEffect(() => {
    // Initial data load
    refreshData();
  }, []);

  const refreshData = () => {
    setParcheggi([...dbService.getAllParcheggi()]);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (dbService.login(email, pwd)) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Credenziali non valide');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">SmartUrban Login</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow border rounded w-full py-2 px-3"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <input 
                type="password" 
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="shadow border rounded w-full py-2 px-3"
              />
            </div>
            {loginError && <p className="text-red-500 text-xs italic mb-4">{loginError}</p>}
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
              Accedi
            </button>
            <p className="text-xs text-gray-400 mt-4 text-center">Demo: mario@example.com / password123</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            🚗 SmartUrban AI
          </h1>
          <div className="text-sm">
             Benvenuto, {dbService.getCurrentUser()?.nome}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-4 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Operational Panels */}
          <div className="space-y-6">
            <ParkingPanel onUpdate={refreshData} />
            
            {/* Live Data Overview (Didactic Extra) */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
               <h3 className="text-lg font-bold mb-3 text-gray-700">Stato Zone (Debug View)</h3>
               <div className="grid grid-cols-2 gap-4">
                  {['Murat', 'Carrassi', 'Poggiofranco'].map(zone => {
                      const zoneSpots = parcheggi.filter(p => p.zona === zone);
                      const free = zoneSpots.filter(p => p.stato === StatoParcheggio.LIBERO).length;
                      return (
                          <div key={zone} className="border p-3 rounded bg-gray-50">
                              <div className="font-semibold text-gray-800">{zone}</div>
                              <div className="text-sm text-green-600">Liberi: {free}</div>
                              <div className="text-sm text-gray-500">Totali: {zoneSpots.length}</div>
                          </div>
                      )
                  })}
               </div>
            </div>

            {/* Parking List (Scrollable) */}
             <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-64 overflow-y-auto">
               <h3 className="text-lg font-bold mb-3 text-gray-700 sticky top-0 bg-white">Lista Parcheggi</h3>
               <table className="min-w-full text-sm">
                 <thead>
                   <tr className="border-b">
                     <th className="text-left py-2">ID</th>
                     <th className="text-left py-2">Zona</th>
                     <th className="text-left py-2">Stato</th>
                   </tr>
                 </thead>
                 <tbody>
                   {parcheggi.map(p => (
                     <tr key={p.codiceID} className="border-b hover:bg-gray-50">
                       <td className="py-2 font-mono">{p.codiceID}</td>
                       <td className="py-2">{p.zona}</td>
                       <td className={`py-2 font-bold ${p.stato === StatoParcheggio.LIBERO ? 'text-green-500' : 'text-red-500'}`}>
                         {p.stato}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>

          {/* Right Column: AI Chat */}
          <div className="h-full">
            <ChatPanel />
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;