sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/VBox",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/m/Button"
], function (Controller, JSONModel, MessageBox, Dialog, VBox, Label, Input, Select, Item, Button) {
    "use strict";

    return Controller.extend("itsm.fiori.controller.AssetDetail", {
        onInit: function () {
            this.getView().setModel(new JSONModel({ isFullScreen: false }), "fclState");
            this.getOwnerComponent().getRouter().getRoute("RouteAssetDetail").attachPatternMatched(this._onAssetMatched, this);
        },
        _getLayout: function () {
            return this.getOwnerComponent().getRootControl().byId("app");
        },
        _onAssetMatched: function (oEvent) {
            var sAssetTag = oEvent.getParameter("arguments").assetId;
            var oModel = this.getView().getModel("assets");
            var oAsset = oModel.getProperty("/items").find(function (oItem) { return oItem.tag === sAssetTag; });
            if (oAsset) {
                oModel.setProperty("/selectedAsset", oAsset);
                this.getView().getModel("fclState").setProperty("/isFullScreen", false);
                this._getLayout().setLayout("TwoColumnsMidExpanded");
            } else {
                this.onCloseColumn();
            }
        },
        onFullScreen: function () {
            this.getView().getModel("fclState").setProperty("/isFullScreen", true);
            this._getLayout().setLayout("MidColumnFullScreen");
        },
        onExitFullScreen: function () {
            this.getView().getModel("fclState").setProperty("/isFullScreen", false);
            this._getLayout().setLayout("TwoColumnsMidExpanded");
        },
        onCloseColumn: function () {
            this._getLayout().setLayout("OneColumn");
            this.getOwnerComponent().getRouter().navTo("RouteAssets");
        },
        onBack: function () {
            this.onCloseColumn();
        },
        onEditAsset: function () {
            var oAsset = this.getView().getModel("assets").getProperty("/selectedAsset");
            var that = this;
            var oStatus = new Select({
                selectedKey: oAsset.status,
                items: [new Item({ key: "Available", text: "Available" }), new Item({ key: "Assigned", text: "Assigned" }), new Item({ key: "In Repair", text: "In Repair" })]
            });
            this._editFields = {
                name: new Input({ value: oAsset.name }),
                category: new Input({ value: oAsset.category }),
                user: new Input({ value: oAsset.user }),
                location: new Input({ value: oAsset.location }),
                status: oStatus
            };
            var aControls = [];
            ["name", "category", "user", "location", "status"].forEach(function (sField) {
                aControls.push(new Label({ text: sField.charAt(0).toUpperCase() + sField.slice(1) }));
                aControls.push(that._editFields[sField]);
            });
            this._editDialog = new Dialog({
                title: "Edit Asset",
                contentWidth: "28rem",
                content: [new VBox({ items: aControls, class: "sapUiSmallMargin" })],
                beginButton: new Button({ text: "Save", type: "Emphasized", press: this._saveAsset.bind(this) }),
                endButton: new Button({ text: "Cancel", press: function () { that._editDialog.close(); } })
            });
            this.getView().addDependent(this._editDialog);
            this._editDialog.open();
        },
        _saveAsset: function () {
            var oFields = this._editFields;
            var oModel = this.getView().getModel("assets");
            var oAsset = oModel.getProperty("/selectedAsset");
            var sTag = oAsset.tag;
            oAsset.name = oFields.name.getValue().trim();
            oAsset.category = oFields.category.getValue().trim();
            oAsset.user = oFields.user.getValue().trim();
            oAsset.location = oFields.location.getValue().trim();
            oAsset.status = oFields.status.getSelectedKey();
            oAsset.state = oAsset.status === "Available" ? "Success" : (oAsset.status === "In Repair" ? "Warning" : "Information");
            oModel.setProperty("/selectedAsset", Object.assign({}, oAsset));
            var aItems = oModel.getProperty("/items").slice();
            var iIndex = aItems.findIndex(function (oItem) { return oItem.tag === sTag; });
            if (iIndex >= 0) {
                aItems[iIndex] = oAsset;
                oModel.setProperty("/items", aItems);
            }
            this._editDialog.close();
            this._editDialog.destroy();
            this._editDialog = null;
        },
        onDeleteAsset: function () {
            var oModel = this.getView().getModel("assets");
            var oAsset = oModel.getProperty("/selectedAsset");
            var that = this;
            MessageBox.confirm("Delete asset " + oAsset.tag + "?", {
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        oModel.setProperty("/items", oModel.getProperty("/items").filter(function (oItem) { return oItem.tag !== oAsset.tag; }));
                        oModel.setProperty("/selectedAsset", {});
                        that.onCloseColumn();
                    }
                }
            });
        }
    });
});