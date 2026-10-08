const fs = require('fs');
let content = fs.readFileSync('webapp/controller/Assets.controller.js', 'utf8');

const replacement = `
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
                mode: 'SingleSelectMaster',
                items: [
                    new StandardListItem({ title: 'Asset Details', icon: 'sap-icon://product' }),
                    new StandardListItem({ title: 'Purchase', icon: 'sap-icon://cart' }),
                    new StandardListItem({ title: 'Warranty', icon: 'sap-icon://shield' }),
                    new StandardListItem({ title: 'Location', icon: 'sap-icon://map' }),
                    new StandardListItem({ title: 'Documents', icon: 'sap-icon://document' }),
                    new StandardListItem({ title: 'Review', icon: 'sap-icon://sys-enter-2' })
                ],
                selectionChange: function (oEvent) {
                    var iIndex = oList.indexOfItem(oEvent.getParameter('listItem'));
                    oNavContainer.to(oNavContainer.getPages()[iIndex]);
                }
            });
            oList.setSelectedItem(oList.getItems()[0]);

            var oSplitLayout = new HBox({
                height: '450px',
                items: [
                    new VBox({ width: '25%', items: [oList], class: 'sapUiSmallMarginEnd customWizardList' }),
                    new ScrollContainer({ vertical: true, horizontal: false, width: '75%', height: '100%', content: [oNavContainer] })
                ]
            });

            this._assetDialog = new Dialog({
                title: 'Create Asset',
                contentWidth: '60rem',
                stretchOnPhone: true,
                content: [oSplitLayout],
                beginButton: new Button({ text: 'Cancel', press: this.onCancelAsset.bind(this) }),
                endButton: new Button({ text: 'Save Asset', type: 'Emphasized', press: this.onSaveAsset.bind(this) })
            });
            this.getView().addDependent(this._assetDialog);
            this._assetDialog.open();
`;

const startStr = '            var oStepAsset = new WizardStep({';
const endStr = '            this._assetDialog.open();';

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr) + endStr.length;

if (startIdx > -1 && endIdx > -1) {
    content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
    
    // Add missing required imports if not present
    if (!content.includes('"sap/m/Page"')) {
        content = content.replace('sap.ui.define([\n', 'sap.ui.define([\n    "sap/m/Page",\n    "sap/m/NavContainer",\n    "sap/m/StandardListItem",\n    "sap/m/List",\n    "sap/m/ScrollContainer",\n');
        content = content.replace('], function (Controller,', '], function (Page, NavContainer, StandardListItem, List, ScrollContainer, Controller,');
    }

    fs.writeFileSync('webapp/controller/Assets.controller.js', content);
    console.log('Successfully replaced asset wizard logic.');
} else {
    console.log('Could not find start or end block.');
}
