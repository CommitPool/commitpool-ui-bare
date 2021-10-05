export interface Commitment {
  activityKey: string;
  exists: boolean;
  met: boolean;
  goalValue: number;
  startTime: number;
  endTime: number;
  reportedValue: number;
  stake: number;
  unit: string;
  activitySet?: boolean;
  activityName?: string;
  stakeSet?: boolean;
  progress?: number;
}

export interface Athlete {
  username?: string;
  firstname?: string;
  id: number;
  profile_medium?: string;
}

export interface Activity {
  key: string;
  name: string;
  oracle: string;
  allowed: boolean;
  exists: boolean;
}

export interface DropdownItem {
  label: string;
  value: string;
}

export interface Network {
  name: string;
  short_name: string;
  chain: string;
  network: string;
  network_id: number;
  chain_id: string;
  providers: string[];
  rpc_url: string;
  block_explorer: string;
  hub_sort_order?: number;
  spcAddress: string;
  daiAddress: string;
  linkAddress: string;
}

export type TransactionTypes =
  | "approve"
  | "depositAndCommit"
  | "requestActivityDistance"
  | "processCommitmentUser";

export type TransactionDetails = {
  methodCall: TransactionTypes;
  txReceipt: Transaction;
};


export type User = {
  type: string;
  attributes: {
    "custom:account_address": string;
    [key: string]: string;
  };
  network: Network;
  username: string;
  nativeTokenBalance: string;
  daiBalance: string;
};
