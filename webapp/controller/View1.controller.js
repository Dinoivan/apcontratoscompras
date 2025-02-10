sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("apcontratoscompras.controller.View1", {
        formatFechaUTC: function(fecha) {
        
            // Crear un array con los nombres cortos de los meses en español
            const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        
            // Obtener los componentes de la fecha en UTC
            const dia = fecha.getUTCDate();
            const mes = meses[fecha.getUTCMonth()];
            const anio = fecha.getUTCFullYear();
        
            // Formatear la fecha al formato deseado
            return `${dia} ${mes} ${anio}`;
        },
        formatMoney: function (value) {
            if (value == null || isNaN(value)) {
                return ""; // Manejo de valores nulos o inválidos
            }
        
            // Formatear el número con coma como separador de miles y punto para decimales
            return new Intl.NumberFormat("en-US", {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value);
        },
        onAfterRendering: function () {
            // Obtener la referencia de la lista
            const oList = this.byId("list");
            var that = this;
            // Esperar a que los datos se carguen
            oList.attachEventOnce("updateFinished", () => {
                // Obtener los elementos de la lista
                const aItems = oList.getItems();

                // Verificar que haya elementos en la lista
                if (aItems.length > 0) {
                    // Seleccionar el primer elemento
                    //oList.setSelectedItem(aItems[0]);
                    oList.getItems()[0].firePress()
                    that.extHookOnInit();
                }
            });
        },
        setUrlBase: function(url){
			sessionStorage.setItem("urlBase", url);
		},
        getUrlBase: function () {
			var remoto = sessionStorage.getItem("urlBase");
			return remoto;
		},
        
        onInit: function(){
            const orderRoute = this.getOwnerComponent().getRouter().getRoute("RouteView1");
            orderRoute.attachPatternMatched(this.onPatternMatched, this);
            
            // SER URL BASE
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.setUrlBase(this.oRouter._oOwner._oManifest._oBaseUri._parts.path)
           
        },
        onPatternMatched: function(){
            
            this.setFooter();
            var userapi = new sap.ui.model.json.JSONModel();
		    userapi.loadData(this.getUrlBase() + "user-api/attributes", "", false);
            
        },
        fnAprobarTodos: function (oEvent) {
            var oList;
            var aSelectedItems;
            var aItemsAprobar = [];
            var sAprobarTodos;
            oList = this.getView().byId("list");
            aSelectedItems = oList.getSelectedItems();
   
            if (aSelectedItems.length < 1) {
                sap.m.MessageToast.show("Seleccione como mínimo un item");
            } else {
                aSelectedItems.forEach(function (x) {
                    aItemsAprobar.push(x.getBindingContext().getObject().PoNumber);
                });
                sap.ui.core.BusyIndicator.show(0);
   
                /* Llamamos RFC */
                sAprobarTodos = this.sAprobarTodos(aItemsAprobar);
                sAprobarTodos.success(function (x) {
                    sap.ui.core.BusyIndicator.hide();
   
                    var oModel = new sap.ui.model.json.JSONModel();
                    var oResponse = $.xml2json(x)["Body"]["ZmmPoRelmResponse"]["EtDocout"]["item"];
                    if (!Array.isArray(oResponse)) {
                        oResponse = [oResponse];
                    }
                    oModel.setData(oResponse);
                    this.getView().setModel(oModel, "detalleEjecucion");
                    //	this.getView().getModel().refresh();
   
                    this._getDialog().open();
                    //console.log("exito");
                }.bind(this));
                sAprobarTodos.fail(function (x) {
                    sap.ui.core.BusyIndicator.hide();
                    console.log(x);
                });
            }
        },
   
        fnRechazarTodos: function (oEvent) {
            var oList;
            var aSelectedItems;
            var aItemsAprobar = [];
            var sRechazarTodos;
            oList = this.getView().byId("list");
            aSelectedItems = oList.getSelectedItems();
   
            if (aSelectedItems.length < 1) {
                sap.m.MessageToast.show("Seleccione como mínimo un item");
            } else {
                aSelectedItems.forEach(function (x) {
                    aItemsAprobar.push(x.getBindingContext().getObject().PoNumber);
                });
   
                sap.ui.core.BusyIndicator.show(0);
                /* Llamamos RFC */
                sRechazarTodos = this.sRechazarTodos(aItemsAprobar);
                sRechazarTodos.success(function (x) {
                    sap.ui.core.BusyIndicator.hide();
                    var oModel = new sap.ui.model.json.JSONModel();
                    var oResponse = $.xml2json(x)["Body"]["ZmmPoRelmResponse"]["EtDocout"]["item"];
                    if (!Array.isArray(oResponse)) {
                        oResponse = [oResponse];
                    }
                    oModel.setData(oResponse);
                    this.getView().setModel(oModel, "detalleEjecucion");
                    //	this.getView().getModel().refresh();
                    this._getDialog().open();
                    //console.log("exito");
                }.bind(this));
                sRechazarTodos.fail(function (x) {
                    sap.ui.core.BusyIndicator.hide();
                    console.log(x);
                });
            }
        },
   
        onCloseFilterOptionsDialogConfirm: function () {
            var oList = this.getView().byId("list");
            $.selectedItems = [];
            this.getView().getModel().refresh();
            //this.getOwnerComponent().getRouter().navTo("noData");
            oList.removeSelections();
            this._getDialog().close();
        },
   
        _getDialog: function () {
            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment("ui.s2p.mm.purcontract.approve.uis2pmmpurcontractapproveExtension.view.Resume", this);
                this.getView().addDependent(this._oDialog);
            }
   
            return this._oDialog;
        },
   
        sAprobarTodos: function (aItems) {
            var data =
                '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">\
      <soapenv:Header/>\
      <soapenv:Body>\
         <urn:ZmmPoRelm>\
            <ItDocin>';
   
            aItems.forEach(function (x) {
                data += '<item>' +
                    '<Ebeln>' + this._getZeros(x) + x + '</Ebeln>' +
                    '<Rejec></Rejec>' +
                    '</item>';
            }.bind(this));
   
            data += '</ItDocin>\
         </urn:ZmmPoRelm>\
      </soapenv:Body>\
   </soapenv:Envelope>';
   
            var url =  this. getUrlBase() + "ODATA_FIORI_GATEWAY/sap/bc/srt/rfc/sap/zmm_po_relm/600/zmm_po_relm/zmm_po_relm";
   
            return jQuery.ajax({
                url: url,
                type: "POST",
                dataType: "xml",
                context: this,
                data: data,
                contentType: 'text/xml; charset=\"utf-8\"'
            });
   
            //console.log(data);
   
        },
   
        sRechazarTodos: function (aItems) {
            var data =
                '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">\
      <soapenv:Header/>\
      <soapenv:Body>\
         <urn:ZmmPoRelm>\
            <ItDocin>';
   
            aItems.forEach(function (x) {
                data += '<item>' +
                    '<Ebeln>' + this._getZeros(x) + x + '</Ebeln>' +
                    '<Rejec>X</Rejec>' +
                    '</item>';
            }.bind(this));
   
            data += '</ItDocin>\
         </urn:ZmmPoRelm>\
      </soapenv:Body>\
   </soapenv:Envelope>';
   
            var url = this.getUrlBase() + "ODATA_FIORI_GATEWAY/sap/bc/srt/rfc/sap/zmm_po_relm/600/zmm_po_relm/zmm_po_relm";
   
            return jQuery.ajax({
                url: url,
                type: "POST",
                dataType: "xml",
                context: this,
                data: data,
                contentType: 'text/xml; charset=\"utf-8\"'
            });
   
            //console.log(data);
   
        },
   
        getListItems: function (oList) {
            var aItems = oList.getItems();
            var aVisibleItems = [];
            aItems.forEach(function (x) {
                if (x.getVisible()) {
                    aVisibleItems.push(x);
                }
            }.bind(this));
            return aVisibleItems;
        },
   
        fnSelectAll: function (e) {
            var oList = this.getView().byId("list");
            var aSelectedItems = oList.getSelectedItems();
            var aItems = this.getListItems(oList); //oList.getItems();
   
            $.ListPO.detachSelect(this._handleSelectPress, this);
            if (aSelectedItems.length === aItems.length) {
                oList.removeSelections();
            } else {
                aItems.forEach(function (x) {
                    x.setSelected(true);
                });
            }
            $.ListPO.attachSelect(this._handleSelectPress, this);
            console.log("--fnSelectAll--");
        },
   
        setFooter: function () {
            setInterval(function (x) {
                //debugger
                //var header = sap.ui.getCore().byId("__bar1");
                var page = this.getView().getContent()[0];
                
                page = page.getAggregation("_navMaster").getAggregation("pages")[0];

                console.log("Page: ", page);
                var header;
                page ? header = page.getCustomHeader() : void 0;

                console.log("Header: ", page);
                console.log("header: ",header);
                if ((header) && (header.getContentRight()) && (header.getContentRight().length < 1)) {
                    //debugger
                    var oSelectAll = new sap.m.Button({
                        icon: "sap-icon://multiselect-all",
                        press: this.fnSelectAll.bind(this)
                    });
    
                    header.addContentRight(oSelectAll);
                    console.log("header: ",header);
                }
    
                var bar;
    
                page ? bar = page.getFooter() : void 0;
                if ((bar) && (bar.getContentRight()) && (bar.getContentRight().length < 1)) {
                    var oAceptar = new sap.m.Button({
                        text: "Aprobar todos",
                        type: sap.m.ButtonType.Accept,
                        press: this.fnAprobarTodos.bind(this)
                    });
   
                    var oCancelar = new sap.m.Button({
                        text: "Rechazar todos",
                        type: sap.m.ButtonType.Reject,
                        press: this.fnRechazarTodos.bind(this)
                    });
   
                    bar.addContentLeft(oAceptar);
                    bar.addContentRight(oCancelar)
                }
   
            }.bind(this), 100);
        },
        /*extHookOnInit: function () {
   
            variable = false;
   
            $.selectedItems = [];
            this.getOwnerComponent().getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
            $.ListPO = this.getView().byId("list");
            this.setFooter();
            sap.ui.core.BusyIndicator.show(0);
   
            //cargando el usuario actual 
            var userapi = new sap.ui.model.json.JSONModel();
            userapi.loadData("/services/userapi/attributes", "", false);
            //select="_handleSelectPress"
            $.ListPO.attachSelect(this._handleSelectPress, this);
   
            *var data =
            '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">' +
            '<soapenv:Header/>' +
            '<soapenv:Body>' +
            '<urn:ZfioriDatosAdicionalesMe28>' +
            '<TOutputNp>' +
            '</TOutputNp>' +
            '<User>' + userapi.getData().name.toUpperCase() + '</User>' +
            '</urn:ZfioriDatosAdicionalesMe28>' +
            '</soapenv:Body>' +
            '</soapenv:Envelope>';
   
            //var url = "/cogaBA/sap/bc/srt/rfc/sap/zfiori_datos_adicionales_me28/600/zfiori_datos_adicionales_me28/zfiori_datos_adicionales_me28";
           var url = "/coga//sap/bc/srt/rfc/sap/zfiori_liberador_doc/600/zfiori_liberador_doc/zfiori_liberador_doc";
   
            this.jQueryDeferred = jQuery.Deferred();
            jQuery.ajax({
                url: url,
                type: "POST",
                dataType: "xml",
                context: this,
                data: data,
                contentType: 'text/xml; charset=\"utf-8\"',
                success: function (x) {
                    var oRetorno = $.xml2json(x)["Body"]["ZfioriDatosAdicionalesMe28Response"]["TOutputNp"]["item"];
                    var modelo = this.getView().getModel();
                    this.jQueryDeferred.resolve(oRetorno);
                    //this.fnUnirDatosAdicionales(oRetorno, modelo);
                    console.log(oRetorno);
                },
                error: function (x) {
                    this.jQueryDeferred.reject(x);
                    console.log(x);
                }
            });
   
            var l = this.getList();
            l.detachEvent("updateFinished");
            l.attachEvent("updateFinished", function (e) {
                this.jQueryDeferred
                    .then(function (oRetorno) {
                        //		this.getView().getModel().setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
                        //var modelo = this.getView().getModel();
   
                        sap.ui.core.BusyIndicator.hide();
                        if (!oRetorno) {
                            return;
                            // en caso venga undefined que ni intente.
                        }
   
                        this.aItems = this.getList().getItems();
                        if (!Array.isArray(oRetorno)) {
                            oRetorno = [oRetorno];
                        }
                        this.datos = oRetorno;
                        //var data = JSON.parse(JSON.stringify(modelo.getProperty("/")));
                        //var model = new sap.ui.model.json.JSONModel(data);
   
                        for (var i = 0; i < this.aItems.length; i++) {
                            var index_array;
                            var find = this.datos.find(function (element, index) {
                                index_array = index;
                                var PoNumber = this.aItems[i].getBindingContext().getObject().PoNumber;
                                return (this._getZeros(PoNumber) + PoNumber) === element.Ebeln;
                            }.bind(this));
                            if (find) {
                                if (parseFloat(find.ZvalDiff) > 0) {
                                    var text = "Valor Anterior: " + ui.s2p.mm.purcontract.approve.util.Conversions.lazyRoundNumber(find.ZvalAnterior);
                                    this.getList().getItems()[i].getAggregation("attributes")[4].setText(text);
                                    var text2 = " Diferencia: " + ui.s2p.mm.purcontract.approve.util.Conversions.lazyRoundNumber(find.ZvalDiff);
                                    this.getList().getItems()[i].getAggregation("attributes")[5].setText(text2);
                                }
                                // 	var text = "Valor Anterior: " + find.ZvalAnterior;
                                // 	this.getList().getItems()[i].getAggregation("attributes")[4].setText(text);
                                // 	var text2 = " Diferencia: " + find.ZvalDiff;
                                // 	this.getList().getItems()[i].getAggregation("attributes")[5].setText(text2);
                                // }
   
                                if (oRetorno[index_array]["ZdateNew"] != oRetorno[index_array]["ZdateOld"]) {
                                    var text3 = "Fin validez anterior: " + _Formatter.DateFormat(oRetorno[index_array].ZdateOld) //.toString();
                                    this.getList().getItems()[i].getAggregation("attributes")[6].setText(text3);
                                    var text4 = "Nueva ampliación: " + _Formatter.DateFormat(oRetorno[index_array].ZdateNew) //.toString();
                                    this.getList().getItems()[i].getAggregation("attributes")[7].setText(text4);
                                }
                            }
                        }
   
                    }.bind(this))
                    .fail(function (x) {
                        sap.ui.core.BusyIndicator.hide();
                        console.log(x);
                    });
            }, this);
            //	console.log("--fui cargado--");
            //https://TLURSAPDE01.tgp.net:8001/sap/bc/srt/rfc/sap/zfiori_datos_adicionales_me28/600/zfiori_datos_adicionales_me28/zfiori_datos_adicionales_me28
   
        },*/
        
        extHookOnInit: function () {
   
           //variable = false;
   
           $.selectedItems = [];
           //this.getOwnerComponent().getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
           $.ListPO = this.getView().byId("list");
           //this.setFooter();
           //sap.ui.core.BusyIndicator.show(0);
   
           /* cargando el usuario actual */
           //var userapi = new sap.ui.model.json.JSONModel();
           //userapi.loadData("/services/userapi/attributes", "", false);
           
           //select="_handleSelectPress"
           $.ListPO.attachSelect(this._handleSelectPress, this);
           
           
           
           console.log("setTimeout() Ejemplo...");
           //var user2 =userapi.getData().name.toUpperCase();
           var data2 =
           '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">' +
              '<soapenv:Header/>' +
              '<soapenv:Body>' +
                 '<urn:ZfioriDatosAdicionalesMe28>' +
                    //'<User>TOD</User>' +
                    '<User>' + 'TGACFT' + '</User>' +
                    '<TOutputNp>' +
                       '<!--Zero or more repetitions:-->' +
                       '<item>' +
                          '<Ebeln></Ebeln>' +
                          '<Netwr></Netwr>' +
                          '<ZvalAnterior></ZvalAnterior>' +
                          '<ZvalDiff></ZvalDiff>' +
                          '<ZdateOld></ZdateOld>' +
                          '<ZdateNew></ZdateNew>' +
                       '</item>' +
                    '</TOutputNp>' +
                    //'<User>' + userapi.getData().name.toUpperCase() + '</User>' +
                 '</urn:ZfioriDatosAdicionalesMe28>' +
              '</soapenv:Body>' +
           '</soapenv:Envelope>';
   
           var url2 = this.getUrlBase() + "coga/sap/bc/srt/rfc/sap/zfiori_liberador_doc/600/zfiori_liberador_doc/zfiori_liberador_doc";
           
           //var l = this.getList();
           var w =this;
           //$.ListPO.attachSelect(this._handleSelectPress, this);
           //l = this.getList();
           //this.jQueryDeferred = jQuery.Deferred();
           jQuery.ajax({
               url: url2,
               type: "POST",
               dataType: "xml",
               context: this,
               data: data2,
               contentType: 'text/xml; charset=\"utf-8\"',
               success: function (x) {
                   /////////////////////////////////////CODDIGO MODIFICADO////////////////////////////////////////////////////////////
                   var cont;
                   setTimeout(function(){
                       console.log("Hola Mundo");
                       /*user = l.getItems()[0].getBindingContext().getObject().SubstitutingForID;
                       if(user=="")
                       {
                           user=user2;
                       }*/
                       var data =
                       '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">' +
                          '<soapenv:Header/>' +
                          '<soapenv:Body>' +
                             '<urn:ZfioriDatosAdicionalesMe28>' +
                                //'<User>TOD</User>' +
                                '<User>' + 'TGACFT' + '</User>' +
                                '<TOutputNp>' +
                                   '<!--Zero or more repetitions:-->' +
                                   '<item>' +
                                      '<Ebeln></Ebeln>' +
                                      '<Netwr></Netwr>' +
                                      '<ZvalAnterior></ZvalAnterior>' +
                                      '<ZvalDiff></ZvalDiff>' +
                                      '<ZdateOld></ZdateOld>' +
                                      '<ZdateNew></ZdateNew>' +
                                   '</item>' +
                                '</TOutputNp>' +
                                //'<User>' + userapi.getData().name.toUpperCase() + '</User>' +
                             '</urn:ZfioriDatosAdicionalesMe28>' +
                          '</soapenv:Body>' +
                       '</soapenv:Envelope>';
               
                       var url = this.getUrlBase() + "coga/sap/bc/srt/rfc/sap/zfiori_liberador_doc/600/zfiori_liberador_doc/zfiori_liberador_doc";
               
                       this.jQueryDeferred = jQuery.Deferred();
                       jQuery.ajax({
                           url: url,
                           type: "POST",
                           dataType: "xml",
                           context: this,
                           data: data,
                           contentType: 'text/xml; charset=\"utf-8\"',
                           success: function (x) {
                               var oRetorno = $.xml2json(x)["Body"]["ZfioriDatosAdicionalesMe28Response"]["TOutputNp"]["item"];
                               var modelo = w.getView().getModel();
                               for (var i = 0; i < oRetorno.length; i++) {
                               //	oRetorno[i]["ZdateOld"] = (oRetorno[i]["ZdateOld"].replace(/-/g, ""));
                               }
                               this.jQueryDeferred.resolve(oRetorno);
                               w.aItems = w.getList().getItems();
                                   if (!Array.isArray(oRetorno)) {
                                       oRetorno = [oRetorno];
                                   }
                                   w.datos = JSON.parse(JSON.stringify(oRetorno));
                                   cont = w.aItems.length;
               
                                   //var data = JSON.parse(JSON.stringify(modelo.getProperty("/")));
                                   //var model = new sap.ui.model.json.JSONModel(data);
                                   
                                   for (var i = 0; i < w.aItems.length; i++) {
                                       var index_array;
                                       var find = w.datos.find(function (element, index) {
                                           index_array = index;
                                           var PoNumber = w.aItems[i].getBindingContext().getObject().PoNumber;
                                           return (w._getZeros(PoNumber) + PoNumber) === element.Ebeln;
                                       }.bind(w));
                                       if (find) {
                                           if (parseFloat(find.ZvalDiff) > 0) {
                                                var text = "Valor Anterior: " + ui.s2p.mm.purcontract.approve.util.Conversions.lazyRoundNumber(find.ZvalAnterior);
                                                l.getItems()[i].getAggregation("attributes")[4].setText(text);
                                                var text2 = " Diferencia: " + ui.s2p.mm.purcontract.approve.util.Conversions.lazyRoundNumber(find.ZvalDiff);
                                                l.getItems()[i].getAggregation("attributes")[5].setText(text2);
                                            }
                                            // 	var text = "Valor Anterior: " + find.ZvalAnterior;
                                            // 	this.getList().getItems()[i].getAggregation("attributes")[4].setText(text);
                                            // 	var text2 = " Diferencia: " + find.ZvalDiff;
                                            // 	this.getList().getItems()[i].getAggregation("attributes")[5].setText(text2);
                                            // }
               
                                            if (oRetorno[index_array]["ZdateNew"] != oRetorno[index_array]["ZdateOld"]) {
                                                var text3 = "Fin validez anterior: " + _Formatter.DateFormat(oRetorno[index_array].ZdateOld) //.toString();
                                                l.getItems()[i].getAggregation("attributes")[6].setText(text3);
                                                var text4 = "Nueva ampliación: " + _Formatter.DateFormat(oRetorno[index_array].ZdateNew) //.toString();
                                                l.getItems()[i].getAggregation("attributes")[7].setText(text4);
                                            }
                                       }
                                   }
                               //this.fnUnirDatosAdicionales(oRetorno, modelo);
                               console.log(oRetorno);
                           },
                           error: function (x) {
                               this.jQueryDeferred.reject(x);
                               console.log(x);
                           }
                       });
                       l.detachEvent("updateFinished");
                       l.attachEvent("updateFinished", function (e) {
                           this.jQueryDeferred.then(function (oRetorno) {
                                   console.log("2setTimeout() Ejemplo...");
               
                                   //		this.getView().getModel().setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
                                   //var modelo = this.getView().getModel();
               
                                   w.aItems = w.getList().getItems();
                                   if (!Array.isArray(oRetorno)) {
                                       oRetorno = [oRetorno];
                                   }
                                   w.datos = JSON.parse(JSON.stringify(oRetorno));
               
                                   //var data = JSON.parse(JSON.stringify(modelo.getProperty("/")));
                                   //var model = new sap.ui.model.json.JSONModel(data);
                                   
                                   for (var i = 0; i < this.aItems.length; i++) {
                                       var index_array;
                                       var find = w.datos.find(function (element, index) {
                                           index_array = index;
                                           var PoNumber = w.aItems[i].getBindingContext().getObject().PoNumber;
                                           return (w._getZeros(PoNumber) + PoNumber) === element.Ebeln;
                                       }.bind(w));
                                       if (find) {
                                           if (parseFloat(find.ZvalDiff) > 0) {
                                               var text = "Valor Anterior: " + ui.s2p.mm.purchorder.approve.util.Conversions.lazyRoundNumber(find.ZvalAnterior);
                                               l.getItems()[i].getAggregation("attributes")[4].setText(text);
                                               var text2 = " Diferencia: " + ui.s2p.mm.purchorder.approve.util.Conversions.lazyRoundNumber(find.ZvalDiff);
                                               l.getItems()[i].getAggregation("attributes")[5].setText(text2);
                                           }
                                               if (oRetorno[index_array]["ZdateNew"] != oRetorno[index_array]["ZdateOld"])
                                               {
                                               var text3 = "Fin validez anterior: " + _Formatter.DateFormat(oRetorno[index_array].ZdateOld)//.toString();
                                               l.getItems()[i].getAggregation("attributes")[6].setText(text3);
                                               var text4 = "Nueva ampliación: " + _Formatter.DateFormat(oRetorno[index_array].ZdateNew)//.toString();
                                               l.getItems()[i].getAggregation("attributes")[7].setText(text4);
                                               }
                                       }
                                   }
                               }.bind(this))
                               .fail(function (x) {
                                   sap.ui.core.BusyIndicator.hide();
                                   console.log(x);
                               });
                       }, this);
                       console.log("3setTimeout() Ejemplo...");
                       ////////////////////////////////////////////FIN/////////////////////////////////////////////////////
                   }, (4000));
                   sap.ui.core.BusyIndicator.hide();
               },
               error: function (x) {
                   this.jQueryDeferred.reject(x);
                   console.log(x);
               }
           });
   
           
           //	console.log("--fui cargado--");
           //https://TLURSAPDE01.tgp.net:8001/sap/bc/srt/rfc/sap/zfiori_datos_adicionales_me28/600/zfiori_datos_adicionales_me28/zfiori_datos_adicionales_me28
   
       },
   
   
        setListItem: function (i) {
            //this._clearSelection();
            //i.setSelected(true);
            this._navToListItem(i);
        },
   
        onRouteMatched: function (e) {
            var name = e.getParameter("name");
            var list = this.getView().byId("list");
            //$.PoNumber = list.getSelectedItem().getBindingContext().getObject().PoNumber;                         
            this.getView().getModel().attachRequestCompleted(function (x) {
                var oHashChanger = sap.ui.core.routing.HashChanger;
   
                if (!variable) {
                    if (list.getSelectedItem()) {
                        $.PoNumber = list.getSelectedItem().getBindingContext().getObject().PoNumber;
                        if ($.PoNumber) {
                            variable = true;
                        }
                    }
                    oHashChanger.getInstance().replaceHash("");
                    list.removeSelections();
                    //list.removeSelections();
                } else if ((name === "detail") && ($.selectedItems.length >= 0)) {
                    list.removeSelections();
                    var items = $.selectedItems;
                    items.forEach(function (x) {
                        list.setSelectedItem(x);
                    }.bind(this));
                }
            }.bind(this));
            //	console.log(e);
   
        },
        _handleItemPressDesktop: function (e) {
            console.log("_handleItemPressDesktop");
            this.setListItem(e);
            if (!sap.ui.Device.system.phone) {
                this._oApplicationImplementation.oSplitContainer.hideMaster();
            }
        },
   
        _handleItemPress: function(oEvent) {
            debugger
            var itemList = oEvent.getSource();
            var oItem = itemList.getBindingContext().getObject()
            var that = this;
            that.getView().setModel(new sap.ui.model.json.JSONModel(oItem),"header");

            console.log("datos: ",  that.getView().setModel(new sap.ui.model.json.JSONModel(oItem),"header"));
            
            //var sOrigin = oItem.getCustomData()[0].getValue();
            //var sWorkitemID = oItem.getCustomData()[1].getValue();

            // Construcción de la URL para expandir datos
            var sPath =  "/WorkflowTaskCollection(SAP__Origin='LOCAL',WorkitemID='" + oItem.WorkitemID + "')/HeaderDetails";
            var aExpand = ["ItemDetails", "Notes", "Attachments"];

            console.log("ruta: ", sPath);
            
            var oModel = this.getView().getModel();

            // Realizar la llamada OData
            oModel.read(sPath, {
                urlParameters: {
                    "$expand": aExpand.join(',')
                },
                success: function(oData) {
                    debugger
                    sap.m.MessageToast.show("Datos cargados con éxito");
                    
                    that.getView().setModel(new sap.ui.model.json.JSONModel(oData),"detail");
                    console.log(oData);
                },
                error: function(oError) {
                    debugger
                    sap.m.MessageToast.show("Error al cargar los datos");
                    console.error(oError);
                }
            });
        },
   
        _handleSelectPress: function (oEvent) {
            /* Is this a phone */
            console.log("_handleSelectPress");
            var isPhone;
            isPhone = this.getView().getModel("device").getData().isPhone;
            if (isPhone) {
                //this._handleItemPressPhone(oEvent);
            } else {
                this._handleItemPress(oEvent);
            }
        },
   
        _handleSelect: function (e) {
            //console.log(e.getSource().getSelectedItems());
            console.log("_handleSelect");
            this.setListItem(e);
            if (!sap.ui.Device.system.phone) {
                this._oApplicationImplementation.oSplitContainer.hideMaster();
            }
        },
   
        fireSelectionChange: function (e) {
            $.selectedItems = e.getSource().getSelectedItems();
            console.log("fireSelectionChange");
        },
   
        _navToListItem: function (l) {
            this.oRouter.navTo(this.getDetailRouteName(), this.getDetailNavigationParameters(l), !sap.ui.Device.system.phone);
        },
   
        __handleSelect: function (oEvent) {
            this._handleSelect(oEvent);
            $.selectedItems = e.getSource().getSelectedItems();
            console.log(e.getSource().getSelectedItems());
            this.fnCargarAprobadores(oEvent);
            console.log("__handleSelect");
        },
   
        fnCargarAprobadores: function (oEvent) {
            if (oEvent.getSource().getBindingContext()) {
                $.PoNumber = oEvent.getSource().getBindingContext().getObject().PoNumber;
            } else {
                $.PoNumber = oEvent.getSource().getSelectedItem().getBindingContext().getObject().PoNumber;
   
            }
        },
   
        extHookSetHeaderFooterOptions: function (l) {
            console.log("hago cosas");
            return l;
        },
   
        _getZeros: function (x) {
            var zero;
            if (10 - x.length === 3) {
                zero = "000";
            } else if (10 - x.length === 2) {
                zero = "00";
            }
            return zero;
   
        }
    });
});