export interface BlockchainBoundaryError {
  code:
    | "wallet_unavailable"
    | "unsupported_network"
    | "missing_rpc"
    | "missing_factory_address"
    | "read_failed"
    | "not_found";
  message: string;
}
