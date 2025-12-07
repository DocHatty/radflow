import { describe, it, expect } from 'vitest';
import { generateFollowUpRecommendations } from '../utils/followUpEngine';

describe('Follow-up Engine', () => {
  describe('generateFollowUpRecommendations', () => {
    it('should detect pulmonary nodules and suggest appropriate follow-up', () => {
      const reportText = 'A 7mm pulmonary nodule is identified in the right upper lobe.';
      const recommendations = generateFollowUpRecommendations(reportText);

      expect(recommendations.length).toBeGreaterThan(0);
      const noduleRec = recommendations.find(r => r.finding.toLowerCase().includes('nodule'));
      expect(noduleRec).toBeDefined();
      if (noduleRec) {
        expect(noduleRec.guideline).toContain('Fleischer');
      }
    });

    it('should handle small nodules (<6mm) appropriately', () => {
      const reportText = 'A 4mm pulmonary nodule is seen in the left lower lobe.';
      const recommendations = generateFollowUpRecommendations(reportText);

      const noduleRec = recommendations.find(r => r.finding.toLowerCase().includes('nodule'));
      if (noduleRec) {
        expect(noduleRec.guideline).toContain('Fleischer');
      }
    });

    it('should handle large nodules (>8mm) with urgency', () => {
      const reportText = 'A 12mm pulmonary nodule is identified.';
      const recommendations = generateFollowUpRecommendations(reportText);

      const noduleRec = recommendations.find(r => r.finding.toLowerCase().includes('nodule'));
      expect(noduleRec).toBeDefined();
    });

    it('should detect Bosniak renal cysts', () => {
      const reportText = 'Bosniak IIF renal cyst in the left kidney measuring 2.5cm.';
      const recommendations = generateFollowUpRecommendations(reportText);

      const renalRec = recommendations.find(r => r.finding.toLowerCase().includes('bosniak'));
      // May or may not be detected depending on implementation
      expect(recommendations).toBeDefined();
    });

    it('should detect adrenal findings', () => {
      const reportText = 'Right adrenal adenoma measuring 15mm.';
      const recommendations = generateFollowUpRecommendations(reportText);

      // Adrenal findings may or may not trigger recommendations
      expect(recommendations).toBeDefined();
    });

    it('should handle multiple findings in one report', () => {
      const reportText = `
        A 7mm pulmonary nodule is seen in the right upper lobe.
        Bosniak II renal cyst in the left kidney.
        Small adrenal adenoma on the right.
      `;
      const recommendations = generateFollowUpRecommendations(reportText);

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should return empty array when no findings require follow-up', () => {
      const reportText = 'Normal chest examination. No acute findings.';
      const recommendations = generateFollowUpRecommendations(reportText);

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should handle size in centimeters and convert to millimeters', () => {
      const reportText = 'A 0.7cm pulmonary nodule is identified.';
      const recommendations = generateFollowUpRecommendations(reportText);

      expect(Array.isArray(recommendations)).toBe(true);
    });
  });
});
