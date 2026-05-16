import { IIncident } from '../../../../../entities/interfaces';

export interface SolutionMatch {
  incident: IIncident;
  similarity: number;
}

export interface SolutionViewerProps {
  isLoading: boolean;
  current: SolutionMatch | null;
  safeIndex: number;
  total: number;
  shortDesc: string;
  issueText: string;
  markedUseful: Set<number>;
  onPrev: () => void;
  onNext: () => void;
  onToggleUseful: (id: number) => void;
}

export interface MatchDetailProps {
  incident: IIncident;
  similarity: number;
  markedUseful: Set<number>;
  onToggleUseful: (id: number) => void;
}

export interface InputColumnProps {
  shortDesc: string;
  issueText: string;
  onShortDescChange: (val: string) => void;
  onIssueTextChange: (val: string) => void;
}

export interface HeroBannerProps {
  ticketNumber: string;
  resolvedCount: number;
  matchCount: number;
}

export interface ActionButtonsProps {
  canApply: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSaveAsDraft: () => void;
  onCreateNew: () => void;
  onApplyAndSubmit: () => void;
}

export interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent?: string;
}
