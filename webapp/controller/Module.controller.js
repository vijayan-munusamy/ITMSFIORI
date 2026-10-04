sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    var MODULES = {
        serviceRequests: ["Service Requests", "Request catalog and fulfillment status", "sap-icon://create"],
        problems: ["Problems", "Root cause analysis and known errors", "sap-icon://alert"],
        changes: ["Changes", "Change calendar and approval status", "sap-icon://edit"],
        assetAssignment: ["Asset Assignment", "Assign equipment to employees", "sap-icon://employee"],
        assetTransfer: ["Asset Transfer", "Track transfers between locations", "sap-icon://journey-change"],
        assetReturn: ["Asset Return", "Manage returned equipment", "sap-icon://undo"],
        assetMaintenance: ["Asset Maintenance", "Track repair tickets and completion outcomes", "sap-icon://wrench"],
        assetLost: ["Lost Asset", "Report and close lost asset cases", "sap-icon://alert"],
        assetDisposal: ["Asset Disposal", "Request approval and dispose retired assets", "sap-icon://delete"],
        employeeAcknowledgement: ["Employee Acknowledgement", "Review and acknowledge assigned equipment", "sap-icon://user-edit"],
        assetHistory: ["Asset History", "Review asset lifecycle events", "sap-icon://history"],
        warranty: ["Warranty", "Monitor coverage and expiry dates", "sap-icon://date-time"],
        amcContracts: ["AMC Contracts", "Manage annual maintenance agreements", "sap-icon://document"],
        inventory: ["Inventory", "IT stock, spare parts, and movements", "sap-icon://inventory"],
        itStock: ["IT Stock", "Current IT equipment inventory", "sap-icon://inventory"],
        spareParts: ["Spare Parts", "Parts available for service operations", "sap-icon://product"],
        issueReceipt: ["Issue / Receipt", "Record inventory transactions", "sap-icon://transaction"],
        stockAdjustment: ["Stock Adjustment", "Review and adjust stock balances", "sap-icon://request"],
        employees: ["Users & Employees", "Employee directory and organization", "sap-icon://employee"],
        employeeDirectory: ["Employees", "Employee profiles and assignments", "sap-icon://employee"],
        departments: ["Departments", "Department structure and ticket ownership", "sap-icon://org-chart"],
        locations: ["Locations", "Sites, offices, and IT rooms", "sap-icon://map"],
        technicians: ["Technicians", "Service desk technician roster", "sap-icon://wrench"],
        workflow: ["SLA & Workflow", "Service targets, escalation, and approvals", "sap-icon://workflow-tasks"],
        slaPolicies: ["SLA Policies", "Response and resolution targets", "sap-icon://time-overtime"],
        priorityMatrix: ["Priority Matrix", "Impact and urgency classifications", "sap-icon://sort"],
        escalationRules: ["Escalation Rules", "Routing and escalation conditions", "sap-icon://alert"],
        approvals: ["Approvals", "Requests awaiting approval", "sap-icon://approvals"],
        knowledgeBase: ["Knowledge Base", "Troubleshooting guides and service articles", "sap-icon://education"],
        vendors: ["Vendors", "Approved suppliers and service partners", "sap-icon://supplier"]
    };

    return Controller.extend("itsm.fiori.controller.Module", {
        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("RouteModule").attachPatternMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function (oEvent) {
            var sKey = oEvent.getParameter("arguments").module;
            var aModule = MODULES[sKey] || ["Module", "Module records and workflows", "sap-icon://folder"];
            this.getView().setModel(new JSONModel({
                title: aModule[0],
                items: [
                    { title: aModule[0] + " Overview", description: aModule[1], icon: aModule[2] },
                    { title: "Recent Activity", description: "No recent activity is available in the sample data.", icon: "sap-icon://history" }
                ]
            }), "module");
        }
    });
});