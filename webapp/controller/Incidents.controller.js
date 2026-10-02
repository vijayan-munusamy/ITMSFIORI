sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast) {
    "use strict";

    return Controller.extend("itsm.fiori.controller.Incidents", {
        onInit: function () {
            this.getView().setModel(new JSONModel({
                items: [
                    { id: "INC00001", subject: "Printer Issue", priority: "High", priorityState: "Error", status: "Open", statusState: "Error", technician: "Ali" },
                    { id: "INC00002", subject: "Laptop Slow", priority: "Medium", priorityState: "Warning", status: "In Progress", statusState: "Information", technician: "Umair" },
                    { id: "INC00003", subject: "VPN Access", priority: "Low", priorityState: "Success", status: "Open", statusState: "Error", technician: "Sara" },
                    { id: "INC00004", subject: "Email Sync Failure", priority: "Critical", priorityState: "Error", status: "In Progress", statusState: "Information", technician: "Ali" }
                ]
            }), "incidents");
        },
        onIncidentPress: function (oEvent) {
            var oIncident = oEvent.getSource().getBindingContext("incidents").getObject();
            this.getOwnerComponent().getRouter().navTo("RouteIncidentDetail", { incidentId: oIncident.id });
        },
        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oBinding = this.byId("incidentTable").getBinding("items");
            oBinding.filter(sQuery ? [new Filter({
                filters: ["id", "subject", "priority", "technician"].map(function (sField) {
                    return new Filter(sField, FilterOperator.Contains, sQuery);
                }),
                and: false
            })] : []);
        },
        onStatusFilter: function (oEvent) {
            var sStatus = oEvent.getSource().getSelectedKey();
            this.byId("incidentTable").getBinding("items").filter(sStatus === "All" ? [] : [new Filter("status", FilterOperator.EQ, sStatus)]);
        },
        onNewIncident: function () {
            MessageToast.show("New incident entry is ready to be connected to your service desk.");
        },
        onFilter: function () {
            this.byId("incidentTable").getBinding("items").filter([]);
            MessageToast.show("Use the search and status controls to narrow incidents.");
        }
    });
});