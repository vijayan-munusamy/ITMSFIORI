sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("itsm.fiori.controller.IncidentDetail", {
        onInit: function () {
            this._employeeModel = new JSONModel({
                editable: false,
                EmployeeCode: "",
                FirstName: "",
                LastName: "",
                Email: "",
                Phone: "",
                DepartmentUuid: "",
                LocationUuid: "",
                ManagerUuid: "",
                Designation: "",
                JoiningDate: "",
                LeavingDate: "",
                Status: "",
                SourceSystem: "",
                ExternalEmployeeId: "",
                DepartmentName: "",
                LocationName: "",
                SAP__Messages: []
            });
            this.getView().setModel(this._employeeModel, "employee");
        },
        onEdit: function () {
            this._employeeSnapshot = Object.assign({}, this._employeeModel.getData());
            this._employeeModel.setProperty("/editable", true);
        },
        onSaveEmployee: function () {
            this._employeeModel.setProperty("/editable", false);
            this._employeeSnapshot = null;
            MessageToast.show("Employee details updated in this view.");
        },
        onCancelEmployeeEdit: function () {
            if (this._employeeSnapshot) {
                this._employeeModel.setData(this._employeeSnapshot);
                this._employeeSnapshot = null;
            }
        },
        onBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteIncidents");
        },
        onUpload: function () {
            MessageToast.show("Attachment upload is ready to be connected to your incident service.");
        },
        onCommentPost: function (oEvent) {
            if (oEvent.getParameter("value").trim()) {
                MessageToast.show("Comment is ready to be saved to the incident.");
            }
        }
    });
});