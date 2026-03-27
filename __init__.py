"""
CTFd Proxmoxer Client Plugin
Admin interface untuk orkestrasi VM challenge via FastAPI backend.
"""

from flask import Blueprint, render_template
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


