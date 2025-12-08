# API Key Configuration

This application supports multiple AI providers and requires at least one API key to function.

## Supported Providers

RADFLOW supports the following AI providers:

1. **Google Gemini** (Default, Recommended)
   - Full feature support including grounding and image generation
   - Get your key: https://aistudio.google.com/app/apikey
2. **OpenAI**
   - GPT-4 and other models
   - Get your key: https://platform.openai.com/api-keys
3. **Anthropic Claude**
   - Claude 3 models with extended context
   - Get your key: https://console.anthropic.com/
4. **OpenRouter**
   - Access to multiple models via unified API
   - Get your key: https://openrouter.ai/keys
5. **Perplexity**
   - Models with built-in search capabilities
   - Get your key: https://www.perplexity.ai/settings/api

## Configuration Methods

### Method 1: Environment Variable (Default Provider)

Set the `API_KEY` or `GEMINI_API_KEY` environment variable:

```bash
# For Google Gemini (recommended)
export GEMINI_API_KEY=your_api_key_here

# Or use generic API_KEY
export API_KEY=your_api_key_here
```

### Method 2: Application Settings (Multiple Providers)

1. Launch the application
2. Go to Settings
3. Navigate to the "Providers" tab
4. Add and configure multiple providers
5. Set model assignments for each provider
6. Select which provider to use as active

## Provider-Specific Features

- **Grounding (Web Search)**: Only available with Google Gemini
- **Image Generation**: Only available with Google Gemini using Imagen models
- **Text Generation**: Supported by all providers

**IMPORTANT**:

- API keys are stored securely in your browser's local storage
- Keys are never sent to any server except the respective provider's API
- You can configure different models for different tasks to optimize cost and performance
