sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("itsm.fiori.controller.Dashboard", {
        onInit: function () {
            this._incidentSearch = "";
            this._incidentPriority = "All";
            this._incidentStatus = "All";
            this.getView().setModel(new JSONModel({
                items: [
                    { id: "INC00001", subject: "Printer Issue", priority: "High", priorityState: "Error", status: "Open", technician: "Ali" },
                    { id: "INC00002", subject: "Laptop Slow", priority: "Medium", priorityState: "Warning", status: "In Progress", technician: "Umair" },
                    { id: "INC00003", subject: "VPN Access", priority: "Low", priorityState: "Success", status: "Open", technician: "Sara" }
                ]
            }), "incidents");
            this.getView().setModel(new JSONModel({
                incidentTrend: [
                    { day: "Mon", incidents: 18 },
                    { day: "Tue", incidents: 22 },
                    { day: "Wed", incidents: 16 },
                    { day: "Thu", incidents: 27 },
                    { day: "Fri", incidents: 21 },
                    { day: "Sat", incidents: 12 },
                    { day: "Sun", incidents: 19 }
                ],
                assetUtilization: [
                    { category: "In Use", assets: 842 },
                    { category: "In Stock", assets: 126 }
                ]
            }), "charts");
        },
        onAfterRendering: function () {
            var that = this;
            var aKpis = [
                { id: "kpiIncidents", route: "RouteIncidents" },
                { id: "kpiRequests", route: "RouteModule", params: { module: "serviceRequests" } },
                { id: "kpiAssets", route: "RouteAssets" },
                { id: "kpiStock", route: "RouteModule", params: { module: "itStock" } }
            ];
            aKpis.forEach(function (oKpi) {
                var oPanel = that.byId(oKpi.id);
                if (oPanel) {
                    var $dom = oPanel.$();
                    $dom.css("cursor", "pointer");
                    $dom.off("click").on("click", function () {
                        that.getOwnerComponent().getRouter().navTo(oKpi.route, oKpi.params || {});
                    });
                }
            });
        },
        onIncidentPress: function (oEvent) {
            var sIncidentId = oEvent.getSource().getText();
            this.getOwnerComponent().getRouter().navTo("RouteIncidentDetail", { incidentId: sIncidentId });
        },
        onPressKpi: function (oEvent) {
            var mRoutes = {
                "Open Incidents": ["RouteIncidents"],
                "Open Requests": ["RouteModule", { module: "serviceRequests" }],
                "Assets in Use": ["RouteAssets"],
                "Assets in Stock": ["RouteAssets"],
                "SLA Breached": ["RouteModule", { module: "slaPolicies" }],
                "Pending Changes": ["RouteModule", { module: "changes" }],
                "Pending Approvals": ["RouteModule", { module: "approvals" }],
                "Active Vendors": ["RouteModule", { module: "vendors" }]
            };
            var aRoute = mRoutes[oEvent.getSource().getHeader()];
            if (aRoute) {
                this.getOwnerComponent().getRouter().navTo(aRoute[0], aRoute[1] || {});
            }
        },
        onIncidentSearch: function (oEvent) {
            this._incidentSearch = oEvent.getParameter("newValue");
            this._applyIncidentFilters();
        },
        onPriorityFilter: function (oEvent) {
            this._incidentPriority = oEvent.getSource().getSelectedKey();
            this._applyIncidentFilters();
        },
        onStatusFilter: function (oEvent) {
            this._incidentStatus = oEvent.getSource().getSelectedKey();
            this._applyIncidentFilters();
        },
        _applyIncidentFilters: function () {
            var aFilters = [];
            if (this._incidentSearch) {
                aFilters.push(new Filter({
                    filters: ["id", "subject", "technician"].map(function (sField) {
                        return new Filter(sField, FilterOperator.Contains, this._incidentSearch);
                    }.bind(this)),
                    and: false
                }));
            }
            if (this._incidentPriority !== "All") {
                aFilters.push(new Filter("priority", FilterOperator.EQ, this._incidentPriority));
            }
            if (this._incidentStatus !== "All") {
                aFilters.push(new Filter("status", FilterOperator.EQ, this._incidentStatus));
            }
            this.byId("recentIncidentTable").getBinding("items").filter(aFilters);
        }
    });
});
