sap.ui.define([
    "sap/ui/model/type/Time",
    "sap/ui/core/format/DateFormat"
], function (Time, DateFormat) {
    "use strict";
    return {
        formatTableDate: function (oDate) {
            if (!oDate) {
                return "";
            }
            // Convert to JS Date if needed
            var date = new Date(oDate);
            // Format to DD.MM.YYYY (or whatever you prefer)
            var day = String(date.getDate()).padStart(2, "0");
            var month = String(date.getMonth() + 1).padStart(2, "0");
            var year = date.getFullYear();
            return day + "." + month + "." + year;
        },
        
        getCarrierLogo: function (sCarrid) {
            console.log("getCarrierLogo called with:", sCarrid);
            switch (sCarrid) {
                case "LH": 
                    return "/img/lufthansa.png";
                case "AB": 
                    return "/img/Logo_airberlin.svg.png";
                case "AL": 
                    return "/img/airalbania.png";
                default:
                    return "/img/default_logo.png";
            }
        }
    };
});
