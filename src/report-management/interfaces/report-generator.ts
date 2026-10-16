export interface ReportGenerator {
  readonly type: string;

  generate(): Promise<void>;
}
