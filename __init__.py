"""
CTFd Proxmoxer Client Plugin - Hello World Version
Simple plugin to demonstrate CTFd plugin architecture
"""

from flask import Blueprint, render_template_string
from CTFd.plugins import register_plugin_assets_directory, register_admin_plugin_menu_bar
from CTFd.utils.decorators import admins_only

# Create blueprint for the plugin
proxmoxer_blueprint = Blueprint(
    "proxmoxer",
    __name__,
    template_folder="templates",
    static_folder="assets",
    static_url_path="/plugins/ctfd-proxmoxer-client/assets"
)


@proxmoxer_blueprint.route("/admin/plugins/proxmoxer", methods=["GET"])
@admins_only
def proxmoxer_dashboard():
    """
    Dashboard halaman untuk Proxmoxer Client Plugin
    """
    return render_template("dashboard.html")


@proxmoxer_blueprint.route("/admin/plugins/proxmoxer/settings", methods=["GET", "POST"])
@admins_only
def proxmoxer_settings():
    """
    Settings halaman untuk Proxmoxer Client Plugin
    """
    return render_template("settings.html")
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Proxmoxer Client</title>
        <link rel="stylesheet" href="/plugins/ctfd-proxmoxer-client/assets/css/style.css">
    </head>
    <body>
        <div class="container">
            <h1 id="greeting">Hello World!</h1>
            <p>Selamat datang di Plugin Proxmoxer Client</p>
            <button id="myButton" class="btn-hello">Klik Saya</button>
            <p id="message" class="message"></p>
        </div>
        <script src="/plugins/ctfd-proxmoxer-client/assets/js/script.js"></script>
    </body>
    </html>
    """
    return render_template_string(html_content)


def load(app):
    """
    Load function yang dipanggil oleh CTFd saat startup
    Fungsi ini mendaftarkan plugin dengan aplikasi CTFd
    """
    # Register blueprint dengan aplikasi
    app.register_blueprint(proxmoxer_blueprint)

    # Register aset statis (CSS, JS)
    register_plugin_assets_directory(
        app,
        base_path="/plugins/ctfd-proxmoxer-client/assets/"
    )

    # Register menu di admin panel
    register_admin_plugin_menu_bar(
        title="Proxmoxer Client",
        route="/admin/plugins/proxmoxer"
    )

    print("[Proxmoxer Plugin] Plugin berhasil dimuat!")


