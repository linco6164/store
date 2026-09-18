import { ListingModel } from "./listing.model.js";

type VisualSearchResult = {
    keywords: string[];
    category?: string;
    brand?: string;
    color?: string;
    productType?: string;
};

class VisualSearchService {
    async analyzeImage(
        buffer: Buffer,
        mimetype: string
    ): Promise<VisualSearchResult> {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            throw new Error(
                "OPENAI_API_KEY is not configured."
            );
        }

        const base64Image =
            buffer.toString("base64");

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-5.6-luna",
                    input: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "input_text",
                                    text: `
Analizează fotografia unui produs pentru o aplicație marketplace.

Identifică:
- tipul produsului
- categoria
- brandul, dacă este vizibil
- culoarea principală
- cuvinte-cheie utile pentru căutarea produsului

Răspunde STRICT cu JSON valid, fără markdown:

{
  "keywords": [],
  "category": "",
  "brand": "",
  "color": "",
  "productType": ""
}

Nu inventa brandul dacă nu este vizibil.
Pentru câmpurile necunoscute folosește string gol.
                                    `.trim(),
                                },
                                {
                                    type: "input_image",
                                    image_url:
                                        `data:image/jpeg;base64,${base64Image}`,
                                },
                            ],
                        },
                    ],
                }),
            }
        );

        if (!response.ok) {
            const errorText =
                await response.text();

            throw new Error(
                `OpenAI API error: ${response.status} ${errorText}`
            );
        }

        const data = await response.json();

        const outputText =
            this.extractOutputText(data);

        if (!outputText) {
            throw new Error(
                "OpenAI returned no analysis."
            );
        }

        const cleaned =
            outputText
                .replace(/^```json\s*/i, "")
                .replace(/^```\s*/i, "")
                .replace(/\s*```$/i, "")
                .trim();

        const result =
            JSON.parse(cleaned);

        return {
            keywords: Array.isArray(result.keywords)
                ? result.keywords
                : [],
            category:
                typeof result.category === "string"
                    ? result.category
                    : "",
            brand:
                typeof result.brand === "string"
                    ? result.brand
                    : "",
            color:
                typeof result.color === "string"
                    ? result.color
                    : "",
            productType:
                typeof result.productType === "string"
                    ? result.productType
                    : "",
        };
    }

    private extractOutputText(
        data: any
    ): string {
        if (
            typeof data.output_text === "string"
        ) {
            return data.output_text;
        }

        if (!Array.isArray(data.output)) {
            return "";
        }

        for (const item of data.output) {
            if (!Array.isArray(item.content)) {
                continue;
            }

            for (const content of item.content) {
                if (
                    typeof content.text === "string"
                ) {
                    return content.text;
                }
            }
        }

        return "";
    }

    async searchByImage(
        buffer: Buffer,
        mimetype: string
    ) {
        const analysis =
            await this.analyzeImage(
                buffer,
                mimetype
            );

        const searchTerms = [
            ...analysis.keywords,
            analysis.productType,
            analysis.brand,
            analysis.color,
        ]
            .filter(Boolean)
            .map((value) =>
                String(value).trim()
            )
            .filter(Boolean);

        if (!searchTerms.length) {
            return {
                analysis,
                listings: [],
            };
        }

        const escapedTerms =
            searchTerms.map((term) =>
                term.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                )
            );

        const regex = new RegExp(
            escapedTerms.join("|"),
            "i"
        );

        const query: Record<string, any> = {
            status: "active",
            $or: [
                {
                    title: regex,
                },
                {
                    description: regex,
                },
                {
                    brand: regex,
                },
                {
                    category: regex,
                },
                {
                    subcategory: regex,
                },
                {
                    color: regex,
                },
            ],
        };

        const listings =
            await ListingModel.find(query)
                .populate(
                    "seller",
                    "username avatar"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(50);

        return {
            analysis,
            listings,
        };
    }
}

export const visualSearchService =
    new VisualSearchService();