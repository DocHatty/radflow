import { ParsedInput, RejectableItem, LabResult, Prior } from '../types';

/**
 * Constructs a coherent clinical brief string from a ParsedInput object.
 * This string is intended for use as context for AI models.
 * @param parsedInfo The structured clinical information, potentially with user edits.
 * @returns A formatted string summarizing the clinical brief.
 */
export function constructBriefFromParsedInput(parsedInfo: ParsedInput): string {
    if (!parsedInfo) return 'No clinical information provided.';

    const sections: string[] = [];

    const addSection = (title: string, content: string | string[] | null | undefined) => {
        if (!content || (Array.isArray(content) && content.length === 0) || (typeof content === 'string' && !content.trim())) {
            return;
        }
        const contentString = Array.isArray(content) ? content.map(item => `- ${item}`).join('\n') : content.trim();
        sections.push(`### ${title}\n${contentString}`);
    };
    
    const filterAndMap = (items?: RejectableItem[]): string[] => {
        return items?.filter(item => !item.isRejected).map(item => item.value) || [];
    };
    
    const mapLabs = (labs?: LabResult[]): string[] => {
        return labs?.map(lab => `${lab.name}: ${lab.value}`) || [];
    };

    const mapPriors = (priors?: Prior[]): string[] => {
        return priors?.map(p => `${p.content}${p.date ? ` (Date: ${p.date})` : ''}`) || [];
    };

    addSection('Study Type', parsedInfo.studyType?.value);
    addSection('Date of Exam', parsedInfo.examDate?.value);
    addSection('Reason for Study', parsedInfo.reasonForStudy?.value);
    addSection('Clinical History', parsedInfo.clinicalHistory?.value);
    addSection('Allergies', filterAndMap(parsedInfo.allergies));
    addSection('Medications', filterAndMap(parsedInfo.medications));
    addSection('Surgical History', filterAndMap(parsedInfo.surgeries));
    addSection('Relevant Lab Results', mapLabs(parsedInfo.labs));
    addSection('Prior Findings', mapPriors(parsedInfo.priors));
    addSection('Uncategorized Information', filterAndMap(parsedInfo.unmatchedText));

    if (sections.length === 0) {
        return 'Clinical brief is empty after filtering.';
    }

    return sections.join('\n\n');
}