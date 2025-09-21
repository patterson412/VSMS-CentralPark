import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { Vehicle } from "../vehicles/entities/vehicle.entity";

@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY");

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });

    console.log("✅ OpenAI service initialized successfully");
  }

  async generateVehicleDescription(vehicle: Vehicle): Promise<string> {
    try {
      const prompt = this.generateVehiclePrompt(vehicle);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a professional automotive sales copywriter. Create engaging and persuasive vehicle descriptions that highlight key features and benefits while maintaining honesty and professionalism.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.8,
      });

      const description = completion.choices[0]?.message?.content?.trim();

      if (!description) {
        throw new InternalServerErrorException(
          "Empty response from OpenAI API",
        );
      }

      return description;
    } catch (error) {
      console.error("OpenAI API Error:", error);

      if (error instanceof Error) {
        throw new InternalServerErrorException(
          `OpenAI API Error: ${error.message}`,
        );
      }

      throw new InternalServerErrorException(
        "Failed to generate vehicle description",
      );
    }
  }

  private generateVehiclePrompt(vehicle: Vehicle): string {
    return `Write an engaging and creative sales description for this vehicle:

Vehicle Details:
- Type: ${vehicle.type}
- Brand: ${vehicle.brand}
- Model: ${vehicle.model}
- Color: ${vehicle.color}
- Engine Size: ${vehicle.engineSize}
- Year: ${vehicle.year}
- Price: $${vehicle.price.toLocaleString()}

Please create a compelling sales description that:
1. Highlights the key features and benefits
2. Creates emotional appeal
3. Emphasizes value proposition
4. Is between 100-200 words
5. Uses persuasive but honest language
6. Mentions reliability, performance, and style where appropriate

Write in an enthusiastic but professional tone that would appeal to potential buyers.`;
  }
}
