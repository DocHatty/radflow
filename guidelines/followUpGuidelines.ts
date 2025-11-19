// guidelines/followUpGuidelines.ts

/**
 * Represents a single clinical guideline.
 * This structure is designed for a Retrieval-Augmented Generation (RAG) system.
 * It now includes a separate, concise summary specifically for the LLM prompt.
 */
export interface Guideline {
  topic: string;
  keywords: string[];
  summary: string; // For UI tooltips.
  details: string; // The full, human-readable text.
  llmSummary: string; // A concise, rule-based summary for the AI prompt.
}

/**
 * A curated knowledge base of major, up-to-date radiology follow-up guidelines.
 * This data is used by the AI during the final review stage to ensure recommendations
 * are consistent with established best practices.
 */
export const FOLLOW_UP_GUIDELINES: Guideline[] = [
  {
    topic: 'Incidental Pulmonary Nodule in Adults (Fleischer Society 2017)',
    keywords: ['pulmonary nodule', 'lung nodule', 'fleischer', 'spn'],
    summary: 'Guidelines for managing incidental solid and subsolid pulmonary nodules found on CT in patients aged 35 and older. Recommendations are based on nodule size, number, morphology, and patient risk factors for lung cancer.',
    llmSummary: 'For single solid nodules in adults: a nodule < 6mm requires no follow-up for low-risk patients and an optional 12-month CT for high-risk. A nodule 6-8mm requires a 6-12 month CT. A nodule > 8mm requires a 3-month CT, PET/CT, or biopsy. For subsolid nodules >= 6mm, a 6-12 month CT is needed to confirm persistence.',
    details: `
### Fleischer Society 2017 Guidelines Summary:

**Patient Risk Factors:**
- **Low Risk:** Minimal or no history of smoking, no other risk factors (e.g., asbestos exposure, family history).
- **High Risk:** Significant smoking history or other known risk factors.

**Solid Nodules:**
- **Single Nodule:**
  - **< 6 mm:**
    - Low Risk: No routine follow-up.
    - High Risk: Optional CT at 12 months.
  - **6 to 8 mm:**
    - Low Risk: CT at 6-12 months, then consider CT at 18-24 months.
    - High Risk: CT at 6-12 months, then CT at 18-24 months.
  - **> 8 mm:**
    - Both Risks: Consider CT at 3 months, PET/CT, or biopsy.
- **Multiple Nodules:**
  - Dominant nodule drives management.
  - **< 6 mm (all):**
    - Low Risk: No routine follow-up.
    - High Risk: Optional CT at 12 months.
  - **>= 6 mm (at least one):**
    - Low Risk: CT at 3-6 months, then consider CT at 18-24 months.
    - High Risk: CT at 3-6 months, then CT at 18-24 months.

**Subsolid Nodules:**
- **Ground-Glass Nodule (GGN):**
  - **< 6 mm:** No routine follow-up.
  - **>= 6 mm:** CT at 6-12 months to confirm persistence. If persistent and stable, CT every 2 years for 5 years.
- **Part-Solid Nodule:**
  - **< 6 mm:** No routine follow-up.
  - **>= 6 mm:** CT at 3-6 months. If persistent, and solid component remains < 6 mm, annual CT for 5 years. If solid component grows to >= 6 mm, consider biopsy.
`
  },
  {
    topic: 'Incidental Renal Cysts (Bosniak Classification v2019)',
    keywords: ['renal cyst', 'kidney cyst', 'bosniak'],
    summary: 'A system to classify cystic renal masses based on CT and MRI features, predicting their risk of malignancy and guiding management.',
    llmSummary: 'For renal cysts: Bosniak I and II cysts require no follow-up. Bosniak IIF requires imaging follow-up (e.g., 6-12 months). Bosniak III and IV require urologic consultation for probable surgical intervention.',
    details: `
### Bosniak Classification v2019 Summary:

- **Bosniak I (Simple Cyst):** 0% malignant. Hairline-thin wall, no septa, calcifications, or enhancing components. No follow-up needed.
- **Bosniak II (Minimally Complex):** ~1-3% malignant. Few thin (<1 mm) septa, fine calcification. May have short segment of minimal enhancement. Generally no follow-up needed.
- **Bosniak IIF (Minimally Complex, Follow-up):** ~5-10% malignant. Multiple thin septa, minimally thickened wall or septa. Requires imaging follow-up (e.g., CT/MRI at 6, 12, 24 months).
- **Bosniak III (Indeterminate):** ~50% malignant. Thickened, irregular, or enhancing walls or septa. Requires urologic consultation for probable surgical excision or ablation.
- **Bosniak IV (Clearly Malignant):** ~90% malignant. Contains enhancing solid components. Requires urologic consultation for surgical excision.
`
  },
  {
    topic: 'Incidental Adrenal Nodules (ACR Incidental Findings Committee 2017)',
    keywords: ['adrenal nodule', 'adrenal mass', 'adrenal incidentaloma'],
    summary: 'Recommendations for managing incidental adrenal masses based on size and imaging characteristics on CT and MRI to differentiate benign adenomas from potentially malignant lesions.',
    llmSummary: 'For incidental adrenal nodules: A nodule <= 10 HU on non-contrast CT is benign and needs no follow-up. If > 10 HU and between 1-4 cm, it is indeterminate and may require a 12-month follow-up. Nodules > 4 cm require surgical consultation.',
    details: `
### ACR Adrenal Incidentaloma Guidelines Summary:

**Initial Characterization (Non-contrast CT):**
- **<= 10 Hounsfield Units (HU):** Benign adenoma. No follow-up.
- **> 10 HU:** Indeterminate. Further imaging is required.

**Further Imaging (Adrenal Protocol CT or MRI):**
- **Adrenal Protocol CT (Washout):**
  - **Absolute Washout >= 60% OR Relative Washout >= 40%:** Benign adenoma. No follow-up.
- **MRI Chemical Shift Imaging:**
  - **Signal drop on out-of-phase images:** Benign adenoma. No follow-up.

**Management Based on Size and Characteristics:**
- **< 1 cm:** No follow-up.
- **1 to 4 cm:**
  - **Benign features (as above):** No follow-up.
  - **Indeterminate features:** Consider 12-month imaging follow-up to assess for growth. Biochemical workup for hormonal activity may be needed.
- **> 4 cm:** Surgical consultation is generally recommended due to increased risk of malignancy, regardless of imaging features.
`
  },
  {
    topic: 'Thyroid Nodules (ACR TI-RADS)',
    keywords: ['thyroid nodule', 'ti-rads', 'thyroid imaging reporting and data system'],
    summary: 'A standardized system for risk-stratifying thyroid nodules based on ultrasound features. A point-based system categorizes nodules from TR1 (benign) to TR5 (highly suspicious) to guide FNA biopsy or follow-up.',
    llmSummary: 'For thyroid nodules based on ultrasound: TR1/TR2 require no FNA. TR3 (mildly suspicious) requires FNA if >= 2.5 cm. TR4 (moderately suspicious) requires FNA if >= 1.5 cm. TR5 (highly suspicious) requires FNA if >= 1.0 cm.',
    details: `
### ACR TI-RADS Management Summary:

**Categories are based on a point score from 5 ultrasound features (Composition, Echogenicity, Shape, Margin, Echogenic Foci).**

- **TR1 (Benign - 0 points):** No FNA.
- **TR2 (Not Suspicious - 2 points):** No FNA.
- **TR3 (Mildly Suspicious - 3 points):**
  - FNA if >= 2.5 cm.
  - Follow-up if >= 1.5 cm.
- **TR4 (Moderately Suspicious - 4 to 6 points):**
  - FNA if >= 1.5 cm.
  - Follow-up if >= 1.0 cm.
- **TR5 (Highly Suspicious - >= 7 points):**
  - FNA if >= 1.0 cm.
  - Follow-up if >= 0.5 cm.
`
  },
  {
    topic: 'Liver Lesions in High-Risk Patients (LI-RADS v2018)',
    keywords: ['liver lesion', 'hepatic lesion', 'hcc', 'li-rads', 'cirrhosis'],
    summary: 'A system for standardizing the reporting of CT and MRI for patients at risk for hepatocellular carcinoma (HCC), such as those with cirrhosis or chronic hepatitis B.',
    llmSummary: 'For liver lesions in high-risk patients (cirrhosis): LR-1/LR-2 are benign and require routine surveillance. LR-3 requires 3-6 month follow-up. LR-4 requires <= 3 month follow-up or biopsy. LR-5 is definitely HCC and should be treated. LR-M is malignant but not HCC-specific and requires biopsy.',
    details: `
### LI-RADS Management Summary (for patients at risk for HCC):

- **LR-1 (Definitely Benign):** Routine follow-up (e.g., 6-month surveillance).
- **LR-2 (Probably Benign):** Routine follow-up.
- **LR-3 (Intermediate Probability of Malignancy):** Follow-up imaging in 3-6 months.
- **LR-4 (Probably HCC):** Follow-up imaging in <= 3 months or consider multidisciplinary discussion/biopsy.
- **LR-5 (Definitely HCC):** Treat as HCC. No biopsy needed.
- **LR-M (Probably or Definitely Malignant, not specific for HCC):** Multidisciplinary discussion and likely biopsy.
- **LR-TIV (Tumor in Vein):** Treat as HCC.
`
  },
  {
    topic: 'Incidental Pancreatic Cysts (ACR White Paper 2017)',
    keywords: ['pancreatic cyst', 'ipmn', 'pancreas cyst'],
    summary: 'Guidelines for managing incidental pancreatic cysts found on CT or MRI, balancing the risk of malignancy with the risks of surveillance and intervention.',
    llmSummary: 'For incidental pancreatic cysts: cysts with high-risk stigmata (jaundice, enhancing solid component, MPD >= 10mm) require surgical evaluation. Cysts with worrisome features (size >= 3cm, thick walls, MPD 5-9mm) require EUS. Cysts without these features are followed with MRI based on size.',
    details: `
### Management of Incidental Pancreatic Cysts in Asymptomatic Patients:

**High-Risk Stigmata (warrant immediate surgical evaluation):**
- Obstructive jaundice in a patient with a cystic lesion of the pancreatic head.
- Enhancing solid component within the cyst.
- Main pancreatic duct (MPD) size >= 10 mm.

**Worrisome Features (warrant endoscopic ultrasound - EUS):**
- Cyst size >= 3 cm.
- Thickened, enhancing cyst walls.
- Main pancreatic duct (MPD) size 5-9 mm.
- Non-enhancing mural nodule.
- Abrupt change in MPD caliber with distal pancreatic atrophy.

**No Worrisome Features - Follow-up by Cyst Size:**
- **< 1.5 cm:** MRI in 2 years. If stable, lengthen interval.
- **1.5 to 2.4 cm:** MRI annually for 2 years, then lengthen interval if stable.
- **2.5 to 2.9 cm:** MRI in 6-12 months, then alternate MRI/EUS annually.
`
  },
];
