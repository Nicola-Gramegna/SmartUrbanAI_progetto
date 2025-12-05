// Enumerazione Stato come definito nel Diagramma delle Classi
export enum StatoParcheggio {
  LIBERO = 'LIBERO',
  OCCUPATO = 'OCCUPATO'
}

// Classe Utente (semplificata come interfaccia)
export interface Utente {
  id: number;
  nome: string;
  email: string;
  pwd?: string; // Opzionale per sicurezza nel frontend
  parcheggioAttuale?: string; // ID del parcheggio se ne occupa uno
}

// Classe Parcheggio
export interface Parcheggio {
  codiceID: string; // Es. "P_001"
  via: string;
  zona: string; // Aggiunto per gestire le 3 zone (Murat, Carrassi, Poggiofranco)
  stato: StatoParcheggio;
  lat: number;
  lon: number;
}

// Struttura per i messaggi della chat
export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}