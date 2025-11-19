import React from 'react';
import EditableReportArea from '../EditableReportArea';
import CopilotPanel from '../CopilotPanel';

const SubmittedStage: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full flex-grow">
    <div className="animate-fade-in h-full">
      <EditableReportArea />
    </div>
    <div className="animate-slide-in-right h-full">
      <CopilotPanel />
    </div>
  </div>
);

export default SubmittedStage;