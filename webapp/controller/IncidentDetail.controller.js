sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("itsm.fiori.controller.IncidentDetail", {
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