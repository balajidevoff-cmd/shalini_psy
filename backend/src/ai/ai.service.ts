import { config } from '../config';
import { AIProvider } from './ai.provider';
import { MockClinicalAIProvider } from './mock.provider';
import { GeminiAIProvider } from './gemini.provider';
import { OpenAIProvider } from './openai.provider';
import { AIScreeningInput, AIScreeningOutput } from './ai.types';

export class AIService {
  private static providerInstance: AIProvider;

  public static getProvider(): AIProvider {
    if (!this.providerInstance) {
      const selected = config.ai.provider.toLowerCase();
      if (selected === 'gemini') {
        this.providerInstance = new GeminiAIProvider(config.ai.apiKey);
      } else if (selected === 'openai') {
        this.providerInstance = new OpenAIProvider(config.ai.apiKey);
      } else {
        this.providerInstance = new MockClinicalAIProvider();
      }
    }
    return this.providerInstance;
  }

  public static async analyzeSession(input: AIScreeningInput): Promise<AIScreeningOutput> {
    const provider = this.getProvider();
    return provider.analyzeScreeningData(input);
  }
}
