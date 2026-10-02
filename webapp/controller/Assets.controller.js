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

    return Controller.extend("itsm.fiori.controller.Assets", {
        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("RouteAssets").attachPatternMatched(function () {
                this.getOwnerComponent().getRootControl().byId("app").setLayout("OneColumn");
            }, this);
        },
        onAssetPress: function (oEvent) {
            var oAsset = oEvent.getSource().getBindingContext("assets").getObject();
            this.getView().getModel("assets").setProperty("/selectedAsset", oAsset);
            this.getOwnerComponent().getRouter().navTo("RouteAssetDetail", { assetId: oAsset.tag });
        },
        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oBinding = this.byId("assetTable").getBinding("items");
            oBinding.filter(sQuery ? [new Filter({
                filters: ["tag", "name", "category", "user", "location"].map(function (sField) {
                    return new Filter(sField, FilterOperator.Contains, sQuery);
                }),
                and: false
            })] : []);
        },
        onStatusFilter: function (oEvent) {
            var sStatus = oEvent.getSource().getSelectedKey();
            this.byId("assetTable").getBinding("items").filter(sStatus === "All" ? [] : [new Filter("status", FilterOperator.EQ, sStatus)]);
        },
        onNewAsset: function () {
            this._editingAssetTag = null;
            this._openAssetDialog({ tag: this._nextAssetTag(), name: "", category: "Laptop", user: "IT Room", location: "Dammam", status: "Available" });
        },
        onEditAsset: function (oEvent) {
            var oAsset = oEvent.getSource().getBindingContext("assets").getObject();
            this._editingAssetTag = oAsset.tag;
            this._openAssetDialog(oAsset);
        },
        onDeleteAsset: function (oEvent) {
            var oAsset = oEvent.getSource().getBindingContext("assets").getObject();
            var oModel = this.getView().getModel("assets");
            var that = this;
            MessageBox.confirm("Delete asset " + oAsset.tag + "?", {
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        oModel.setProperty("/items", oModel.getProperty("/items").filter(function (oItem) { return oItem.tag !== oAsset.tag; }));
                        that.byId("assetTable").getBinding("items").filter([]);
                    }
                }
            });
        },
        _openAssetDialog: function (oAsset) {
            var that = this;
            var oStatus = new Select({
                selectedKey: oAsset.status,
                items: [new Item({ key: "Available", text: "Available" }), new Item({ key: "Assigned", text: "Assigned" }), new Item({ key: "In Repair", text: "In Repair" })]
            });
            this._assetFields = {
                tag: new Input({ value: oAsset.tag, editable: false }),
                name: new Input({ value: oAsset.name, placeholder: "Asset name" }),
                category: new Input({ value: oAsset.category, placeholder: "Category" }),
                user: new Input({ value: oAsset.user, placeholder: "Assigned user or IT Room" }),
                location: new Input({ value: oAsset.location, placeholder: "Location" }),
                status: oStatus
            };
            var aControls = [];
            ["tag", "name", "category", "user", "location", "status"].forEach(function (sField) {
                aControls.push(new Label({ text: sField === "tag" ? "Asset Tag" : sField.charAt(0).toUpperCase() + sField.slice(1) }));
                aControls.push(that._assetFields[sField]);
            });
            this._assetDialog = new Dialog({
                title: this._editingAssetTag ? "Edit Asset" : "New Asset",
                contentWidth: "28rem",
                content: [new VBox({ items: aControls, class: "sapUiSmallMargin" })],
                beginButton: new Button({ text: "Save", type: "Emphasized", press: this.onSaveAsset.bind(this) }),
                endButton: new Button({ text: "Cancel", press: function () { that._assetDialog.close(); } })
            });
            this.getView().addDependent(this._assetDialog);
            this._assetDialog.open();
        },
        onSaveAsset: function () {
            var oFields = this._assetFields;
            var sName = oFields.name.getValue().trim();
            var sCategory = oFields.category.getValue().trim();
            if (!sName || !sCategory) {
                MessageToast.show("Enter an asset name and category.");
                return;
            }
            var oAsset = {
                tag: oFields.tag.getValue(), name: sName, category: sCategory,
                user: oFields.user.getValue().trim() || "IT Room", location: oFields.location.getValue().trim(),
                status: oFields.status.getSelectedKey(), state: oFields.status.getSelectedKey() === "Available" ? "Success" : "Information"
            };
            var oModel = this.getView().getModel("assets");
            var aItems = oModel.getProperty("/items").slice();
            var iIndex = aItems.findIndex(function (oItem) { return oItem.tag === this._editingAssetTag; }.bind(this));
            if (iIndex >= 0) { aItems[iIndex] = oAsset; } else { aItems.push(oAsset); }
            oModel.setProperty("/items", aItems);
            if (this._editingAssetTag === oModel.getProperty("/selectedAsset/tag")) {
                oModel.setProperty("/selectedAsset", oAsset);
            }
            this.byId("assetTable").getBinding("items").filter([]);
            this._assetDialog.close();
            this._assetDialog.destroy();
            this._assetDialog = null;
            MessageToast.show(iIndex >= 0 ? "Asset updated." : "Asset created.");
        },
        _nextAssetTag: function () {
            var iHighest = this.getView().getModel("assets").getProperty("/items").reduce(function (iMax, oAsset) {
                return Math.max(iMax, parseInt(oAsset.tag.replace("AST", ""), 10) || 0);
            }, 0);
            return "AST" + String(iHighest + 1).padStart(4, "0");
        },
        onUpload: function () {
            MessageToast.show("Excel upload is ready to be connected to your import service.");
        },
        onExport: function () {
            var aItems = this.getView().getModel("assets").getProperty("/items");
            var aRows = [["Asset Tag", "Asset Name", "Category", "User", "Location", "Status"]];
            aItems.forEach(function (oAsset) { aRows.push([oAsset.tag, oAsset.name, oAsset.category, oAsset.user, oAsset.location, oAsset.status]); });
            var sCsv = aRows.map(function (aRow) {
                return aRow.map(function (sValue) { return '"' + String(sValue).replace(/"/g, '""') + '"'; }).join(",");
            }).join("\r\n");
            var sUrl = URL.createObjectURL(new Blob([sCsv], { type: "text/csv;charset=utf-8" }));
            var oLink = document.createElement("a");
            oLink.href = sUrl;
            oLink.download = "asset-register.csv";
            oLink.click();
            URL.revokeObjectURL(sUrl);
            MessageToast.show("Asset register exported.");
        }
    });
});