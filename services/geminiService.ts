import { GoogleGenAI } from "@google/genai";

// --- Constants from User Spec ---

const SUBJECTS = [
  "An abstract representation of a neurological landscape, focusing on the intricate beauty of neural pathways and synaptic bursts.",
  "A conceptual exploration of the cardiovascular system, depicting the heart and arterial branching with fluid, energetic strokes.",
  "A microscopic view of cellular mitosis, rendered with the vibrant, dappled light and color of an impressionist garden scene.",
  "An artistic interpretation of the pulmonary system, showing alveoli and bronchioles as delicate, blossoming structures.",
  "A surrealist vision of the human endocrine system, with glands and hormones painted as celestial bodies in a vibrant nebula.",
];

const PALETTES = [
  "A Cerebral Twilight palette: dominated by deep cerulean blues and slate grays, with dramatic, glowing accents of fiery crimson and incandescent gold.",
  "A Sanguine Vitality palette: featuring rich cadmium reds, deep purples, and warm ochres, contrasted with highlights of cool, pale blues.",
  "A Cellular Dawn palette: a bright and vibrant mix of soft pinks, luminous yellows, and bioluminescent greens against a backdrop of soft, hazy lavender.",
  "A Venous River palette: a cool and calming blend of deep blues, teals, and phthalo greens, with shimmering silver and white highlights.",
];

const STYLES = [
  "in the style of Claude Monet, with a focus on dappled light, broken color, and capturing a fleeting moment.",
  "in the style of Vincent van Gogh, characterized by thick, swirling impasto, emotional energy, and bold, dramatic colors.",
  "in the style of Camille Pissarro, with short, distinct brushstrokes, a muted yet rich earth-toned palette, and a focus on harmonious composition.",
  "in the style of Edgar Degas, capturing a sense of movement and using unconventional angles and compositions.",
];

const MASTER_TEMPLATE = `Create a masterpiece oil painting of the highest quality.
The defining characteristic must be the brushwork: make the brushstrokes visible, energetic, thick, and textured with a clear impasto effect. The texture of the canvas and the depth of the oil paint should be almost palpable. This is not a digital graphic; it must look and feel like a true, physical Impressionist painting.
The subject is: {SUBJECT}.
Use {PALETTE}.
Render this {STYLE}.
The overall composition must feel vibrant, sophisticated, and full of artistic movement.`;

// --- Helper Functions ---

const getRandomElement = (arr: string[]) =>
  arr[Math.floor(Math.random() * arr.length)];

const constructPrompt = () => {
  const subject = getRandomElement(SUBJECTS);
  const palette = getRandomElement(PALETTES);
  const style = getRandomElement(STYLES);

  return MASTER_TEMPLATE.replace("{SUBJECT}", subject)
    .replace("{PALETTE}", palette)
    .replace("{STYLE}", style);
};

// --- Main Service ---

export const generateImpressionistBackground = async (
  apiKey?: string,
  availableModels?: string[],
): Promise<string> => {
  let generatedImage: string | null = null;
  let lastError: any;

  if (apiKey) {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = constructPrompt();

    // Smart Model Selection Logic
    let modelsToTry: string[] = [];

    if (availableModels && availableModels.length > 0) {
      // Filter for known image generation capable models (containing 'imagen')
      // Sort them to prioritize newer versions (higher numbers)
      const imagenModels = availableModels
        .filter((m) => m.toLowerCase().includes("imagen"))
        .sort((a, b) => b.localeCompare(a)); // Descending sort (e.g., imagen-3.0 before imagen-2.0)

      if (imagenModels.length > 0) {
        modelsToTry = imagenModels;
      }
    }

    // Fallback if no models detected or provided
    if (modelsToTry.length === 0) {
      modelsToTry = [
        "imagen-3.0-generate-001", // Stable fallback
        "gemini-2.0-flash-exp", // Experimental
      ];
    }

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateImages({
          model: model,
          prompt: prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: "image/jpeg",
            aspectRatio: "16:9",
            personGeneration: "dont_allow" as any,
          },
        });

        const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
        if (base64Image) {
          generatedImage = `data:image/jpeg;base64,${base64Image}`;
          break; // Stop trying models
        }
      } catch (error) {
        lastError = error;
        // Continue to next model
      }
    }
  }

  if (generatedImage) {
    return generatedImage;
  }

  // Local Fallback Images (from user provided folder)
  const LOCAL_FALLBACK_IMAGES = [
    "/backgrounds/027506bf-3af1-4bbc-a8eb-c358f2c71f5f.png",
    "/backgrounds/download (1).jpg",
    "/backgrounds/download (2).jpg",
    "/backgrounds/e9cd2064-c277-4a0d-a416-6fa7ac1947b4.png",
  ];

  const randomFallback =
    LOCAL_FALLBACK_IMAGES[
      Math.floor(Math.random() * LOCAL_FALLBACK_IMAGES.length)
    ];
  return randomFallback;
};
