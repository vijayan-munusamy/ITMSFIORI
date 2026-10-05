sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
    "use strict";
    return UIComponent.extend("itsm.fiori.Component", {
        metadata: {
            manifest: "json"
        },
        init: function () {
            // call the init function of the parent
            UIComponent.prototype.init.apply(this, arguments);
            this.setModel(new JSONModel({
                items: [
                    { tag: "AST0001", name: "Dell Latitude 5540", category: "Laptop", assetType: "Laptop", manufacturer: "Dell", model: "Latitude 5540", user: "Ahmed", location: "Dammam", department: "IT", status: "Assigned", state: "Information", serialNumber: "DL5540-240118", purchaseDate: "18 Jan 2025", cost: "4250 SAR", purchaseCost: 4250, vendor: "Al Mizan Tech", warranty: "36 Months", attachments: "PO-2025-018", assetUuid: "ASSET-79F1-001", assetCode: "AST-0001", qrCode: "QR-AST0001", auditRecord: "Audit record created on 18 Jan 2025", lifecycleRecord: "Available on receipt; assigned to Ahmed", acknowledgementStatus: "Pending Acknowledgement", warrantyExpiry: "18 Jan 2028", assignmentHistory: [{ date: "12 Feb 2025", employee: "Ahmed", action: "Assigned" }, { date: "18 Jan 2025", employee: "IT Room", action: "Received" }], maintenanceHistory: [{ date: "03 Mar 2026", vendor: "TechSource", remarks: "Annual health check completed" }] },
                    { tag: "AST0002", name: "HP LaserJet Pro", category: "Printer", assetType: "Printer", user: "IT Room", location: "Dammam", department: "Operations", status: "Available", state: "Success", serialNumber: "HPLJ-8842", purchaseDate: "04 Jun 2024", cost: "SAR 1,850", vendor: "Epsilon Supplies", warranty: "24 Months", attachments: "Invoice HP-441", assetUuid: "ASSET-90A2-002", assetCode: "AST-0002", qrCode: "QR-AST0002", auditRecord: "Audit record created on 04 Jun 2024", lifecycleRecord: "Available in inventory", acknowledgementStatus: "None", warrantyExpiry: "04 Jun 2027", assignmentHistory: [{ date: "04 Jun 2024", employee: "IT Room", action: "Received" }], maintenanceHistory: [] },
                    { tag: "AST0003", name: "Lenovo ThinkPad T14", category: "Laptop", assetType: "Laptop", user: "Vijayan", location: "Riyadh", department: "Finance", status: "Assigned", state: "Information", serialNumber: "LNT14-031624", purchaseDate: "16 Mar 2024", cost: "SAR 5,100", vendor: "BlueStone", warranty: "36 Months", attachments: "Warranties-2024", assetUuid: "ASSET-4FA5-003", assetCode: "AST-0003", qrCode: "QR-AST0003", auditRecord: "Audit record created on 16 Mar 2024", lifecycleRecord: "Assigned to Vijayan; in use", acknowledgementStatus: "Pending Acknowledgement", warrantyExpiry: "16 Mar 2027", assignmentHistory: [{ date: "18 Mar 2024", employee: "Vijayan", action: "Assigned" }], maintenanceHistory: [] },
                    { tag: "AST0004", name: "Cisco 8841", category: "IP Phone", assetType: "IP Phone", user: "IT Room", location: "Jeddah", department: "IT", status: "Available", state: "Success", serialNumber: "CS8841-77021", purchaseDate: "09 Nov 2023", cost: "SAR 980", vendor: "Cisco Saudi", warranty: "24 Months", attachments: "Cisco-8841-PO", assetUuid: "ASSET-BA30-004", assetCode: "AST-0004", qrCode: "QR-AST0004", auditRecord: "Audit record created on 09 Nov 2023", lifecycleRecord: "Available in inventory", acknowledgementStatus: "None", warrantyExpiry: "09 Nov 2026", assignmentHistory: [{ date: "09 Nov 2023", employee: "IT Room", action: "Received" }], maintenanceHistory: [] }
                ],
                selectedAsset: {}
            }), "assets");
            this.setModel(new JSONModel({
                items: [
                    { id: "EMP0001", name: "Ahmed Al-Salem", department: "IT", location: "Dammam", email: "ahmed.alsalem@example.com", status: "Active", state: "Success" },
                    { id: "EMP0002", name: "Vijayan Kumar", department: "IT", location: "Riyadh", email: "vijayan.kumar@example.com", status: "Active", state: "Success" },
                    { id: "EMP0003", name: "Sara Hassan", department: "Finance", location: "Jeddah", email: "sara.hassan@example.com", status: "Active", state: "Success" },
                    { id: "EMP0004", name: "Ali Mansour", department: "Operations", location: "Dammam", email: "ali.mansour@example.com", status: "Inactive", state: "None" }
                ]
            }), "employees");
            // create the views based on the url/hash
            this.getRouter().initialize();
        }
    });
});
