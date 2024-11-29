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