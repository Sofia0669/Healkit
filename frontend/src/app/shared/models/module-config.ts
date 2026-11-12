export interface Stat { icon: string; label: string; value: string; }
export interface ModuleConfig {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  button: string;
  search: string;
  banner?: string;
  stats: Stat[];
  columns: string[];
  rows: string[][];
  statusIndex?: number;
  footers?: {icon: string; title: string; detail: string}[];
}
