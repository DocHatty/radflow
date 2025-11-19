import React from 'react';
import Panel from './Panel';
import ActionButton from './ActionButton';
import { useWorkflowStore } from '../App';

const VerificationWorkbench: React.FC = () => {
  const parsedInfo = useWorkflowStore(state => state.parsedInfo);
  const onConfirm = useWorkflowStore(state => state.confirmBrief);
  const isConfirming = useWorkflowStore(state => state.activeProcess === 'generating');
  
  const isExamDateMissing = !parsedInfo?.examDate?.value?.trim();

  return (
    <Panel className="animate-fade-in">
      <div className="flex flex-col items-center justify-center text-center py-4">
        <h3 className="text-lg font-bold text-[var(--color-text-bright)]">Ready to Proceed?</h3>
        <p className="text-sm text-[var(--color-text-muted)] max-w-sm mx-auto my-2">
          The clinical brief has been generated. Please review and edit the details on the left. When ready, confirm to generate the AI-powered report draft.
        </p>
        <ActionButton 
          onClick={onConfirm} 
          isLoading={isConfirming} 
          disabled={isConfirming || isExamDateMissing} 
          className="mt-2"
          title={isExamDateMissing ? "Please provide the exam date in the brief" : "Confirm and generate report"}
        >
          {isConfirming ? 'Generating...' : 'Confirm & Generate Report'}
        </ActionButton>
      </div>
    </Panel>
  );
};

export default VerificationWorkbench;