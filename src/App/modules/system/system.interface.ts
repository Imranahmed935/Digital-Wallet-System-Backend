
export interface ISystemParams {
  key: string;
  values: {
    transferFeePct: number;
    withdrawFeePct: number;
    agentCashInCommissionPct: number;
    agentCashOutCommissionPct: number;
    minBalance: number;
    dailyTransferLimit: number;
  };
}