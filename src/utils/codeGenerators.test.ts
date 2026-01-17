import { generatePython, generateTypeScript, generateCurl } from './codeGenerators';

describe('codeGenerators', () => {
  const options = {
    provider: 'openai',
    model: 'gpt-4',
    prompt: 'Hello world',
    apiKey: 'test-key',
    systemPrompt: 'Be nice'
  };

  test('generatePython for OpenAI', () => {
    const code = generatePython(options);
    expect(code).toContain('import requests');
    expect(code).toContain('api.openai.com');
    expect(code).toContain('Authorization": "Bearer test-key');
    expect(code).toContain('"role": "system"');
  });

  test('generateTypeScript for Anthropic', () => {
    const code = generateTypeScript({ ...options, provider: 'anthropic', model: 'claude-2' });
    expect(code).toContain('api.anthropic.com');
    expect(code).toContain('x-api-key');
    expect(code).toContain('claude-2');
  });

  test('generateCurl for OpenAI', () => {
    const code = generateCurl(options);
    expect(code).toContain('curl https://api.openai.com');
    expect(code).toContain('-H "Authorization: Bearer test-key"');
    expect(code).toContain('-d \'{"model":"gpt-4"');
  });
});
