export interface ChannelStatusSectionProps {
  channel: string;
  status: string;
  channelOptions: { value: string; label: string }[];
  onChannelChange: (v: string) => void;
  onStatusChange: (v: string) => void;
}
