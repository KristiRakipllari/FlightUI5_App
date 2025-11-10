sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"
], function (Controller, History, JSONModel) {
    "use strict";

    return Controller.extend("viewo2.controller.Detail", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Detail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var that = this;
            var sCarrid = oEvent.getParameter("arguments").Carrid;
            var oDataModel = this.getOwnerComponent().getModel();
            var oFlightModel = this.getOwnerComponent().getModel("flightDataModel");

            // Set the header data from the main flight model
            if (oFlightModel) {
                var aFlights = oFlightModel.getData();
                var oSelectedFlight = null;

                if (Array.isArray(aFlights)) {
                    oSelectedFlight = aFlights.find(function(flight) {
                        return flight.Carrid === sCarrid;
                    });
                }

                if (oSelectedFlight) {
                    var oDetailHeaderModel = new JSONModel(oSelectedFlight);
                    this.getView().setModel(oDetailHeaderModel, "flightDataModel");
                }
            }

            // Load flight details from OData
            oDataModel.read("/ZC_FLIGHT_BOOTCAMP(Carrid='" + sCarrid + "',IsActiveEntity=true)/to_detailsKR", {
                success: function(oData) {
                    var oDetailsModel = new JSONModel(oData.results);
                    that.getView().setModel(oDetailsModel, "flightDetailsModel");
                },
                error: function(oError) {
                    console.error("Error loading flight details:", oError);
                }
            });
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Routeview_o2", {}, true);
            }
        }

    });
});
