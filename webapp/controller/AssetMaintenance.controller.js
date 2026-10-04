sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("itsm.fiori.controller.AssetMaintenance", {
        onInit: function () {
            this.getView().setModel(new JSONModel({
                assets: [],
                selectedAsset: null,
                ticket: {
                    vendor: "",
                    issue: "",
                    cost: "",
                    repairDate: "",
                    system: "",
                    status: "Under_Repair"
                }
            }), "maintenance");

            this.getOwnerComponent().getRouter().getRoute("RouteAssetMaintenance").attachPatternMatched(this._loadMaintenanceAssets, this);
        },

        _loadMaintenanceAssets: function () {
            var oAssetsModel = this.getOwnerComponent().getModel("assets");
            var aAssets = oAssetsModel ? oAssetsModel.getProperty("/items") : [];
            this.getView().getModel("maintenance").setProperty("/assets", (aAssets || []).filter(function (oAsset) {
                return oAsset.status === "Assigned" || oAsset.status === "Under_Repair";
            }));
            this.getView().getModel("maintenance").setProperty("/selectedAsset", null);
            this._resetTicket();
        },

        _resetTicket: function () {
            this.getView().getModel("maintenance").setProperty("/ticket", {
                vendor: "",
                issue: "",
                cost: "",
                repairDate: "",
                system: "",
                status: "Under_Repair"
            });
        },

        onSelectAssetForMaintenance: function (oEvent) {
            var oAsset = oEvent.getSource().getBindingContext("maintenance").getObject();
            this.getView().getModel("maintenance").setProperty("/selectedAsset", oAsset);
            this.getView().getModel("maintenance").setProperty("/ticket", {
                vendor: oAsset.vendor || "",
                issue: oAsset.issue || "Routine maintenance",
                cost: oAsset.cost || "SAR 0",
                repairDate: new Date().toISOString().slice(0, 10),
                system: oAsset.assetType || "IT Asset",
                status: "Under_Repair"
            });
            MessageToast.show("Selected asset: " + oAsset.name);
        },

        onOpenMaintenanceTicket: function () {
            var oMaintenanceModel = this.getView().getModel("maintenance");
            var oSelectedAsset = oMaintenanceModel.getProperty("/selectedAsset");
            var oTicket = oMaintenanceModel.getProperty("/ticket");

            if (!oSelectedAsset) {
                MessageToast.show("Select an asset before opening a maintenance ticket.");
                return;
            }

            var oAssetsModel = this.getOwnerComponent().getModel("assets");
            var aAssets = oAssetsModel.getProperty("/items");
            var iIndex = aAssets.findIndex(function (oAsset) {
                return oAsset.tag === oSelectedAsset.tag;
            });

            if (iIndex < 0 || (aAssets[iIndex].status !== "Assigned" && aAssets[iIndex].status !== "Under_Repair")) {
                MessageToast.show("Maintenance can only be opened for an ASSIGNED or UNDER_REPAIR asset.");
                this._loadMaintenanceAssets();
                return;
            }

            if (iIndex >= 0) {
                aAssets[iIndex].status = "Under_Repair";
                aAssets[iIndex].state = "Warning";
                aAssets[iIndex].vendor = oTicket.vendor || aAssets[iIndex].vendor;
                aAssets[iIndex].issue = oTicket.issue || "Routine maintenance";
                aAssets[iIndex].repairCost = oTicket.cost || aAssets[iIndex].cost;
                aAssets[iIndex].repairDate = oTicket.repairDate || new Date().toISOString().slice(0, 10);
                aAssets[iIndex].system = oTicket.system || aAssets[iIndex].assetType;
                aAssets[iIndex].maintenanceTicket = "Ticket opened for " + aAssets[iIndex].name + " with vendor " + aAssets[iIndex].vendor;
                aAssets[iIndex].lifecycleRecord = "Maintenance ticket opened; asset moved to under repair";
                aAssets[iIndex].maintenanceHistory = (aAssets[iIndex].maintenanceHistory || []).concat({
                    date: new Date().toLocaleDateString("en-GB"),
                    vendor: aAssets[iIndex].vendor,
                    remarks: aAssets[iIndex].issue
                });
                oAssetsModel.setProperty("/items", aAssets);
            }

            MessageToast.show("Maintenance ticket opened for " + oSelectedAsset.name + ".");
            this._loadMaintenanceAssets();
        },

        onCompleteMaintenance: function () {
            var oMaintenanceModel = this.getView().getModel("maintenance");
            var oSelectedAsset = oMaintenanceModel.getProperty("/selectedAsset");
            var sOutcome = this.byId("maintenanceOutcomeSelect") ? this.byId("maintenanceOutcomeSelect").getSelectedKey() : "Repaired";
            var sFailureStatus = this.byId("maintenanceFailureStatusSelect") ? this.byId("maintenanceFailureStatusSelect").getSelectedKey() : "Damaged";

            if (!oSelectedAsset) {
                MessageToast.show("Select an asset before completing maintenance.");
                return;
            }

            var oAssetsModel = this.getOwnerComponent().getModel("assets");
            var aAssets = oAssetsModel.getProperty("/items");
            var iIndex = aAssets.findIndex(function (oAsset) {
                return oAsset.tag === oSelectedAsset.tag;
            });

            if (iIndex < 0 || aAssets[iIndex].status !== "Under_Repair") {
                MessageToast.show("Only UNDER_REPAIR assets can complete maintenance.");
                this._loadMaintenanceAssets();
                return;
            }

            if (iIndex >= 0) {
                if (sOutcome === "Repaired") {
                    aAssets[iIndex].status = "Available";
                    aAssets[iIndex].state = "Success";
                    aAssets[iIndex].acknowledgementStatus = "None";
                    aAssets[iIndex].lifecycleRecord = "Maintenance complete: asset repaired and returned to available stock";
                    aAssets[iIndex].maintenanceResolution = "Repaired";
                    aAssets[iIndex].user = "IT Room";
                } else {
                    aAssets[iIndex].status = sFailureStatus === "Disposed" ? "Disposed" : "Under_Repair";
                    aAssets[iIndex].state = sFailureStatus === "Disposed" ? "Error" : "Warning";
                    if (sFailureStatus === "Disposed") {
                        aAssets[iIndex].assetLocked = true;
                        aAssets[iIndex].isAssignable = false;
                        aAssets[iIndex].disposalRecord = "Disposed following maintenance outcome on " + new Date().toLocaleDateString("en-GB");
                    }
                    aAssets[iIndex].lifecycleRecord = sFailureStatus === "Disposed" ?
                        "Maintenance complete: asset not repaired and disposed" :
                        "Maintenance complete: asset damaged and remains under repair";
                    aAssets[iIndex].maintenanceResolution = sFailureStatus;
                    aAssets[iIndex].user = "IT Room";
                }

                aAssets[iIndex].maintenanceHistory = (aAssets[iIndex].maintenanceHistory || []).concat({
                    date: new Date().toLocaleDateString("en-GB"),
                    vendor: aAssets[iIndex].vendor || "Vendor",
                    remarks: "Maintenance completed: " + sOutcome + (sOutcome === "Not Repaired" ? " - " + sFailureStatus : "")
                });
                oAssetsModel.setProperty("/items", aAssets);
            }

            MessageToast.show("Maintenance completion recorded for " + oSelectedAsset.name + ".");
            this._loadMaintenanceAssets();
        }
    });
});
