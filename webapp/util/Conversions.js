jQuery.sap.declare("pecogaapordenescompras.util.Conversions");
jQuery.sap.require("sap.ca.ui.model.format.DateFormat");
jQuery.sap.require("sap.ca.ui.model.format.AmountFormat");
jQuery.sap.require("sap.ca.ui.model.format.FileSizeFormat");
jQuery.sap.require("sap.ca.ui.model.format.NumberFormat");
jQuery.sap.require("sap.ca.ui.model.format.QuantityFormat");
jQuery.sap.require("sap.ca.ui.model.format.FormatHelper");
jQuery.sap.require("sap.ca.ui.model.format.FormattingLibrary");
jQuery.sap.require("sap.ui.core.format.NumberFormat");
sap.ui.define([
	"sap/ui/core/format/NumberFormat",
    
], function() {
	"use strict";
    var Conversions = {
        stringVisibilityTrigger: function(s) {
            if (s == null || s == "") {
                return false;
            } else {
                return true;
            }
        },
        stringFormatterInterop: function(s) {
            if (s != null && s != "") {
                return s;
            } else {
                return "";
            }
        },
        commonIDFormatter: function(d, i) {
            if (i) {
                if (d) {
                    var b = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
                    return b.getText("Formatting.DescriptionAndId", [d, i]);
                }
                return i;
            }
            if (d) {
                return d;
            }
            return "";
        },
        salesOrderIDFormatter: function(s, S, a) {
            var r;
            r = s;
            if (S) {
                r = r + "/" + S;
            }
            if (a) {
                r = r + "/" + a;
            }
            return r;
        },
        assetIDFormatter: function(d, a, A) {
            var s = a;
            if (A) {
                s = s + "/" + A;
            }
            if (s) {
                if (d) {
                    var b = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
                    return b.getText("Formatting.DescriptionAndId", [d, s]);
                }
                return s;
            }
            if (d) {
                return d;
            }
            return "";
        },
        accountAssignmentPercentageFormatter: function(p) {
            if (p == null || p == "") {
                return "";
            } else {
                return "%";
            }
        },
        incoTermsFormatter: function(i, I, s) {
            var r = pecogaapordenescompras.util.Conversions.commonIDFormatter(s, i);
            if (I != '') {
                r += ', ' + I;
            }
            return r;
        },
        incoTermsVisibilityTrigger: function(i, I, s) {
            var f = pecogaapordenescompras.util.Conversions.commonFieldVisibilityTrigger;
            return f(i) && f(s);
        },
        serviceInformationVisibilityTrigger: function(s, l) {
            var f = pecogaapordenescompras.util.Conversions.commonFieldVisibilityTrigger;
            return f(s) || f(l);
        },
        componentVisibilityTrigger: function(i) {
            if (i === "3") {
                return true;
            } else {
                return false;
            }
        },
        PriceConditionsVisibilityTriggerItemType: function(p) {
            if (p === null || p === "" || p.length === 0 || p === undefined) {
                return false;
            } else {
                return true;
            }
        },
        itemCategoryFormatter: function(i, I) {
            if (i && i !== 'return-item') {
                if (i && i !== "") {
                    return i;
                } else {
                    var b = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
                    if (I == 'S') {
                        return (b !== undefined) ? b.getText("view.PurchaseOrder.serviceLineIdLabel") : "";
                    } else if (I == 'L') {
                        return (b !== undefined) ? b.getText("view.PurchaseOrder.limit") : "";
                    } else if (I == 'M') {
                        return (b !== undefined) ? b.getText("view.PurchaseOrder.standard") : "";
                    } else if (I == '2') {
                        return (b !== undefined) ? b.getText("view.PurchaseOrder.consignment") : "";
                    } else if (I == '3') {
                        return (b !== undefined) ? b.getText("view.PurchaseOrder.subcontracting") : "";
                    } else if (I == '5') {
                        return (b !== undefined) ? b.getText("view.PurchaseOrder.thirdParty") : "";
                    }
                    ;
                }
                ;
            } else {
                var b = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
                if (I == 'S') {
                    var i = (b !== undefined) ? b.getText("view.PurchaseOrder.serviceLineIdLabel") : "";
                } else if (I == 'L') {
                    var i = (b !== undefined) ? b.getText("view.PurchaseOrder.limit") : "";
                } else if (I == 'M') {
                    var i = (b !== undefined) ? b.getText("view.PurchaseOrder.standard") : "";
                } else if (I == '2') {
                    var i = (b !== undefined) ? b.getText("view.PurchaseOrder.consignment") : "";
                } else if (I == '3') {
                    var i = (b !== undefined) ? b.getText("view.PurchaseOrder.subcontracting") : "";
                } else if (I == '5') {
                    var i = (b !== undefined) ? b.getText("view.PurchaseOrder.thirdParty") : "";
                }
                var r = (b !== undefined) ? b.getText("view.PurchaseOrder.return") : "";
                var R = i + ' / ' + r;
                return R;
            }
            ;
        },
        IDFormatter: function(d, i) {
            return pecogaapordenescompras.util.Conversions.commonIDFormatter(d, i);
        },
        companyCodeFormatter: function(c, C) {
            return pecogaapordenescompras.util.Conversions.commonIDFormatter(C, c);
        },
        lazyRoundNumber: function(n) {
            var r = 0;
            var f;
            if (n) {
                if (!isNaN(parseFloat(n)) && isFinite(n)) {
                    if (Math.abs(n) < 1e6) {
                        f = sap.ui.core.format.NumberFormat.getInstance({
                            style: 'standard'
                        });
                    } else {
                        f = sap.ui.core.format.NumberFormat.getInstance({
                            style: 'short',
                            shortDecimals: 2
                        });
                    }
                    r = f.format(n);
                }
            }
            return r;
        },
        formatPrice: function(n) {
            var f = sap.ui.core.format.NumberFormat.getInstance({
                style: 'standard'
            });
            return f.format(n);
        },
        getNumberFormatOptions: function(o, l) {
            var f = {};
            var t = typeof o;
            switch (t) {
            case "number":
                if (l) {
                    f.lazyDecimals = o;
                } else {
                    f.decimals = o;
                }
                break;
            case "object":
                if (typeof o.locale == "string") {
                    f.locale = new sap.ui.core.Locale(o.locale);
                } else {
                    f.locale = o.locale;
                }
                f.decimals = o.decimals;
                f.rounding = o.rounding;
                f.lazy = o.lazy;
                f.lazyDecimals = o.lazyDecimals;
                f.lazyRounding = o.lazyRounding;
                break;
            default:
                break;
            }
            if (l != undefined) {
                f.lazy = l;
            }
            if (!f.locale) {
                if (sap.ui.getCore().getConfiguration().getLanguage() == "ZH") {
                    f.locale = new sap.ui.core.Locale("zh_CN");
                } else {
                    f.locale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
                }
            }
            return f;
        },
        accountingFormatter: function(h) {
            if (!h) {
                return;
            }
            ;var b = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
            var m = (b !== undefined) ? b.getText("view.PurchaseOrder.multiAccounting") : "";
            var n = (b !== undefined) ? b.getText("view.PurchaseOrder.placeholder") : "";
            var u = (b !== undefined) ? b.getText("view.PurchaseOrder.unknown") : "";
            var g = (b !== undefined) ? b.getText("view.PurchaseOrder.account") : "";
            if (h.CumulatedAccountingTypeCode == '2') {
                return m;
            } else if (h.CumulatedAccountingTypeCode == '3') {
                return u;
            } else if (h.CumulatedAccountingTypeCode == '0') {
                return n;
            }
            ;if ((h.CostCentre === "" || h.CostCentre === undefined) && (h.WBSElement === "" || h.WBSElement === undefined) && (h.Network === "" || h.Network === undefined) && (h.Order === "" || h.Order === undefined) && (h.SalesOrder === "" || h.SalesOrder === undefined) && (h.Asset === "" || h.Asset === undefined) && (h.ProfitCenter === "" || h.ProfitCenter === undefined)) {
                var r = pecogaapordenescompras.util.Conversions.commonIDFormatter(h.AccountDescription, h.AccountNumber);
                var R = pecogaapordenescompras.util.Conversions.commonIDFormatter(h.GlAccountDescription, h.GlAccountNumber);
                return h.AccountCategoryDescription + ' ' + r + '\n' + g + ' ' + R;
            } else {
                var s = "";
                if (h.CostCentre != "") {
                    var c = (b !== undefined) ? b.getText("view.PurchaseOrder.accountAssignmentCostCentre") : "";
                    s = c + ' ' + pecogaapordenescompras.util.Conversions.commonIDFormatter(h.CostCentreDescription, h.CostCentre);
                }
                if (h.WBSElement != "") {
                    if (s !== "") {
                        s = s + '\n';
                    }
                    ;var w = (b !== undefined) ? b.getText("view.PurchaseOrder.accountAssignmentWBSElement") : "";
                    s = s + w + ' ' + pecogaapordenescompras.util.Conversions.commonIDFormatter(h.WBSElementDescription, h.WBSElement);
                }
                if (h.Network != "") {
                    if (s !== "") {
                        s = s + '\n';
                    }
                    ;var N = (b !== undefined) ? b.getText("view.PurchaseOrder.accountAssignmentNetwork") : "";
                    s = s + N + ' ' + pecogaapordenescompras.util.Conversions.commonIDFormatter(h.NetworkDescription, h.Network);
                }
                if (h.Order != "") {
                    if (s !== "") {
                        s = s + '\n';
                    }
                    ;var o = (b !== undefined) ? b.getText("view.PurchaseOrder.accountAssignmentOrder") : "";
                    s = s + o + ' ' + pecogaapordenescompras.util.Conversions.commonIDFormatter(h.OrderDescription, h.Order);
                }
                if (h.SalesOrder != "") {
                    if (s !== "") {
                        s = s + '\n';
                    }
                    ;var S = (b !== undefined) ? b.getText("view.PurchaseOrder.accountAssignmentSalesOrder") : "";
                    s = s + S + ' ' + pecogaapordenescompras.util.Conversions.salesOrderIDFormatter(h.SalesOrder, h.SalesOrderItem, h.SalesOrderScheduleLine);
                }
                if (h.Asset != "") {
                    if (s !== "") {
                        s = s + '\n';
                    }
                    ;var a = (b !== undefined) ? b.getText("view.PurchaseOrder.accountAssignmentAsset") : "";
                    s = s + a + ' ' + pecogaapordenescompras.util.Conversions.assetIDFormatter(h.AssetDescription, h.Asset, h.AssetSubnumber);
                }
                if (h.ProfitCenter != "") {
                    if (s !== "") {
                        s = s + '\n';
                    }
                    ;var p = (b !== undefined) ? b.getText("view.PurchaseOrder.ProfitCenter") : "";
                    s = s + p + ' ' + pecogaapordenescompras.util.Conversions.commonIDFormatter(h.ProfitCenterDescription, h.ProfitCenter);
                }
                if (h.GlAccountNumber != "") {
                    if (s !== "") {
                        s = s + '\n';
                    }
                    ;var G = (b !== undefined) ? b.getText("view.PurchaseOrder.account") : "";
                    s = s + G + ' ' + pecogaapordenescompras.util.Conversions.commonIDFormatter(h.GlAccountDescription, h.GlAccountNumber);
                }
                return s;
            }
        },
        noteDateFormatter: function(n, d) {
            if (n) {
                return pecogaapordenescompras.util.Conversions.formatDaysAgo(d);
            } else {
                return '';
            }
            ;
        },
        approverNoteValueFormatter: function(n, v) {
            if (n) {
                return v;
            } else {
                return '';
            }
            ;
        },
        companyCodeVisibilityTrigger: function(c, C) {
            if ((c == '' || c == null) && (C == '' || C == null)) {
                return false;
            } else {
                return true;
            }
            ;
        },
        commonFieldVisibilityTrigger: function(v) {
            if (v == '' || v == null) {
                return false;
            } else {
                return true;
            }
            ;
        },
        deliveryAddressFormatter: function(s, p, c, C) {
            return s + "," + " " + p + " " + c + "," + " " + C;
        },
        valueLimitFormatter: function(v, u, c) {
            var b = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
            var r = (b !== undefined) ? b.getText("view.PurchaseOrder.valueLimit") : "";
            r += ': ' + pecogaapordenescompras.util.Conversions.valueLimitWithoutLabelFormatter(v, u, c);
            return r;
        },
        valueLimitWithoutLabelFormatter: function(v, u, c) {
            var b = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
            var r = "";
            if (u === '' || u === null || u === undefined) {
                r += pecogaapordenescompras.util.Conversions.formatPrice(v) + ' ' + c;
            } else {
                r += ((b !== undefined) ? b.getText("view.PurchaseOrder.unlimitedLimit") : "");
            }
            return r;
        },
        expectedValueFormatter: function(v, c) {
            var b = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
            var r = (b !== undefined) ? b.getText("view.PurchaseOrder.expectedValue") : "";
            r += ': ' + pecogaapordenescompras.util.Conversions.formatPrice(v) + ' ' + c;
            return r;
        },
        itemQuantityFormatter: function(q, u, v, U, c, t) {
            var b = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
            if (t == 'S') {
                return (b !== undefined) ? b.getText("view.PurchaseOrder.serviceLineIdLabel") : "";
            } else if (t == 'L') {
                return (b !== undefined) ? b.getText("view.PurchaseOrder.limit") : "";
            } else {
                return pecogaapordenescompras.util.Conversions.quantityFormatter(q, u);
            }
            ;
        },
        quantityFormatter: function(q, u) {
            return pecogaapordenescompras.util.Conversions.formatQuantityWithoutUnit(q, u) + ' ' + u;
        },
        formatQuantityWithoutUnit: function(q, u) {
            var n = sap.ui.core.format.NumberFormat.getFloatInstance({}, sap.ui.getCore().getConfiguration().getLocale());
            return n.format(q);
        },
        quantityPerUnitItemCategory: function(q, u, p, c, i) {
            if (i === "2") {
                return pecogaapordenescompras.util.Conversions.quantityPerUnitFormatter("", "", "", "", "");
            } else {
                return pecogaapordenescompras.util.Conversions.quantityPerUnitFormatter(q, u, p, c, i);
            }
        },
        quantityPerUnitFormatter: function(q, u, p, c) {
            var p = pecogaapordenescompras.util.Conversions.formatPrice(p);
            var q = pecogaapordenescompras.util.Conversions.formatQuantityWithoutUnit(q, u);
            var b = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
            return b.getText("view.PurchaseOrder.priceQty", [p, c, q, u]);
        },
        totalPriceFormatter: function(p, c) {
            return p + ' ' + c;
        },
        notesVisibilityTrigger: function(n) {
            if (n !== null && n !== undefined && n.length !== 0) {
                return true;
            } else {
                return false;
            }
            ;
        },
        attachmentsVisibilityTrigger: function(a) {
            if (a !== null && a !== undefined && a.length !== 0) {
                return true;
            } else {
                return false;
            }
            ;
        },
        createdByFormatter: function(i, n) {
            var b = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
            var r = (b !== undefined) ? b.getText("view.PurchaseOrder.by") : "";
            if (n !== undefined && n !== '') {
                r += ' ' + n;
            } else {
                r += ' ' + i;
            }
            return r;
        },
        deliveryDateFormatter: function(d, a) {
            var b = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
            var l = (b !== undefined) ? b.getText("view.PurchaseOrder.DeliveryAlsoLater") : "";
            var D = pecogaapordenescompras.util.Conversions.formatLongDate(d, true);
            if (a == null || a == "") {
                return D;
            } else if (sap.ui.getCore().getConfiguration().getLanguage() == "zh-Hans") {
                return D + l;
            } else {
                return D + ' ' + l;
            }
        },
        fConvert: function(d) {
            var D = d;
            if (typeof d === "string") {
                if (d.indexOf("Date") != -1) {
                    d = d.substring(d.indexOf("(") + 1, d.indexOf(")"));
                    d = new Number(d);
                }
                D = new Date(d);
            } else if (typeof d !== "object" || d === null) {
                D = "";
            }
            return D;
        },
        formatLongDate: function(d, u) {
            var f = sap.ca.ui.model.format.DateFormat.getDateInstance({
                style: "medium"
            }, sap.ui.getCore().getConfiguration().getLocale());
            d = pecogaapordenescompras.util.Conversions.fConvert(d);
            if (d === "") {
                return "";
            }
            return f.format(d, u);
        },
        deliveryHeaderFormatter: function(d, a) {
            var b = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
            var p = (b !== undefined) ? b.getText("view.PurchaseOrder.deliveryOn") : "";
            return p + ' ' + pecogaapordenescompras.util.Conversions.deliveryDateFormatter(d, a);
        },
        itemsTableHeader: function(i) {
            var b = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
            if (i === undefined || i === null || parseInt(i) == 0) {
                return (b !== undefined) ? b.getText("view.PurchaseOrder.noItem") : "";
            } else {
                return (b !== undefined) ? b.getText("view.PurchaseOrder.multipleItems", [parseInt(i)]) : "";
            }
            ;
        },
        serviceLinesTableHeader: function(i) {
            var b = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
            if (i === undefined || i === null || parseInt(i) == 0) {
                return '';
            } else {
                return (b !== undefined) ? b.getText("view.PurchaseOrder.multipleLines", [parseInt(i)]) : "";
            }
            ;
        },
        commonCountVisibilityTrigger: function(c) {
            if (c !== null && c !== undefined && c != '0') {
                return true;
            } else {
                return false;
            }
            ;
        },
        materialVisibilityTrigger: function(p) {
            if (p !== "L" && p !== "S") {
                return true;
            }
            return false;
        },
        serviceVisibilityTrigger: function(p) {
            if (p == "S") {
                return true;
            }
            return false;
        },
        limitVisibilityTrigger: function(p) {
            if (p == "L") {
                return true;
            }
            return false;
        },
        ItemServiceLineVisibilityTrigger: function(n) {
            if (n == '' || n == null || n == "0") {
                return false;
            } else {
                return true;
            }
        },
        ItemLimitVisibilityTrigger: function(l, e, c) {
            if (c == "S" && ((l && parseFloat(l) > 0) || (e && parseFloat(e) > 0))) {
                return true;
            } else {
                return false;
            }
        },
        ItemAccountAssignmentVisibilityTrigger: function(a) {
            if (a !== null && a !== undefined && a.length !== 0) {
                return true;
            } else {
                return false;
            }
        },
        GetAccountAssignmentVisibility: function(a, o) {
            if (!a) {
                return true;
            }
            if (!a[0]) {
                return true;
            }
            var p = a[0];
            if (!o.getModel) {
                return true;
            }
            var m = o.getModel();
            if (!m) {
                return true;
            }
            if (!m.oData) {
                return true;
            }
            var f = m.oData[p];
            if (!f) {
                return true;
            }
            if ((f.CostCentre === "" || f.CostCentre === undefined) && (f.WBSElement === "" || f.WBSElement === undefined) && (f.Network === "" || f.Network === undefined) && (f.Order === "" || f.Order === undefined) && (f.SalesOrder === "" || f.SalesOrder === undefined) && (f.Asset === "" || f.Asset === undefined)) {
                return true;
            }
            return false;
        },
        OldAccountAssignmentVisibilityTrigger: function(a) {
            var t = this;
            return pecogaapordenescompras.util.Conversions.GetAccountAssignmentVisibility(a, t);
        },
        NewAccountAssignmentVisibilityTrigger: function(a) {
            var t = this;
            var r = pecogaapordenescompras.util.Conversions.GetAccountAssignmentVisibility(a, t);
            if (r === true) {
                return false;
            }
            return true;
        },
        ItemNoteVisibilityTrigger: function(n) {
            if (n == '' || n == null || n == "0" || n == 0) {
                return false;
            } else {
                return true;
            }
            ;
        },
        formatAttachmentIcon: function(m) {
            return sap.ca.ui.model.format.FormattingLibrary.formatAttachmentIcon(m);
        },
        formatAttachmentSize: function(f) {
            var a = sap.ca.ui.model.format.FileSizeFormat.getInstance();
            return a.format(f);
        },
        formatAttachmentDesc: function(d, m) {
            if (d) {
                return d;
            }
            return m;
        },
        ItemAttachmentVisibilityTrigger: function(n) {
            if (n == '' || n == null || n == "0" || n == 0) {
                return false;
            } else {
                return true;
            }
            ;
        },
        forwardedBy: function(r) {
            var b = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
            var R = (b !== undefined) ? b.getText("view.PurchaseOrder.forwarded") : "";
            if (r === null || r == "") {
                return '';
            } else {
                return R + ' ' + r;
            }
            ;
        },
        substitutedBy: function(s) {
            var b = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
            var r = (b !== undefined) ? b.getText("view.PurchaseOrder.substituted") : "";
            if (s === null || s == "") {
                return '';
            } else {
                return r + ' ' + s;
            }
            ;
        },
        customerNameFormatter: function(c, C) {
            if (C !== '' && C !== undefined && C !== null) {
                return c + ' (' + C + ')';
            } else {
                return c;
            }
            ;
        },
        plantVisibilityTrigger: function(p, c, a, i) {
            if ((p !== '' || p !== null) && (c === '' || c === null || c === undefined) && (a === '' || a === null || a === undefined) && i !== "5") {
                return true;
            } else {
                return false;
            }
            ;
        },
        customerNameVisibilityTrigger: function(c, C) {
            if (c !== '' && c !== undefined && c !== null && C !== '' && C !== undefined && C !== null) {
                return true;
            } else {
                return false;
            }
        },
        freestyleNameVisibilityTrigger: function(c, C) {
            if (c !== '' && c !== undefined && c !== null && (C === '' || C === undefined || C === null)) {
                return true;
            } else {
                return false;
            }
        },
        materialGroupFormatter: function(m, M) {
            if (m !== '' && m !== undefined && m !== null) {
                return M + ' (' + m + ')';
            } else {
                return M;
            }
            ;
        },
        materialGroupVisibilityTrigger: function(m, M) {
            if ((m == '' || m == null) && (M == '' || M == null)) {
                return false;
            } else {
                return true;
            }
            ;
        },
        materialIDVisibilityTrigger: function(m) {
            if (m !== '' && m !== undefined && m !== null) {
                return true;
            } else {
                return false;
            }
            ;
        },
        formatDaysAgo: function(d) {
            if (d == null || d == "") {
                return "";
            } else {
                var f = sap.ca.ui.model.format.DateFormat.getDateInstance({
                    style: "daysAgo"
                }, sap.ui.getCore().getConfiguration().getLocale());
                var F = f.format(d, true);
                return F;
            }
        },
        formatNumberItemType: function(v, i) {
            if (i == '2') {
                return "";
            } else {
                return pecogaapordenescompras.util.Conversions.formatPrice(v);
            }
        },
        formatNumberUnitItemType: function(i, c) {
            if (i === '2') {
                return "";
            } else {
                return c;
            }
        },
        formatAmount: function(n) {
            var f = sap.ui.core.format.NumberFormat.getCurrencyInstance({
                showMeasure: false
            });
            return f.format(n);
        },
        formatNumber: function(n, o) {
            var a = pecogaapordenescompras.util.Conversions.toNumeric(n);
            if (!isFinite(a)) {
                return "";
            }
            var f = pecogaapordenescompras.util.Conversions.getFormatOptions(o);
            var b = sap.ui.core.format.NumberFormat.getFloatInstance({}, f.locale);
            if (pecogaapordenescompras.util.Conversions.hasRounding(o)) {
                a = pecogaapordenescompras.util.Conversions.roundNumber(a, f);
                return b.format(a);
            } else {
                return b.format(n);
            }
        },
        toNumeric: function(o) {
            return sap.ca.ui.model.format.FormatHelper.toNumeric(o);
        },
        getFormatOptions: function(o, l) {
            var f = {};
            var t = typeof o;
            switch (t) {
            case "number":
                if (l) {
                    f.lazyDecimals = o;
                } else {
                    f.decimals = o;
                }
                break;
            case "object":
                if (typeof o.locale === "string") {
                    f.locale = new sap.ui.core.Locale(o.locale);
                } else {
                    f.locale = o.locale;
                }
                f.decimals = o.decimals;
                f.rounding = o.rounding;
                f.lazy = o.lazy;
                f.lazyDecimals = o.lazyDecimals;
                f.lazyRounding = o.lazyRounding;
                break;
            default:
                break;
            }
            if (l !== undefined) {
                f.lazy = l;
            }
            if (!f.locale) {
                if (sap.ui.getCore().getConfiguration().getLanguage() == "ZH") {
                    f.locale = new sap.ui.core.Locale("zh_CN");
                } else {
                    f.locale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
                }
            }
            return f;
        },
        roundNumber: function(n, o) {
            return sap.ca.ui.model.format.FormatHelper.roundNumber(n, o);
        },
        hasRounding: function(o) {
            var r;
            if (o !== undefined) {
                if (typeof o === "number") {
                    r = true;
                } else {
                    if (o.lazy) {
                        r = (o.lazyDecimals !== undefined) || (o.lazyRounding !== undefined);
                    } else {
                        r = (o.decimals !== undefined) || (o.rounding !== undefined);
                    }
                }
            } else {
                r = false;
            }
            return r;
        },
        businessCardImg: function(m, i) {
            if (m) {
                return i;
            } else {
                return null;
            }
        },
        onAttachment: function(m) {
            var u = "";
            if (m && typeof m === "string") {
                var l = document.createElement("a");
                l.href = m;
                u = (l.pathname.charAt(0) === "/") ? l.pathname : "/" + l.pathname;
                sap.m.URLHelper.redirect(u, true);
            }
        }
    };
    return Conversions;

}, /* bExport= */ true);