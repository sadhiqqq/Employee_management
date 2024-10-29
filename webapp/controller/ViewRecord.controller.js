sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/core/Fragment",
    "sap/ui/core/UIComponent",
    'sap/m/MessageBox',
    "sap/ui/core/format/DateFormat"

], function (Controller, History, JSONModel, MessageToast, DateFormat) {
    "use strict";

    return Controller.extend("empproj.controller.ViewRecord", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("ViewRecord").attachPatternMatched(this.MatchingRoutes, this);
            this.enableProperties(false);
        },

        MatchingRoutes: function (oEvent) {
            var empId = oEvent.getParameter("arguments").empId;
            this.viewBind(empId);
        },

        viewBind: function (empId) {
            var oModel = this.getView().getModel("employees");

            if (!oModel) {
                console.error("Employees model is not available.");
                return;
            }

            var employees = oModel.getProperty("/Employees");

            if (!employees) {
                console.error("Employees data is not available.");
                return;
            }

            var selectedEmployee = employees.find(emp => emp.ID === empId);
            if (selectedEmployee) {
                console.log(selectedEmployee, 'Selected Employee Data'); // Check if ROLE is available
                console.log(selectedEmployee.ROLE, 'Selected Employee Role'); // Check if role data exists
        
                this.originalEmpId = empId; // Store the original employee ID for later use
                this.getView().bindElement({
                    path: "/Employees/" + employees.indexOf(selectedEmployee),
                    model: "employees"
                });
            }
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteEmpList", {}, true);
            }
        },

        onSwitchOnOffToggle: function (oEvent) {
            var bState = oEvent.getParameter("state");
            this.enableProperties(bState);
        },

        resetToggle: function () {
            var oSwitch = this.byId("switchOnOff");
            if (oSwitch) {
                oSwitch.setState(false);
            }
        },

        enableProperties: function (isEnabled) {
            this.byId('emp_Name').setEnabled(isEnabled);
            this.byId('emp_Gender').setEnabled(isEnabled);
            this.byId('emp_Role').setEnabled(isEnabled);
            this.byId('emp_DOB').setEnabled(isEnabled);
            this.byId('emp_DOJ').setEnabled(isEnabled);
        },
        
        onSavingInfo: function () {
            var updatedEmpName = this.byId('emp_Name').getValue();
            var updatedEmpGender = this.byId('emp_Gender').getSelectedKey();
            var updatedEmpRole = this.byId('emp_Role').getSelectedKey();
            var updatedEmpDOB = this.byId('emp_DOB').getDateValue();
            var updatedEmpDOJ = this.byId('emp_DOJ').getDateValue();
            console.log('Gender Details are: ',updatedEmpGender)
            console.log('Role Details are: ',updatedEmpRole)
            function formatDate(date) {
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const day = date.getDate();
                const monthIndex = date.getMonth();
                const year = date.getFullYear();
                
                function getOrdinalSuffix(day) {
                    if (day > 3 && day < 21) return 'th';
                    switch (d % 10) {
                        case 1:  return "st";
                        case 2:  return "nd";
                        case 3:  return "rd";
                        default: return "th";
                    }
                }

                return `${months[monthIndex]} ${day}${getOrdinalSuffix(day)} ${year}`;
            }

            var empModel = this.getView().getModel("employees");
            var employees = empModel.getProperty("/Employees");
            console.log(employees, 'employees dataaaaaaa');

            var employeeIndex = employees.findIndex(emp => emp.ID === this.originalEmpId);
            if (employeeIndex !== -1) {
                employees[employeeIndex].NAME = updatedEmpName;
                employees[employeeIndex].GENDER = updatedEmpGender;
                employees[employeeIndex].ROLE = updatedEmpRole;
                employees[employeeIndex].DOB = formatDate(updatedEmpDOB);
                employees[employeeIndex].DateOfJoining = formatDate(updatedEmpDOJ);
                if (this._imageData) {
                    employees[employeeIndex].IMAGE = this._imageData;
                }
                empModel.setProperty("/Employees", employees);
                localStorage.setItem("employees", JSON.stringify({ Employees: employees }));
                empModel.refresh(true);
                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("employeeChannel", "employeeUpdated", {
                    employeeId: this.originalEmpId
                });

                MessageToast.show('Employee updated successfully');

                this.cancelInfo();
            } else {
                MessageToast.show('Employee not found');
            }
        },

        onUpdate: function () {
            var updateButton = this.byId("updateView");
            var buttonText = updateButton.getText();

            if (buttonText === "Update") {
                // this.enableProperties(true);
                updateButton.setText("Save");
            } else if (buttonText === "Save") {
                console.log('Saveeeeeeeeeeeeeeeeeeee')
                this.onSavingInfo();
                this.enableProperties(false);
                updateButton.setText("Update");
            }
        },

        cancelInfo: function () {
            this.enableProperties(false);
            this.onNavBack();
            this.resetToggle();
        }
    });
});
