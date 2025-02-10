// sap.ui.define([
//     "ui/s2p/mm/purcontract/approve/Component"
// ], function (BaseComponent) {
//     "use strict";
    
//     return BaseComponent.extend("ui.s2p.mm.purcontract.approve.uis2pmmpurcontractapproveExtension.Component", {
//         metadata: {
//             manifest: "json"
//         },

//         init: function () {
//             // Llama al init del componente base
//             BaseComponent.prototype.init.apply(this, arguments);
            
//             // Aquí puedes agregar inicializaciones adicionales si son necesarias
//             console.log("Extensión del componente cargada correctamente.");
//         }
//     });
// });

sap.ui.define([
    "sap/ui/core/UIComponent",
    "apcontratoscompras/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("apcontratoscompras.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
        }
    });
});