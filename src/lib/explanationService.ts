import { adminDb } from "./firebase/admin";
import { ai, MODEL } from "./gemini";
import { SpaceEvent } from "@/types";

export async function enhanceWithExplanations(events: SpaceEvent[], origin: "space_devs" | "nasa") {
  if (!events || !Array.isArray(events)) return events;

  const explanationsRef = adminDb.collection('event_explanations');
  const enhancedEvents: SpaceEvent[] = [];
  
  // We process events sequentially to avoid hitting Gemini's Free Tier RPM limits (429 errors)
  for (const event of events) {
    const id = event.id;
    const name = origin === "space_devs" ? event.name : event.title;
    
    if (!id || !name) {
      enhancedEvents.push(event);
      continue;
    }
    
    try {
      const doc = await explanationsRef.doc(id).get();
      
      if (doc.exists) {
        // Return existing event with cached explanation
        enhancedEvents.push({ ...event, explanation: doc.data()?.text });
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
          
          // Small delay to be extra safe with rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (geminiErr) {
          console.error(`Gemini generation failed for event ${id}:`, geminiErr);
        }
        
        enhancedEvents.push({ ...event, explanation: explanationText });
      }
    } catch (err) {
      console.error(`Firestore explanation check failed for event ${id}:`, err);
      enhancedEvents.push(event);
    }
  }

  return enhancedEvents;
}
