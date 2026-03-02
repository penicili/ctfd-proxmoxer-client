# Template Structure - Proxmoxer Client Plugin

## 📋 Struktur Template

```
templates/
├── plugin_base.html    ← Base template untuk plugin (extends admin/base.html)
└── dashboard.html      ← Dashboard page (extends plugin_base.html)
```

## 🔗 Template Hierarchy

```
CTFd admin/base.html
    ↓ (extends)
plugin_base.html
    ↓ (extends)
dashboard.html
```

## 📝 File Details

### `plugin_base.html`
Template dasar untuk semua plugin pages.

**Extends:** `admin/base.html` (dari CTFd)

**Blocks yang disediakan:**
- `{% block page_title %}` - Title di jumbotron
- `{% block plugin_content %}` - Main content area
- `{% block extra_css %}` - Custom CSS
- `{% block extra_scripts %}` - Custom JavaScript

**Fitur:**
- ✅ Navbar CTFd tetap ada
- ✅ Jumbotron header
- ✅ Tailwind CSS CDN
- ✅ Custom CSS & JS auto-loaded

### `dashboard.html`
Dashboard page - contoh penggunaan plugin_base.html

**Extends:** `plugin_base.html`

**Override blocks:**
```html
{% block page_title %}Proxmoxer Client Dashboard{% endblock %}

{% block plugin_content %}
  <!-- Dashboard content -->
{% endblock %}

{% block extra_scripts %}
  <!-- Optional: extra scripts untuk halaman ini -->
{% endblock %}
```

## ✅ Checklist Template System

- [x] Navbar CTFd tidak rusak
- [x] Template inheritance yang proper
- [x] Breadcrumb & navigation bisa ditambah kemudian
- [x] CSS & JS terintegrasi
- [x] Responsive dengan Bootstrap 4
- [x] Siap untuk Tailwind CSS

## 🚀 Cara Menambah Halaman Baru

1. Buat file di `templates/newpage.html`:

```html
{% extends 'plugin_base.html' %}

{% block page_title %}New Page Title{% endblock %}

{% block plugin_content %}
<div class="card">
    <div class="card-header bg-primary text-white">
        <h3>Konten Halaman</h3>
    </div>
    <div class="card-body">
        <!-- Your content here -->
    </div>
</div>
{% endblock %}
```

2. Tambah route di `__init__.py`:

```python
@proxmoxer_blueprint.route("/admin/plugins/proxmoxer/newpage")
@admins_only
def proxmoxer_newpage():
    return render_template("newpage.html")
```

## 🎨 Styling Options

### Bootstrap 4 (Primary)
Gunakan classes dari Bootstrap yang sudah ada di CTFd:
- `.card`, `.card-header`, `.card-body`
- `.btn`, `.btn-primary`, `.btn-success`
- `.row`, `.col-md-*`
- `.mb-4`, `.mt-3`, `.text-white`
- `.fas fa-*` (FontAwesome icons)

### Tailwind CSS (Optional)
Tailwind CDN sudah diload di `plugin_base.html`:
- `.text-4xl`, `.text-lg` - typography
- `.text-blue-600`, `.text-gray-700` - colors
- `.mb-4`, `.mt-3` - spacing (overlap dengan Bootstrap)

### Custom CSS
File: `assets/css/style.css`
- Animations
- Helper utilities
- Custom effects

## 📚 Resources

- CTFd: https://docs.ctfd.io/
- Bootstrap 4: https://getbootstrap.com/docs/4.6/
- Tailwind CSS: https://tailwindcss.com/
- FontAwesome: https://fontawesome.com/

