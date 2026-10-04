sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("itsm.fiori.controller.EmployeeAcknowledgement", {
        onInit: function () {
            this.getView().setModel(new JSONModel({
                assignedAssets: []
            }), "acknowledgement");

            this.getOwnerComponent().getRouter().getRoute("RouteEmployeeAcknowledgement").attachPatternMatched(this._loadAcknowledgements, this);
        },

        _loadAcknowledgements: function () {
            var oAssetsModel = this.getOwnerComponent().getModel("assets");
            var aAssets = oAssetsModel ? oAssetsModel.getProperty("/items") : [];
            var aAssignedAssets = (aAssets || []).filter(function (oAsset) {
                return oAsset.status === "Assigned";
            }).map(function (oAsset) {
                return Object.assign({}, oAsset, {
                    acknowledgementStatus: oAsset.acknowledgementStatus || "Pending Acknowledgement"
                });
            });

            this.getView().getModel("acknowledgement").setProperty("/assignedAssets", aAssignedAssets);
        },

        onAcceptAsset: function (oEvent) {
            var oAsset = oEvent.getSource().getBindingContext("acknowledgement").getObject();
            var oAssetsModel = this.getOwnerComponent().getModel("assets");
            var aAssets = oAssetsModel.getProperty("/items");
            var iIndex = aAssets.findIndex(function (item) { return item.tag === oAsset.tag; });

            if (iIndex >= 0) {
                aAssets[iIndex].status = "Assigned";
                aAssets[iIndex].acknowledgementStatus = "Acknowledged";
                aAssets[iIndex].notification = "Accepted by employee; acknowledgement recorded";
                aAssets[iIndex].lifecycleRecord = "Employee accepted asset assignment; no status change";
                oAssetsModel.setProperty("/items", aAssets);
            }

            MessageToast.show("Asset accepted. Acknowledgement = YES");
            this._loadAcknowledgements();
        },

        onRejectAsset: function (oEvent) {
            var oAsset = oEvent.getSource().getBindingContext("acknowledgement").getObject();
            var that = this;
            MessageBox.confirm("Reject assignment for asset " + oAsset.tag + " (" + oAsset.name + ") and return it to AVAILABLE status?", {
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        var oAssetsModel = that.getOwnerComponent().getModel("assets");
                        var aAssets = oAssetsModel.getProperty("/items");
                        var iIndex = aAssets.findIndex(function (item) { return item.tag === oAsset.tag; });

                        if (iIndex >= 0) {
                            var sPreviousUser = aAssets[iIndex].user || "Employee";
                            aAssets[iIndex].status = "Available";
                            aAssets[iIndex].state = "Success";
                            aAssets[iIndex].acknowledgementStatus = "Rejected";
                            aAssets[iIndex].notification = "Rejected by " + sPreviousUser + "; asset returned to inventory";
                            aAssets[iIndex].lifecycleRecord = "Assigned asset rejected by " + sPreviousUser + " and returned to available inventory";
                            aAssets[iIndex].user = "IT Room";
                            aAssets[iIndex].location = aAssets[iIndex].location || "Dammam";
                            aAssets[iIndex].assignmentHistory = (aAssets[iIndex].assignmentHistory || []).concat({
                                date: new Date().toLocaleDateString("en-GB"),
                                employee: "IT Room",
                                action: "Returned (Rejected by " + sPreviousUser + ")"
                            });
                            oAssetsModel.setProperty("/items", aAssets);
                        }
                        MessageToast.show("Asset rejected and returned to available inventory.");
                        that._loadAcknowledgements();
                    }
                }
            });
        }
    });
});
