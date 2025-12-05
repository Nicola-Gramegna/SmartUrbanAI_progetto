import { GoogleGenAI } from "@google/genai";
import { dbService } from "./databaseService";

// IMPORTANTE: In un'app reale, la chiave non dovrebbe essere nel frontend.
// Per questo progetto didattico, assumiamo che l'utente inserisca la chiave o usiamo una env var.
// Per il prototipo, useremo una chiave placeholder o iniettata.

export class GeminiController {
  private ai: GoogleGenAI;
  private modelId = "gemini-2.5-flash";

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  // Funzione del Controller: gestisciRichiestaAI
  public async gestisciRichiestaAI(userQuestion: string): Promise<string> {
    try {
      // 1. Context Injection: Recupero dati dal DB (Model)
      const parkingStats = dbService.getStatsByZone();
      const currentUser = dbService.getCurrentUser();
      const userStatus = currentUser?.parcheggioAttuale 
        ? `L'utente ha occupato il parcheggio ${currentUser.parcheggioAttuale}` 
        : "L'utente non ha parcheggi occupati al momento.";

      // 2. Costruzione Prompt di Sistema
      const systemPrompt = `
        Sei SmartUrban AI, un assistente per la gestione dei parcheggi a Bari.
        
        DATI IN TEMPO REALE DAL DATABASE:
        - Situazione Zone: ${parkingStats}.
        - Stato Utente: ${userStatus}.
        
        OBIETTIVI:
        - Rispondi alle domande sulla disponibilità dei posti basandoti SOLO sui dati forniti sopra.
        - Sii cortese, conciso e utile.
        - Se ti chiedono di prenotare, spiega che devono usare il pannello "Gestione Sosta" inserendo il codice ID.
      `;

      // 3. Chiamata API
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: [
            { role: 'user', parts: [{ text: systemPrompt + "\n\nDomanda Utente: " + userQuestion }] }
        ]
      });

      return response.text || "Mi dispiace, non ho potuto elaborare una risposta.";

    } catch (error) {
      console.error("Gemini Error:", error);
      return "Errore di connessione al servizio AI. Verifica la API Key.";
    }
  }
}