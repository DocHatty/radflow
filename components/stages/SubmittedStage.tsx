import React from "react";
import EditableReportArea from "../EditableReportArea";
import CopilotPanel from "../CopilotPanel";

const SubmittedStage: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
    <div className="animate-fade-in">
      <EditableReportArea />
    </div>
    <div className="animate-slide-in-right">
      <CopilotPanel />
    </div>
  </div>
);

export default SubmittedStage;
