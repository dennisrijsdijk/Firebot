import { AudioOutputDevice, EffectType } from "../../../types/effects";
import { EffectCategory } from "../../../shared/effect-constants";
import { settings } from "../../common/settings-access";
import { wait } from "../../utility";
import resourceTokenManager from "../../resourceTokenManager";
import webServer from "../../../server/http-server-manager";
import fsp from "fs/promises";
import path from "path";
import frontendCommunicator from "../../common/frontend-communicator";
import logger from "../../logwrapper";

interface EffectModel {
    filepath?: string;
    folder?: string;
    url?: string;
    soundType: "local" | "folderRandom" | "url";
    volume: number;
    overlayInstance?: string;
    waitForSound: boolean;
    audioOutputDevice: AudioOutputDevice;
}

interface OverlayData {
    filepath: string;
    url: string;
    isUrl: boolean;
    volume: number;
    overlayInstance?: string;
    resourceToken?: string;
    audioOutputDevice: AudioOutputDevice;
    [x: string]: unknown; // Needed for sendToOverlay
}

const model: EffectType<EffectModel, OverlayData> = {
    definition: {
        id: "firebot:playsound",
        name: "Play Sound",
        description: "Plays a sound effect",
        icon: "fad fa-waveform",
        categories: [EffectCategory.COMMON],
        dependencies: []
    },
    optionsTemplate: `
    <eos-container header="Type">
        <firebot-radios
            options="{ local: 'Local file', folderRandom: 'Random from folder', url: 'Url' }"
            model="effect.soundType"
            inline="true"
            style="padding-bottom: 5px;"
        />
    </eos-container>

    <div ng-hide="effect.soundType == null">
        <eos-container header="Sound" pad-top="true">
            <div ng-if="effect.soundType === 'folderRandom'">
                <file-chooser model="effect.folder" options="{ directoryOnly: true, filters: [], title: 'Select Sound Folder'}"></file-chooser>
            </div>

            <div ng-if="effect.soundType === 'local'">
                <div style="margin-bottom: 10px">
                    <file-chooser model="effect.filepath" options="{ filters: [ {name: 'Audio', extensions: ['mp3', 'ogg', 'wav', 'flac']} ]}" on-update="soundFileUpdated(filepath)"></file-chooser>
                </div>
                <div>
                    <sound-player path="effect.filepath" volume="effect.volume" output-device="effect.audioOutputDevice"></sound-player>
                </div>
            </div>

            <div ng-if="effect.soundType === 'url'">
               <firebot-input input-title="Url" model="effect.url" />
            </div>

            <div style="padding-top:20px">
                <label class="control-fb control--checkbox"> Wait for sound to finish <tooltip text="'Wait for the sound to finish before letting the next effect play.'"></tooltip>
                    <input type="checkbox" ng-model="effect.waitForSound">
                    <div class="control__indicator"></div>
                </label>
            </div>
        </eos-container>

        <eos-container header="Volume" pad-top="true">
            <div class="volume-slider-wrapper">
                <i class="fal fa-volume-down volume-low"></i>
                <rzslider rz-slider-model="effect.volume" rz-slider-options="{floor: 1, ceil: 10, hideLimitLabels: true, showSelectionBar: true}"></rzslider>
                <i class="fal fa-volume-up volume-high"></i>
            </div>
        </eos-container>

        <eos-audio-output-device effect="effect" pad-top="true"></eos-audio-output-device>

        <eos-overlay-instance ng-if="effect.audioOutputDevice && effect.audioOutputDevice.deviceId === 'overlay'" effect="effect" pad-top="true"></eos-overlay-instance>
    </div>
    `,
    optionsController: ($scope) => {
        if ($scope.effect.soundType == null) {
            $scope.effect.soundType = "local";
        }

        if ($scope.effect.volume == null) {
            $scope.effect.volume = 5;
        }
    },
    optionsValidator: (effect) => {
        const errors = [];

        if (effect.soundType === "local" || effect.soundType == null) {
            if (effect.filepath == null || effect.filepath.length < 1) {
                errors.push("Please select a sound file.");
            }
        } else if (effect.soundType === "folderRandom") {
            if (effect.folder == null || effect.folder.length < 1) {
                errors.push("Please select a sound folder.");
            }
        } else if (effect.soundType === "url" && (effect.url == null || effect.url.trim() === "")) {
            errors.push("Please input a url.");
        }

        return errors;
    },
    onTriggerEvent: async (event) => {
        const effect = event.effect;

        if (effect.soundType == null) {
            effect.soundType = "local";
        }

        // Set output device.
        let selectedOutputDevice = effect.audioOutputDevice;
        if (selectedOutputDevice == null || selectedOutputDevice.label === "App Default") {
            selectedOutputDevice = settings.getAudioOutputDevice();
        }

        const data: OverlayData = {
            filepath: effect.filepath,
            url: effect.url,
            isUrl: effect.soundType === "url",
            volume: effect.volume,
            overlayInstance: effect.overlayInstance,
            audioOutputDevice: selectedOutputDevice
        };

        // Get random sound
        if (effect.soundType === "folderRandom") {
            let files = [];
            try {
                files = await fsp.readdir(effect.folder);
            } catch (err) {
                logger.warn("Unable to read sound folder", err);
            }

            const filteredFiles = files.filter(i => (/\.(mp3|ogg|wav|flac)$/i).test(i));
            const chosenFile = filteredFiles[Math.floor(Math.random() * filteredFiles.length)];

            if (filteredFiles.length === 0) {
                logger.error('No sounds were found in the select sound folder.');
            }

            data.filepath = path.join(effect.folder, chosenFile);
        }

        // Generate token if going to overlay, otherwise send to gui.
        if (selectedOutputDevice.deviceId === "overlay") {
            if (effect.soundType !== "url") {
                const resourceToken = resourceTokenManager.storeResourcePath(
                    data.filepath,
                    30
                );
                data.resourceToken = resourceToken;
            }

            // send event to the overlay
            webServer.sendToOverlay("sound", data);
        } else {
            // Send data back to media.js in the gui.
            // @ts-expect-error renderWindow is not defined
            renderWindow.webContents.send("playsound", data);
        }

        if (effect.waitForSound) {
            try {
                const duration: number = await frontendCommunicator.fireEventAsync("getSoundDuration", {
                    path: data.isUrl ? data.url : data.filepath
                });

                if (selectedOutputDevice.deviceId === "overlay"
                    && settings.getForceOverlayEffectsToContinueOnRefresh() === true) {
                    let currentDuration = 0;
                    let returnNow = false;
                    const overlayInstance = effect.overlayInstance ?? "Default";

                    webServer.on("overlay-connected", (instance) => {
                        if (instance === overlayInstance) {
                            returnNow = true;
                        }
                    });

                    while (currentDuration < duration) {
                        if (returnNow) {
                            return true;
                        }
                        currentDuration += 1;

                        await wait(1000);
                    }
                } else {
                    const durationInMils = (Math.round(duration) || 0) * 1000;
                    await wait(durationInMils);
                }

                return true;
            } catch (error) {
                return true;
            }
        }
        return true;
    },
    /**
     * Code to run in the overlay
     */
    overlayExtension: {
        dependencies: {
            css: [],
            js: []
        },
        event: {
            name: "sound",
            onOverlayEvent: (event) => {
                const data = event;
                const token = encodeURIComponent(data.resourceToken);
                const resourcePath = `http://${
                    window.location.hostname
                }:7472/resource/${token}`;

                // Generate UUID to use as class name.
                // eslint-disable-next-line no-undef
                const uuid = uuidv4();

                const audioElement = document.createElement("audio") as HTMLAudioElement;
                audioElement.id = uuid;
                audioElement.src = data.isUrl ? data.url : resourcePath;
                audioElement.volume = parseFloat(data.volume) / 10;
                audioElement.oncanplay = () => audioElement.play();
                audioElement.onended = () => {
                    audioElement.remove();
                };

                // Throw audio element on page.
                const wrapper = document.getElementById("wrapper");
                wrapper.append(audioElement);
            }
        }
    }
};

module.exports = model;