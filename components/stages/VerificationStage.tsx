import React from 'react';
import ClinicalBrief from '../ClinicalBrief';
import PriorReportArea from '../PriorReportArea';
import VerificationWorkbench from '../VerificationWorkbench';

const VerificationStage: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 w-full grow">
    <div className="animate-slide-in-left">
      <ClinicalBrief />
    </div>
    <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
      <div className="flex flex-col h-full">
        <PriorReportArea />
        <div className="mt-6">
          <VerificationWorkbench />
        </div>
      </div>
    </div>
  </div>
);

export default VerificationStage;