sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast,MessageBox) {
    "use strict";

    return Controller.extend("viewo2.controller.Main", {

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
        },
        onPress: function () {
            if (!this.oDialog) {
                this.loadFragment({
                    name: "viewo2.fragment.createAirline",
                }).then(
                    function (oDialog) {
                        this.oDialog = oDialog;
                        this.oDialog.open();
                    }.bind(this)
                );
            } else {
                this.oDialog.open();
            }
        },
        onCancelRecord: function (){
           this.oDialog.close();
        },
        onCreateNewRecord: function () {
            var sCarrid = this.getView().byId("carrIDInput").getValue();
            var sCarrname = this.getView().byId("carrNameInput").getValue();
            var sCurrcode = this.getView().byId("currCodeInput").getValue();
            var sUrl = this.getView().byId("URLInput").getValue();
            
            if (!sCarrid) {
                MessageToast.show("The CarrId should not be empty");
                return;
            }
            if (!sCarrname) {
                MessageToast.show("The Carrier Name should not be empty");
                return;
            }
            if (!sCurrcode) {
                MessageToast.show("The Currency Code should not be empty");
                return;
            }
            
            var addparam = {
                Carrid: sCarrid,
                Carrname: sCarrname,
                Currcode: sCurrcode,
                Url: sUrl
            };


            var that = this;
            var oDataModel = this.getOwnerComponent().getModel();
            this.oDialog.setBusy(true);
            oDataModel.callFunction("/create_action", {
                method: "POST",
                urlParameters: addparam,
                success: function (oResponse) {
                    that.oDialog.close();
                    //set  dialog busy false
                    that.oDialog.setBusy(false);
                    //update your model
                    that.readFlight(that);
                    MessageToast.show("Airline created successfuly");
                    
                    console.log("Record created successfully:", oResponse);
                },
                error: function (oError) {
                    that.oDialog.setBusy(false);
                    

                    var sErrorMsg = "There was an error creating the airline";
                    try {
                        var oErrorResponse = JSON.parse(oError.responseText);
                        if (oErrorResponse.error && oErrorResponse.error.message) {
                            sErrorMsg = oErrorResponse.error.message.value || sErrorMsg;
                        }
                    } catch (e) {
                        console.error("Error parsing error response:", e);
                    }
                    
                    MessageBox.error(sErrorMsg);
                    console.error("Error creating record:", oError);
                }
            });
        },

        readFlight: function (that) {
            var oFlightModel = that.getView().getModel("flightDataModel");
            var oDataModel = that.getOwnerComponent().getModel();

            oDataModel.read("/ZC_FLIGHT_BOOTCAMP", {
                urlParameters: {
                    "$orderby": "Carrid asc"
                },
                success: function (oResponse) {
                    console.log("Flight data refreshed:", oResponse);
                    oFlightModel.setData(oResponse.results);
                    MessageToast.show("Flight data refreshed");
                },
                error: function (oError) {
                    console.error("Error refreshing flight data:", oError);
                    MessageToast.show("Error refreshing flight data");
                }
            });
        },

        onUpdatePress: function() {
            var oTable = this.getView().byId("airlineTable");
            const oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageBox.warning("Please select an airline to update");
                return;
            }

            // Get the selected data
            var oContext = oSelectedItem.getBindingContext("flightDataModel");
            var oSelectedData = oContext.getObject();

            var oUpdateModel = new sap.ui.model.json.JSONModel(oSelectedData);
            this.getView().setModel(oUpdateModel, "updateModel");

            if (!this.oUpdateDialog) {
                this.loadFragment({
                    name: "viewo2.fragment.updateAirline"
                }).then(
                    function (oDialog) {
                        this.oUpdateDialog = oDialog;
                        this.oUpdateDialog.open();
                    }.bind(this)
                );
            } else {
                this.oUpdateDialog.open();
            }
        },

        onUpdateRecord: function() {
            var sCarrid = this.getView().byId("carrIDUpdate").getValue();
            var sCarrname = this.getView().byId("carrNameUpdate").getValue();
            var sCurrcode = this.getView().byId("currCodeUpdate").getValue();
            var sUrl = this.getView().byId("URLUpdate").getValue();
            
            // Required Fields
            if (!sCarrid || !sCarrname || !sCurrcode) {
                MessageToast.show("Please fill all required fields");
                return;
            }
            
            var mParams = {
                Carrid: sCarrid,
                Carrname: sCarrname,
                Currcode: sCurrcode,
                Url: sUrl
            };
            
            var that = this;
            var oDataModel = this.getOwnerComponent().getModel();
            
            this.oUpdateDialog.setBusy(true);
            
            oDataModel.callFunction("/update_flight", {
                method: "POST",
                urlParameters: mParams,
                success: function (oData, response) {
                    that.oUpdateDialog.close();
                    // Remove busy state
                    that.oUpdateDialog.setBusy(false);
                    that.readFlight(that);
                    MessageToast.show("The Airline Updated Successfully");
                },
                error: function (oError) {
                    that.oUpdateDialog.setBusy(false);
                    MessageToast.show("An error occurred while updating");
                    that.oUpdateDialog.close();
                }
            });
        },
        
        onCancelUpdate: function (){
           this.oUpdateDialog.close();
        },

        onDeleteItem: function(oEvent) {
            //Getting the data that was selected
            var oButton = oEvent.getSource();
            var oItem = oButton.getParent();
            var oContext = oItem.getBindingContext("flightDataModel");
            var oDeletedData = oContext.getObject();

            var that = this;

            MessageBox.confirm(
                "Are you sure you want to delete airline '" + oDeletedData.Carrname + "' (" + oDeletedData.Carrid + ")?",
                {
                    title: "Delete Airline",
                    onClose: function(oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            // If yes
                            var oDataModel = that.getOwnerComponent().getModel();
                            var sPath = "/ZC_FLIGHT_BOOTCAMP(Carrid='" + oDeletedData.Carrid + "',IsActiveEntity=true)";

                            // Del operation
                            oDataModel.remove(sPath, {
                                success: function() {
                                    MessageToast.show("Airline deleted successfully");
                                    that.readFlight(that);
                                },
                                error: function() {
                                    MessageToast.show("Error deleting airline");
                                }
                            });
                        }
                    }
                }
            );
        }
    });
});
