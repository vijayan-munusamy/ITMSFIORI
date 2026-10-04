sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast) {
    "use strict";

    return Controller.extend("itsm.fiori.controller.AssetAssignment", {
        onInit: function () {
            this.getView().setModel(new JSONModel({
                availableAssets: [],
                activeEmployees: [],
                selectedAsset: null,
                selectedEmployee: null
            }), "assignment");

            this.getOwnerComponent().getRouter().getRoute("RouteAssetAssignment").attachPatternMatched(this._refreshAssignmentData, this);
        },

        _refreshAssignmentData: function () {
            var oAssetsModel = this.getOwnerComponent().getModel("assets");
            var oEmployeesModel = this.getOwnerComponent().getModel("employees");
            var aAssets = oAssetsModel ? oAssetsModel.getProperty("/items") : [];
            var aEmployees = oEmployeesModel ? oEmployeesModel.getProperty("/items") : [];

            this.getView().getModel("assignment").setProperty("/availableAssets", (aAssets || []).filter(function (oAsset) {
                return oAsset.status === "Available" && !oAsset.assetLocked;
            }));

            this.getView().getModel("assignment").setProperty("/activeEmployees", (aEmployees || []).filter(function (oEmployee) {
                return oEmployee.status === "Active";
            }));

            this.getView().getModel("assignment").setProperty("/selectedAsset", null);
            this.getView().getModel("assignment").setProperty("/selectedEmployee", null);
        },

        onAssetSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oBinding = this.byId("availableAssetTable").getBinding("items");
            oBinding.filter(sQuery ? [new Filter({
                filters: ["tag", "name", "category", "location"].map(function (sField) {
                    return new Filter(sField, FilterOperator.Contains, sQuery);
                }),
                and: false
            })] : []);
        },

        onEmployeeSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oBinding = this.byId("assignmentEmployeeTable").getBinding("items");
            oBinding.filter(sQuery ? [new Filter({
                filters: ["id", "name", "department", "location"].map(function (sField) {
                    return new Filter(sField, FilterOperator.Contains, sQuery);
                }),
                and: false
            })] : []);
        },

        onSelectAsset: function (oEvent) {
            var oAsset = oEvent.getSource().getBindingContext("assignment").getObject();
            this.getView().getModel("assignment").setProperty("/selectedAsset", oAsset);
            MessageToast.show("Asset selected: " + oAsset.name);
            var oWizard = this.byId("assignmentWizard");
            if (oWizard) {
                oWizard.nextStep();
            }
        },

        onSelectEmployee: function (oEvent) {
            var oEmployee = oEvent.getSource().getBindingContext("assignment").getObject();
            this.getView().getModel("assignment").setProperty("/selectedEmployee", oEmployee);
            MessageToast.show("Employee selected: " + oEmployee.name);
            var oWizard = this.byId("assignmentWizard");
            if (oWizard) {
                oWizard.nextStep();
            }
        },

        onSubmitAssignment: function () {
            var oAssignmentModel = this.getView().getModel("assignment");
            var oSelectedAsset = oAssignmentModel.getProperty("/selectedAsset");
            var oSelectedEmployee = oAssignmentModel.getProperty("/selectedEmployee");

            if (!oSelectedAsset || !oSelectedEmployee) {
                MessageToast.show("Select an available asset and an active employee before submitting.");
                return;
            }

            if (oSelectedAsset.status !== "Available") {
                MessageToast.show("Only AVAILABLE assets can be assigned.");
                return;
            }

            if (oSelectedEmployee.status !== "Active") {
                MessageToast.show("Only ACTIVE employees can receive an assignment.");
                return;
            }

            var oAssetsModel = this.getOwnerComponent().getModel("assets");
            var aAssets = oAssetsModel.getProperty("/items");
            var iIndex = aAssets.findIndex(function (oAsset) {
                return oAsset.tag === oSelectedAsset.tag;
            });

            if (iIndex >= 0) {
                aAssets[iIndex].status = "Assigned";
                aAssets[iIndex].state = "Information";
                aAssets[iIndex].user = oSelectedEmployee.name;
                aAssets[iIndex].location = oSelectedEmployee.location;
                aAssets[iIndex].department = oSelectedEmployee.department;
                aAssets[iIndex].assignmentRecord = "Assignment record created for " + oSelectedEmployee.name + " on " + new Date().toLocaleDateString("en-GB");
                aAssets[iIndex].lifecycleEvent = "Lifecycle event created: Asset moved from AVAILABLE to ASSIGNED";
                aAssets[iIndex].notification = "Email sent to " + oSelectedEmployee.email + " - pending acknowledgement";
                aAssets[iIndex].acknowledgementStatus = "Pending Acknowledgement";
                aAssets[iIndex].assignmentHistory = (aAssets[iIndex].assignmentHistory || []).concat({
                    date: new Date().toLocaleDateString("en-GB"),
                    employee: oSelectedEmployee.name,
                    action: "Assigned"
                });
                aAssets[iIndex].lifecycleRecord = "Assigned to " + oSelectedEmployee.name + " and moved to active use";
                oAssetsModel.setProperty("/items", aAssets);
            }

            MessageToast.show("Asset assigned successfully to " + oSelectedEmployee.name + ".");
            var oWizard = this.byId("assignmentWizard");
            var oStepAsset = this.byId("stepAsset");
            if (oWizard && oStepAsset) {
                oWizard.goToStep(oStepAsset);
            }
            this._refreshAssignmentData();
        }
    });
});
