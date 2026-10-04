sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("itsm.fiori.controller.AssetReturn", {
        onInit: function () {
            this.getView().setModel(new JSONModel({
                assignedAssets: [],
                selectedAsset: null
            }), "return");

            this.getOwnerComponent().getRouter().getRoute("RouteAssetReturn").attachPatternMatched(this._loadAssignedAssets, this);
        },

        _loadAssignedAssets: function () {
            var oAssetsModel = this.getOwnerComponent().getModel("assets");
            var aAssets = oAssetsModel ? oAssetsModel.getProperty("/items") : [];
            this.getView().getModel("return").setProperty("/assignedAssets", (aAssets || []).filter(function (oAsset) {
                return oAsset.status === "Assigned";
            }));
            this.getView().getModel("return").setProperty("/selectedAsset", null);
            this.getView().getModel("return").setProperty("/remarks", "");
            if (this.byId("returnRemarks")) {
                this.byId("returnRemarks").setValue("");
            }
        },

        onSelectAssetForReturn: function (oEvent) {
            var oAsset = oEvent.getSource().getBindingContext("return").getObject();
            oAsset.returnReason = "Employee Exit";
            this.getView().getModel("return").setProperty("/selectedAsset", oAsset);
            MessageToast.show("Asset selected for return: " + oAsset.name);
        },

        onConfirmReturn: function () {
            var oReturnModel = this.getView().getModel("return");
            var oSelectedAsset = oReturnModel.getProperty("/selectedAsset");
            var oCondition = this.byId("returnConditionSelect");
            var oRemarks = this.byId("returnRemarks");

            if (!oSelectedAsset) {
                MessageToast.show("Select an asset before returning it.");
                return;
            }

            var sCondition = oCondition ? oCondition.getSelectedKey() : "Good";
            var sRemarks = oRemarks ? oRemarks.getValue().trim() : "";
            var oAssetsModel = this.getOwnerComponent().getModel("assets");
            var aAssets = oAssetsModel.getProperty("/items");
            var iIndex = aAssets.findIndex(function (oAsset) {
                return oAsset.tag === oSelectedAsset.tag;
            });

            if (iIndex >= 0) {
                var sPreviousUser = aAssets[iIndex].user || "Employee";
                if (sCondition === "Good") {
                    aAssets[iIndex].status = "Available";
                    aAssets[iIndex].state = "Success";
                } else if (sCondition === "Damaged" || sCondition === "Broken") {
                    aAssets[iIndex].status = "Under_Repair";
                    aAssets[iIndex].state = "Warning";
                } else if (sCondition === "Lost") {
                    aAssets[iIndex].status = "Lost";
                    aAssets[iIndex].state = "Error";
                }

                aAssets[iIndex].user = "IT Room";
                aAssets[iIndex].acknowledgementStatus = "None";
                aAssets[iIndex].returnCondition = sCondition;
                aAssets[iIndex].returnRemarks = sRemarks || "No remarks provided";
                aAssets[iIndex].returnRecord = "Asset returned on " + new Date().toLocaleDateString("en-GB") + " with condition " + sCondition;
                aAssets[iIndex].lifecycleRecord = "Asset returned by " + sPreviousUser + " and status set to " + aAssets[iIndex].status;
                aAssets[iIndex].assignmentHistory = (aAssets[iIndex].assignmentHistory || []).concat({
                    date: new Date().toLocaleDateString("en-GB"),
                    employee: "IT Room",
                    action: "Returned by " + sPreviousUser + " (" + sCondition + ")"
                });
                oAssetsModel.setProperty("/items", aAssets);
            }

            MessageToast.show("Asset return processed. Status: " + (aAssets[iIndex] ? aAssets[iIndex].status : "Available"));
            this._loadAssignedAssets();
        }
    });
});
