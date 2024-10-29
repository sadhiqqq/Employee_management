sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
], function (Controller, ODataModel, MessageToast,  Fragment) {

    "use strict";

    return Controller.extend("empproj.controller.OData", {

        onInit: function () {
            var ODataURL = "/northwind/northwind.svc/";
            var oModel = new ODataModel(ODataURL);
            this.getView().setModel(oModel, 'connectModel');
        },
        onCreatePress: function() {
            if (!this._oDialog) {
                Fragment.load({
                    name: "empproj.view.CreateOData",  
                    controller: this
                }).then(function(oDialog) {
                    this._oDialog = oDialog;
                    this.getView().addDependent(this._oDialog);
                    this._oDialog.open();
                }.bind(this));
            } else {
                this._oDialog.open();
            }
        },

        onCancelPress: function() {
            if (this._oDialog) {
                this._clearInputs();
                this._oDialog.close();
            }
        },

        _clearInputs: function() {
            var firstNameInput = sap.ui.getCore().byId("firstNameInput");
            var lastNameInput = sap.ui.getCore().byId("lastNameInput");
            
            if (firstNameInput) firstNameInput.setValue("");
            if (lastNameInput) lastNameInput.setValue("");
        },

        onSubmit: function() {
            var firstName = sap.ui.getCore().byId("firstNameInput").getValue();
            var lastName = sap.ui.getCore().byId("lastNameInput").getValue();
            
            if (!firstName || !lastName) {
                MessageToast.show("Please enter both First Name and Last Name.");
                return;
            }
            
            var newEmployee = {
                FirstName: firstName,
                LastName: lastName
            };
            
            var oModel = this.getView().getModel('connectModel');
            
            // Trigger the OData Create operation
            oModel.create("/Employees", newEmployee, {
                success: function() {
                    MessageToast.show("Employee added successfully!");
                    this._clearInputs();
                    this._oDialog.close();
                    oModel.refresh();
                }.bind(this),
                error: function(oError) {
                    MessageToast.show("Error while adding employee.");
                }
            });
        }
        
    });
});
