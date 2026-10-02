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
                    { tag: "AST0001", name: "Dell Latitude 5540", category: "Laptop", user: "Ahmed", location: "Dammam", status: "Assigned", state: "Information", serialNumber: "DL5540-240118", purchaseDate: "18 Jan 2025", warrantyExpiry: "18 Jan 2028", assignmentHistory: [{ date: "12 Feb 2025", employee: "Ahmed", action: "Assigned" }, { date: "18 Jan 2025", employee: "IT Room", action: "Received" }], maintenanceHistory: [{ date: "03 Mar 2026", vendor: "TechSource", remarks: "Annual health check completed" }] },
                    { tag: "AST0002", name: "HP LaserJet Pro", category: "Printer", user: "IT Room", location: "Dammam", status: "Available", state: "Success", serialNumber: "HPLJ-8842", purchaseDate: "04 Jun 2024", warrantyExpiry: "04 Jun 2027", assignmentHistory: [{ date: "04 Jun 2024", employee: "IT Room", action: "Received" }], maintenanceHistory: [] },
                    { tag: "AST0003", name: "Lenovo ThinkPad T14", category: "Laptop", user: "Vijayan", location: "Riyadh", status: "Assigned", state: "Information", serialNumber: "LNT14-031624", purchaseDate: "16 Mar 2024", warrantyExpiry: "16 Mar 2027", assignmentHistory: [{ date: "18 Mar 2024", employee: "Vijayan", action: "Assigned" }], maintenanceHistory: [] },
                    { tag: "AST0004", name: "Cisco 8841", category: "IP Phone", user: "IT Room", location: "Jeddah", status: "Available", state: "Success", serialNumber: "CS8841-77021", purchaseDate: "09 Nov 2023", warrantyExpiry: "09 Nov 2026", assignmentHistory: [{ date: "09 Nov 2023", employee: "IT Room", action: "Received" }], maintenanceHistory: [] }
                ],
                selectedAsset: {}
            }), "assets");
            // create the views based on the url/hash
            this.getRouter().initialize();
        }
    });
});
