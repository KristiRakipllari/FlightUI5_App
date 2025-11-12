sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "viewo2/formatter/Formatter",
    "sap/m/MessageToast"
], function (Controller, History, JSONModel, Formatter, MessageToast) {
    "use strict";
    
    return Controller.extend("viewo2.controller.Detail", {
        formatter: Formatter,
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
                oRouter.navTo("RouteMain", {}, true);
            }
        },

        onGenerateUrl: function () {
            var that = this;
            var oFlightModel = this.getView().getModel("flightDataModel");
            var oData = oFlightModel.getData();

            // If Exists?
            if (oData.Url && oData.Url.trim() !== "") {
                MessageToast.show("URL already exists: " + oData.Url);
                return;
            }

            // Get carrier name and generate URL
            var sCarrname = oData.Carrname || "";
            if (!sCarrname) {
                MessageToast.show("Carrier name is missing, cannot generate URL");
                return;
            }

            var sCleanName = sCarrname.replace(/\s+/g, "").toLowerCase();
            var sGeneratedUrl = "https://www." + sCleanName + ".com";

            // Get OData model and save to database
            var oDataModel = this.getOwnerComponent().getModel();
            var sCarrid = oData.Carrid;
            var sPath = "/ZC_FLIGHT_BOOTCAMP(Carrid='" + sCarrid + "',IsActiveEntity=true)";

            // Update the database
            oDataModel.update(sPath, {
                Url: sGeneratedUrl
            }, {
                success: function() {
                    // Update the local model
                    oData.Url = sGeneratedUrl;
                    oFlightModel.setData(oData);

                    MessageToast.show("URL generated and saved: " + sGeneratedUrl);
                },
                error: function(oError) {
                    console.error("Error saving URL:", oError);
                    MessageToast.show("Error: Could not save URL to database");
                }
            });
        },

        onOpenUrl: function () {
            var oFlightModel = this.getView().getModel("flightDataModel");
            var oData = oFlightModel.getData();

            if (!oData.Url || oData.Url.trim() === "") {
                MessageToast.show("No URL available for this Airline");
                return;
            }
            window.open(oData.Url, "_blank");
        }

    });
});
