import { Parcheggio, StatoParcheggio, Utente } from '../types';
import { RAW_MURAT_DATA, RAW_CARRASSI_DATA, RAW_POGGIOFRANCO_DATA } from '../constants';

// This service simulates the SQLite interaction and the "seed_db.py" script logic.
// In a real backend, this would connect to a real DB file.

class DatabaseService {
  private parcheggi: Parcheggio[] = [];
  private utenti: Utente[] = [];
  private currentUser: Utente | null = null;

  constructor() {
    this.seedDatabase();
    // Create a dummy user for the simulation
    this.utenti.push({
      id: 1,
      nome: "Mario Rossi",
      email: "mario@example.com",
      pwd: "password123"
    });
  }

  // Corrisponde alla logica di seed_db.py
  // Legge i dati grezzi e crea record con ID progressivi
  private seedDatabase() {
    let counter = 1;

    const processZone = (data: any, zonaName: string) => {
      data.features.forEach((feature: any) => {
        // Simple extraction of a coordinate for display purposes
        // GeoJSON polygons are complex, we just take the first point for simplicity
        const coords = feature.geometry.coordinates[0][0];
        const lat = coords[1];
        const lon = coords[0];

        const id = `P_${counter.toString().padStart(3, '0')}`; // ID Leggibile es: P_001

        this.parcheggi.push({
          codiceID: id,
          via: `${zonaName} Street, Block ${counter}`, // Simulated address
          zona: zonaName,
          stato: StatoParcheggio.LIBERO,
          lat: lat,
          lon: lon
        });
        counter++;
      });
    };

    processZone(RAW_MURAT_DATA, 'Murat');
    processZone(RAW_CARRASSI_DATA, 'Carrassi');
    processZone(RAW_POGGIOFRANCO_DATA, 'Poggiofranco');

    console.log(`Database seeded with ${this.parcheggi.length} parking spots.`);
  }

  // --- Methods corresponding to Controller/Model interactions ---

  public login(email: string, pwd: string): boolean {
    const user = this.utenti.find(u => u.email === email && u.pwd === pwd);
    if (user) {
      this.currentUser = user;
      return true;
    }
    return false;
  }

  public getCurrentUser(): Utente | null {
    return this.currentUser;
  }

  public getParcheggioById(codice: string): Parcheggio | undefined {
    return this.parcheggi.find(p => p.codiceID === codice);
  }

  // Logica Check-in del Diagramma di Sequenza
  public updateStatoParcheggio(codice: string, nuovoStato: StatoParcheggio): boolean {
    const p = this.parcheggi.find(item => item.codiceID === codice);
    if (!p) return false;

    p.stato = nuovoStato;
    
    // Aggiorna riferimento utente
    if (this.currentUser) {
        if (nuovoStato === StatoParcheggio.OCCUPATO) {
            this.currentUser.parcheggioAttuale = codice;
        } else {
            this.currentUser.parcheggioAttuale = undefined;
        }
    }
    return true;
  }

  // Metodo per AI: Aggregazione dati
  public getStatsByZone(): string {
    const stats: Record<string, { free: number, total: number }> = {};

    this.parcheggi.forEach(p => {
      if (!stats[p.zona]) stats[p.zona] = { free: 0, total: 0 };
      stats[p.zona].total++;
      if (p.stato === StatoParcheggio.LIBERO) stats[p.zona].free++;
    });

    return Object.entries(stats)
      .map(([zona, data]) => `${zona}: ${data.free} liberi su ${data.total} totali`)
      .join('; ');
  }

  public getAllParcheggi(): Parcheggio[] {
      return this.parcheggi;
  }
}

// Singleton instance
export const dbService = new DatabaseService();