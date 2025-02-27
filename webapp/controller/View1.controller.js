sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("apcontratoscompras.controller.View1", {

        _getZeros: function (x) {
            var zero;
            if (10 - x.length === 3) {
                zero = "000";
            } else if (10 - x.length === 2) {
                zero = "00";
            }
            return zero;
   
        },

        
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

        formatCostAssignment: function(accountCategory, accountDesc, accountNumber, glAccountDesc, glAccountNumber) {
            debugger
            console.log("accountCategory:", accountCategory);
            console.log("accountDesc:", accountDesc);
            console.log("accountNumber:", accountNumber);
            console.log("glAccountDescription:", glAccountDesc);
            console.log("glAccountNumber:", glAccountNumber);
        
            if (accountCategory) {
                return accountCategory + " " + accountDesc + " (" + accountNumber + ")\n" +
                    "Cuenta de mayor " + glAccountDesc + " (" + glAccountNumber + ")";
            } else {
                return "Desconocido";
            }
        },

        formatAprobadoState: function(sValue) {
            if (!sValue || sValue.trim() === "") {
                return "None";  // Si está vacío, usa "None" para evitar errores
            }
            return "Warning"; // Usa el valor original si es válido
        },
        notesVisibilityTrigger: function(iNumberOfNotes) {
            return iNumberOfNotes > 0; // Retorna `true` si es mayor a 0, `false` si es 0
        },
        attachmentsVisibilityTrigger: function(aAttachments) {
            return aAttachments && aAttachments.length > 0;
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
                    that.extHookSetHeaderFooterOptions();
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
            
            debugger;
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
                    debugger;
                    console.log("Respuesta del servidor antes de parsear:", x);

                    console.log("Tipo de x:", typeof x);
                    console.log("Contenido de x:", x);
        
                    var oModel = new sap.ui.model.json.JSONModel();
                    var oResponse = [];
        
                    if (typeof x === "string") {
                        var parser = new DOMParser();
                        x = parser.parseFromString(x, "application/xml");
                    }
        
                    // 🟢 Extraer datos manualmente del XML
                    var items = x.getElementsByTagName("item");
                    for (var i = 0; i < items.length; i++) {
                        var ebeln = items[i].getElementsByTagName("Ebeln")[0]?.textContent || "";
                        var type = items[i].getElementsByTagName("Type")[0]?.textContent || "";
                        var msg = items[i].getElementsByTagName("Msg")[0]?.textContent || "";
        
                        oResponse.push({ Ebeln: ebeln, Type: type, Msg: msg });
                    }
        
                    console.log("Datos extraídos:", oResponse);
        
                    oModel.setData(oResponse);
                    this.getView().setModel(oModel, "detalleEjecucion");
        
                    this._getDialog().open();
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
            
            debugger;
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
                    debugger;
                    console.log("Respuesta del servidor antes de parsear:", x);

                    console.log("Tipo de x:", typeof x);
                    console.log("Contenido de x:", x);
        
                    var oModel = new sap.ui.model.json.JSONModel();
                    var oResponse = [];
        
                    if (typeof x === "string") {
                        var parser = new DOMParser();
                        x = parser.parseFromString(x, "application/xml");
                    }
        
                    // 🟢 Extraer datos manualmente del XML
                    var items = x.getElementsByTagName("item");
                    for (var i = 0; i < items.length; i++) {
                        var ebeln = items[i].getElementsByTagName("Ebeln")[0]?.textContent || "";
                        var type = items[i].getElementsByTagName("Type")[0]?.textContent || "";
                        var msg = items[i].getElementsByTagName("Msg")[0]?.textContent || "";
        
                        oResponse.push({ Ebeln: ebeln, Type: type, Msg: msg });
                    }
        
                    console.log("Datos extraídos:", oResponse);
        
                    oModel.setData(oResponse);
                    this.getView().setModel(oModel, "detalleEjecucion");
        
                    this._getDialog().open();
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
                this._oDialog = sap.ui.xmlfragment("apcontratoscompras.view.fragment.Resume", this);
                this.getView().addDependent(this._oDialog);
            }
   
            return this._oDialog;
        },
   
        sAprobarTodos: function (aItems) {
           var that = this;
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
   
            var url =  that.getUrlBase() + "ODATA_FIORI_GATEWAY/sap/bc/srt/rfc/sap/zmm_po_relm/600/zmm_po_relm/zmm_po_relm";
   
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
   
            var url = that.getUrlBase() + "ODATA_FIORI_GATEWAY/sap/bc/srt/rfc/sap/zmm_po_relm/600/zmm_po_relm/zmm_po_relm";
   
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
            var page = this.getView().getContent()[0];
            if (!page) return;
        
            page = page.getAggregation("_navMaster")?.getAggregation("pages")[0];
            if (!page) return;
        
            var header = page.getCustomHeader();
            if (header && header.getContentRight().length < 1) {
                var oSelectAll = new sap.m.Button({
                    icon: "sap-icon://multiselect-all",
                    press: this.fnSelectAll.bind(this)
                });
                header.addContentRight(oSelectAll);
            }
        
            var bar = page.getFooter();
            if (bar && bar.getContentRight().length < 1) {
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
                bar.addContentRight(oCancelar);
            }
        },
   
        extHookOnInit: function () {
           var that = this;
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
   
           var url2 = that.getUrlBase() + "ODATA_FIORI_GATEWAY/sap/bc/srt/rfc/sap/zfiori_datos_adicionales_me28/600/zws_zfiori_datos_adicionales_me2/zws_zfiori_datos_adicionales_me2";
           
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
               
                       var url = that.getUrlBase() + "ODATA_FIORI_GATEWAY/sap/bc/srt/rfc/sap/zfiori_datos_adicionales_me28/600/zws_zfiori_datos_adicionales_me2/zws_zfiori_datos_adicionales_me2";

               
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
                       //l.detachEvent("updateFinished");
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

        _handleItemPressDesktop: function (oEvent) {
            console.log("_handleItemPressDesktop");

            this.getView().setBusyIndicatorDelay(0);
            this.getView().setBusy(true);
       
            // Obtener el item correcto
            var item;
            if (oEvent.getId() === "select") {
                item = oEvent.getParameter("listItem");
            } else {
                item = oEvent.getSource();
            }
        
            // Validar que item sea un ObjectListItem antes de continuar
            if (!(item instanceof sap.m.ObjectListItem)) {
                this.getView().setBusy(false);
                console.error("El evento no proviene de un ObjectListItem.");
                return;
            }
        
            var oItem = item.getBindingContext().getObject();
            if (!oItem) {
                this.getView().setBusy(false);
                console.error("No se encontró un objeto válido en el contexto.");
                return;
            }
        
            // Actualizar modelo "header"
            this.getView().setModel(new sap.ui.model.json.JSONModel(oItem), "header");
        
            
                // 🔹 CORRECCIÓN: Obtener SplitContainer dinámicamente desde la vista
                var oSplitContainer = this.getView().getParent();
                if (oSplitContainer && oSplitContainer.isA("sap.m.SplitContainer") && !sap.ui.Device.system.phone) {
                    oSplitContainer.hideMaster();
                } else {
                    console.warn("No se encontró el SplitContainer o no es válido.");
                }
        
            // Construcción de la URL para expandir datos
            var sPath = "/WorkflowTaskCollection(SAP__Origin='LOCAL',WorkitemID='" + oItem.WorkitemID + "')/HeaderDetails";
            var aExpand = ["ItemDetails", "Notes", "Attachments"];
        
            console.log("ruta: ", sPath);
        
            var oModel = this.getView().getModel();
        
            // Realizar la llamada OData
            oModel.read(sPath, {
                urlParameters: {
                    "$expand": aExpand.join(',')
                },
                success: function(oData) {
                    sap.m.MessageToast.show("Datos cargados con éxito");
                    this.getView().setModel(new sap.ui.model.json.JSONModel(oData), "detail");
                    console.log("Modelo: ", oData);
                    this.getView().setBusy(false);
                }.bind(this),
                error: function(oError) {
                    this.getView().setBusy(false);
                    sap.m.MessageToast.show("Error al cargar los datos");
                    console.error(oError);
                }
            });
        },
        
        _handleItemPress: function (oEvent) {
            console.log("--_handleItemPress--");
        
            var isPhone = this.getView().getModel("device").getData().isPhone;
            this.fnCargarAprobadores(oEvent);
        
            try {
                this._handleItemPressDesktop(oEvent);
            } catch (e) {
                console.error(e);
            }
        },

        onAttachmentPress: function(oEvent) {
            debugger
            var ModeloPrincipal = this.getView().getModel('detail');

            console.log("Modelo principal: ",ModeloPrincipal);

            var oItem = oEvent.getSource().getBindingContext("detail").getObject();

            if(!oItem || !oItem.AttachmentGuid || !oItem.SAP__Origin){
                sap.m.MessageToast.show("No se encontré el archivo adjunto");
            }

            var AttachmentGuid = oItem.AttachmentGuid;
            var SAP__Origin = oItem.SAP__Origin;

            console.log("Verificación: ",oItem);

            var sPath = `/AttachmentCollection(SAP__Origin='${SAP__Origin}',AttachmentGuid='${AttachmentGuid}')/$value`;
        

            var oModel = this.getView().getModel();


            var sServiceUrl = oModel.sServiceUrl + sPath

            console.log("Url construida: ", sServiceUrl);

            window.open(sServiceUrl, '_blank');
        
        },


        // _handleItemPressDesktop: function (e) {
        //     console.log("_handleItemPressDesktop");
        //     this.setListItem(e);
        //     if (!sap.ui.Device.system.phone) {
        //         this._oApplicationImplementation.oSplitContainer.hideMaster();
        //     }
        // },
   
        // _handleItemPress: function(oEvent) {
        //     debugger
        //     var itemList = oEvent.getSource();
        //     var oItem = itemList.getBindingContext().getObject()
        //     var that = this;
        //     that.getView().setModel(new sap.ui.model.json.JSONModel(oItem),"header");

        //     console.log("datos: ",  that.getView().setModel(new sap.ui.model.json.JSONModel(oItem),"header"));
            
        //     //var sOrigin = oItem.getCustomData()[0].getValue();
        //     //var sWorkitemID = oItem.getCustomData()[1].getValue();

        //     // Construcción de la URL para expandir datos
        //     var sPath =  "/WorkflowTaskCollection(SAP__Origin='LOCAL',WorkitemID='" + oItem.WorkitemID + "')/HeaderDetails";
        //     var aExpand = ["ItemDetails", "Notes", "Attachments"];

        //     console.log("ruta: ", sPath);
            
        //     var oModel = this.getView().getModel();

        //     // Realizar la llamada OData
        //     oModel.read(sPath, {
        //         urlParameters: {
        //             "$expand": aExpand.join(',')
        //         },
        //         success: function(oData) {
        //             debugger
        //             sap.m.MessageToast.show("Datos cargados con éxito");
                    
        //             that.getView().setModel(new sap.ui.model.json.JSONModel(oData),"detail");
        //             console.log(oData);
        //         },
        //         error: function(oError) {
        //             debugger
        //             sap.m.MessageToast.show("Error al cargar los datos");
        //             console.error(oError);
        //         }
        //     });
        // },
   
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
   
        // extHookSetHeaderFooterOptions: function (l) {
        //     console.log("hago cosas");
        //     return l;
        // },
   
      
        extHookSetHeaderFooterOptions: function() {
            var that = this;
            var loading = jQuery.Deferred();
            var PoNumber;
            if ($.ListPO.getSelectedItem()) {
                PoNumber = $.ListPO.getSelectedItem().getBindingContext().getObject().PoNumber;
                loading.resolve(PoNumber);
            } else if ($.PoNumber) {
                PoNumber = $.PoNumber;
                loading.resolve(PoNumber);
            } else {
                this.getView().getModel().attachRequestCompleted(function(x) {
                    PoNumber = $.PoNumber;
                    loading.resolve(PoNumber);
                }.bind(this));
            }
    
            Promise.resolve(loading)
                .then(function() {
                    debugger
    
                    var model = new sap.ui.model.json.JSONModel();
                    this.getView().setModel(model, "aprobadores");
                    /*var data =
                        '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">\
                           <soapenv:Header/>\
                           <soapenv:Body>\
                              <urn:ZfioriLiberadorDoc>\
                                 <EtOutput>\
                                    <!--Zero or more repetitions:-->\
                                 </EtOutput>\
                                 <IvNumero>' + this._getZeros(PoNumber) + 
                                            PoNumber + '</IvNumero>\
                              </urn:ZfioriLiberadorDoc>\
                           </soapenv:Body>\
                        </soapenv:Envelope>';*/
                        
                    var data =
                    '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">' +
                       '<soapenv:Header/>' +
                       '<soapenv:Body>' +
                          '<urn:ZfioriLiberadorDoc>' +
                             '<EtOutput>' +
                                '<!--Zero or more repetitions:-->' +
                                '<item>' +
                                   '<Ebeln></Ebeln>' +
                                   '<Secuencia></Secuencia>' +
                                   '<Nombre></Nombre>' +
                                   '<IdSap></IdSap>' +
                                   '<Aprobado></Aprobado>' +
                                '</item>' +
                             '</EtOutput>' +
                             '<IvNumero>' + this._getZeros(PoNumber) + PoNumber + '</IvNumero>' +
                          '</urn:ZfioriLiberadorDoc>' +
                       '</soapenv:Body>' +
                    '</soapenv:Envelope>';
    
                    //var url = "/coga/sap/bc/srt/rfc/sap/zfiori_liberador_doc/600/zfiori_liberador_doc/zfiori_liberador_doc";
                    var url = that.getUrlBase() + "ODATA_FIORI_GATEWAY/sap/bc/srt/rfc/sap/zfiori_liberador_doc/600/zws_zfiori_libertador_doc/zws_zfiori_libertador_doc"
    
                    var sGetAprobadores = jQuery.ajax({
                        url: url,
                        type: "POST",
                        dataType: "xml",
                        context: this,
                        data: data,
                        contentType: 'text/xml; charset=\"utf-8\"'
                    });
    
                    sGetAprobadores.success(function (x) {
                        debugger
                        sap.ui.core.BusyIndicator.hide();
                        
                        console.log("Respuesta del servidor antes de parsear:", x);
                        
                        // Verificar si la respuesta es un string y convertirla en XML
                        if (typeof x === "string") {
                            var parser = new DOMParser();
                            x = parser.parseFromString(x, "application/xml");
                        }
                    
                        var oAprobadores = [];
                        
                        // 🟢 Extraer datos manualmente del XML
                        var items = x.getElementsByTagName("item");
                        for (var i = 0; i < items.length; i++) {
                            var ebeln = items[i].getElementsByTagName("Ebeln")[0]?.textContent.trim() || "";
                            var secuencia = items[i].getElementsByTagName("Secuencia")[0]?.textContent.trim() || "0";
                            var nombre = items[i].getElementsByTagName("Nombre")[0]?.textContent.trim() || "";
                            var idSap = items[i].getElementsByTagName("IdSap")[0]?.textContent.trim() || "";
                            var aprobado = items[i].getElementsByTagName("Aprobado")[0]?.textContent.trim() || "";
                    
                            oAprobadores.push({
                                Ebeln: ebeln,
                                Secuencia: parseInt(secuencia, 10), // Convertir a número
                                Nombre: nombre,
                                IdSap: idSap,
                                Aprobado: aprobado
                            });
                        }
                    
                        console.log("Datos extraídos:", oAprobadores);
                    
                        // Guardar en el modelo "aprobadores"
                        var oModel = new sap.ui.model.json.JSONModel();
                        oModel.setData({ items: oAprobadores });
                        this.getView().setModel(oModel, "aprobadores");

                        console.log("Modelo aprobadores",this.getView().getModel("aprobadores").getData());
                    }.bind(this));
    
                }.bind(this));
    
        },
    
        _updateListItem: function(e) {
            var m = e.getSource().getModel();
            if (!m) {
                return false;
            }
            var l = this.sContext.replace("/WorkflowTaskCollection", "WorkflowTaskCollection");
            l = l.replace("/HeaderDetails", "");
            var c = "HeaderDetailCollection(";
            if (m.oData[l] && m.oData[l].SAP__Origin) {
                c = c + "SAP__Origin='" + m.oData[l].SAP__Origin + "',PoNumber=";
            }
            c = c + "'" + m.oData[l].PoNumber + "')";
            if (!m.oData[l] || !m.oData[c]) {
                return false;
            }
            m.oData[l].CreatedByID = m.oData[c].CreatedByID;
            m.oData[l].CreatedByName = m.oData[c].CreatedByName;
            m.oData[l].Currency = m.oData[c].Currency;
            m.oData[l].ForwardedByID = m.oData[c].ForwardedByID;
            m.oData[l].ForwardedByName = m.oData[c].ForwardedByName;
            m.oData[l].WiCreatedAt = m.oData[c].WiCreatedAt;
            m.oData[l].Value = m.oData[c].Value;
        },
       
    });
});