function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function showEvalSriSettings(changeStatus)
{
  frappe.call({
    method: "erpnext_ec.utilities.tools.validate_sri_settings",
    args: 
    {
      success: function(r) {},
      always: function(r) {},
    },
    callback: function(r)
    {
      console.log(r);
      if(r == null || r == undefined)
        return;
      
      if(r.message == null || r.message == undefined)
        return;

      //if(r.message.SettingsAreReady)
      //{
        //console.log('Configuracion Lista!!');
        //return;
      //}
      //else
      //{
        //console.log('Configuracion No esta Lista!!');
      //}

      var data_header = '';
      var data_alert = '';
      var SettingsAreReady = true;

      for(ig=0; ig < r.message.groups.length; ig++)
      {
        data_header += '<table>';

        if(r.message.groups[ig].SettingsAreReady == false && SettingsAreReady)
        {
          SettingsAreReady = false;
        }

        for(i=0; i < r.message.groups[ig].header.length; i++)
          {                  
            data_header += `<tr>
                      <td>${r.message.groups[ig].header[i].description}:</td>
                      <td>${r.message.groups[ig].header[i].value}</td>
                  </tr>`;
          }
          
          for(i=0; i < r.message.groups[ig].alerts.length; i++)
            {				
              data_header += document.Website.CreateAlertItem(r.message.groups[ig].alerts[i].description);
            }

        data_header += '</table>';
        data_header += '<div class="dropdown-divider"></div>';
        //data_alert += '<table>';
  
        //for(i=0; i < r.message.groups[ig].alerts.length; i++)
        //{				
          //data_alert += document.Website.CreateAlertItem(r.message.groups[ig].alerts[i].description);
        //}
        //data_alert += '</table>';              
      }

      //console.log(data_alert);

      var document_preview = `
            <p>Se requiere revisión</p>` + 
      data_header +
      data_alert +
                `<div class="warning-sri">
                  Por favor, corrija su configuración antes de generar documentos electrónicos.
                </div>`;
      
    if(!SettingsAreReady)
    {
      frappe.msgprint({
        title: __('Configuración incompatible con el SRI'),
        indicator: 'red',
        message: __(document_preview)
      });
    }
      
      if(changeStatus)
      {
        //Se actualiza la cookie a "not"
        frappe.call({
          method: "erpnext_ec.utilities.tools.set_cookie",
          args: 
          {
            cookie_name:'login_boot',
            cookie_value:'not',
            success: function(r) {},
            always: function(r) {},
          },
          callback: function(r)
          {
            //console.log(r);
          },
          error: function(r) {
            //console.log(r);
          },
        });
      }

    },
    error: function(r) {
      console.log(r);
    },
  });
}

function evalSriSettings()
{  
  var login_boot = getCookie('login_boot');

  if(login_boot=='yes')
  {
    showEvalSriSettings(true);
    //console.log('Mensaje de configuracion');        
  }
}

// Función para obtener el selector de navbar compatible con diferentes versiones de Frappe
function getNavbarSelector() {
    // Selector v15 (navbar rediseñada)
    let v15Selectors = [
        '.navbar-right .dropdown',
        '.navbar-nav.navbar-right-icons > li:first-child',
        '.standard-actions .dropdown'
    ];

    // Selector v14 y anteriores
    let legacySelector = 'li.nav-item.dropdown.dropdown-notifications';

    // Intentar selectores v15 primero
    for (let selector of v15Selectors) {
        if ($(selector).length > 0) {
            return { element: $(selector).first(), position: 'before' };
        }
    }

    // Fallback a versión anterior
    if ($(legacySelector).length > 0) {
        return { element: $(legacySelector), position: 'before' };
    }

    // Selector alternativo genérico
    let altSelector = '.navbar .navbar-collapse .navbar-nav';
    if ($(altSelector).length > 0) {
        return { element: $(altSelector).last(), position: 'append' };
    }

    return null;
}

// Función para insertar el botón de compañía en la navbar
function insertCompanyButton() {
    // Evitar duplicados
    if ($('.erpnext-ec-company-btn').length > 0) {
        return;
    }

    var companyName = frappe.boot.sysdefaults.company || 'Sin Empresa';

    var buttonGroup = `<li class="nav-item dropdown dropdown-mobile show erpnext-ec-company-btn">
        <button class="btn-reset nav-link text-muted ellipsis"
        data-toggle="" aria-haspopup="true"
        aria-expanded="true" title=""
        data-original-title="Compania" style="max-width: 120px;"
        onclick="showEvalSriSettings(false)">
        <span class="ellipsis">${companyName}</span>
        </button>
        </li>`;

    let navTarget = getNavbarSelector();

    if (navTarget) {
        if (navTarget.position === 'before') {
            navTarget.element.before(buttonGroup);
        } else if (navTarget.position === 'append') {
            navTarget.element.append(buttonGroup);
        }
    } else {
        console.warn('erpnext_ec: No se pudo encontrar selector de navbar compatible');
    }
}

setTimeout(
    async function () {
      insertCompanyButton();
      evalSriSettings();
}, 2000);

// Escuchar evento page-change para SPAs (v15 usa más navegación SPA)
$(document).on('page-change', function() {
    setTimeout(insertCompanyButton, 500);
});
