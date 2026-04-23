import { mockActivity } from "../activity/mockActivity";
import { mockVaults } from "../vault-list/mockVaults";
import type { VaultAddress, VaultDetail } from "../../types";

const detailMap: Record<VaultAddress, VaultDetail> = {
  "0x4fA4D52C8fA01d9a0c3b71Fe83eB31091A9340f3": {
    ...mockVaults[0],
    ownerLabel: "Primary wallet",
    depositPreview: {
      depositAmount: 250,
      resultingSavedAmount: 7700,
      resultingProgressRatio: 0.64,
      resultingRemainingAmount: 4300,
    },
    withdrawEligibility: {
      lockState: "locked",
      availability: "locked",
      message: "Withdrawals stay unavailable until August 30, 2026.",
      unlockDate: "2026-08-30T00:00:00.000Z",
      unlockTimestampMs: Date.parse("2026-08-30T00:00:00.000Z"),
      availableAmount: 0,
      availableAmountAtomic: 0n,
      withdrawableAmount: {
        amount: 0,
        amountAtomic: 0n,
        hasFunds: false,
      },
      countdown: null,
      isOwner: false,
      connectedAddress: null,
      ownerAddress: mockVaults[0].ownerAddress,
      isConnected: false,
      isSupportedNetwork: true,
      canWithdraw: false,
    },
    activityPreview: mockActivity.filter(
      (event) => event.vaultAddress === "0x4fA4D52C8fA01d9a0c3b71Fe83eB31091A9340f3",
    ),
  },
  "0x8aC7F0D9a412B0A55F08683dD9a4bB8f6358eD91": {
    ...mockVaults[1],
    ownerLabel: "Primary wallet",
    depositPreview: {
      depositAmount: 400,
      resultingSavedAmount: 4500,
      resultingProgressRatio: 0.53,
      resultingRemainingAmount: 4000,
    },
    withdrawEligibility: {
      lockState: "locked",
      availability: "locked",
      message: "This vault unlocks on November 12, 2026.",
      unlockDate: "2026-11-12T00:00:00.000Z",
      unlockTimestampMs: Date.parse("2026-11-12T00:00:00.000Z"),
      availableAmount: 0,
      availableAmountAtomic: 0n,
      withdrawableAmount: {
        amount: 0,
        amountAtomic: 0n,
        hasFunds: false,
      },
      countdown: null,
      isOwner: false,
      connectedAddress: null,
      ownerAddress: mockVaults[1].ownerAddress,
      isConnected: false,
      isSupportedNetwork: true,
      canWithdraw: false,
    },
    activityPreview: mockActivity.filter(
      (event) => event.vaultAddress === "0x8aC7F0D9a412B0A55F08683dD9a4bB8f6358eD91",
    ),
  },
  "0x9D56a671Ba41Fff55e8D9aB6B0B3Db4f5B0Bc1A2": {
    ...mockVaults[2],
    ownerLabel: "Primary wallet",
    depositPreview: {
      depositAmount: 500,
      resultingSavedAmount: 13750,
      resultingProgressRatio: 0.86,
      resultingRemainingAmount: 2250,
    },
    withdrawEligibility: {
      lockState: "unlocked",
      availability: "ready",
      message: "Withdrawals are available whenever you are ready.",
      unlockDate: "2026-05-18T00:00:00.000Z",
      unlockTimestampMs: Date.parse("2026-05-18T00:00:00.000Z"),
      availableAmount: 13250,
      availableAmountAtomic: 13250000000n,
      withdrawableAmount: {
        amount: 13250,
        amountAtomic: 13250000000n,
        hasFunds: true,
      },
      countdown: null,
      isOwner: false,
      connectedAddress: null,
      ownerAddress: mockVaults[2].ownerAddress,
      isConnected: false,
      isSupportedNetwork: true,
      canWithdraw: true,
    },
    activityPreview: mockActivity.filter(
      (event) => event.vaultAddress === "0x9D56a671Ba41Fff55e8D9aB6B0B3Db4f5B0Bc1A2",
    ),
  },
};

export const getMockVaultDetail = (vaultAddress: VaultAddress): VaultDetail =>
  detailMap[vaultAddress] ?? detailMap["0x4fA4D52C8fA01d9a0c3b71Fe83eB31091A9340f3"];
