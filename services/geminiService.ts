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

export async function fetchLeads(
  searchQuery: string,
  city: string,
  country: string,
  leadCount: number,
  runSeoAnalysis: boolean,
  onProgress: (message: string) => void
): Promise<Omit<Lead, 'id' | 'webhookStatus'>[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const userLocation = await getGeolocation();

  const finalLeads: Omit<Lead, 'id' | 'webhookStatus'>[] = [];
  let rateLimitHit = false;

  for (let i = 0; i < leadCount; i++) {
    onProgress(`Generating lead ${i + 1}/${leadCount}...`);

    const alreadyFoundCompanies = finalLeads.map(lead => lead.companyName).join(', ');
    const exclusionPrompt = alreadyFoundCompanies
      ? `\n\n**IMPORTANT EXCLUSION:** You have already found the following businesses: "${alreadyFoundCompanies}". Do not return any of these. Find a new, different business.`
      : '';
      
    const leadJsonStructure = `
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
    "twitter": "string | null",
    "rating": "number | null",
    "reviewCount": "integer | null",
    "businessHours": { "Monday": "string", "Tuesday": "string", "Wednesday": "string", "Thursday": "string", "Friday": "string", "Saturday": "string", "Sunday": "string" } | null,
    "services": "string[] | null (A list of key services or products offered)",
    "companySize": "string | null (e.g., '11-50 employees')",
    "employeeCount": "integer | null",
    "postFrequency": "'Daily' | 'Weekly' | 'Monthly' | 'Inactive' | null",
    "engagementLevel": "'High' | 'Medium' | 'Low' | null",
    "qualityScore": "integer (1-100 based on data completeness and accuracy)",
    "qualityReasoning": "string (Briefly explain the quality score)",
    "status": "'New'",
    "contacted": "false",
    "notes": "''"
    ${runSeoAnalysis ? `,
    "hasWebsite": "boolean",
    "websiteSeoScore": "integer | null (1-10)",
    "hasGbpListing": "boolean",
    "gbpSeoScore": "integer | null (1-10)",
    "seoRecommendations": "string | null (Formatted string with improvement tips)"
    ` : ''}
    }`;

    const seoAnalysisInstructions = runSeoAnalysis ? `
    **SEO & Local SEO Analysis Instructions (CRITICAL):**
    Once a business website is found, you MUST perform a thorough SEO and Local SEO analysis.
    1. Website SEO Analysis: Check on-page fundamentals (titles, headers), content relevance, technical aspects (HTTPS, mobile-friendly), and local signals (NAP consistency).
    2. GBP Analysis: Check profile completeness, customer engagement (reviews, responses), and recent activity (posts).
    3. Actionable Recommendations: Combine findings into a markdown-formatted string in the \`seoRecommendations\` field with specific, actionable tips. Example format: "### Website Improvements\\n- **Technical:** Your site is secure (Good!).\\n### GBP Improvements\\n- **Engagement:** Respond to new reviews."
    ` : '';

    const prompt = `You are an AI lead generation expert.
Your task is to find a single business that matches the following criteria and has not been found yet.

Search Criteria: '${searchQuery}'
Location: '${city}, ${country}'
${exclusionPrompt}

**CRITICAL DATA POINTS:**
1. **Website:** Perform a dedicated, persistent search to find the company's official website.
2. **Email:** If a website is found, you MUST then analyze it to locate a contact email address.

Then, gather all other information as defined in the JSON structure below. If, after a persistent search, you cannot find a piece of information, use \`null\`.

Your final output MUST be a single JSON object inside a markdown code block. Do not include any other text.
The structure for the JSON object is:
${leadJsonStructure}

${seoAnalysisInstructions}
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }, { googleSearch: {} }],
          ...(userLocation ? { toolConfig: { retrievalConfig: { latLng: userLocation } } } : {}),
        },
      });

      const rawText = response.text;
      const jsonMatch = rawText.match(/```json\n([\s\S]*)\n```/);
      let newLead: Omit<Lead, 'id' | 'webhookStatus'>;

       if (!jsonMatch) {
         try {
          newLead = JSON.parse(rawText.trim());
        } catch (e) {
           console.warn(`Could not parse non-markdown JSON for lead ${i + 1}. Skipping. Content: ${rawText}`);
           continue; // Skip this lead
        }
      } else {
         const jsonText = jsonMatch[1];
         newLead = JSON.parse(jsonText);
      }
      
      if (newLead && newLead.companyName) {
        newLead.leadNumber = i + 1;
        finalLeads.push(newLead);
      } else {
        console.warn(`Generated lead ${i + 1} was invalid or missing a company name. Skipping.`);
      }
    } catch (err: any) {
      const errorMessage = JSON.stringify(err);
      if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes('"code":429')) {
        onProgress('API Rate Limit Exceeded: You have hit your daily quota. The leads generated so far are displayed below.');
        rateLimitHit = true;
        console.error("API Rate Limit Exceeded. Returning partial results.", err);
        break; // Exit the loop and return what we have so far.
      }
      
      // For other errors, log them and continue to the next lead.
      console.error(`Failed to generate lead ${i + 1}, skipping. Error:`, err);
    }
    
    // Add a delay between requests to avoid hitting per-minute rate limits
    if (i < leadCount - 1) { // No need to wait after the last one
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay
    }
  }
  
  if (!rateLimitHit) {
    onProgress('Lead generation complete!');
  }
  
  return finalLeads;
}