sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/core/Fragment",
    "sap/ui/core/UIComponent",
    'sap/m/MessageBox'

], function (Controller, JSONModel, MessageToast, Dialog, Button, Text, Fragment, UIComponent, MessageBox) {

    'use strict';

    return Controller.extend("empproj.controller.EmpList", {

        onInit: function () {
            var employeesData = JSON.parse(localStorage.getItem("employees")) || { Employees: [] };
            this.originalEmployeeData = employeesData.Employees;

            // Pagination variables
            this.currentPage = 1;
            this.pageSize = 10;
            this.totalPages = Math.ceil(this.originalEmployeeData.length / this.pageSize);

            console.log(this.totalPages, 'Total Pages =>')

            var empModel = this.getView().getModel("employees");
            console.log(empModel, 'Employees');

            if (!empModel) {
                empModel = new JSONModel({ Employees: [] });
                this.getView().setModel(empModel, "employees");
            }
            empModel.setProperty("/Employees", this.originalEmployeeData);
            console.log(empModel, 'Employees');


            var navModel = new JSONModel({
                firstPageBtnEnable: this.currentPage > 1,
                nextPageBtnEnable: this.currentPage < this.totalPages,
                page: this.currentPage,
                totalPages: this.totalPages
            });
            console.log(navModel, 'Pagination');

            this.getView().setModel(navModel, "NavModel");

            this.loadPaginatedData();
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.subscribe("employeeChannel", "employeeUpdated", this.onEmployeeUpdated, this);
        },

        onEmployeeUpdated: function (sChannel, sEvent, oData) {
            var employeesData = JSON.parse(localStorage.getItem("employees")) || { Employees: [] };
            this.originalEmployeeData = employeesData.Employees;
            var empModel = this.getView().getModel("employees");
            empModel.setProperty("/Employees", this.originalEmployeeData);

            this.loadPaginatedData();
        },

        createPaginationButtons: function () {
            var paginationContainer = this.byId("paginationButtons");
            paginationContainer.removeAllItems();

            for (var i = 1; i <= this.totalPages; i++) {
                var pageButton = new sap.m.Button({
                    text: i.toString(),
                    press: this.onPagePress.bind(this, i)
                });
                console.log(pageButton, 'pageButtonss')
                if (i === this.currentPage) {
                    pageButton.setType("Emphasized");
                }

                paginationContainer.addItem(pageButton);
            }
        },

        onPagePress: function (pageNumber) {
            this.currentPage = pageNumber;
            this.loadPaginatedData(); // Load the data for the selected page
        },

        createPaginationDropdown: function () {
            var paginationDropdown = this.byId('paginationDropdown' && 'paginationDropdown1');
            paginationDropdown.removeAllItems();

            var selectDropdown = new sap.m.Select({
                change: this.pageSelect.bind(this)
            })
            for (var i = 1; i <= this.totalPages; i++) {
                var dropDownItems = new sap.ui.core.Item({
                    key: i.toString(),
                    text: `Page ${i}`
                });
                console.log(dropDownItems, 'dropDownItemss')
                selectDropdown.addItem(dropDownItems);
            }

            selectDropdown.setSelectedKey(this.currentPage.toString());
            paginationDropdown.addItem(selectDropdown);

        },

        pageSelect: function (oEvent) {
            var selectedPage = oEvent.getParameter("selectedItem").getKey();
            this.currentPage = parseInt(selectedPage, 10);

            this.loadPaginatedData();
        },

        loadPaginatedData: function () {
            var startIndex = (this.currentPage - 1) * this.pageSize;
            console.log(startIndex, 'Startingg')
            var endIndex = startIndex + this.pageSize;
            console.log(endIndex, 'Endingg')

            var paginatedEmployees = this.originalEmployeeData.slice(startIndex, endIndex);
            console.log(paginatedEmployees, 'Paginated Employees')

            paginatedEmployees.forEach(employee => {
                employee.isSelected = false;
            });

            var empModel = this.getView().getModel("employees");
            console.log(empModel, 'Emploeees in loadFunction')
            empModel.setProperty("/Employees", paginatedEmployees);
            this.updateNavButtons();
            this.createPaginationButtons();
            this.createPaginationDropdown();
        },

        updateNavButtons: function () {
            var navModel = this.getView().getModel("NavModel");
            navModel.setProperty("/firstPageBtnEnable", this.currentPage > 1);
            navModel.setProperty("/nextPageBtnEnable", this.currentPage < this.totalPages);
            navModel.setProperty("/page", this.currentPage);
            navModel.setProperty("/totalPages", this.totalPages);
        },

        onFirstPress: function () {
            this.currentPage = 1;
            this.loadPaginatedData();
        },

        onPreviousPress: function () {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadPaginatedData();
            }
        },

        onNextPress: function () {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.loadPaginatedData();
            }
        },

        onLastPress: function () {
            this.currentPage = this.totalPages;
            this.loadPaginatedData();
        },

        onNextPage: function () {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.loadPaginatedData();
            } else {
                MessageToast.show("You are already on the last page.");
            }
        },

        onPreviousPage: function () {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadPaginatedData();
            } else {
                MessageToast.show("You are already on the first page.");
            }
        },

        onAddEmployee: function () {
            if (!this.oDialog) {
                Fragment.load({
                    id: this.getView().getId('addEmpDialog'),
                    name: 'empproj.view.AddEmp',
                    controller: this
                }).then(function (oDialog) {
                    this.oDialog = oDialog;
                    this.getView().addDependent(oDialog);
                    this.clearFields();
                    oDialog.open();
                }.bind(this));
            } else {
                this.clearFields();
                this.oDialog.open();
            }
        },

        onSubmit: function () {
            var empId = this.byId('empId').getValue();
            var empName = this.byId('empName').getValue();
            var empGender = this.byId('empGender').getSelectedKey();
            var empRole = this.byId('empRole').getSelectedKey();
            var empDOB = this.byId('empDOB').getDateValue();
            var empDOJ = this.byId('empDOJ').getDateValue();

            if (!empId || !empName || !empGender || !empRole || !empDOB || !empDOJ) {
                MessageToast.show('Please fill in all required fields before submitting.');
                return;
            }

            if (!this._imageData) {
                MessageToast.show('Please upload an employee image.');
                return;
            }
            var formattedDOB = this.formatDate(empDOB);
            var formattedDOJ = this.formatDate(empDOJ);

            var empModel = this.getView().getModel("employees");
            var employees = empModel.getProperty("/Employees");

            var existEmp = employees.find(emp => emp.ID === 'VSPL0' + empId);
            if (existEmp) {
                MessageToast.show('Employee ID already exists. Please enter a unique ID.');
                return;
            }

            // Create a new employee object
            var newEmployee = {
                ID: 'VSPL0' + empId,
                NAME: empName,
                IMAGE: this._imageData,
                GENDER: empGender,
                ROLE: empRole,
                DOB: formattedDOB,
                DateOfJoining: formattedDOJ
            };

            employees.push(newEmployee);
            console.log(newEmployee, 'New Dataaaa');
            empModel.setProperty("/Employees", employees);
            this.originalEmployeeData.push(newEmployee);
            localStorage.setItem("employees", JSON.stringify({ Employees: employees }));
            this._imageData = null;
            this.byId('addEmpDialog').close();
            MessageToast.show('Employee Added Successfully');
        },

        onCloseDialog: function () {
            if (this.oDialog) {
                this.oDialog.close();
                this.clearFields();
            }
            if (this.oReadEmpDialog) {
                this.enableProperties(false);
                this.oReadEmpDialog.close();
                this.resetSwitchState();
            }
        },

        onViewInfo: function (oEvent) {
            var oSelectedItem = oEvent.getSource().getParent();
            var oContext = oSelectedItem.getBindingContext("employees");
            var oEmployeeData = oContext.getObject();

            var employeeExists = this.originalEmployeeData.some(emp => emp.ID === oEmployeeData.ID);
            if (!employeeExists) {
                MessageToast.show('Employee does not exist or has been deleted.');
                return;
            }

            if (!this.oReadEmpDialog) {
                Fragment.load({
                    id: this.getView().getId('readEmpDialog'),
                    name: 'empproj.view.ReadEmp',
                    controller: this
                }).then(function (oDialog) {
                    this.oReadEmpDialog = oDialog;
                    this.getView().addDependent(oDialog);

                    this.setDialogData(oEmployeeData);
                    oDialog.open();
                }.bind(this));
            } else {
                this.setDialogData(oEmployeeData);
                this.oReadEmpDialog.open();
            }
        },

        setDialogData: function (oEmployeeData) {
            this.originalEmpId = oEmployeeData.ID; // Store the original ID
            console.log('Original ID', this.originalEmpId)
            this.byId('empIdInput').setValue(oEmployeeData.ID);
            this.byId('empNameInput').setValue(oEmployeeData.NAME);
            this.byId('empGenderSelect').setSelectedKey(oEmployeeData.GENDER);
            this.byId('empRoleSelect').setSelectedKey(oEmployeeData.ROLE);
            const dobDate = this.parseDate(oEmployeeData.DOB);
            const dojDate = this.parseDate(oEmployeeData.DateOfJoining);

            this.byId('empDOBPicker').setDateValue(dobDate);
            this.byId('empDOJPicker').setDateValue(dojDate);

            if (oEmployeeData.IMAGE) {
                this.byId('ImageView').setSrc(oEmployeeData.IMAGE);
                this._imageData = oEmployeeData.IMAGE; // Store the image data
            }
            this.enableProperties(false);
        },

        onSaveChanges: function () {
            var updatedEmpId = this.byId('empIdInput').getValue();
            var updatedEmpName = this.byId('empNameInput').getValue();
            var updatedEmpGender = this.byId('empGenderSelect').getSelectedKey();
            var updatedEmpRole = this.byId('empRoleSelect').getSelectedKey();
            var updatedEmpDOB = this.formatDate(this.byId('empDOBPicker').getDateValue());
            var updatedEmpDOJ = this.formatDate(this.byId('empDOJPicker').getDateValue());

            var empModel = this.getView().getModel("employees");
            var employees = empModel.getProperty("/Employees");

            var employeeIndex = employees.findIndex(emp => emp.ID === this.originalEmpId);

            if (employeeIndex !== -1) {
                employees[employeeIndex].ID = updatedEmpId;
                employees[employeeIndex].NAME = updatedEmpName;
                employees[employeeIndex].GENDER = updatedEmpGender;
                employees[employeeIndex].ROLE = updatedEmpRole;
                employees[employeeIndex].DOB = updatedEmpDOB;
                employees[employeeIndex].DateOfJoining = updatedEmpDOJ;
                if (this._imageData) {
                    employees[employeeIndex].IMAGE = this._imageData;
                }
                
                empModel.setProperty("/Employees", employees);
                localStorage.setItem("employees", JSON.stringify({ Employees: employees }));

                MessageToast.show('Employee updated successfully');
            }

            this.onCloseDialog();
        },

        onUpdate: function () {
            var updateButton = this.byId("updateButton");
            var buttonText = updateButton.getText();

            if (buttonText === "Edit") {
                // Enable fields for editing
                this.enableProperties(true);
                updateButton.setText("Save");
            } else {
                // Save the changes
                this.onSaveChanges();
                updateButton.setText("Edit");
                this.enableProperties(false);
                this.resetSwitchState();
            }
        },

        onSwitchToggle: function (oEvent) {
            var oState = oEvent.getParameter('state');
            console.log(oState, 'Switch toggled state');
            this.enableProperties(oState);
        },

        resetSwitchState: function () {
            var oSwitch = this.byId("switchToggle");
            if (oSwitch) {
                oSwitch.setState(false);
            }
        },

        enableProperties: function (isEnabled) {
            // this.byId('empIdInput').setEnabled(isEnabled);
            this.byId('empNameInput').setEnabled(isEnabled);
            this.byId('empGenderSelect').setEnabled(isEnabled);
            this.byId('empRoleSelect').setEnabled(isEnabled);
            this.byId('empDOBPicker').setEnabled(isEnabled);
            this.byId('empDOJPicker').setEnabled(isEnabled);
        },

        formatDate: function (date) {
            if (!date) {
                return null;
            }

            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const day = date.getDate();
            const daySuffix = this.getDaySuffix(day);
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();

            return `${month} ${day}${daySuffix} ${year}`;
        },

        getDaySuffix: function (day) {
            if (day >= 11 && day <= 13) {
                return 'th';
            }
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        },

        parseDate: function (dateString) {
            if (!dateString) {
                return null;
            }

            const dateParts = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1').split(' ');
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const month = monthNames.indexOf(dateParts[0]);
            const day = parseInt(dateParts[1]);
            const year = parseInt(dateParts[2]);

            return new Date(year, month, day);
        },

        clearFields: function () {
            this.byId('empId').setValue('');
            this.byId('empName').setValue('');
            this.byId('empGender').setSelectedKey('');
            this.byId('empRole').setSelectedKey('');
            this.byId('empDOB').setDateValue(null);
            this.byId('empDOJ').setDateValue(null);
            this.byId('empImage').setSrc('');
            this._imageData = null;
        },

        onSelectAllEmp: function (oEvent) {
            var isSelected = oEvent.getParameter("selected");
            var empModel = this.getView().getModel("employees");
            var employees = empModel.getProperty("/Employees");

            employees.forEach(employee => {
                employee.isSelected = isSelected;
            });

            empModel.setProperty("/Employees", employees);
        },

        onSelectEmp: function (oEvent) {
            var isSelected = oEvent.getParameter("selected");
            var empModel = this.getView().getModel("employees");
            var employees = empModel.getProperty("/Employees");

            var selectedEmployee = oEvent.getSource().getBindingContext("employees").getObject();
            selectedEmployee.isSelected = isSelected;

            var oneSelected = employees.every(emp => emp.isSelected);
            this.byId("selectEmp").setSelected(oneSelected);

            empModel.setProperty("/Employees", employees);
        },

        onDeleteEmployee: function () {
            var empModel = this.getView().getModel("employees");
            var employees = empModel.getProperty("/Employees");
            var selectedEmployees = employees.filter(emp => emp.isSelected);

            if (selectedEmployees.length === 0) {
                MessageToast.show('No employee is selected for deletion.');
                return;
            }

            var message;
            if (selectedEmployees.length === 1) {
                message = `Are you sure you want to delete this record of ${selectedEmployees[0].NAME}?`;
            } else {
                message = `Are you sure you want to delete these records?`;
            }

            MessageBox.confirm(message, {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        // If the user confirms, delete the selected employees
                        var remainingEmployees = employees.filter(emp => !emp.isSelected);
                        empModel.setProperty("/Employees", remainingEmployees);
                        this.originalEmployeeData = remainingEmployees;
                        localStorage.setItem("employees", JSON.stringify({ Employees: remainingEmployees }));

                        if (remainingEmployees.length === 0) {
                            this.byId("selectAllEmp").setSelected(false);
                        }
                        MessageToast.show('Selected employees deleted successfully');
                    }
                }.bind(this)
            });
        },

        onRoleSelectChange: function (oEvent) {
            const selectedFilter = oEvent.getParameter("selectedItem").getText();
            const employees = this.originalEmployeeData;

            const parseDate = (dateString) => {
                const parts = dateString.match(/(\w+)\s(\d{1,2})(?:st|nd|rd|th)\s(\d{4})/);
                const month = new Date(`${parts[1]} 1`).getMonth();
                const day = parseInt(parts[2], 10);
                const year = parseInt(parts[3], 10);
                return new Date(year, month, day);
            };

            const filterMap = {
                "Male": () => employees.filter(emp => emp.GENDER === "Male"),
                "Female": () => employees.filter(emp => emp.GENDER === "Female"),
                "Recently Joined": () => employees
                    .slice()
                    .sort((a, b) => {
                        const dateA = parseDate(a.DateOfJoining);
                        const dateB = parseDate(b.DateOfJoining);

                        // First compare by year
                        const yearComparison = dateB.getFullYear() - dateA.getFullYear();
                        if (yearComparison !== 0) {
                            return yearComparison; // Higher years come first
                        }

                        return dateB - dateA; // Higher dates come first
                    }),
                "Date Joined": () => employees.slice().sort((a, b) => parseDate(a.DateOfJoining) - parseDate(b.DateOfJoining)),
                "ID's Low": () => employees.slice().sort((a, b) => a.ID.localeCompare(b.ID)),
                "ID's High": () => employees.slice().sort((a, b) => b.ID.localeCompare(a.ID)),
                "Filter": () => employees
            };

            const filteredEmployees = (filterMap[selectedFilter] || filterMap["Filter"])();
            this.getView().getModel("employees").setProperty("/Employees", filteredEmployees);
        },

        onSearch: function (oEvent) {
            const searchTerm = oEvent.getParameter("newValue").toLowerCase();
            const employees = JSON.parse(localStorage.getItem("employees")).Employees;
            const filteredEmployees = employees.filter(emp => emp.NAME.toLowerCase().includes(searchTerm));

            this.originalEmployeeData = filteredEmployees;

            this.totalPages = Math.ceil(this.originalEmployeeData.length / this.pageSize);

            this.currentPage = 1;

            this.loadPaginatedData();
        },

        onListItemPressed: function (oEvent) {
            // this.getOwnerComponent().getRouter().navTo("ViewRecord");

            var oSelectedItem = oEvent.getSource();
            var oContext = oSelectedItem.getBindingContext("employees");
            var empId = oContext.getProperty("ID");

            this.getOwnerComponent().getRouter().navTo("ViewRecord", {
                empId: empId
            });
        },

        //OData page
        OnGetOData: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("OData");
            console.log('Hellooo');

        },

        onGenderChange: function (oEvent) {
            // Get the selected employee from the binding context
            var oSelectedItem = oEvent.getSource().getParent(); // Access the parent (ColumnListItem)
            var oContext = oSelectedItem.getBindingContext("employees"); // Get binding context
            var employeeData = oContext.getObject(); // Get the employee data object

            // Get the new gender from the dropdown
            var selectedGender = oEvent.getParameter("selectedItem").getKey();

            // Update the gender in the model
            employeeData.GENDER = selectedGender;

            // Update the model data
            var empModel = this.getView().getModel("employees");
            empModel.refresh(true); // Refresh the model to reflect changes in the view

            // Update local storage
            var employeesData = JSON.parse(localStorage.getItem("employees")) || { Employees: [] };
            var employees = employeesData.Employees;

            // Find and update the employee in local storage
            var employeeIndex = employees.findIndex(emp => emp.ID === employeeData.ID);
            if (employeeIndex !== -1) {
                employees[employeeIndex].GENDER = selectedGender;
                localStorage.setItem("employees", JSON.stringify({ Employees: employees })); // Update local storage
            }

            MessageToast.show("Gender updated successfully!"); // Optional: Show a success message
        },
        onFileChange: function (oEvent) {
            var file = oEvent.getParameter("files")[0];
            if (!file) {
                return;
            }

            // Check file type
            if (!file.type.match('image.*')) {
                MessageToast.show('Please upload an image file');
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                MessageToast.show('File size should not exceed 5MB');
                return;
            }

            var reader = new FileReader();
            reader.onload = function (e) {
                var imageData = e.target.result;
                this.byId('empImage').setSrc(imageData);
                this._imageData = imageData;
            }.bind(this);

            reader.readAsDataURL(file);
        },
    })
});
