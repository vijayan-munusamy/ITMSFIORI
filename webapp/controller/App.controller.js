sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/Device"
], function (Controller, Device) {
    "use strict";

    return Controller.extend("itsm.fiori.controller.App", {
        onInit: function () {
            this._onMediaChange = function (oEvent) {
                this.byId("toolPage").setSideExpanded(oEvent.name === "Desktop");
            }.bind(this);
            Device.media.attachHandler(this._onMediaChange, this, Device.media.RANGESETS.SAP_STANDARD);
            this._onMediaChange(Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD));
        },
        onExit: function () {
            Device.media.detachHandler(this._onMediaChange, this, Device.media.RANGESETS.SAP_STANDARD);
        },
        onToggleSide: function () {
            var oToolPage = this.byId("toolPage");
            oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
        },
        onNavigationSelect: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            var oRouter = this.getOwnerComponent().getRouter();
            this.getView().byId("app").setLayout("OneColumn");

            if (sKey === "dashboard") {
                oRouter.navTo("RouteDashboard");
            } else if (sKey === "assets") {
                oRouter.navTo("RouteAssets");
            } else if (sKey === "assetAssignment") {
                oRouter.navTo("RouteAssetAssignment");
            } else if (sKey === "assetTransfer") {
                oRouter.navTo("RouteAssetTransfer");
            } else if (sKey === "assetReturn") {
                oRouter.navTo("RouteAssetReturn");
            } else if (sKey === "assetMaintenance") {
                oRouter.navTo("RouteAssetMaintenance");
            } else if (sKey === "assetLost") {
                oRouter.navTo("RouteAssetLost");
            } else if (sKey === "assetDisposal") {
                oRouter.navTo("RouteAssetDisposal");
            } else if (sKey === "employeeAcknowledgement") {
                oRouter.navTo("RouteEmployeeAcknowledgement");
            } else if (sKey === "employeeDirectory") {
                oRouter.navTo("RouteEmployees");
            } else if (sKey === "incidents") {
                oRouter.navTo("RouteIncidents");
            } else if (sKey === "reports") {
                oRouter.navTo("RouteReports");
            } else {
                oRouter.navTo("RouteModule", { module: sKey });
            }
        },
    });
});
