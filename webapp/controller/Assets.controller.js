sap.ui.define([
    "sap/m/Page",
    "sap/m/NavContainer",
    "sap/m/StandardListItem",
    "sap/m/List",
    "sap/m/ScrollContainer",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/HBox",
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
    "sap/ui/layout/Grid",
    "sap/m/DatePicker",
    "sap/ui/unified/FileUploader"
], function (Page, NavContainer, StandardListItem, List, ScrollContainer, Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, Dialog, HBox, VBox, Title, Text, ObjectIdentifier, ObjectStatus, Label, Input, Select, Item, Button, Wizard, WizardStep, Grid, DatePicker, FileUploader) {
    "use strict";

    return Controller.extend("itsm.fiori.controller.Assets", {
        _categoryTypeMap: {
            "IT Assets": ["Laptop", "Desktop", "Monitor", "Printer", "Scanner", "Mobile Phone", "Tablet", "Projector", "Server", "Storage Device"],
            "Furniture": ["Office Chair", "Office Table", "Cabinet", "Workstation", "Meeting Table", "Sofa"],
            "Vehicles": ["Car", "Truck", "Forklift", "Motorcycle", "Van"],
            "Network Infrastructure": ["Switch", "Router", "Firewall", "Access Point", "Rack", "UPS"],
            "Office Equipment": ["Photocopier", "Shredder", "Telephone", "Attendance Device"],
            "Software & Licenses": ["Microsoft License", "SAP License", "Adobe License", "Antivirus", "Cloud Subscription"],
            "Machinery": ["Other"],
            "Others": ["Other"]
        },
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
            var sAssetTag = this._nextAssetTag();
            var oAsset = {
                tag: sAssetTag,
                name: "",
                category: "IT Assets",
                assetType: "Laptop",
                manufacturer: "",
                model: "",
                user: "IT Room",
                location: "Dammam",
                storageLocation: "",
                department: "IT",
                status: "Available",
                serialNumber: "",
                vendor: "",
                procurementVendor: "",
                purchaseDate: "",
                cost: "",
                purchaseCost: "",
                invoiceNumber: "",
                warrantyStartDate: "",
                warrantyEndDate: "",
                warranty: "",
                documents: {
                    invoice: null,
                    warrantyCertificate: null,
                    assetImage: null
                },
                attachments: "",
                assetUuid: this._generateAssetUuid(),
                assetCode: "AST-" + sAssetTag.replace("AST", ""),
                qrCode: "QR-" + sAssetTag,
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
        _createCategorySelect: function (sSelectedKey, fnChange) {
            var oSelect = new Select({
                selectedKey: sSelectedKey,
                items: Object.keys(this._categoryTypeMap).map(function (sCategory) {
                    return new Item({ key: sCategory, text: sCategory });
                })
            });
            if (fnChange) {
                oSelect.attachChange(fnChange);
            }
            return oSelect;
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
                defaultSpan: "XL12 L12 M12 S12",
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
            var oAssetType = new Select({ selectedKey: "{assetDraft>/assetType}" });
            var fnUpdateTypeItems = function(sCat) {
                var aTypes = that._categoryTypeMap[sCat] || ["Other"];
                oAssetType.removeAllItems();
                aTypes.forEach(function(t) { oAssetType.addItem(new Item({ key: t, text: t })); });
            };
            fnUpdateTypeItems(oAsset.category);
            
            var oCategory = this._createCategorySelect("{assetDraft>/category}", function(oEvent) {
                var sCat = oEvent.getParameter("selectedItem").getKey();
                fnUpdateTypeItems(sCat);
                that.getView().getModel("assetDraft").setProperty("/assetType", (that._categoryTypeMap[sCat] || ["Other"])[0]);
            });
            var oSerialNumber = new Input({ value: "{assetDraft>/serialNumber}", placeholder: "Serial Number" });
            var oManufacturer = new Input({ value: "{assetDraft>/manufacturer}", placeholder: "Manufacturer" });
            var oModelName = new Input({ value: "{assetDraft>/model}", placeholder: "Model" });
            var oVendor = new Input({ value: "{assetDraft>/vendor}", placeholder: "Vendor" });
            var oPurchaseVendor = new Input({ value: "{assetDraft>/procurementVendor}", placeholder: "Procurement vendor" });
            var oPurchaseDate = new DatePicker({ value: "{assetDraft>/purchaseDate}", valueFormat: "yyyy-MM-dd", displayFormat: "medium", width: "100%" });
            var oCost = new Input({ value: "{assetDraft>/purchaseCost}", type: "Number", placeholder: "Purchase cost" });
            var oInvoiceNumber = new Input({ value: "{assetDraft>/invoiceNumber}", placeholder: "Invoice number" });
            var oWarrantyStartDate = new DatePicker({ value: "{assetDraft>/warrantyStartDate}", valueFormat: "yyyy-MM-dd", displayFormat: "medium", width: "100%" });
            var oWarrantyEndDate = new DatePicker({ value: "{assetDraft>/warrantyEndDate}", valueFormat: "yyyy-MM-dd", displayFormat: "medium", width: "100%" });
            var oLocation = this._createLocationSelect("{assetDraft>/location}");
            var oStorageLocation = new Input({ value: "{assetDraft>/storageLocation}", placeholder: "Storage location" });
            var fnCreateUploader = function (sProperty, sLabel) {
                return new VBox({
                    items: [
                        new FileUploader({
                            buttonText: "Browse...",
                            width: "100%",
                            change: function (oEvent) {
                                var aFiles = oEvent.getParameter("files") || [];
                                var oFile = aFiles[0];
                                that.getView().getModel("assetDraft").setProperty("/documents/" + sProperty, oFile ? {
                                    name: oFile.name,
                                    type: oFile.type,
                                    size: oFile.size
                                } : null);
                            }
                        }),
                        new Text({
                            text: {
                                path: "assetDraft>/documents/" + sProperty + "/name",
                                formatter: function (sName) {
                                    return sName || "No file selected";
                                }
                            }
                        })
                    ]
                });
            };

            var oPageAsset = new Page({
                showHeader: false,
                content: [new Title({ text: 'Asset Information', level: 'H3', class: 'sapUiSmallMargin' }), this._createFormGrid([
                    this._createFormField('Asset Tag', oTag),
                    this._createFormField('Asset Name', oName),
                    this._createFormField('Asset Category', oCategory),
                    this._createFormField('Asset Type', oAssetType),
                    this._createFormField('Serial Number', oSerialNumber),
                    this._createFormField('Manufacturer', oManufacturer),
                    this._createFormField('Model', oModelName),
                    this._createFormField('Vendor', oVendor)
                ])]
            });
            var oPageProcurement = new Page({
                showHeader: false,
                content: [new Title({ text: 'Procurement', level: 'H3', class: 'sapUiSmallMargin' }), this._createFormGrid([
                    this._createFormField('Purchase Date', oPurchaseDate),
                    this._createFormField('Purchase Cost', oCost),
                    this._createFormField('Invoice Number', oInvoiceNumber),
                    this._createFormField('Vendor', oPurchaseVendor)
                ])]
            });
            var oPageWarranty = new Page({
                showHeader: false,
                content: [new Title({ text: 'Warranty', level: 'H3', class: 'sapUiSmallMargin' }), this._createFormGrid([
                    this._createFormField('Warranty Start Date', oWarrantyStartDate),
                    this._createFormField('Warranty End Date', oWarrantyEndDate)
                ])]
            });
            var oPageLocation = new Page({
                showHeader: false,
                content: [new Title({ text: 'Location', level: 'H3', class: 'sapUiSmallMargin' }), this._createFormGrid([
                    this._createFormField('Location', oLocation),
                    this._createFormField('Storage Location', oStorageLocation)
                ])]
            });
            var oPageDocuments = new Page({
                showHeader: false,
                content: [new Title({ text: 'Documents', level: 'H3', class: 'sapUiSmallMargin' }), this._createFormGrid([
                    this._createFormField('Invoice', fnCreateUploader('invoice')),
                    this._createFormField('Warranty Certificate', fnCreateUploader('warrantyCertificate')),
                    this._createFormField('Asset Image', fnCreateUploader('assetImage'))
                ])]
            });
            var oPageReview = new Page({
                showHeader: false,
                content: [new VBox({
                    items: [
                        new Title({ text: 'Review & Save', level: 'H3', class: 'sapUiBottomMargin' }),
                        this._createFormGrid([
                            this._createFormField('Asset Tag', new Text({ text: '{assetDraft>/tag}' })),
                            this._createFormField('Asset Name', new Text({ text: '{assetDraft>/name}' })),
                            this._createFormField('Category', new Text({ text: '{assetDraft>/category}' })),
                            this._createFormField('Type', new Text({ text: '{assetDraft>/assetType}' })),
                            this._createFormField('Manufacturer', new Text({ text: '{assetDraft>/manufacturer}' })),
                            this._createFormField('Model', new Text({ text: '{assetDraft>/model}' })),
                            this._createFormField('Serial Number', new Text({ text: '{assetDraft>/serialNumber}' })),
                            this._createFormField('Vendor', new Text({ text: '{assetDraft>/vendor}' })),
                            this._createFormField('Purchase Date', new Text({ text: '{assetDraft>/purchaseDate}' })),
                            this._createFormField('Cost', new Text({ text: '{assetDraft>/purchaseCost} SAR' })),
                            this._createFormField('Location', new Text({ text: '{assetDraft>/location}' }))
                        ])
                    ],
                    class: 'sapUiSmallMargin'
                })]
            });

            var oNavContainer = new NavContainer({
                pages: [oPageAsset, oPageProcurement, oPageWarranty, oPageLocation, oPageDocuments, oPageReview],
                initialPage: oPageAsset
            });

            var oList = new List({
                mode: 'SingleSelectMaster', showSeparators: 'None',
                items: [
                    new StandardListItem({ title: 'Asset Information', icon: 'sap-icon://laptop' }),
                    new StandardListItem({ title: 'Procurement', icon: 'sap-icon://money-bills' }),
                    new StandardListItem({ title: 'Warranty', icon: 'sap-icon://shield' }),
                    new StandardListItem({ title: 'Location', icon: 'sap-icon://map' }),
                    new StandardListItem({ title: 'Documents', icon: 'sap-icon://document' }),
                    new StandardListItem({ title: 'Review', icon: 'sap-icon://accept' })
                ],
                selectionChange: function (oEvent) {
                    var iIndex = oList.indexOfItem(oEvent.getParameter('listItem'));
                    that._setAssetWizardStep(iIndex);
                }
            });
            oList.setSelectedItem(oList.getItems()[0]);

            var oPreviousButton = new Button({
                text: '← Previous',
                type: 'Transparent',
                press: this.onPreviousStep.bind(this)
            });
            var oNextButton = new Button({
                text: 'Next →',
                type: 'Emphasized',
                press: this.onNextStep.bind(this)
            });
            var oSaveButton = new Button({
                text: 'Save Asset',
                type: 'Emphasized',
                icon: 'sap-icon://save',
                press: this.onSaveAsset.bind(this)
            }).addStyleClass('sapUiTinyMarginBegin');
            var oCancelButton = new Button({
                text: 'Cancel',
                type: 'Transparent',
                press: this.onCancelAsset.bind(this)
            });
            var oStepButtons = new HBox({
                items: [
                    oPreviousButton,
                    oNextButton.addStyleClass('sapUiTinyMarginBegin'),
                    oSaveButton
                ]
            });
            var oFooter = new HBox({
                justifyContent: 'End',
                alignItems: 'Center',
                items: [oCancelButton, oStepButtons],
                class: 'sapUiMediumMarginTop assetWizardFooter'
            });

            this._assetWizardPages = oNavContainer.getPages();
            this._assetWizardNavContainer = oNavContainer;
            this._assetWizardList = oList;
            this._assetWizardFooter = oFooter;
            this._assetWizardButtons = {
                previous: oPreviousButton,
                next: oNextButton,
                save: oSaveButton,
                cancel: oCancelButton
            };
            this._assetWizardStepIndex = 0;
            this._setAssetWizardStep(0);

            var oSplitLayout = new HBox({
                height: '450px',
                items: [
                    new VBox({ width: '25%', items: [oList], class: 'sapUiSmallMarginEnd customWizardList' }),
                    new ScrollContainer({ vertical: true, horizontal: false, width: '75%', height: '100%', content: [oNavContainer], class: 'assetWizardFormCard' })
                ],
                class: 'assetWizardLayout'
            });

            this._assetDialog = new Dialog({
                title: 'Create Asset',
                contentWidth: '48rem',
                stretchOnPhone: true,
                content: [oSplitLayout, oFooter]
            });
            this._assetDialog.addStyleClass('assetWizardDialog');
            this.getView().addDependent(this._assetDialog);
            this._assetDialog.open();

        },
        _setAssetWizardStep: function (iIndex) {
            if (!this._assetWizardPages || !this._assetWizardList || !this._assetWizardButtons || !this._assetWizardFooter) {
                return;
            }

            var iLastStep = this._assetWizardPages.length - 1;
            this._assetWizardStepIndex = Math.max(0, Math.min(iIndex, iLastStep));
            this._assetWizardList.setSelectedItem(this._assetWizardList.getItems()[this._assetWizardStepIndex]);
            this._assetWizardButtons.previous.setVisible(this._assetWizardStepIndex > 0);
            this._assetWizardButtons.next.setVisible(this._assetWizardStepIndex < iLastStep);
            this._assetWizardButtons.save.setVisible(this._assetWizardStepIndex === iLastStep);
            this._assetWizardFooter.setJustifyContent(this._assetWizardStepIndex === 0 ? 'End' : 'SpaceBetween');
            this._assetWizardNavContainer.to(this._assetWizardPages[this._assetWizardStepIndex]);
        },
        onNextStep: function () {
            this._setAssetWizardStep(this._assetWizardStepIndex + 1);
        },
        onPreviousStep: function () {
            this._setAssetWizardStep(this._assetWizardStepIndex - 1);
        },
        _openAssetEditDialog: function (oAsset) {
            var that = this;
            var oAssetTypeSelect = new Select({ selectedKey: oAsset.assetType || "Laptop" });
            var fnUpdateTypeItems = function(sCat) {
                var aTypes = that._categoryTypeMap[sCat] || ["Other"];
                oAssetTypeSelect.removeAllItems();
                aTypes.forEach(function(t) { oAssetTypeSelect.addItem(new Item({ key: t, text: t })); });
            };
            fnUpdateTypeItems(oAsset.category);
            
            var oCategorySelect = this._createCategorySelect(oAsset.category, function(oEvent) {
                var sCat = oEvent.getParameter("selectedItem").getKey();
                fnUpdateTypeItems(sCat);
                oAssetTypeSelect.setSelectedKey((that._categoryTypeMap[sCat] || ["Other"])[0]);
            });

            this._assetFields = {
                tag: new Input({ value: oAsset.tag, editable: false }),
                name: new Input({ value: oAsset.name, placeholder: "Asset name" }),
                category: oCategorySelect,
                assetType: oAssetTypeSelect,
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
                assetType: oFields.assetType.getSelectedKey() || sCategory,
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
            if (this._editingAssetTag) {
                var oExistingAsset = this.getView().getModel("assets").getProperty("/items").find(function (oItem) {
                    return oItem.tag === this._editingAssetTag;
                }.bind(this));
                if (oExistingAsset) {
                    Object.keys(oExistingAsset).forEach(function (sProperty) {
                        if (!Object.prototype.hasOwnProperty.call(oAsset, sProperty)) {
                            oAsset[sProperty] = oExistingAsset[sProperty];
                        }
                    });
                }
            } else {
                oAsset.status = "Available";
                oAsset.cost = oAsset.purchaseCost;
                oAsset.warranty = oAsset.warrantyEndDate || "";
                oAsset.warrantyExpiry = oAsset.warrantyEndDate || "";
                oAsset.attachments = Object.keys(oAsset.documents || {}).map(function (sDocument) {
                    return oAsset.documents[sDocument] && oAsset.documents[sDocument].name;
                }).filter(Boolean).join(", ");
                oAsset.lifecycleRecord = "Lifecycle record created; status set to AVAILABLE";
            }
            oAsset.state = this._getStatusState(oAsset.status);
            oAsset.warrantyExpiry = oAsset.warrantyEndDate || oAsset.warranty || oAsset.warrantyExpiry;
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
            if (iIndex < 0) {
                var sResult = 
                    "Asset Tag      : " + oAsset.tag + "\n" +
                    "Asset Name     : " + oAsset.name + "\n" +
                    "Category       : " + oAsset.category + "\n" +
                    "Type           : " + oAsset.assetType + "\n" +
                    "Manufacturer   : " + (oAsset.manufacturer || "N/A") + "\n" +
                    "Model          : " + (oAsset.model || "N/A") + "\n" +
                    "Serial Number  : " + (oAsset.serialNumber || "N/A") + "\n" +
                    "Vendor         : " + (oAsset.vendor || "N/A") + "\n" +
                    "Purchase Date  : " + (oAsset.purchaseDate || "N/A") + "\n" +
                    "Cost           : " + (oAsset.cost ? oAsset.cost + " SAR" : "N/A") + "\n" +
                    "Location       : " + (oAsset.location || "N/A");
                MessageBox.success(sResult, {
                    title: "Asset Created Successfully",
                    styleClass: "sapUiSizeCompact"
                });
            } else {
                MessageToast.show("Asset updated.");
            }
        },
        onCancelAsset: function () {
            this._closeAssetDialog();
        },
        _closeAssetDialog: function () {
            var oDialog = this._assetDialog;
            this._assetDialog = null;
            this._assetWizard = null;
            this._assetWizardPages = null;
            this._assetWizardNavContainer = null;
            this._assetWizardList = null;
            this._assetWizardFooter = null;
            this._assetWizardButtons = null;
            this._assetWizardStepIndex = null;
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