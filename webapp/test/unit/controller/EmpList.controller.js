/*global QUnit*/

sap.ui.define([
	"empproj/controller/EmpList.controller"
], function (Controller) {
	"use strict";

	QUnit.module("EmpList Controller");

	QUnit.test("I should test the EmpList controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
