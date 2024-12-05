import { RewardRedemption, SavedChannelReward } from "./channel-rewards";

export interface AccountAccessService {
    accounts: {
        streamer: {
            username: string;
            loggedIn: boolean;
            broadcasterType: string;
        };
        bot: {
            username: string;
            loggedIn: boolean;
        };
    };

    getAccounts: () => void;
    logoutAccount: (accountType: "streamer" | "bot") => void;
}

export interface Activity {
    id: unknown;
    source: {
        id: string;
        name: string;
    };
    event: {
        id: string;
        name: string;
        forceAllow: boolean;
        canRetrigger: boolean;
    };
    message: string;
    icon: string;
    acknowledged: boolean;
    timestamp: string;
}

export interface ActivityFeedService {
    allActivities: Activity[];
    /** Activities shown in the activity feed */
    activities: Activity[];
    allAcknowledged: () => boolean;
    markAllAcknowledged: () => void;
    markAllNotAcknowledged: () => void;
    toggleMarkAllAcknowledged: () => void;
    unacknowledgedCount: () => number;
    retriggerEvent: (activityId: string) => void;
    showEditActivityFeedEventsModal: () => void;
}

export interface AdBreakService {
    showAdBreakTimer: boolean;
    adRunning: boolean;
    nextAdBreak: string;
    endsAt: string;
    adDuration: number;
    friendlyDuration: string;

    updateDuration: () => void;
}

export interface BackendCommunicator {
    on: <ExpectedArgs extends Array<unknown> = [], ReturnPayload = void>(eventName: string, callback: (...args: ExpectedArgs) => ReturnPayload, async = false) => string;
    onAsync: <ExpectedArgs extends Array<unknown> = [], ReturnPayload = void>(eventName: string, callback: (...args: ExpectedArgs) => Promise<ReturnPayload>) => string;
    fireEventAsync: <ReturnPayload = void>(eventName: string, data: unknown) => Promise<ReturnPayload>;
    fireEventSync: <ReturnPayload = void>(eventName: string, data: unknown) => ReturnPayload;
    fireEvent: (eventName: string, data: unknown) => unknown;
    send: (eventName: string, data: unknown) => unknown;
}

export interface BackupService {
    BACKUPS_FOLDER_PATH: string;

    startBackup: () => void;
    openBackupZipFilePicker: () => Promise<string>;
    initiateBackupRestore: (backupFilePath: string) => void;
    restoreBackup: (backupFilePath) => Promise<{ success: boolean; reason?: string; }>;
}

export interface ChannelRewardsService {
    channelRewards: SavedChannelReward[];
    redemptions: Record<string, RewardRedemption[]>;
    selectedSortTag: null | string;
    searchQuery: string;
    loadingRedemptions: boolean;

    loadChannelRewards: () => void;
    saveChannelReward: (channelReward: SavedChannelReward) => Promise<boolean>;
    saveAllRewards: (channelRewards: SavedChannelReward[], updateTwitch = false) => void;
    deleteChannelReward: (channelRewardId: string) => void;
    showAddOrEditRewardModal: (reward: SavedChannelReward) => void;
    manuallyTriggerReward: (itemId: string) => void;
    channelRewardNameExists: (name: string) => boolean;
    duplicateChannelReward: (rewardId: string) => void;
    syncChannelRewards: () => void;
    refreshChannelRewardRedemptions: () => void;
    getRewardIdsWithRedemptions: () => string[];
    approveOrRejectChannelRewardRedemptions: (rewardId: string, redemptionIds: string[], approve = true) => Promise<void>;
    approveOrRejectAllRedemptionsForChannelRewards: (rewardIds: string[], approve = true) => Promise<void>;
}