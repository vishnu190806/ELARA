import { adminDb } from "./firebase/admin";
import { ai, MODEL } from "./gemini";

export async function enhanceWithExplanations(events: any[], origin: "space_devs" | "nasa") {
  if (!events || !Array.isArray(events)) return events;

  const results = [...events];
  
  // To avoid hitting API rate limits or timeout limits, we only process max 5 at a time
  const batch = results.slice(0, 5);
  
  const explanationsRef = adminDb.collection('event_explanations');
  
  await Promise.all(batch.map(async (event, index) => {
    const id = event.id;
    const name = origin === "space_devs" ? event.name : event.title;
    
    if (!id || !name) return;
    
    try {
      const doc = await explanationsRef.doc(id).get();
      
      if (doc.exists) {
        // Cached in Firestore
        results[index].explanation = doc.data()?.text;
      } else {
        // Pre-generate with Gemini
        let explanationText = "Explanation temporarily unavailable.";
        
        try {
          const prompt = `Write a simple, 2-sentence explanation for the general public about this astronomical/space event: "${name}". Do not include introductory text, just the explanation.`;
          
          const result = await ai.models.generateContent({
            model: MODEL,
            contents: prompt,
          });
          
          if (result.text) {
             explanationText = result.text.trim();
             // Cache in Firestore for next time
             await explanationsRef.doc(id).set({
               text: explanationText,
               type: origin,
               name: name,
               createdAt: new Date().toISOString()
             });
          }
        } catch (geminiErr) {
          console.error(`Gemini generation failed for event ${id}:`, geminiErr);
        }
        
        results[index].explanation = explanationText;
      }
    } catch (err) {
      console.error(`Firestore explanation check failed for event ${id}:`, err);
    }
  }));

  return results;
}
