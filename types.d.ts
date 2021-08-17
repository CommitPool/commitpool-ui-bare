interface Commitment {
  activityKey: string;
  exists: boolean;
  met: boolean;
  goalValue: number;
  startTime: number;
  endTime: number;
  reportedValue: number;
  stake: number;
  unit: string;
}

interface Athlete {
  username?: string;
  firstname?: string;
  id: number;
  profile_medium?: string;
}

interface Activity {
  key: string;
  name: string;
  oracle: string;
  allowed: boolean;
  exists: boolean;
}

interface DropdownItem {
  label: string;
  value: string;
}

interface Network {
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
}

type TransactionTypes =
  | "approve"
  | "depositAndCommit"
  | "requestActivityDistance"
  | "processCommitmentUser";

type TransactionDetails = {
  methodCall: TransactionTypes;
  tx: TransactionResponse | TransactionRequest;
};
