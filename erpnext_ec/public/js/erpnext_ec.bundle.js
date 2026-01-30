// erpnext_ec.bundle.js - Bundle principal para ERPNext v15+
// Este archivo importa todos los módulos necesarios para la aplicación

// Módulos principales SRI
import "./sri_custom.js";
import "./sales_invoice_tools.js";
import "./delivery_note_tools.js";
import "./withholding_tools.js";
import "./frappe_sri_ui_tools.js";
import "./purchase_receipt_tools.js";

// Librerías externas
import "./libs/jsonTree/jsonTree.js";
import "./libs/monthpicker/jquery.ui.monthpicker.min.js";

// Utilidades de escritorio
import "./utils/desk.custom.js";

console.log('erpnext_ec v15 bundle loaded successfully');
