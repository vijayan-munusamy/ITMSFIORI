sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/VBox",
    "sap/m/Title",
    "sap/m/Text",
    "sap/m/ObjectIdentifier",
    "sap/m/ObjectStatus",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/m/Button",
    "sap/m/Wizard",
    "sap/m/WizardStep",
    "sap/ui/layout/Grid"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, Dialog, VBox, Title, Text, ObjectIdentifier, ObjectStatus, Label, Input, Select, Item, Button, Wizard, WizardStep, Grid) {
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
            var oAsset = {
                tag: this._nextAssetTag(),
                name: "",
                category: "Laptop",
                assetType: "Laptop",
                user: "IT Room",
                location: "Dammam",
                department: "IT",
                status: "Available",
                serialNumber: "",
                vendor: "",
                purchaseDate: "",
                cost: "",
                warranty: "",
                attachments: "",
                assetUuid: this._generateAssetUuid(),
                assetCode: "AST-" + this._nextAssetTag().replace("AST", ""),
                qrCode: "QR-" + this._nextAssetTag(),
                auditRecord: "Audit record created on " + new Date().toLocaleDateString("en-GB"),
                lifecycleRecord: "Lifecycle record created; status set to AVAILABLE"
            };
            this._openAssetWizard(oAsset);
        },
        onEditAsset: function (oEvent) {
            var oAsset = oEvent.getSource().getBindingContext("assets").getObject();
            this._editingAssetTag = oAsset.tag;
            this._openAssetEditDialog(oAsset);
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
        _generateAssetUuid: function () {
            return "ASSET-" + Math.random().toString(36).slice(2, 8).toUpperCase();
        },
        _createFormField: function (sLabel, oControl) {
            return new VBox({
                items: [new Label({ text: sLabel }), oControl],
                class: "assetFormField"
            });
        },
        _createCategorySelect: function (sSelectedKey) {
            return new Select({
                selectedKey: sSelectedKey,
                items: ["Laptop", "Desktop", "Printer", "Monitor", "IP Phone", "Other"].map(function (sCategory) {
                    return new Item({ key: sCategory, text: sCategory });
                })
            });
        },
        _createLocationSelect: function (sSelectedKey) {
            return new Select({
                selectedKey: sSelectedKey,
                items: ["Dammam", "Riyadh", "Jeddah"].map(function (sLocation) {
                    return new Item({ key: sLocation, text: sLocation });
                })
            });
        },
        _createStatusSelect: function (sSelectedKey) {
            var aStatuses = [
                { key: "Available", text: "Available" },
                { key: "Assigned", text: "Assigned" },
                { key: "Under_Repair", text: "Under Repair" },
                { key: "Lost", text: "Lost" },
                { key: "Disposed", text: "Disposed" }
            ];
            return new Select({
                selectedKey: sSelectedKey === "In Repair" ? "Under_Repair" : sSelectedKey,
                items: aStatuses.map(function (oStatus) {
                    return new Item({ key: oStatus.key, text: oStatus.text });
                })
            });
        },
        _createFormGrid: function (aFields) {
            return new Grid({
                defaultSpan: "XL6 L6 M6 S12",
                hSpacing: 0.5,
                vSpacing: 0.5,
                content: aFields
            });
        },
        _openAssetWizard: function (oAsset) {
            var that = this;
            this.getView().setModel(new JSONModel(oAsset), "assetDraft");
            var oTag = new Input({ value: "{assetDraft>/tag}", editable: false });
            var oName = new Input({ value: "{assetDraft>/name}", placeholder: "Asset name" });
            var oCategory = this._createCategorySelect("{assetDraft>/category}");
            var oAssetType = new Input({ value: "{assetDraft>/assetType}", placeholder: "Asset Type" });
            var oSerialNumber = new Input({ value: "{assetDraft>/serialNumber}", placeholder: "Serial Number" });
            var oVendor = new Input({ value: "{assetDraft>/vendor}", placeholder: "Vendor" });
            var oPurchaseDate = new Input({ value: "{assetDraft>/purchaseDate}", placeholder: "Purchase Date" });
            var oCost = new Input({ value: "{assetDraft>/cost}", placeholder: "Cost" });
            var oUser = new Input({ value: "{assetDraft>/user}", placeholder: "Assigned user or IT Room" });
            var oLocation = this._createLocationSelect("{assetDraft>/location}");
            var oDepartment = new Input({ value: "{assetDraft>/department}", placeholder: "Department" });
            var oWarranty = new Input({ value: "{assetDraft>/warranty}", placeholder: "Warranty" });
            var oAttachments = new Input({ value: "{assetDraft>/attachments}", placeholder: "Attachment reference" });
            var oStatus = this._createStatusSelect("{assetDraft>/status}");
            var oStepAsset = new WizardStep({
                title: "Asset Information",
                validated: true,
                content: [this._createFormGrid([
                    this._createFormField("Asset Tag", oTag),
                    this._createFormField("Asset Name", oName),
                    this._createFormField("Asset Category", oCategory),
                    this._createFormField("Asset Type", oAssetType),
                    this._createFormField("Serial Number", oSerialNumber),
                    this._createFormField("Vendor", oVendor),
                    this._createFormField("Purchase Date", oPurchaseDate),
                    this._createFormField("Cost", oCost)
                ])]
            });
            var oStepAssignment = new WizardStep({
                title: "Assignment & Lifecycle",
                validated: true,
                content: [this._createFormGrid([
                    this._createFormField("Assigned To", oUser),
                    this._createFormField("Location", oLocation),
                    this._createFormField("Department", oDepartment),
                    this._createFormField("Warranty", oWarranty),
                    this._createFormField("Attachments", oAttachments),
                    this._createFormField("Status", oStatus)
                ])]
            });
            var oStepReview = new WizardStep({
                title: "Review & Save",
                validated: true,
                content: [new VBox({
                    items: [
                        new Title({ text: "Review & Save", level: "H3" }),
                        new ObjectIdentifier({ title: "{assetDraft>/name}", text: "{assetDraft>/tag}", icon: "sap-icon://laptop" }),
                        new Text({ text: "Asset Category: {assetDraft>/category}" }),
                        new Text({ text: "Asset Type: {assetDraft>/assetType}" }),
                        new Text({ text: "Serial Number: {assetDraft>/serialNumber}" }),
                        new Text({ text: "Vendor: {assetDraft>/vendor}" }),
                        new Text({ text: "Purchase Date: {assetDraft>/purchaseDate}" }),
                        new Text({ text: "Cost: {assetDraft>/cost}" }),
                        new Text({ text: "Assigned To: {assetDraft>/user}" }),
                        new Text({ text: "Location: {assetDraft>/location}" }),
                        new Text({ text: "Department: {assetDraft>/department}" }),
                        new Text({ text: "Warranty: {assetDraft>/warranty}" }),
                        new Text({ text: "System Processing: Asset UUID {assetDraft>/assetUuid}; Asset Code {assetDraft>/assetCode}; QR Code {assetDraft>/qrCode}" }),
                        new Text({ text: "Audit Record: {assetDraft>/auditRecord}" }),
                        new ObjectStatus({ text: "Final Status: {assetDraft>/status}" })
                    ],
                    class: "sapUiSmallMargin"
                })]
            });
            this._assetWizard = new Wizard({
                finishButtonText: "Save",
                steps: [oStepAsset, oStepAssignment, oStepReview],
                complete: this.onSaveAsset.bind(this)
            });
            this._assetDialog = new Dialog({
                title: "Create Asset",
                contentWidth: "52rem",
                stretchOnPhone: true,
                content: [this._assetWizard],
                beginButton: new Button({ text: "Cancel", press: this.onCancelAsset.bind(this) })
            });
            this.getView().addDependent(this._assetDialog);
            this._assetDialog.open();
        },
        _openAssetEditDialog: function (oAsset) {
            var that = this;
            this._assetFields = {
                tag: new Input({ value: oAsset.tag, editable: false }),
                name: new Input({ value: oAsset.name, placeholder: "Asset name" }),
                category: this._createCategorySelect(oAsset.category),
                assetType: new Input({ value: oAsset.assetType || oAsset.category, placeholder: "Asset Type" }),
                user: new Input({ value: oAsset.user, placeholder: "Assigned user or IT Room" }),
                location: this._createLocationSelect(oAsset.location),
                department: new Input({ value: oAsset.department || "IT", placeholder: "Department" }),
                status: this._createStatusSelect(oAsset.status),
                serialNumber: new Input({ value: oAsset.serialNumber || "", placeholder: "Serial Number" }),
                vendor: new Input({ value: oAsset.vendor || "", placeholder: "Vendor" }),
                purchaseDate: new Input({ value: oAsset.purchaseDate || "", placeholder: "Purchase Date" }),
                cost: new Input({ value: oAsset.cost || "", placeholder: "Cost" }),
                warranty: new Input({ value: oAsset.warranty || "", placeholder: "Warranty" }),
                attachments: new Input({ value: oAsset.attachments || "", placeholder: "Attachment reference" })
            };
            this._assetDialog = new Dialog({
                title: "Edit Asset",
                contentWidth: "52rem",
                stretchOnPhone: true,
                content: [new VBox({
                    items: [
                        new Title({ text: "Asset Information", level: "H3", class: "assetFormSectionTitle" }),
                        this._createFormGrid([
                            this._createFormField("Asset Tag", this._assetFields.tag),
                            this._createFormField("Asset Name", this._assetFields.name),
                            this._createFormField("Asset Category", this._assetFields.category),
                            this._createFormField("Asset Type", this._assetFields.assetType),
                            this._createFormField("Serial Number", this._assetFields.serialNumber),
                            this._createFormField("Vendor", this._assetFields.vendor),
                            this._createFormField("Purchase Date", this._assetFields.purchaseDate),
                            this._createFormField("Cost", this._assetFields.cost)
                        ]),
                        new Title({ text: "Assignment & Lifecycle", level: "H3", class: "assetFormSectionTitle" }),
                        this._createFormGrid([
                            this._createFormField("Assigned To", this._assetFields.user),
                            this._createFormField("Location", this._assetFields.location),
                            this._createFormField("Department", this._assetFields.department),
                            this._createFormField("Warranty", this._assetFields.warranty),
                            this._createFormField("Attachments", this._assetFields.attachments),
                            this._createFormField("Status", this._assetFields.status)
                        ])
                    ],
                    class: "sapUiSmallMargin"
                })],
                beginButton: new Button({ text: "Cancel", press: this.onCancelAsset.bind(this) }),
                endButton: new Button({ text: "Save", type: "Emphasized", press: this.onSaveAsset.bind(this) })
            });
            this.getView().addDependent(this._assetDialog);
            this._assetDialog.open();
        },
        onSaveAsset: function () {
            var oFields = this._editingAssetTag ? this._assetFields : null;
            var oDraft = this._editingAssetTag ? null : this.getView().getModel("assetDraft").getData();
            var sName = this._editingAssetTag ? oFields.name.getValue().trim() : oDraft.name.trim();
            var sCategory = this._editingAssetTag ? oFields.category.getSelectedKey() : oDraft.category;
            if (!sName || !sCategory) {
                MessageToast.show("Enter an asset name and category.");
                return;
            }
            var oAsset = this._editingAssetTag ? {
                tag: oFields.tag.getValue(),
                name: sName,
                category: sCategory,
                assetType: oFields.assetType.getValue().trim() || sCategory,
                user: oFields.user.getValue().trim() || "IT Room",
                location: oFields.location.getSelectedKey(),
                department: oFields.department.getValue().trim() || "IT",
                status: oFields.status.getSelectedKey(),
                serialNumber: oFields.serialNumber.getValue().trim(),
                vendor: oFields.vendor.getValue().trim(),
                purchaseDate: oFields.purchaseDate.getValue().trim(),
                cost: oFields.cost.getValue().trim(),
                warranty: oFields.warranty.getValue().trim(),
                attachments: oFields.attachments.getValue().trim(),
                assetUuid: this._editingAssetTag ? (this.getView().getModel("assets").getProperty("/items").find(function (oItem) { return oItem.tag === this._editingAssetTag; }.bind(this)) || {}).assetUuid || this._generateAssetUuid() : oDraft.assetUuid,
                assetCode: this._editingAssetTag ? (this.getView().getModel("assets").getProperty("/items").find(function (oItem) { return oItem.tag === this._editingAssetTag; }.bind(this)) || {}).assetCode || "AST-" + this._editingAssetTag.replace("AST", "") : oDraft.assetCode,
                qrCode: this._editingAssetTag ? (this.getView().getModel("assets").getProperty("/items").find(function (oItem) { return oItem.tag === this._editingAssetTag; }.bind(this)) || {}).qrCode || "QR-" + this._editingAssetTag : oDraft.qrCode,
                auditRecord: this._editingAssetTag ? (this.getView().getModel("assets").getProperty("/items").find(function (oItem) { return oItem.tag === this._editingAssetTag; }.bind(this)) || {}).auditRecord || "Audit record updated on " + new Date().toLocaleDateString("en-GB") : oDraft.auditRecord,
                lifecycleRecord: this._editingAssetTag ? (this.getView().getModel("assets").getProperty("/items").find(function (oItem) { return oItem.tag === this._editingAssetTag; }.bind(this)) || {}).lifecycleRecord || "Lifecycle record created; status set to " + this._getStatusLabel(oFields.status.getSelectedKey()) : oDraft.lifecycleRecord
            } : oDraft;
            oAsset.state = this._getStatusState(oAsset.status);
            oAsset.warrantyExpiry = oAsset.warranty ? oAsset.warranty : oAsset.warrantyExpiry;
            var oModel = this.getView().getModel("assets");
            var aItems = oModel.getProperty("/items").slice();
            var iIndex = aItems.findIndex(function (oItem) { return oItem.tag === this._editingAssetTag; }.bind(this));
            if (iIndex >= 0) { aItems[iIndex] = oAsset; } else { aItems.push(oAsset); }
            oModel.setProperty("/items", aItems);
            if (this._editingAssetTag === oModel.getProperty("/selectedAsset/tag")) {
                oModel.setProperty("/selectedAsset", oAsset);
            }
            this.byId("assetTable").getBinding("items").filter([]);
            this._closeAssetDialog();
            MessageToast.show(iIndex >= 0 ? "Asset updated." : "Asset created.");
        },
        onCancelAsset: function () {
            this._closeAssetDialog();
        },
        _closeAssetDialog: function () {
            var oDialog = this._assetDialog;
            this._assetDialog = null;
            this._assetWizard = null;
            this._assetFields = null;
            this.getView().setModel(null, "assetDraft");
            if (oDialog) {
                oDialog.close();
                oDialog.destroy();
            }
        },
        _getStatusState: function (sStatus) {
            if (sStatus === "Available") {
                return "Success";
            }
            if (sStatus === "In Repair" || sStatus === "Under_Repair") {
                return "Warning";
            }
            if (sStatus === "Lost" || sStatus === "Disposed") {
                return "Error";
            }
            return "Information";
        },
        _getStatusLabel: function (sStatus) {
            return sStatus || "Available";
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