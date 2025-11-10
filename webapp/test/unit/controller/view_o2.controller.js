/*global QUnit*/

sap.ui.define([
	"viewo2/controller/view_o2.controller"
], function (Controller) {
	"use strict";

	QUnit.module("view_o2 Controller");

	QUnit.test("I should test the view_o2 controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
