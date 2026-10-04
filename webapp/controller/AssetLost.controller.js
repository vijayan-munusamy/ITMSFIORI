sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("itsm.fiori.controller.AssetLost", {
        onInit: function () {
            this.getView().setModel(new JSONModel({
                assets: [],
                selectedAsset: null,
                loss: {
                    investigation: "",
                    approval: "Pending",
                    remarks: ""
                }
            }), "lost");

            this.getOwnerComponent().getRouter().getRoute("RouteAssetLost").attachPatternMatched(this._loadLostAssets, this);
        },

        _loadLostAssets: function () {
            var oAssetsModel = this.getOwnerComponent().getModel("assets");
            var aAssets = oAssetsModel ? oAssetsModel.getProperty("/items") : [];
            this.getView().getModel("lost").setProperty("/assets", (aAssets || []).filter(function (oAsset) {
                return oAsset.status === "Assigned" || oAsset.status === "Lost";
            }));
            this.getView().getModel("lost").setProperty("/selectedAsset", null);
            this.getView().getModel("lost").setProperty("/loss", {
                investigation: "",
                approval: "Pending",
                remarks: ""
            });
        },

        onSelectAssetForLost: function (oEvent) {
            var oAsset = oEvent.getSource().getBindingContext("lost").getObject();
            this.getView().getModel("lost").setProperty("/selectedAsset", oAsset);
            this.getView().getModel("lost").setProperty("/loss", {
                investigation: oAsset.investigationStatus || "Pending",
                approval: oAsset.approvalStatus || "Pending",
                remarks: oAsset.lossRemarks || ""
            });
            MessageToast.show("Selected asset: " + oAsset.name);
        },

        onReportLostAsset: function () {
            var oLostModel = this.getView().getModel("lost");
            var oSelectedAsset = oLostModel.getProperty("/selectedAsset");
            var sRemarks = oLostModel.getProperty("/loss/remarks");

            if (!oSelectedAsset) {
                MessageToast.show("Select an asset before reporting it as lost.");
                return;
            }

            var oAssetsModel = this.getOwnerComponent().getModel("assets");
            var aAssets = oAssetsModel.getProperty("/items");
            var iIndex = aAssets.findIndex(function (oAsset) {
                return oAsset.tag === oSelectedAsset.tag;
            });

            if (iIndex >= 0) {
                aAssets[iIndex].status = "Lost";
                aAssets[iIndex].state = "Error";
                aAssets[iIndex].investigationStatus = "Open";
                aAssets[iIndex].approvalStatus = "Pending";
                aAssets[iIndex].lossRemarks = sRemarks || "Asset reported lost";
                aAssets[iIndex].lostRecord = "Asset reported lost on " + new Date().toLocaleDateString("en-GB");
                aAssets[iIndex].lifecycleRecord = "Assignment → Lost → Investigation → Closure";
                aAssets[iIndex].assignmentHistory = (aAssets[iIndex].assignmentHistory || []).concat({
                    date: new Date().toLocaleDateString("en-GB"),
                    employee: aAssets[iIndex].user,
                    action: "Lost"
                });
                oAssetsModel.setProperty("/items", aAssets);
            }

            MessageToast.show("Asset reported lost and moved to investigation.");
            this._loadLostAssets();
        },

        onApproveLoss: function () {
            var oLostModel = this.getView().getModel("lost");
            var oSelectedAsset = oLostModel.getProperty("/selectedAsset");
            var sInvestigation = this.byId("lossInvestigationStatusSelect") ? this.byId("lossInvestigationStatusSelect").getSelectedKey() : "Investigated";
            var sApproval = this.byId("lossApprovalStatusSelect") ? this.byId("lossApprovalStatusSelect").getSelectedKey() : "Approved";

            if (!oSelectedAsset) {
                MessageToast.show("Select an asset before approval.");
                return;
            }

            var oAssetsModel = this.getOwnerComponent().getModel("assets");
            var aAssets = oAssetsModel.getProperty("/items");
            var iIndex = aAssets.findIndex(function (oAsset) {
                return oAsset.tag === oSelectedAsset.tag;
            });

            if (iIndex >= 0) {
                aAssets[iIndex].status = "Lost";
                aAssets[iIndex].state = "Error";
                aAssets[iIndex].investigationStatus = sInvestigation;
                aAssets[iIndex].approvalStatus = sApproval;
                if (sApproval === "Approved" && sInvestigation === "Investigated") {
                    aAssets[iIndex].assetLocked = true;
                    aAssets[iIndex].isAssignable = false;
                }
                aAssets[iIndex].lifecycleRecord = "Assignment → Lost → Investigation → Closure (" + sInvestigation + " / " + sApproval + ")";
                aAssets[iIndex].investigationClosure = "Investigation completed and approval recorded";
                oAssetsModel.setProperty("/items", aAssets);
            }

            MessageToast.show("Lost asset investigation and approval recorded.");
            this._loadLostAssets();
        }
    });
});
