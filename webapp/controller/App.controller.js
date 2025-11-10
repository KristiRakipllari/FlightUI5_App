sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], function (Controller, Fragment, MessageToast) {
    "use strict";

    return Controller.extend("viewo2.controller.App", {

        onInit: function () {
            // The table binds automatically to the default OData model (mainService)
            // Verify the entity path (/ZC_FLIGHT_BOOTCAMP) matches your backend metadata
        },

        onItemPress: function (oEvent) {
            var oView = this.getView();
            var oContext = oEvent.getSource().getBindingContext();

            if (!this._pDialog) {
                this._pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "viewo2.fragments.AirlineDialog", // adjust if your fragment is named differently
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pDialog.then(function (oDialog) {
                oDialog.bindElement(oContext.getPath());
                oDialog.open();
            });
        },

        onCloseDialog: function () {
            this.byId("airlineDialog").close();
        }

    });
});
