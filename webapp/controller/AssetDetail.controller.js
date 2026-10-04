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
            var aStatuses = [
                { key: "Available", text: "Available" },
                { key: "Assigned", text: "Assigned" },
                { key: "Under_Repair", text: "Under Repair" },
                { key: "Lost", text: "Lost" },
                { key: "Disposed", text: "Disposed" }
            ];
            var oStatus = new Select({
                selectedKey: oAsset.status === "In Repair" ? "Under_Repair" : oAsset.status,
                items: aStatuses.map(function (oItem) {
                    return new Item({ key: oItem.key, text: oItem.text });
                })
            });
            this._editFields = {
                name: new Input({ value: oAsset.name }),
                category: new Input({ value: oAsset.category }),
                assetType: new Input({ value: oAsset.assetType || oAsset.category }),
                user: new Input({ value: oAsset.user }),
                location: new Input({ value: oAsset.location }),
                department: new Input({ value: oAsset.department || "IT" }),
                serialNumber: new Input({ value: oAsset.serialNumber || "" }),
                vendor: new Input({ value: oAsset.vendor || "" }),
                cost: new Input({ value: oAsset.cost || "" }),
                warranty: new Input({ value: oAsset.warranty || "" }),
                status: oStatus
            };
            var aControls = [];
            var aFieldNames = [
                { id: "name", label: "Asset Name" },
                { id: "category", label: "Category" },
                { id: "assetType", label: "Asset Type" },
                { id: "user", label: "Assigned User" },
                { id: "location", label: "Location" },
                { id: "department", label: "Department" },
                { id: "serialNumber", label: "Serial Number" },
                { id: "vendor", label: "Vendor" },
                { id: "cost", label: "Cost" },
                { id: "warranty", label: "Warranty" },
                { id: "status", label: "Status" }
            ];
            aFieldNames.forEach(function (oField) {
                aControls.push(new Label({ text: oField.label }));
                aControls.push(that._editFields[oField.id]);
            });
            this._editDialog = new Dialog({
                title: "Edit Asset",
                contentWidth: "32rem",
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
            oAsset.assetType = oFields.assetType.getValue().trim() || oAsset.category;
            oAsset.user = oFields.user.getValue().trim();
            oAsset.location = oFields.location.getValue().trim();
            oAsset.department = oFields.department.getValue().trim();
            oAsset.serialNumber = oFields.serialNumber.getValue().trim();
            oAsset.vendor = oFields.vendor.getValue().trim();
            oAsset.cost = oFields.cost.getValue().trim();
            oAsset.warranty = oFields.warranty.getValue().trim();
            oAsset.status = oFields.status.getSelectedKey();
            oAsset.state = oAsset.status === "Available" ? "Success" :
                           (oAsset.status === "In Repair" || oAsset.status === "Under_Repair" ? "Warning" :
                           (oAsset.status === "Lost" || oAsset.status === "Disposed" ? "Error" : "Information"));
            if (oAsset.status === "Disposed") {
                oAsset.assetLocked = true;
                oAsset.isAssignable = false;
            }
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