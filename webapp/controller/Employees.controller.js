sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/VBox",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/m/Button"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, Dialog, VBox, Label, Input, Select, Item, Button) {
    "use strict";

    return Controller.extend("itsm.fiori.controller.Employees", {
        onInit: function () {
            this.getView().setModel(new JSONModel({
                items: [
                    { id: "EMP0001", name: "Ahmed Al-Salem", department: "IT", location: "Dammam", email: "ahmed.alsalem@example.com", status: "Active", state: "Success" },
                    { id: "EMP0002", name: "Vijayan Kumar", department: "IT", location: "Riyadh", email: "vijayan.kumar@example.com", status: "Active", state: "Success" },
                    { id: "EMP0003", name: "Sara Hassan", department: "Finance", location: "Jeddah", email: "sara.hassan@example.com", status: "Active", state: "Success" },
                    { id: "EMP0004", name: "Ali Mansour", department: "Operations", location: "Dammam", email: "ali.mansour@example.com", status: "Inactive", state: "None" }
                ]
            }), "employees");
        },
        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oBinding = this.byId("employeeTable").getBinding("items");
            oBinding.filter(sQuery ? [new Filter({
                filters: ["id", "name", "department", "location", "email"].map(function (sField) {
                    return new Filter(sField, FilterOperator.Contains, sQuery);
                }),
                and: false
            })] : []);
        },
        onNewEmployee: function () {
            this._editingEmployeeId = null;
            this._openEmployeeDialog({ id: this._nextEmployeeId(), name: "", department: "IT", location: "Dammam", email: "", status: "Active" });
        },
        onEditEmployee: function (oEvent) {
            var oEmployee = oEvent.getSource().getBindingContext("employees").getObject();
            this._editingEmployeeId = oEmployee.id;
            this._openEmployeeDialog(oEmployee);
        },
        onDeleteEmployee: function (oEvent) {
            var oEmployee = oEvent.getSource().getBindingContext("employees").getObject();
            var oModel = this.getView().getModel("employees");
            MessageBox.confirm("Delete employee " + oEmployee.name + "?", {
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        oModel.setProperty("/items", oModel.getProperty("/items").filter(function (oItem) { return oItem.id !== oEmployee.id; }));
                    }
                }
            });
        },
        _openEmployeeDialog: function (oEmployee) {
            var that = this;
            var oStatus = new Select({
                selectedKey: oEmployee.status,
                items: [new Item({ key: "Active", text: "Active" }), new Item({ key: "Inactive", text: "Inactive" })]
            });
            this._employeeFields = {
                id: new Input({ value: oEmployee.id, editable: false }),
                name: new Input({ value: oEmployee.name, placeholder: "Employee name" }),
                department: new Input({ value: oEmployee.department, placeholder: "Department" }),
                location: new Input({ value: oEmployee.location, placeholder: "Location" }),
                email: new Input({ value: oEmployee.email, type: "Email", placeholder: "name@example.com" }),
                status: oStatus
            };
            var aControls = [];
            ["id", "name", "department", "location", "email", "status"].forEach(function (sField) {
                aControls.push(new Label({ text: sField === "id" ? "Employee ID" : sField.charAt(0).toUpperCase() + sField.slice(1) }));
                aControls.push(that._employeeFields[sField]);
            });
            this._employeeDialog = new Dialog({
                title: this._editingEmployeeId ? "Edit Employee" : "New Employee",
                contentWidth: "28rem",
                content: [new VBox({ items: aControls, class: "sapUiSmallMargin" })],
                beginButton: new Button({ text: "Save", type: "Emphasized", press: this.onSaveEmployee.bind(this) }),
                endButton: new Button({ text: "Cancel", press: function () { that._employeeDialog.close(); } })
            });
            this.getView().addDependent(this._employeeDialog);
            this._employeeDialog.open();
        },
        onSaveEmployee: function () {
            var oFields = this._employeeFields;
            var sName = oFields.name.getValue().trim();
            var sEmail = oFields.email.getValue().trim();
            if (!sName || !sEmail) {
                MessageToast.show("Enter an employee name and email address.");
                return;
            }
            var sStatus = oFields.status.getSelectedKey();
            var oEmployee = {
                id: oFields.id.getValue(), name: sName, department: oFields.department.getValue().trim(),
                location: oFields.location.getValue().trim(), email: sEmail,
                status: sStatus, state: sStatus === "Active" ? "Success" : "None"
            };
            var oModel = this.getView().getModel("employees");
            var aItems = oModel.getProperty("/items").slice();
            var iIndex = aItems.findIndex(function (oItem) { return oItem.id === this._editingEmployeeId; }.bind(this));
            if (iIndex >= 0) { aItems[iIndex] = oEmployee; } else { aItems.push(oEmployee); }
            oModel.setProperty("/items", aItems);
            this.byId("employeeTable").getBinding("items").filter([]);
            this._employeeDialog.close();
            this._employeeDialog.destroy();
            this._employeeDialog = null;
            MessageToast.show(iIndex >= 0 ? "Employee updated." : "Employee created.");
        },
        _nextEmployeeId: function () {
            var iHighest = this.getView().getModel("employees").getProperty("/items").reduce(function (iMax, oEmployee) {
                return Math.max(iMax, parseInt(oEmployee.id.replace("EMP", ""), 10) || 0);
            }, 0);
            return "EMP" + String(iHighest + 1).padStart(4, "0");
        }
    });
});