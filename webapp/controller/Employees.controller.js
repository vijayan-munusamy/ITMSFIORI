sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, Fragment) {
    "use strict";

    return Controller.extend("itsm.fiori.controller.Employees", {
        onInit: function () {
            var oModel = this.getOwnerComponent().getModel("employees");
            if (!oModel) {
                oModel = new JSONModel({
                    items: [
                        { id: "EMP0001", EmployeeCode: "EMP0001", FirstName: "Ahmed", LastName: "Al-Salem", DepartmentName: "IT", LocationName: "Dammam", Email: "ahmed.alsalem@example.com", Phone: "+966500000001", Designation: "IT Manager", JoiningDate: "2020-01-15", LeavingDate: "", Status: "Active", state: "Success", SourceSystem: "Workday", ExternalEmployeeId: "EXT001", DepartmentUuid: "DEP-01", LocationUuid: "LOC-01", ManagerUuid: "" },
                        { id: "EMP0002", EmployeeCode: "EMP0002", FirstName: "Vijayan", LastName: "Kumar", DepartmentName: "IT", LocationName: "Riyadh", Email: "vijayan.kumar@example.com", Phone: "+966500000002", Designation: "Software Engineer", JoiningDate: "2021-03-10", LeavingDate: "", Status: "Active", state: "Success", SourceSystem: "Workday", ExternalEmployeeId: "EXT002", DepartmentUuid: "DEP-01", LocationUuid: "LOC-02", ManagerUuid: "EMP0001" },
                        { id: "EMP0003", EmployeeCode: "EMP0003", FirstName: "Sara", LastName: "Hassan", DepartmentName: "Finance", LocationName: "Jeddah", Email: "sara.hassan@example.com", Phone: "+966500000003", Designation: "Financial Analyst", JoiningDate: "2019-06-20", LeavingDate: "", Status: "Active", state: "Success", SourceSystem: "SAP HR", ExternalEmployeeId: "EXT003", DepartmentUuid: "DEP-02", LocationUuid: "LOC-03", ManagerUuid: "EMP0008" },
                        { id: "EMP0004", EmployeeCode: "EMP0004", FirstName: "Ali", LastName: "Mansour", DepartmentName: "Operations", LocationName: "Dammam", Email: "ali.mansour@example.com", Phone: "+966500000004", Designation: "Operations Coordinator", JoiningDate: "2022-02-11", LeavingDate: "2023-12-01", Status: "Inactive", state: "None", SourceSystem: "Workday", ExternalEmployeeId: "EXT004", DepartmentUuid: "DEP-03", LocationUuid: "LOC-01", ManagerUuid: "EMP0009" },
                        { id: "EMP0005", EmployeeCode: "EMP0005", FirstName: "Omar", LastName: "Al-Fassi", DepartmentName: "HR", LocationName: "Jeddah", Email: "omar.alfassi@example.com", Phone: "+966500000005", Designation: "HR Specialist", JoiningDate: "2018-09-01", LeavingDate: "", Status: "Active", state: "Success", SourceSystem: "Oracle HCM", ExternalEmployeeId: "EXT005", DepartmentUuid: "DEP-04", LocationUuid: "LOC-03", ManagerUuid: "EMP0010" },
                        { id: "EMP0006", EmployeeCode: "EMP0006", FirstName: "Fatima", LastName: "Zahra", DepartmentName: "Marketing", LocationName: "Riyadh", Email: "fatima.zahra@example.com", Phone: "+966500000006", Designation: "Marketing Manager", JoiningDate: "2020-11-15", LeavingDate: "", Status: "Active", state: "Success", SourceSystem: "Workday", ExternalEmployeeId: "EXT006", DepartmentUuid: "DEP-05", LocationUuid: "LOC-02", ManagerUuid: "" },
                        { id: "EMP0007", EmployeeCode: "EMP0007", FirstName: "John", LastName: "Smith", DepartmentName: "IT", LocationName: "Dammam", Email: "john.smith@example.com", Phone: "+966500000007", Designation: "System Administrator", JoiningDate: "2021-08-01", LeavingDate: "", Status: "Active", state: "Success", SourceSystem: "Workday", ExternalEmployeeId: "EXT007", DepartmentUuid: "DEP-01", LocationUuid: "LOC-01", ManagerUuid: "EMP0001" },
                        { id: "EMP0008", EmployeeCode: "EMP0008", FirstName: "Mona", LastName: "Ali", DepartmentName: "Finance", LocationName: "Riyadh", Email: "mona.ali@example.com", Phone: "+966500000008", Designation: "Finance Director", JoiningDate: "2017-04-10", LeavingDate: "", Status: "On Leave", state: "Warning", SourceSystem: "SAP HR", ExternalEmployeeId: "EXT008", DepartmentUuid: "DEP-02", LocationUuid: "LOC-02", ManagerUuid: "" },
                        { id: "EMP0009", EmployeeCode: "EMP0009", FirstName: "Khalid", LastName: "Abdulrahman", DepartmentName: "Operations", LocationName: "Jeddah", Email: "khalid.abdulrahman@example.com", Phone: "+966500000009", Designation: "Operations Manager", JoiningDate: "2016-01-20", LeavingDate: "", Status: "Active", state: "Success", SourceSystem: "Workday", ExternalEmployeeId: "EXT009", DepartmentUuid: "DEP-03", LocationUuid: "LOC-03", ManagerUuid: "" },
                        { id: "EMP0010", EmployeeCode: "EMP0010", FirstName: "Jane", LastName: "Doe", DepartmentName: "HR", LocationName: "Dammam", Email: "jane.doe@example.com", Phone: "+966500000010", Designation: "HR Director", JoiningDate: "2015-05-15", LeavingDate: "2025-01-01", Status: "Inactive", state: "None", SourceSystem: "Oracle HCM", ExternalEmployeeId: "EXT010", DepartmentUuid: "DEP-04", LocationUuid: "LOC-01", ManagerUuid: "" },
                        { id: "EMP0011", EmployeeCode: "EMP0011", FirstName: "Hassan", LastName: "Tariq", DepartmentName: "IT", LocationName: "Riyadh", Email: "hassan.tariq@example.com", Phone: "+966500000011", Designation: "Network Engineer", JoiningDate: "2022-09-01", LeavingDate: "", Status: "Active", state: "Success", SourceSystem: "Workday", ExternalEmployeeId: "EXT011", DepartmentUuid: "DEP-01", LocationUuid: "LOC-02", ManagerUuid: "EMP0001" },
                        { id: "EMP0012", EmployeeCode: "EMP0012", FirstName: "Leila", LastName: "Abbas", DepartmentName: "Marketing", LocationName: "Jeddah", Email: "leila.abbas@example.com", Phone: "+966500000012", Designation: "Content Strategist", JoiningDate: "2021-04-12", LeavingDate: "", Status: "Active", state: "Success", SourceSystem: "Workday", ExternalEmployeeId: "EXT012", DepartmentUuid: "DEP-05", LocationUuid: "LOC-03", ManagerUuid: "EMP0006" },
                        { id: "EMP0013", EmployeeCode: "EMP0013", FirstName: "Yousef", LastName: "Kamal", DepartmentName: "Finance", LocationName: "Dammam", Email: "yousef.kamal@example.com", Phone: "+966500000013", Designation: "Accountant", JoiningDate: "2020-07-25", LeavingDate: "", Status: "Active", state: "Success", SourceSystem: "SAP HR", ExternalEmployeeId: "EXT013", DepartmentUuid: "DEP-02", LocationUuid: "LOC-01", ManagerUuid: "EMP0008" },
                        { id: "EMP0014", EmployeeCode: "EMP0014", FirstName: "Nadia", LastName: "Hussein", DepartmentName: "Operations", LocationName: "Riyadh", Email: "nadia.hussein@example.com", Phone: "+966500000014", Designation: "Logistics Analyst", JoiningDate: "2019-11-05", LeavingDate: "", Status: "On Leave", state: "Warning", SourceSystem: "Workday", ExternalEmployeeId: "EXT014", DepartmentUuid: "DEP-03", LocationUuid: "LOC-02", ManagerUuid: "EMP0009" },
                        { id: "EMP0015", EmployeeCode: "EMP0015", FirstName: "Tariq", LastName: "Aziz", DepartmentName: "IT", LocationName: "Jeddah", Email: "tariq.aziz@example.com", Phone: "+966500000015", Designation: "Helpdesk Support", JoiningDate: "2023-01-10", LeavingDate: "", Status: "Active", state: "Success", SourceSystem: "Workday", ExternalEmployeeId: "EXT015", DepartmentUuid: "DEP-01", LocationUuid: "LOC-03", ManagerUuid: "EMP0001" },
                        { id: "EMP0016", EmployeeCode: "EMP0016", FirstName: "Aisha", LastName: "Rahman", DepartmentName: "HR", LocationName: "Riyadh", Email: "aisha.rahman@example.com", Phone: "+966500000016", Designation: "Recruiter", JoiningDate: "2021-02-28", LeavingDate: "", Status: "Active", state: "Success", SourceSystem: "Oracle HCM", ExternalEmployeeId: "EXT016", DepartmentUuid: "DEP-04", LocationUuid: "LOC-02", ManagerUuid: "EMP0010" },
                        { id: "EMP0017", EmployeeCode: "EMP0017", FirstName: "Majid", LastName: "Al-Qahtani", DepartmentName: "Sales", LocationName: "Dammam", Email: "majid.alqahtani@example.com", Phone: "+966500000017", Designation: "Sales Executive", JoiningDate: "2018-05-14", LeavingDate: "", Status: "Active", state: "Success", SourceSystem: "Salesforce", ExternalEmployeeId: "EXT017", DepartmentUuid: "DEP-06", LocationUuid: "LOC-01", ManagerUuid: "" },
                        { id: "EMP0018", EmployeeCode: "EMP0018", FirstName: "Reem", LastName: "Saeed", DepartmentName: "Marketing", LocationName: "Jeddah", Email: "reem.saeed@example.com", Phone: "+966500000018", Designation: "Graphic Designer", JoiningDate: "2022-10-01", LeavingDate: "2024-03-15", Status: "Inactive", state: "None", SourceSystem: "Workday", ExternalEmployeeId: "EXT018", DepartmentUuid: "DEP-05", LocationUuid: "LOC-03", ManagerUuid: "EMP0006" },
                        { id: "EMP0019", EmployeeCode: "EMP0019", FirstName: "Sami", LastName: "Abdullah", DepartmentName: "IT", LocationName: "Riyadh", Email: "sami.abdullah@example.com", Phone: "+966500000019", Designation: "Database Admin", JoiningDate: "2019-08-20", LeavingDate: "", Status: "Active", state: "Success", SourceSystem: "Workday", ExternalEmployeeId: "EXT019", DepartmentUuid: "DEP-01", LocationUuid: "LOC-02", ManagerUuid: "EMP0001" },
                        { id: "EMP0020", EmployeeCode: "EMP0020", FirstName: "Nour", LastName: "Yassin", DepartmentName: "Finance", LocationName: "Dammam", Email: "nour.yassin@example.com", Phone: "+966500000020", Designation: "Payroll Clerk", JoiningDate: "2023-05-01", LeavingDate: "", Status: "Active", state: "Success", SourceSystem: "SAP HR", ExternalEmployeeId: "EXT020", DepartmentUuid: "DEP-02", LocationUuid: "LOC-01", ManagerUuid: "EMP0008" }
                    ]
                });
                this.getOwnerComponent().setModel(oModel, "employees");
            }
            oModel.setProperty("/items", oModel.getProperty("/items").map(this._normalizeEmployee));
            this._updateEmployeeOptions();
        },
        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oBinding = this.byId("employeeTable").getBinding("items");
            oBinding.filter(sQuery ? [new Filter({
                filters: ["id", "name", "department", "location", "email", "Phone", "Designation", "EmployeeCode", "ExternalEmployeeId"].map(function (sField) {
                    return new Filter(sField, FilterOperator.Contains, sQuery);
                }),
                and: false
            })] : []);
        },
        onNewEmployee: function () {
            this._editingEmployeeId = null;
            this._openEmployeeDialog({
                EmployeeCode: this._nextEmployeeId(),
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
                LocationName: ""
            });
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
                        this._updateEmployeeOptions();
                    }
                }.bind(this)
            });
        },
        _normalizeEmployee: function (oEmployee) {
            var aNameParts = (oEmployee.name || "").trim().split(/\s+/);
            var sFirstName = oEmployee.FirstName || aNameParts.shift() || "";
            var sLastName = oEmployee.LastName || aNameParts.join(" ");
            var sEmployeeCode = oEmployee.EmployeeCode || oEmployee.id || "";
            var sDepartmentName = oEmployee.DepartmentName !== undefined ? oEmployee.DepartmentName : (oEmployee.department || "");
            var sLocationName = oEmployee.LocationName !== undefined ? oEmployee.LocationName : (oEmployee.location || "");
            var sStatus = oEmployee.Status !== undefined ? oEmployee.Status : (oEmployee.status || "");
            return Object.assign({}, oEmployee, {
                EmployeeCode: sEmployeeCode,
                FirstName: sFirstName,
                LastName: sLastName,
                Email: oEmployee.Email || oEmployee.email || "",
                Phone: oEmployee.Phone || "",
                DepartmentUuid: oEmployee.DepartmentUuid || "",
                LocationUuid: oEmployee.LocationUuid || "",
                ManagerUuid: oEmployee.ManagerUuid || "",
                Designation: oEmployee.Designation || "",
                JoiningDate: oEmployee.JoiningDate || "",
                LeavingDate: oEmployee.LeavingDate || "",
                Status: sStatus,
                SourceSystem: oEmployee.SourceSystem || "",
                ExternalEmployeeId: oEmployee.ExternalEmployeeId || "",
                DepartmentName: sDepartmentName,
                LocationName: sLocationName,
                id: sEmployeeCode,
                name: [sFirstName, sLastName].filter(Boolean).join(" "),
                email: oEmployee.Email || oEmployee.email || "",
                department: sDepartmentName,
                location: sLocationName,
                status: sStatus,
                state: sStatus === "Active" ? "Success" : "None"
            });
        },
        _openEmployeeDialog: function (oEmployee) {
            var oView = this.getView();

            var oDialogData = Object.assign({}, oEmployee);
            oDialogData.title = this._editingEmployeeId ? "Edit Employee" : "New Employee";

            var oDialogModel = new JSONModel(oDialogData);

            if (!this._pEmployeeDialog) {
                this._pEmployeeDialog = Fragment.load({
                    id: oView.getId(),
                    name: "itsm.fiori.view.EmployeeDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pEmployeeDialog.then(function (oDialog) {
                oDialog.setModel(oDialogModel, "employeeDialog");
                oDialog.open();
            });
        },
        onCancelEmployee: function () {
            if (this._pEmployeeDialog) {
                this._pEmployeeDialog.then(function(oDialog) {
                    oDialog.close();
                });
            }
        },
        onSaveEmployee: function () {
            var that = this;
            if (this._pEmployeeDialog) {
                this._pEmployeeDialog.then(function(oDialog) {
                    var oDialogModel = oDialog.getModel("employeeDialog");
                    var oPayload = oDialogModel.getData();

                    if (!oPayload.FirstName || !oPayload.LastName || !oPayload.Email) {
                        MessageToast.show("Enter the employee's first name, last name, and email address.");
                        return;
                    }
                    var oModel = that.getView().getModel("employees");
                    var aItems = oModel.getProperty("/items").slice();
                    var iIndex = aItems.findIndex(function (oItem) { return oItem.id === that._editingEmployeeId; });
                    var oOptions = that.getView().getModel("employeeOptions").getData();
                    var oDepartment = oOptions.departments.find(function (oItem) { return oItem.key === oPayload.DepartmentUuid; });
                    var oLocation = oOptions.locations.find(function (oItem) { return oItem.key === oPayload.LocationUuid; });

                    var oEmployee = that._normalizeEmployee(Object.assign({}, iIndex >= 0 ? aItems[iIndex] : {}, oPayload, {
                        id: oPayload.EmployeeCode,
                        name: [oPayload.FirstName, oPayload.LastName].join(" "),
                        email: oPayload.Email,
                        DepartmentName: oDepartment ? oDepartment.text : "",
                        LocationName: oLocation ? oLocation.text : "",
                        department: oDepartment ? oDepartment.text : "",
                        location: oLocation ? oLocation.text : "",
                        status: oPayload.Status
                    }));

                    if (iIndex >= 0) { aItems[iIndex] = oEmployee; } else { aItems.push(oEmployee); }
                    oModel.setProperty("/items", aItems);
                    that._updateEmployeeOptions();
                    that.byId("employeeTable").getBinding("items").filter([]);

                    oDialog.close();
                    MessageToast.show(iIndex >= 0 ? "Employee updated." : "Employee created.");
                });
            }
        },
        _updateEmployeeOptions: function () {
            var aEmployees = this.getView().getModel("employees").getProperty("/items");
            var aDepartments = [];
            var aLocations = [];

            aEmployees.forEach(function (oEmployee) {
                if (oEmployee.DepartmentUuid && !aDepartments.some(function (oItem) { return oItem.key === oEmployee.DepartmentUuid; })) {
                    aDepartments.push({ key: oEmployee.DepartmentUuid, text: oEmployee.DepartmentName });
                }
                if (oEmployee.LocationUuid && !aLocations.some(function (oItem) { return oItem.key === oEmployee.LocationUuid; })) {
                    aLocations.push({ key: oEmployee.LocationUuid, text: oEmployee.LocationName });
                }
            });

            this.getView().setModel(new JSONModel({
                departments: aDepartments,
                locations: aLocations,
                managers: aEmployees.map(function (oEmployee) {
                    return { key: oEmployee.id, text: oEmployee.name };
                })
            }), "employeeOptions");
        },
        _nextEmployeeId: function () {
            var iHighest = this.getView().getModel("employees").getProperty("/items").reduce(function (iMax, oEmployee) {
                return Math.max(iMax, parseInt((oEmployee.EmployeeCode || oEmployee.id).replace("EMP", ""), 10) || 0);
            }, 0);
            return "EMP" + String(iHighest + 1).padStart(4, "0");
        }
    });
});