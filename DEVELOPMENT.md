# Development Guide - Proxmoxer Client Plugin

## 🚀 Quick Start

### 1. Start Server
```bash
cd "D:\Kuliah\Semt 8\Tugas Akhir\CTFd"
python serve.py
```

### 2. Access Plugin
- Navigate to: http://localhost:4000/admin/plugins/proxmoxer
- Or Admin Panel → Plugins → Proxmoxer Client

### 3. Test Features
- Click "Klik Saya" button → counter updates
- Message appears with fade animation
- Total Clicks card updates

## 📁 Project Structure (Clean & Simple)

```
ctfd-proxmoxer-client/
├── __init__.py                  # Plugin entry point & routes
├── TEMPLATE_DOCS.md            # Template documentation
├── DEVELOPMENT.md              # This file
│
├── templates/
│   ├── plugin_base.html        # Base template (extends admin/base.html)
│   └── dashboard.html          # Dashboard page (extends plugin_base.html)
│
└── assets/
    ├── css/
    │   └── style.css           # Custom CSS (minimal)
    └── js/
        └── script.js           # JavaScript (minimal)
```

## 🔧 File Purposes

### `__init__.py`
- Blueprint definition
- Route handlers
- Plugin registration

**Routes:**
- `/admin/plugins/proxmoxer` → Dashboard

### `plugin_base.html`
- Extends CTFd's `admin/base.html` (navbar tetap ada!)
- Provides `plugin_content` block untuk child templates
- Loads Tailwind CSS & custom CSS
- Loads custom JavaScript

### `dashboard.html`
- Extends `plugin_base.html`
- Demo content: button, cards, stats
- Example of how to use plugin_base.html

### `style.css`
- Tailwind utility classes (for Bootstrap compatibility)
- Fade-in animation
- Opacity helpers for icons

### `script.js`
- Button click handler
- Updates message & counter
- Shows fade-in animation

## 💡 How Template Inheritance Works

```
User visits: /admin/plugins/proxmoxer
    ↓
__init__.py: return render_template("dashboard.html")
    ↓
dashboard.html extends 'plugin_base.html'
    ↓
plugin_base.html extends 'admin/base.html'
    ↓
admin/base.html renders:
  - CTFd navbar ✅
  - CTFd stylesheets ✅
  - plugin_base.html content:
    - Jumbotron header
    - plugin_content block
  - plugin_base.html scripts

Result: Full CTFd page with navbar + plugin content
```

## ⚙️ Modifying Templates

### Add new block to plugin_base.html
```html
{% extends "admin/base.html" %}

{% block content %}
  <div class="container">
    <!-- ... existing ... -->
    {% block my_new_block %}{% endblock %}
  </div>
{% endblock %}
```

### Use new block in dashboard.html
```html
{% extends 'plugin_base.html' %}

{% block my_new_block %}
  <p>My custom content</p>
{% endblock %}
```

## 🎯 Adding New Pages

### Step 1: Create template
```html
{# templates/mypage.html #}
{% extends 'plugin_base.html' %}

{% block page_title %}My Page{% endblock %}

{% block plugin_content %}
  <div class="card">
    <div class="card-body">
      <h1>My Page Content</h1>
    </div>
  </div>
{% endblock %}
```

### Step 2: Add route
```python
{# __init__.py #}
@proxmoxer_blueprint.route("/admin/plugins/proxmoxer/mypage")
@admins_only
def proxmoxer_mypage():
    return render_template("mypage.html")
```

## 🐛 Troubleshooting

### Problem: Navbar hilang
**Check:**
1. `plugin_base.html` extends dari `admin/base.html` ✓
2. `plugin_base.html` punya `{{ super() }}` di blocks ✓
3. Browser refresh/cache clear

### Problem: CSS tidak bekerja
**Check:**
1. Path benar: `/plugins/ctfd-proxmoxer-client/assets/css/style.css`
2. Browser DevTools → Network tab → check CSS loading
3. Try hard refresh (Ctrl+Shift+R)

### Problem: JavaScript error
**Check:**
1. Browser DevTools → Console tab
2. Check elements exist with `getElementById()`
3. Wrap code dalam `DOMContentLoaded` event

### Problem: Template not found
**Check:**
1. File ada di `templates/` directory
2. Nama file benar (case sensitive)
3. Blueprint punya `template_folder="templates"`

## ✨ Best Practices

1. ✅ Keep templates simple - business logic di Python
2. ✅ Use Bootstrap 4 classes (native dari CTFd)
3. ✅ Minimal custom CSS - hanya untuk special needs
4. ✅ Always test navbar ada dan berfungsi
5. ✅ Use Jinja2 template inheritance properly
6. ✅ Comments untuk complex template logic

## 📝 Next Steps

### Ketika siap implement fitur sebenarnya:
1. Add models untuk Proxmox credentials
2. Add forms untuk input data
3. Add API endpoints untuk Proxmox
4. Implement VM management
5. Add more pages sesuai kebutuhan

## 🔗 Documentation

- See: `TEMPLATE_DOCS.md` untuk template details
- See: `__init__.py` untuk route definitions
- See: Individual template files untuk content structure

---

**Status:** ✅ Template system clean & working
**Next:** Ready untuk development fitur sebenarnya

