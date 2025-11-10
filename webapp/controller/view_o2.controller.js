sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("viewo2.controller.view_o2", {

        onInit: function () {
            var that = this;
            var oDataModel = this.getOwnerComponent().getModel();

            // Read data from OData service
            oDataModel.read("/ZC_FLIGHT_BOOTCAMP", {
                urlParameters: {
                    "$orderby": "Carrid asc"
                },
                success: function(oData) {
                    console.log("Data loaded successfully:", oData);
                    var oFlightModel = new JSONModel(oData.results);
                    that.getOwnerComponent().setModel(oFlightModel, "flightDataModel");
                },
                error: function(oError) {
                    console.error("Error loading data:", oError);
                }
            });
        },

        onItemPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext("flightDataModel");
            var sCarrid = oContext.getProperty("Carrid");

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("Detail", {
                Carrid: sCarrid
            });
        }

    });
});
