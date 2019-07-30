"use strict";

const cooldownManager = require("../../interactive/cooldown-manager");

const { ControlKind, InputEvent } = require('../../interactive/constants/MixplayConstants');
const effectModels = require("../models/effectModels");
const { EffectDependency, EffectTrigger } = effectModels;

/**
 * The Cooldown effect
 */
const cooldown = {
    /**
   * The definition of the Effect
   */
    definition: {
        id: "firebot:cooldown",
        name: "Cooldown Controls",
        description: "Put specific MixPlay controls on cooldown.",
        tags: ["Built in"],
        dependencies: [EffectDependency.INTERACTIVE],
        triggers: effectModels.buildEffectTriggersObject(
            [ControlKind.BUTTON, ControlKind.TEXTBOX],
            [InputEvent.MOUSEDOWN, InputEvent.KEYDOWN, InputEvent.SUBMIT],
            EffectTrigger.ALL
        )
    },
    optionsTemplate: `
        <eos-container header="MixPlay Project">
            <dropdown-select ng-show="hasProjects" uib-tooltip="{{getTooltip()}}" tooltip-append-to-body="true" options="projects" selected="effect.mixplayProject" on-update="onProjectUpdate()" is-disabled="disableProjectDropdown"></dropdown-select>
            <span ng-hide="hasProjects" class="muted">You currently don't have any MixPlay projects created. Create on in the Controls tab!</span>
            <div class="effect-info alert alert-info" ng-hide="disableProjectDropdown" style="margin-bottom:0;">
                Remember the selected mixplay project must be connected when this effect is triggered for it to work.
            </div>
        </eos-container>

        <div ng-show="effect.mixplayProject">
            <eos-container header="Controls To Cooldown" pad-top="true">
                <div style="display:flex; justify-content: space-between; align-items: center;">
                    <div class="searchbar-wrapper">
                        <input type="text" class="form-control" placeholder="Search controls..." ng-model="controlSearch" style="padding-left: 27px;">
                        <span class="searchbar-icon"><i class="far fa-search"></i></span>
                    </div>
                    <div class="cooldown-group-button-reset">
                        <button class="btn btn-default" ng-click="unselectAllControls()">Uncheck all</button>
                    </div>
                </div>
                <div class="cooldown-group-buttons">
                    <div ng-repeat="controlData in availableControlData | filter:controlSearch track by controlData.controlId" class="cooldown-list-btn-wrapper">
                        <label class="control-fb control--checkbox" style="margin-bottom: 0">{{controlData.controlName}} <span class="muted" style="font-size:12px;">(Scene: <b>{{controlData.sceneName}}</b>)</span>
                            <input type="checkbox" ng-click="toggleControlSelected(controlData.controlId)" ng-checked="controlIsSelected(controlData.controlId)"/>
                            <div class="control__indicator"></div>
                        </label>
                    </div>
                </div>
            </eos-container>

            <eos-container header="Cooldown Duration" pad-top="true">
                <div class="input-group">
                    <span class="input-group-addon" id="cooldown-amount-effect-type">Seconds</span>
                    <input ng-model="effect.duration" type="text" class="form-control" id="cooldown-amount-setting" aria-describedby="cooldown-amount-effect-type" replace-variables>
                </div>
                <div style="padding-top: 10px;">
                    <label class="control-fb control--checkbox"> Never Override Current Cooldown <tooltip text="'If unchecked, current cooldowns will only be overridden if this new cooldown is longer.'"></tooltip>
                        <input type="checkbox" ng-model="effect.neverOverride">
                        <div class="control__indicator"></div>
                    </label>
                </div>
            </eos-container>

            <eos-container>
                <div class="effect-info alert alert-info">
                    If you want to cool down a lot of buttons at the same time, try Cooldown Groups located in the Controls tab.
                </div>
            </eos-container>
        </div>
    `,
    /**
   * The controller for the front end Options
   * Port over from effectHelperService.js
   */
    optionsController: ($scope, mixplayService, controlHelper) => {
    // Get all control id's in an array so we can add checkboxes.

        if (!$scope.effect.controlIds) {
            $scope.effect.controlIds = [];
        }

        $scope.toggleControlSelected = function(controlId) {
            if ($scope.controlIsSelected(controlId)) {
                $scope.effect.controlIds = $scope.effect.controlIds.filter(c => c !== controlId);
            } else {
                $scope.effect.controlIds.push(controlId);
            }
        };

        $scope.controlIsSelected = function(controlId) {
            return $scope.effect.controlIds.includes(controlId);
        };

        $scope.unselectAllControls = function() {
            $scope.effect.controlIds = [];
        };

        $scope.hasProjects = false;
        $scope.projects = {};

        let projects = mixplayService.getProjects();
        if (projects && projects.length > 0) {
            $scope.hasProjects = true;
            for (let project of projects) {
                $scope.projects[project.id] = project.name;
            }
        }
        if ($scope.effect.mixplayProject) {
            if (!$scope.projects[$scope.effect.mixplayProject]) {
                $scope.effect.mixplayProject = null;
            }
        }

        $scope.getTooltip = function() {
            return $scope.disableProjectDropdown ? "You can only create cooldowns for the current project when adding to a control." : "";
        };


        // force to current project if we are in the context of interactive
        if ($scope.trigger === "interactive") {
            if ($scope.hasProjects) {
                let projectId = mixplayService.getCurrentProjectId();
                if (projectId) {
                    $scope.effect.mixplayProject = mixplayService.getCurrentProjectId();
                    $scope.disableProjectDropdown = true;
                }
            }
        }

        $scope.availableControlData = [];
        function getControlData() {
            if ($scope.effect.mixplayProject) {
                $scope.availableControlData = mixplayService.getControlDataForProject($scope.effect.mixplayProject)
                    .filter(cd => controlHelper.controlSettings[cd.controlKind].canCooldown);
            }
        }
        getControlData();

        $scope.onProjectUpdate = function() {
            getControlData();
        };

    },
    /**
   * When the effect is triggered by something
   * Used to validate fields in the option template.
   */
    optionsValidator: effect => {
        let errors = [];
        if (effect.duration == null) {
            errors.push("Please input a cooldown time.");
        }
        return errors;
    },
    /**
   * When the effect is triggered by something
   */
    onTriggerEvent: event => {
        return new Promise((resolve) => {
            const effect = event.effect;

            if (effect.controlIds && effect.controlIds.length > 0) {
                cooldownManager.cooldownControls(effect.controlId, effect.duration, effect.neverOverride);
            }

            resolve(true);
        });
    }
};

module.exports = cooldown;