"use strict";
(function() {
    angular
        .module('firebotApp')
        .component("chatMessage", {
            bindings: {
                message: "=",
                compactDisplay: "<",
                hideDeletedMessages: "<",
                showAvatar: "<",
                showTimestamp: "<",
                showBttvEmotes: "<",
                showFfzEmotes: "<",
                showSevenTvEmotes: "<",
                showPronoun: "<",
                updateChatInput: "&",
                chatSizeStyle: "@?"
            },
            template: `
                <div class="chat-message-wrapper">
                    <div
                        ng-if="$ctrl.message.isAnnouncement"
                        class="announcement-bar"
                        ng-class="$ctrl.message.announcementColor"
                    >
                    </div>
                    <div
                        ng-if="$ctrl.message.isAutoModHeld"
                        class="automod-bar"
                        ng-class="$ctrl.message.autoModStatus"
                    >
                    </div>
                    <div ng-if="$ctrl.message.isAnnouncement" style="background: #00000014;padding: 5px 10px;margin-top:5px">
                        <i class="fad fa-bullhorn"></i> Announcement
                    </div>
                    <div class="chat-message"
                        ng-class="{
                            isAction: $ctrl.message.action,
                            isWhisper: $ctrl.message.whisper,
                            isDeleted: $ctrl.message.deleted,
                            isTagged: $ctrl.message.tagged,
                            isCompact: $ctrl.compactDisplay,
                            spoilers: $ctrl.hideDeletedMessages,
                            isHighlighted: $ctrl.message.isHighlighted,
                            isCustomReward: $ctrl.message.customRewardId != null
                        }"
                        ng-attr-messageId="{{$ctrl.message.id}}"
                        context-menu="$ctrl.getMessageContextMenu($ctrl.message)"
                        context-menu-class="chat-message-context-menu"
                        context-menu-on="{{$ctrl.message.isExtension ? 'disabled' : 'contextmenu'}}"
                    >
                        <div
                            ng-if="!$ctrl.compactDisplay"
                            ng-show="$ctrl.showAvatar"
                            class="chat-user-avatar-wrapper"
                            context-menu="$ctrl.getMessageContextMenu($ctrl.message)"
                            context-menu-class="chat-message-context-menu"
                            context-menu-on="{{$ctrl.message.isExtension ? 'disabled' : 'click'}}"
                        >
                            <img class="chat-user-avatar" ng-src="{{$ctrl.message.profilePicUrl}}">
                        </div>
                        <div>

                            <span ng-if="$ctrl.compactDisplay" ng-show="$ctrl.showTimestamp" class="muted chat-timestamp">
                                {{$ctrl.message.timestampDisplay}}
                            </span>

                            <div
                                ng-if="$ctrl.compactDisplay"
                                class="chat-user-avatar-wrapper"
                                ng-show="$ctrl.showAvatar"
                                context-menu="$ctrl.getMessageContextMenu($ctrl.message)"
                                context-menu-class="chat-message-context-menu"
                                context-menu-on="{{$ctrl.message.isExtension ? 'disabled' : 'click'}}"
                            >
                                <img class="chat-user-avatar" ng-src="{{$ctrl.message.profilePicUrl}}">
                            </div>

                            <div
                                class="chat-username"
                                context-menu="$ctrl.getMessageContextMenu($ctrl.message)"
                                context-menu-class="chat-message-context-menu"
                                context-menu-on="{{$ctrl.message.isExtension ? 'disabled' : 'click'}}"
                            >
                                <div ng-show="$ctrl.message.badges.length > 0" class="user-badges">
                                    <img ng-repeat="badge in $ctrl.message.badges"
                                        ng-src="{{badge.url}}"
                                        uib-tooltip="{{badge.title}}"
                                        tooltip-append-to-body="true" />
                                </div>
                                <span
                                    class="pronoun"
                                    uib-tooltip="Pronouns"
                                    tooltip-append-to-body="true"
                                    ng-click="$root.openLinkExternally('https://pronouns.alejo.io/')"
                                    ng-show="$ctrl.showPronoun && $ctrl.pronouns.pronounCache[$ctrl.message.username] != null"
                                >{{$ctrl.pronouns.pronounCache[$ctrl.message.username]}}</span>
                                <b ng-style="{'color': $ctrl.message.color}">{{$ctrl.message.username}}</b>
                                <span
                                    ng-if="$ctrl.compactDisplay && !$ctrl.message.action"
                                    style="color:white;font-weight:200;"
                                >:</span>
                                <span ng-if="!$ctrl.compactDisplay" ng-show="$ctrl.showTimestamp" class="muted chat-timestamp">
                                    {{$ctrl.message.timestampDisplay}}
                                </span>
                            </div>
                            <div class="chatContent">
                                <span ng-repeat="part in $ctrl.message.parts" class="chat-content-wrap">

                                    <span ng-if="part.type === 'text'" style="{{$ctrl.chatSizeStyle}}" ng-class="{ highlightText: part.flagged }">{{part.text}}</span>

                                    <a ng-if="part.type === 'link'" style="{{$ctrl.chatSizeStyle}}" ng-href="{{part.url}}" target="_blank">{{part.text}}</a>

                                    <span
                                        ng-if="part.type === 'emote'"
                                        class="chatEmoticon"
                                        uib-tooltip="{{part.origin}}: {{part.name}}"
                                        tooltip-append-to-body="true"
                                    >
                                        <img ng-src="{{part.url}}" style="height: 100%;">
                                    </span>

                                    <span
                                        ng-if="part.origin === 'BTTV' && $ctrl.showBttvEmotes"
                                        class="chatEmoticon"
                                        uib-tooltip="{{part.origin}}: {{part.name}}"
                                        tooltip-append-to-body="true"
                                    >
                                        <img ng-src="{{part.url}}" style="height: 100%;" />
                                    </span>
                                    <span ng-if="part.origin === 'BTTV' && !$ctrl.showBttvEmotes" style="{{$ctrl.chatSizeStyle}}">{{part.name}}</span>

                                    <span
                                        ng-if="part.origin === 'FFZ' && $ctrl.showFfzEmotes"
                                        class="chatEmoticon"
                                        uib-tooltip="{{part.origin}}: {{part.name}}"
                                        tooltip-append-to-body="true"
                                    >
                                        <img ng-src="{{part.url}}" style="height: 100%;" />
                                    </span>
                                    <span ng-if="part.origin === 'FFZ' && !$ctrl.showFfzEmotes" style="{{$ctrl.chatSizeStyle}}">{{part.name}}</span>

                                    <span
                                        ng-if="part.origin === '7TV' && $ctrl.showSevenTvEmotes"
                                        class="chatEmoticon"
                                        uib-tooltip="{{part.origin}}: {{part.name}}"
                                        tooltip-append-to-body="true"
                                    >
                                        <img ng-src="{{part.url}}" style="height: 100%;" />
                                    </span>
                                    <span ng-if="part.origin === '7TV' && !$ctrl.showSevenTvEmotes" style="{{$ctrl.chatSizeStyle}}">{{part.name}}</span>
                                </span>
                            </div>
                            <div ng-show="$ctrl.message.whisper" class="muted">(Whispered to you)</div>
                        </div>
                    </div>
                    <div class="automod-tag" ng-show="$ctrl.message.isAutoModHeld">
                        <div ng-if="$ctrl.message.autoModStatus === 'PENDING' && !$ctrl.message.autoModErrorMessage">
                            <span>Flagged by AutoMod ({{$ctrl.message.autoModReason}}): </span>
                            <span ng-if="!$ctrl.respondedToAutoMod">
                                <a href style="font-weight: 700;" ng-click="$ctrl.allowAutoModMessage()">Allow</a>
                                <span> • </span>
                                <a href style="font-weight: 700;" ng-click="$ctrl.denyAutoModMessage()">Deny</a>
                            </span>
                            <span ng-if="$ctrl.respondedToAutoMod" class="muted">
                                Sending...
                            </span>
                        </div>
                        <div ng-if="$ctrl.message.autoModStatus === 'PENDING' && $ctrl.message.autoModErrorMessage">
                            <span style="color: rgb(255 149 149)">{{$ctrl.message.autoModErrorMessage}}</span>
                        </div>
                        <div ng-if="['ALLOWED', 'DENIED'].includes($ctrl.message.autoModStatus)">
                            <span>{{$ctrl.message.autoModStatus === 'ALLOWED' ? 'Allowed' : 'Denied'}} by {{$ctrl.message.autoModResolvedBy}}</span>
                        </div>
                        <div ng-if="$ctrl.message.autoModStatus === 'EXPIRED'">
                            <span>Expired</span>
                        </div>
                    </div>
                    <div ng-if="$ctrl.message.isAnnouncement" style="margin-bottom:5px">
                </div>
            `,
            controller: function(chatMessagesService, utilityService, connectionService, pronounsService, backendCommunicator) {

                const $ctrl = this;

                $ctrl.pronouns = pronounsService;

                $ctrl.respondedToAutoMod = false;

                $ctrl.allowAutoModMessage = () => {
                    if ($ctrl.respondedToAutoMod) {
                        return;
                    }
                    $ctrl.respondedToAutoMod = true;
                    backendCommunicator.fireEvent("process-automod-message", { messageId: $ctrl.message.id, allow: true });
                };

                $ctrl.denyAutoModMessage = () => {
                    if ($ctrl.respondedToAutoMod) {
                        return;
                    }
                    $ctrl.respondedToAutoMod = true;
                    backendCommunicator.fireEvent("process-automod-message", { messageId: $ctrl.message.id, allow: false });
                };

                $ctrl.showUserDetailsModal = (userId) => {
                    if (userId == null) {
                        return;
                    }

                    const closeFunc = () => {};
                    utilityService.showModal({
                        component: "viewerDetailsModal",
                        backdrop: true,
                        resolveObj: {
                            userId: () => userId
                        },
                        closeCallback: closeFunc,
                        dismissCallback: closeFunc
                    });
                };

                function updateChatField(text) {
                    $ctrl.updateChatInput({
                        text: text
                    });
                }

                $ctrl.getMessageContextMenu = (message) => {
                    const actions = [];

                    actions.push({
                        name: "Details",
                        icon: "fa-info-circle"
                    });

                    actions.push({
                        name: "Delete This Message",
                        icon: "fa-trash-alt"
                    });

                    actions.push({
                        name: "Mention",
                        icon: "fa-at"
                    });

                    actions.push({
                        name: "Quote This Message",
                        icon: "fa-quote-right"
                    });

                    if (message.username.toLowerCase() !== connectionService.accounts.streamer.username.toLowerCase() &&
                        message.username.toLowerCase() !== connectionService.accounts.bot.username.toLowerCase()) {

                        actions.push({
                            name: "Whisper",
                            icon: "fa-envelope"
                        });

                        actions.push({
                            name: "Highlight This Message",
                            icon: "fa-eye"
                        });

                        actions.push({
                            name: "Shoutout",
                            icon: "fa-megaphone"
                        });

                        if (message.roles.includes("mod")) {
                            actions.push({
                                name: "Unmod",
                                icon: "fa-user-times"
                            });
                        } else {
                            actions.push({
                                name: "Mod",
                                icon: "fa-user-plus"
                            });

                            if (message.roles.includes("vip")) {
                                actions.push({
                                    name: "Remove VIP",
                                    icon: "fa-gem"
                                });
                            } else {
                                actions.push({
                                    name: "Add as VIP",
                                    icon: "fa-gem"
                                });
                            }
                        }

                        actions.push({
                            name: "Timeout",
                            icon: "fa-clock"
                        });

                        actions.push({
                            name: "Ban",
                            icon: "fa-ban"
                        });
                    }

                    return [
                        {
                            html: `<div class="name-wrapper">
                                    <img class="user-avatar" src="${message.profilePicUrl}">
                                    <span style="margin-left: 10px" class="user-name">${message.username}</span>
                                </div>`,
                            enabled: false
                        },
                        ...actions.map(a => {
                            let html = "";
                            if (a.name === "Remove VIP") {
                                html = `
                                    <div class="message-action">
                                        <span class="fa-stack fa-1x mr-3" style="width: 18px">
                                            <i class="fad fa-gem fa-stack-1x ml-px mt-1" style="opacity: 0.5"></i>
                                            <i class="far fa-slash fa-stack-1x text-2xl"></i>
                                        </span>
                                        <span class="action-name">${a.name}</span>
                                    </div>
                                `;
                            } else {
                                html = `
                                    <div class="message-action">
                                        <span class="action-icon"><i class="fad ${a.icon}"></i></span>
                                        <span class="action-name">${a.name}</span>
                                    </div>
                                `;
                            }
                            return {
                                html: html,
                                click: () => {
                                    $ctrl.messageActionSelected(a.name, message.username, message.userId, message.id, message.rawText);
                                }
                            };
                        })];
                };

                $ctrl.messageActionSelected = (action, userName, userId, msgId, rawText) => {
                    switch (action.toLowerCase()) {
                    case "delete this message":
                        chatMessagesService.deleteMessage(msgId);
                        break;
                    case "timeout":
                        updateChatField(`/timeout @${userName} 300`);
                        break;
                    case "ban":
                        utilityService
                            .showConfirmationModal({
                                title: "Ban User",
                                question: `Are you sure you want to ban ${userName}?`,
                                confirmLabel: "Ban",
                                confirmBtnType: "btn-danger"
                            })
                            .then(confirmed => {
                                if (confirmed) {
                                    backendCommunicator.fireEvent("update-user-banned-status", { username: userName, shouldBeBanned: true });
                                }
                            });
                        break;
                    case "mod":
                        chatMessagesService.changeModStatus(userName, true);
                        break;
                    case "unmod":
                        utilityService
                            .showConfirmationModal({
                                title: "Mod User",
                                question: `Are you sure you want to unmod ${userName}?`,
                                confirmLabel: "Unmod",
                                confirmBtnType: "btn-danger"
                            })
                            .then(confirmed => {
                                if (confirmed) {
                                    chatMessagesService.changeModStatus(userName, false);
                                }
                            });
                        break;
                    case "add as vip":
                        backendCommunicator.fireEvent("update-user-vip-status", { username: userName, shouldBeVip: true });
                        break;
                    case "remove vip":
                        backendCommunicator.fireEvent("update-user-vip-status", { username: userName, shouldBeVip: false });
                        break;
                    case "whisper":
                        updateChatField(`/w @${userName} `);
                        break;
                    case "mention":
                        updateChatField(`@${userName} `);
                        break;
                    case "quote this message":
                        updateChatField(`!quote add @${userName} ${rawText}`);
                        break;
                    case "highlight this message":
                        chatMessagesService.highlightMessage(userName, rawText);
                        break;
                    case "shoutout":
                        updateChatField(`!so @${userName}`);
                        break;
                    case "details": {
                        $ctrl.showUserDetailsModal(userId);
                        break;
                    }
                    default:
                        return;
                    }
                };

                $ctrl.$onInit = () => {
                };

                /*
                    $scope.getWhisperData = function(data) {
                        let target = data.target;
                        return "Whispered to " + target + ".";
                    };
                */

            }
        });
}());