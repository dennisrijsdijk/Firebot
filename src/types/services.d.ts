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