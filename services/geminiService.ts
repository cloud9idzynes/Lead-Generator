import { GoogleGenAI } from "@google/genai";
import { Lead } from "../types";

const getGeolocation = (): Promise<{ latitude: number; longitude: number } | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        resolve(null); // User denied or error occurred
      }
    );
  });
};

export async function fetchLeads(searchQuery: string, city: string, country: string, leadCount: number): Promise<Omit<Lead, 'id' | 'webhookStatus'>[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `You are a world-class lead generation expert with advanced web-scraping capabilities.
Your task is to find a list of up to ${leadCount} business leads based on the following criteria: '${searchQuery}' in '${city}, ${country}'.

Follow this multi-step process for each potential lead to ensure maximum data accuracy and completeness:
1.  **Initial Discovery (Google Maps):** Use Google Maps to identify a list of businesses matching the search query in the specified location. From this initial search, extract core information like Company Name, Address, Phone Number, Category, Rating, and Review Count.
2.  **Deep Dive (Google Search):** For each business identified, perform a targeted Google Search using the company name and city to find their official website.
3.  **Data Enrichment (Website & Search):**
    *   Scour the official website. Look for an 'About Us' page for the \`description\`, a 'Services' or 'Products' page for the list of \`services\`, and a 'Contact' or 'Hours' page for \`businessHours\`.
    *   Also search the website for a contact Email address, a LinkedIn company page URL, a Facebook page URL, and an Instagram profile URL.
    *   If this information is not on the website, use Google Search again with queries like "[Company Name] services", "[Company Name] LinkedIn" or "[Company Name] contact email" to find them.
4.  **Final Assembly:** Consolidate all the gathered information into the precise JSON structure defined below. If, after thorough searching, a piece of information cannot be found, use \`null\`.

For each lead found, you MUST provide the data in a structured JSON format. The final output must be a single JSON object with a key named "leads" which contains an array of lead objects.
The structure for each lead object is as follows:
{
  "generatedDate": "string (ISO 8601 format)",
  "searchCity": "string (The city used for the search: ${city})",
  "searchCountry": "string (The country used for the search: ${country})",
  "leadNumber": "integer (A sequential number for the lead in this batch)",
  "companyName": "string",
  "category": "string",
  "description": "string | null",
  "address": "string | null",
  "city": "string | null",
  "country": "string | null",
  "coordinates": { "lat": "number", "lon": "number" } | null,
  "phone": "string | null",
  "email": "string | null",
  "website": "string | null",
  "linkedIn": "string | null",
  "facebook": "string | null",
  "instagram": "string | null",
  "rating": "number | null",
  "reviewCount": "integer | null",
  "businessHours": { "Monday": "string", "Tuesday": "string", "Wednesday": "string", "Thursday": "string", "Friday": "string", "Saturday": "string", "Sunday": "string" } | null,
  "services": "string[] | null (A list of key services or products offered)",
  "qualityScore": "integer (1-100 based on data completeness and accuracy)",
  "qualityReasoning": "string (Briefly explain the quality score)",
  "status": "'New'",
  "contacted": "false",
  "notes": "''"
}

IMPORTANT: Your entire response MUST be a JSON object wrapped in a single markdown code block. For example:
\`\`\`json
{
  "leads": [
    { /* ...lead data... */ }
  ]
}
\`\`\`
Do not include any text, conversation, or explanation outside of this JSON code block.`;

  const userLocation = await getGeolocation();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        ...(userLocation ? { toolConfig: { retrievalConfig: { latLng: userLocation } } } : {}),
      },
    });

    const rawText = response.text;
    const jsonMatch = rawText.match(/```json\n([\s\S]*)\n```/);
    const jsonText = jsonMatch ? jsonMatch[1] : rawText.trim();
    
    if (!jsonText) {
      throw new Error("AI response was empty.");
    }

    const parsedResponse = JSON.parse(jsonText);

    if (!parsedResponse.leads || !Array.isArray(parsedResponse.leads)) {
      throw new Error("AI response did not contain a valid 'leads' array.");
    }

    return parsedResponse.leads;

  } catch (error) {
    console.error("Error fetching leads from Gemini:", error);
    throw new Error("Failed to get a valid response from the AI. The model may be unable to find leads for this query or the response format was incorrect.");
  }
}
