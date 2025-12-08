# Model IDs Configuration

This file provides example model IDs for different AI providers.

## Google Gemini Models

- gemini-2.5-flash (Fast, cost-effective)
- gemini-2.5-pro (High quality, slower)
- gemini-2.0-flash-exp (Experimental)
- gemini-1.5-pro (Legacy)
- gemini-1.5-flash (Legacy)
- imagen-4.0-generate-001 (Image generation)
- imagen-3.0-generate-001 (Image generation)

## OpenAI Models

- gpt-4-turbo
- gpt-4
- gpt-3.5-turbo
- gpt-4o
- gpt-4o-mini

## Anthropic Claude Models

- claude-3-5-sonnet-20241022
- claude-3-opus-20240229
- claude-3-sonnet-20240229
- claude-3-haiku-20240307

## OpenRouter Models

OpenRouter provides access to many models. Examples:

- openai/gpt-4-turbo
- anthropic/claude-3-opus
- google/gemini-pro-1.5
- meta-llama/llama-3-70b-instruct

Visit https://openrouter.ai/models for the full list.

## Perplexity Models

- llama-3.1-sonar-small-128k-online
- llama-3.1-sonar-large-128k-online
- llama-3.1-sonar-huge-128k-online

## Configuration

Model assignments are configured per provider in the Settings panel.
You can assign different models for different tasks to optimize for:

- Cost (use smaller/faster models for simple tasks)
- Quality (use larger models for complex reasoning)
- Speed (use faster models for real-time tasks)

Example task-specific assignments:

- Categorization: Fast model (gemini-2.5-flash, gpt-3.5-turbo)
- Draft Report: Balanced model (gemini-2.5-flash, gpt-4o-mini)
- Final Review: High-quality model (gemini-2.5-pro, gpt-4, claude-3-opus)
- Image Generation: Imagen models (Google only)
