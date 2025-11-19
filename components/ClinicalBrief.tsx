import React from 'react';
import { ParsedInput, RejectableCategory, RejectableItem, LabResult, Prior } from '../types';
import Panel from './Panel';
import BriefSection from './BriefSection';
import EditableField from './EditableField';
import { InfoIcon } from './Icons';
import { useWorkflowStore } from '../App';

const ClinicalBrief: React.FC = () => {
  const parsedInfo = useWorkflowStore(state => state.parsedInfo);
  const onItemReject = useWorkflowStore(state => state.rejectItem);
  const onUpdate = useWorkflowStore(state => state.updateParsedInfo);
  
  if (!parsedInfo) {
    return <Panel title="Clinical Brief"><div className="text-center text-sm text-[var(--color-text-muted)] p-4">Awaiting analysis...</div></Panel>;
  }

  const handleSimpleUpdate = (category: 'studyType' | 'clinicalHistory' | 'reasonForStudy' | 'examDate') => (newValue: string) => {
    onUpdate(category, newValue, undefined, 'value');
  };

  const handleListUpdate = (category: 'allergies' | 'medications' | 'surgeries' | 'unmatchedText') => (index: number, newValue: string) => {
    onUpdate(category, newValue, index, 'value');
  };
  
  const handleLabUpdate = (index: number, field: keyof LabResult) => (newValue: string) => {
      onUpdate('labs', newValue, index, field);
  };

  const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="py-3 border-b border-[var(--color-border)] last:border-b-0">
      <h4 className="text-xs font-bold uppercase text-[var(--color-secondary)] tracking-wider mb-2">{title}</h4>
      {children}
    </div>
  );

  const examDateValue = parsedInfo.examDate?.value;
  const isExamDateMissing = !examDateValue?.trim();

  return (
    <Panel title="Interactive Clinical Brief" className="h-full">
      <div className="divide-y divide-[var(--color-border)] -mt-4">
        <Section title="Study Type">
          <EditableField value={parsedInfo.studyType?.value} onSave={handleSimpleUpdate('studyType')} className="text-sm text-[var(--color-text-bright)] font-semibold" />
        </Section>
        <Section title="Date of Exam">
            <EditableField 
                value={examDateValue} 
                onSave={handleSimpleUpdate('examDate')} 
                className={`text-sm text-[var(--color-text-bright)] font-semibold ${isExamDateMissing ? 'border-b-2 border-dashed border-[var(--color-warning-border)]' : ''}`} 
            />
            {isExamDateMissing && (
                <p className="text-xs text-[var(--color-warning-text)] mt-1.5">This field is required.</p>
            )}
        </Section>
        <Section title="Reason for Study">
          <EditableField value={parsedInfo.reasonForStudy?.value} onSave={handleSimpleUpdate('reasonForStudy')} className="text-sm text-[var(--color-text-default)]" />
        </Section>
        <Section title="Clinical History">
          <EditableField value={parsedInfo.clinicalHistory?.value} onSave={handleSimpleUpdate('clinicalHistory')} className="text-sm text-[var(--color-text-default)] whitespace-pre-wrap" />
        </Section>

        <BriefSection title="Allergies" items={parsedInfo.allergies} onUpdate={handleListUpdate('allergies')} onReject={(item) => onItemReject('allergies', item)} />
        <BriefSection title="Medications" items={parsedInfo.medications} onUpdate={handleListUpdate('medications')} onReject={(item) => onItemReject('medications', item)} />
        <BriefSection title="Surgical History" items={parsedInfo.surgeries} onUpdate={handleListUpdate('surgeries')} onReject={(item) => onItemReject('surgeries', item)} />

        {parsedInfo.labs && parsedInfo.labs.length > 0 && (
          <Section title="Lab Results">
            <div className="space-y-2 text-sm">
              {parsedInfo.labs.map((lab, index) => (
                <div key={index} className="flex justify-between items-center text-[var(--color-text-default)]">
                  <EditableField value={lab.name} onSave={handleLabUpdate(index, 'name')} className="font-semibold text-[var(--color-text-bright)]" />
                  <EditableField value={lab.value} onSave={handleLabUpdate(index, 'value')} />
                </div>
              ))}
            </div>
          </Section>
        )}

        <BriefSection title="Uncategorized Info" items={parsedInfo.unmatchedText} onUpdate={handleListUpdate('unmatchedText')} onReject={(item) => onItemReject('unmatchedText', item)} />

        {parsedInfo.unmatchedText?.length > 0 && (
            <div className="p-3 bg-[var(--color-info-bg)]/80 border border-[var(--color-info-border)] text-xs text-[var(--color-info-text)] rounded-md flex mt-4">
                <InfoIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0"/>
                <span>The AI couldn't categorize some text. Please review it and manually integrate it into the brief if it's relevant.</span>
            </div>
        )}
      </div>
    </Panel>
  );
};

export default ClinicalBrief;