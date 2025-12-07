# Security Policy

## Supported Versions

We release security updates for the following versions of RADFLOW:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

## Reporting a Vulnerability

**IMPORTANT: Do NOT report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in RADFLOW, please report it privately to ensure patient safety and data security.

### How to Report

Send an email to: **DoctorHatkoff14@gmail.com**

Include the following information:

1. **Type of vulnerability** (e.g., XSS, SQL injection, authentication bypass)
2. **Affected component(s)** (e.g., file path, component name)
3. **Steps to reproduce** - Detailed instructions
4. **Potential impact** - What could an attacker accomplish?
5. **Suggested fix** (if you have one)
6. **Your contact information** (if you want credit or follow-up)

### What to Expect

- **Acknowledgment**: Within 48 hours of your report
- **Initial Assessment**: Within 5 business days
- **Updates**: Regular status updates every 5-7 days
- **Fix Timeline**: Critical vulnerabilities will be prioritized and fixed as quickly as possible
- **Credit**: We will acknowledge your contribution (unless you prefer to remain anonymous)

### Security Best Practices for Users

When using RADFLOW:

1. **API Keys**: 
   - Never commit API keys to version control
   - Use environment variables or the Settings panel
   - Rotate API keys regularly
   - Use separate keys for development and production

2. **Protected Health Information (PHI)**:
   - Never include patient identifiers in reports
   - Be aware that data may be transmitted to AI provider APIs
   - Review your organization's policies on AI tool usage
   - Use de-identified data when possible

3. **Dependencies**:
   - Keep RADFLOW and its dependencies up to date
   - Review security advisories regularly
   - Use `npm audit` to check for vulnerabilities

4. **Network Security**:
   - Use HTTPS for all communications
   - Be cautious when using public WiFi
   - Follow your organization's network security policies

5. **Access Control**:
   - Protect your development environment
   - Use strong passwords
   - Don't share API keys or credentials

## Security Features

RADFLOW implements the following security measures:

1. **Client-Side Only**: No server-side data storage or transmission (except to AI provider APIs)
2. **Local Storage**: API keys stored in browser's local storage with appropriate security measures
3. **No Data Persistence**: Clinical data is cleared between sessions
4. **Dependency Monitoring**: Automated dependency updates via Dependabot
5. **Security Auditing**: Regular npm audit checks in CI/CD pipeline

## Known Security Considerations

1. **AI Provider APIs**: Data sent to AI providers (Google, OpenAI, etc.) is subject to their privacy policies
2. **Local Storage**: API keys are stored in browser local storage - users should be aware of this
3. **Client-Side Application**: Being a client-side app, all code is visible to users

## Compliance

RADFLOW is designed for **personal use and research only**. For clinical use:

- Consult your organization's policies on AI tool usage
- Ensure compliance with HIPAA, GDPR, or other relevant regulations
- Implement appropriate data protection measures
- Obtain necessary approvals before use in clinical settings

## Updates and Patches

Security updates will be released as needed:

- **Critical vulnerabilities**: Patched immediately
- **High severity**: Patched within 7 days
- **Medium/Low severity**: Included in regular updates

Subscribe to repository notifications to stay informed of security updates.

## Contact

For security concerns: DoctorHatkoff14@gmail.com

For general questions: See CONTRIBUTING.md

---

*Last updated: December 2024*
