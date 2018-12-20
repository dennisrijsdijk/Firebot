"use strict";
(function() {
    angular
        .module("firebotApp")
        .controller("controlsController", function(
            $scope,
            mixplayService,
            utilityService
        ) {

            $scope.mps = mixplayService;

            $scope.GridSize = {
                LARGE: "large",
                MEDIUM: "medium",
                SMALL: "small"
            };

            $scope.tiles = [
                {
                    x: 0,
                    y: 0,
                    height: 4,
                    width: 6
                },
                {
                    x: 6,
                    y: 5,
                    height: 4,
                    width: 6
                }
            ];

            $scope.gridUpdated = function() {
                console.log("grid updated!");
                console.log($scope.tiles);
                $scope.$apply();
            };

            $scope.getSelectedProjectName = function() {
                let currentProject = mixplayService.getCurrentProject();
                if (currentProject != null) {
                    return currentProject.name;
                }
                return "No project selected";
            };

            $scope.getScenesForSelectedProject = function() {
                let currentProject = mixplayService.getCurrentProject();
                if (currentProject != null) {
                    return currentProject.scenes;
                }
                return [];
            };

            $scope.deleteCurrentProject = function() {
                let currentProject = mixplayService.getCurrentProject();
                if (currentProject != null) {

                    utilityService
                        .showConfirmationModal({
                            title: "Delete MixPlay Project",
                            question: `Are you sure you want to delete the MixPlay Project "${currentProject.name}"?`,
                            confirmLabel: "Delete",
                            confirmBtnType: "btn-danger"
                        })
                        .then(confirmed => {
                            if (confirmed) {
                                mixplayService.deleteProject(currentProject.id);
                            }
                        });
                }
            };

            $scope.deleteScene = function(scene) {
                if (scene != null) {

                    utilityService
                        .showConfirmationModal({
                            title: "Delete Scene",
                            question: `Are you sure you want to delete the Scene "${scene.name}"?`,
                            confirmLabel: "Delete",
                            confirmBtnType: "btn-danger"
                        })
                        .then(confirmed => {
                            if (confirmed) {
                                mixplayService.deleteSceneFromCurrentProject(scene.id);
                            }
                        });
                }
            };

            $scope.deleteControl = function(control) {
                if (control != null) {

                    utilityService
                        .showConfirmationModal({
                            title: "Delete Control",
                            question: `Are you sure you want to delete the Control "${control.name}"?`,
                            confirmLabel: "Delete",
                            confirmBtnType: "btn-danger"
                        })
                        .then(confirmed => {
                            if (confirmed) {
                                mixplayService.deleteControlForCurrentScene(control.id);
                            }
                        });
                }
            };


            $scope.showCreateMixplayModal = function() {

                utilityService.openGetInputModal(
                    {
                        model: "",
                        label: "New Project Name",
                        saveText: "Create",
                        validationFn: (value) => {
                            return new Promise(resolve => {
                                if (value == null || value.trim().length < 1) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            });
                        },
                        validationText: "Project name cannot be empty."

                    },
                    (name) => {
                        mixplayService.createNewProject(name);
                    });
            };

            $scope.showCreateSceneModal = function() {

                utilityService.openGetInputModal(
                    {
                        model: "",
                        label: "New Scene Name",
                        saveText: "Add",
                        validationFn: (value) => {
                            return new Promise(resolve => {
                                if (value == null || value.trim().length < 1) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            });
                        },
                        validationText: "Scene name cannot be empty."

                    },
                    (name) => {
                        mixplayService.addNewSceneToCurrentProject(name);
                    });
            };

            $scope.getControlPositionForGrid = function(control, gridSize = "large") {
                let position = control.position.find(p => p.size === gridSize);
                return position || {};
            };

            $scope.getAllControlPositionsForGridSize = function(size = "large") {
                //get all controls for this scene
                let allControls = mixplayService.getControlsForCurrentScene();

                //filter to just controls that have saved positions for this size
                return allControls
                    .filter(c => c.position.some(p => p.size === size));
            };


            $scope.showCreateControlModal = function() {

                utilityService.openGetInputModal(
                    {
                        model: "",
                        label: "New Button Name",
                        saveText: "Add",
                        validationFn: (value) => {
                            return new Promise(resolve => {
                                if (value == null || value.trim().length < 1) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            });
                        },
                        validationText: "Button name cannot be empty."

                    },
                    (name) => {

                        mixplayService.createControlForCurrentScene(name);

                    });
            };
        });
}());