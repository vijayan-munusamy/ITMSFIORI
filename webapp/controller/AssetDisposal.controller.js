sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    var DISPOSABLE_STATUSES = ["Available", "Under_Repair", "Lost"];

    return Controller.extend("itsm.fiori.controller.AssetDisposal", {
        onInit: function () {
            this.getView().setModel(new JSONModel({
                assets: [],
                selectedAsset: null,
                request: {
                    reason: "Obsolete",
                    remarks: "",
                    approval: "Pending",
                    status: "Not Requested"
                }
            }), "disposal");

            this.getOwnerComponent().getRouter().getRoute("RouteAssetDisposal").attachPatternMatched(this._loadDisposalAssets, this);
        },

        _loadDisposalAssets: function () {
            var oAssetsModel = this.getOwnerComponent().getModel("assets");
            var aAssets = oAssetsModel ? oAssetsModel.getProperty("/items") : [];
            var oDisposalModel = this.getView().getModel("disposal");

            oDisposalModel.setProperty("/assets", (aAssets || []).filter(function (oAsset) {
                return DISPOSABLE_STATUSES.indexOf(oAsset.status) >= 0;
            }));
            oDisposalModel.setProperty("/selectedAsset", null);
            oDisposalModel.setProperty("/request", {
                reason: "Obsolete",
                remarks: "",
                approval: "Pending",
                status: "Not Requested"
            });
        },

        onSelectAsset: function (oEvent) {
            var oAsset = oEvent.getSource().getBindingContext("disposal").getObject();
            this.getView().getModel("disposal").setProperty("/selectedAsset", oAsset);
            this.getView().getModel("disposal").setProperty("/request", {
                reason: oAsset.disposalRequest ? oAsset.disposalRequest.reason : "Obsolete",
                remarks: oAsset.disposalRequest ? oAsset.disposalRequest.remarks : "",
                approval: oAsset.disposalRequest ? oAsset.disposalRequest.approval : "Pending",
                status: oAsset.disposalRequest ? oAsset.disposalRequest.status : "Not Requested"
            });
        },

        onCreateDisposalRequest: function () {
            var oDisposalModel = this.getView().getModel("disposal");
            var oSelectedAsset = oDisposalModel.getProperty("/selectedAsset");
            var oRequest = oDisposalModel.getProperty("/request");

            if (!oSelectedAsset || DISPOSABLE_STATUSES.indexOf(oSelectedAsset.status) < 0) {
                MessageToast.show("Select an AVAILABLE, UNDER_REPAIR, or LOST asset.");
                return;
            }

            var oAssetsModel = this.getOwnerComponent().getModel("assets");
            var aAssets = oAssetsModel.getProperty("/items");
            var iIndex = aAssets.findIndex(function (oAsset) {
                return oAsset.tag === oSelectedAsset.tag;
            });

            if (iIndex < 0 || DISPOSABLE_STATUSES.indexOf(aAssets[iIndex].status) < 0) {
                MessageToast.show("The asset status changed and is no longer eligible for disposal.");
                this._loadDisposalAssets();
                return;
            }

            aAssets[iIndex].disposalRequest = {
                reason: oRequest.reason,
                remarks: oRequest.remarks.trim(),
                approval: "Pending",
                status: "Awaiting Approval",
                requestedOn: new Date().toLocaleDateString("en-GB"),
                requestedFromStatus: aAssets[iIndex].status
            };
            aAssets[iIndex].lifecycleRecord = "Disposal requested: " + oRequest.reason + "; awaiting approval";
            oAssetsModel.setProperty("/items", aAssets);
            oDisposalModel.setProperty("/request/status", "Awaiting Approval");
            MessageToast.show("Disposal request created and awaiting approval.");
        },

        onRecordApproval: function () {
            var oDisposalModel = this.getView().getModel("disposal");
            var oSelectedAsset = oDisposalModel.getProperty("/selectedAsset");
            var sApproval = this.byId("disposalApprovalSelect").getSelectedKey();

            if (!oSelectedAsset || !oSelectedAsset.disposalRequest || oSelectedAsset.disposalRequest.status !== "Awaiting Approval") {
                MessageToast.show("Create a disposal request before recording approval.");
                return;
            }

            var oAssetsModel = this.getOwnerComponent().getModel("assets");
            var aAssets = oAssetsModel.getProperty("/items");
            var iIndex = aAssets.findIndex(function (oAsset) {
                return oAsset.tag === oSelectedAsset.tag;
            });

            if (iIndex < 0 || DISPOSABLE_STATUSES.indexOf(aAssets[iIndex].status) < 0) {
                MessageToast.show("The asset status changed; approval cannot be recorded.");
                this._loadDisposalAssets();
                return;
            }

            aAssets[iIndex].disposalRequest.approval = sApproval;
            aAssets[iIndex].disposalRequest.status = sApproval === "Approved" ? "Approved" : "Rejected";
            aAssets[iIndex].disposalRequest.approvedOn = new Date().toLocaleDateString("en-GB");
            aAssets[iIndex].lifecycleRecord = "Disposal request " + aAssets[iIndex].disposalRequest.status.toLowerCase();
            oAssetsModel.setProperty("/items", aAssets);
            oDisposalModel.setProperty("/request/status", aAssets[iIndex].disposalRequest.status);
            MessageToast.show("Disposal request " + aAssets[iIndex].disposalRequest.status.toLowerCase() + ".");
        },

        onDisposeAsset: function () {
            var oDisposalModel = this.getView().getModel("disposal");
            var oSelectedAsset = oDisposalModel.getProperty("/selectedAsset");

            if (!oSelectedAsset || !oSelectedAsset.disposalRequest || oSelectedAsset.disposalRequest.status !== "Approved") {
                MessageToast.show("Only an approved disposal request can be completed.");
                return;
            }

            var oAssetsModel = this.getOwnerComponent().getModel("assets");
            var aAssets = oAssetsModel.getProperty("/items");
            var iIndex = aAssets.findIndex(function (oAsset) {
                return oAsset.tag === oSelectedAsset.tag;
            });

            if (iIndex < 0 || DISPOSABLE_STATUSES.indexOf(aAssets[iIndex].status) < 0) {
                MessageToast.show("The asset status changed; disposal cannot be completed.");
                this._loadDisposalAssets();
                return;
            }

            aAssets[iIndex].status = "Disposed";
            aAssets[iIndex].state = "Error";
            aAssets[iIndex].user = "None (Disposed)";
            aAssets[iIndex].assetLocked = true;
            aAssets[iIndex].isAssignable = false;
            aAssets[iIndex].disposalRequest.status = "Disposed";
            aAssets[iIndex].disposalRequest.disposedOn = new Date().toLocaleDateString("en-GB");
            aAssets[iIndex].disposalRecord = "Disposed after approval on " + aAssets[iIndex].disposalRequest.disposedOn;
            aAssets[iIndex].lifecycleRecord = "Asset disposed and locked; no further assignment permitted";
            aAssets[iIndex].assignmentHistory = (aAssets[iIndex].assignmentHistory || []).concat({
                date: new Date().toLocaleDateString("en-GB"),
                employee: "IT Room",
                action: "Disposed"
            });
            oAssetsModel.setProperty("/items", aAssets);
            MessageToast.show("Asset disposed and locked against further assignment.");
            this._loadDisposalAssets();
        }
    });
});
