sap.ui.define([
	"com/disease/management/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("com.disease.management.controller.Main", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.disease.management.view.Main
		 */
		onInit: function() {
			this.getView().addStyleClass(sap.ui.Device.support.touch ? "sapUiSizeCozy" : "sapUiSizeCompact");
			this._initSetUp();
		},

		onPressEmployee: function(oEvent) {
			this._bindView(oEvent.getParameter("listItem").getBindingContextPath());
		},

		onSelectionChange: function(oEvent) {
			this._bindView(oEvent.getSource().getSelectedItem().getBindingContext().getPath());
		},

		onSearchByEmployeeNumber: function(oEvent) {
			this._getEmployeeDetails("EmployeeNumber", oEvent.getSource().getValue());
		},

		onSearchByEmployeeName: function(oEvent) {
			this._getEmployeeDetails("FirstName", oEvent.getSource().getValue());
		},

		onTBQuestionnaire: function(oEvent) {
			this._setStiTbQuestionnaireModel(oEvent, "/isTbQsVisible");
		},

		onSTIQuestionnaire: function(oEvent) {
			this._setStiTbQuestionnaireModel(oEvent, "/isStiQsVisible");
		},

		onPhysicalRadioButtonSelect: function(oEvent) {

			//var sProperty = oEvent.getSource().mBindingInfos.selectedIndex.binding.sPath;
			//this._oModel.setProperty("PhysicalExamSet/" + sProperty, oEvent.getSource().getSelectedIndex());
		},

		onSave: function() {
			//set employee number on the changed entities to make it availabe in the create entry method 
			//of the gateway class.
			var oContext = this.getView().byId("vBoxPhysicalClinical").getBindingContext();
			this._oModel.setProperty(oContext.sPath + "/EmployeeNumber", this.byId("EmployeeNumberTxtVal").getText());
			this._oModel.submitChanges({
				success: function(oResponse) {

				},
				error: function(oError) {

				}
			});
		},

		_setStiTbQuestionnaireModel: function(oEvent, vProperty) {
			if (oEvent.getSelectedIndex() === 0) {
				this.getView().getModel().setProperty(vProperty, false);
				return;
			}
			this.getView().getModel().setProperty(vProperty, true);
		},

		_initSetUp: function() {
			this._oModel = this.getOwnerComponent().getModel();
			this._oModel.metadataLoaded().then(this._onMetadataLoaded.bind(this));
			this._setViewModel();
		},

		_onMetadataLoaded: function() {
			this._setFormsBindingContext();
		},

		_setViewModel: function() {
			var oViewModel = new JSONModel({
				isTbQsVisible: false,
				isStiQsVisible: false,
				EmployeeNumber: "2"
			});

			this.getView().setModel("ViewModel", oViewModel);
		},

		_getEmployeeDetails: function(vFilterProperty, vFilterValue) {
			if (vFilterValue.length === 0) {
				return;
			}
			var oTable = this.getView().byId("idEmployeeTable");

			var oTemplate = new sap.m.ColumnListItem({
				cells: [
					new sap.m.Text({
						text: "{EmployeeNumber}"
					}),
					new sap.m.Text({
						text: "{LastName}"
					}),
					new sap.m.Text({
						text: "{FirstName}"
					})
				]
			});

			// oTable.bindItems({
			// 	path: '/EmployeeSet',
			// 	filters: [new sap.ui.model.Filter(vFilterProperty, "EQ", vFilterValue)],
			// 	template: oTemplate
			// });

			oTable.bindAggregation("items", {
				path: '/EmployeeSet',
				filters: [new sap.ui.model.Filter(vFilterProperty, "EQ", vFilterValue)],
				template: oTemplate,
				events: {
					dataReceived: function(response) {
						this._bindView("/EmployeeSet('" + vFilterValue + "')");
					}.bind(this)
				}
			});

			// this._oModel.attachRequestCompleted(function() {
			// 	if (oTable.getItems().length === 1) {
			//                    this._bindView("/EmployeeSet('" + vFilterValue + "')");
			// 	}
			// }.bind(this));

			// this.getView().byId("idEmployeeTable").getBinding("items").filter([new sap.ui.model.Filter(vFilterProperty, "EQ", vFilterValue)]);

		},

		_bindView: function(vPath) {
			this.getView().byId("EmployeeDetailForm").bindElement({
				path: vPath
			}, "Application");
		},

		_setFormsBindingContext: function() {
			var oProperty = {
				EmployeeNumber: this.byId("EmployeeNumberTxtVal").getText()
			};
			// var oPhysicalExamContext = this._oModel.createEntry("PhysicalExamSet");
			this.getView().byId("PhysicalClinicalExamForm").setBindingContext(this._oModel.createEntry("PhysicalExamSet"));
			this.getView().byId("MedicalHistoryForm").setBindingContext(this._oModel.createEntry("MedicalHistorySet"));
			this.getView().byId("SocialHistoryForm").setBindingContext(this._oModel.createEntry("SocialHistorySet"));
			this.getView().byId("ScreeningClinicalExamForm").setBindingContext(this._oModel.createEntry("ScreeningExamSet"));
		}
	});

});