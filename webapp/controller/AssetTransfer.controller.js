sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("itsm.fiori.controller.AssetTransfer", {
        onInit: function () {
            this.getView().setModel(new JSONModel({
                assignedAssets: [],
                eligibleEmployees: [],
                selectedAsset: null
            }), "transfer");

            this.getOwnerComponent().getRouter().getRoute("RouteAssetTransfer").attachPatternMatched(this._loadTransferData, this);
        },

        _loadTransferData: function () {
            var oAssetsModel = this.getOwnerComponent().getModel("assets");
            var oEmployeesModel = this.getOwnerComponent().getModel("employees");
            var aAssets = oAssetsModel ? oAssetsModel.getProperty("/items") : [];
            var aEmployees = oEmployeesModel ? oEmployeesModel.getProperty("/items") : [];

            this.getView().getModel("transfer").setProperty("/assignedAssets", (aAssets || []).filter(function (oAsset) {
                return oAsset.status === "Assigned";
            }));

            this.getView().getModel("transfer").setProperty("/eligibleEmployees", (aEmployees || []).filter(function (oEmployee) {
                return oEmployee.status === "Active";
            }));

            this.getView().getModel("transfer").setProperty("/selectedAsset", null);
        },

        onSelectAssetForTransfer: function (oEvent) {
            var oAsset = oEvent.getSource().getBindingContext("transfer").getObject();
            this.getView().getModel("transfer").setProperty("/selectedAsset", oAsset);
            var oEmployeesModel = this.getOwnerComponent().getModel("employees");
            var aEmployees = oEmployeesModel ? oEmployeesModel.getProperty("/items") : [];
            var aEligible = (aEmployees || []).filter(function (oEmployee) {
                return oEmployee.status === "Active" && oEmployee.name !== oAsset.user;
            });
            this.getView().getModel("transfer").setProperty("/eligibleEmployees", aEligible);
            MessageToast.show("Asset selected: " + oAsset.name + " (Current holder: " + oAsset.user + ")");
        },

        onSubmitTransfer: function () {
            var oTransferModel = this.getView().getModel("transfer");
            var oSelectedAsset = oTransferModel.getProperty("/selectedAsset");
            var oSelect = this.byId("newEmployeeSelect");
            var sNewEmployeeId = oSelect ? oSelect.getSelectedKey() : "";

            if (!oSelectedAsset) {
                MessageToast.show("Select an asset to transfer.");
                return;
            }

            if (!sNewEmployeeId) {
                MessageToast.show("Select a new employee before submitting the transfer.");
                return;
            }

            var oEmployeesModel = this.getOwnerComponent().getModel("employees");
            var aEmployees = oEmployeesModel ? oEmployeesModel.getProperty("/items") : [];
            var oNewEmployee = aEmployees.find(function (oEmployee) {
                return oEmployee.id === sNewEmployeeId;
            });

            if (!oNewEmployee) {
                MessageToast.show("Selected employee could not be found.");
                return;
            }

            if (oNewEmployee.name === oSelectedAsset.user) {
                MessageToast.show("Asset is already assigned to " + oNewEmployee.name + ". Select a different employee.");
                return;
            }

            var oAssetsModel = this.getOwnerComponent().getModel("assets");
            var aAssets = oAssetsModel.getProperty("/items");
            var iIndex = aAssets.findIndex(function (oAsset) {
                return oAsset.tag === oSelectedAsset.tag;
            });

            if (iIndex >= 0) {
                var sOldUser = aAssets[iIndex].user || "Unknown";
                aAssets[iIndex].status = "Assigned";
                aAssets[iIndex].state = "Information";
                aAssets[iIndex].user = oNewEmployee.name;
                aAssets[iIndex].location = oNewEmployee.location;
                aAssets[iIndex].department = oNewEmployee.department;
                aAssets[iIndex].acknowledgementStatus = "Pending Acknowledgement";
                aAssets[iIndex].notification = "Transferred from " + sOldUser + " to " + oNewEmployee.name + " - pending acknowledgement";
                aAssets[iIndex].transferRecord = "Asset transferred from " + sOldUser + " to " + oNewEmployee.name + " on " + new Date().toLocaleDateString("en-GB");
                aAssets[iIndex].lifecycleRecord = "Transfer completed: previous assignment closed and new assignment created";
                aAssets[iIndex].auditEntry = "Audit entry created for transfer to " + oNewEmployee.name;
                aAssets[iIndex].assignmentHistory = (aAssets[iIndex].assignmentHistory || []).concat({
                    date: new Date().toLocaleDateString("en-GB"),
                    employee: oNewEmployee.name,
                    action: "Transferred from " + sOldUser
                });
                oAssetsModel.setProperty("/items", aAssets);
            }

            MessageToast.show("Asset transferred from " + oSelectedAsset.user + " to " + oNewEmployee.name + ".");
            this._loadTransferData();
        }
    });
});
