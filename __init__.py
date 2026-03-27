"""
CTFd Proxmoxer Client Plugin
Admin interface untuk orkestrasi VM challenge via FastAPI backend.
"""

from flask import Blueprint, render_template, request, jsonify
from CTFd.models import Teams, Challenges, Flags, db
from CTFd.plugins import register_plugin_assets_directory, register_admin_plugin_menu_bar
from CTFd.utils.decorators import admins_only

proxmoxer_blueprint = Blueprint(
    "proxmoxer",
    __name__,
    template_folder="templates",
    static_folder="assets",
    static_url_path="/plugins/ctfd-proxmoxer-client/assets"
)


# ── Dashboard ────────────────────────────────────────────────────────────────

@proxmoxer_blueprint.route("/admin/plugins/proxmoxer", methods=["GET"])
@admins_only
def proxmoxer_dashboard():
    return render_template("dashboard.html")


# ── Internal Plugin API ──────────────────────────────────────────────────────

@proxmoxer_blueprint.route("/admin/plugins/proxmoxer/api/teams", methods=["GET"])
@admins_only
def get_ctfd_teams():
    """Kembalikan daftar teams yang terdaftar di CTFd."""
    teams = Teams.query.filter_by(hidden=False, banned=False).order_by(Teams.name).all()
    return jsonify({
        "total": len(teams),
        "teams": [{"id": t.id, "name": t.name} for t in teams]
    })


@proxmoxer_blueprint.route("/admin/plugins/proxmoxer/api/finalize", methods=["POST"])
@admins_only
def finalize_challenge():
    """
    Setelah VM running, buat entri challenge di CTFd dan set flag-nya.

    Request body:
    {
        "team_id": int,           -- CTFd team ID
        "flag": str,              -- flag yang di-generate backend
        "level_name": str,
        "level_category": str,
        "level_points": int,
        "level_description": str, -- (optional)
        "vm_ip": str              -- (optional) untuk ditampilkan di description
    }

    Response:
    { "ctfd_challenge_id": int }
    """
    data = request.get_json()

    team = Teams.query.get(data["team_id"])
    if not team:
        return jsonify({"error": "Team not found"}), 404

    description = data.get("level_description") or ""
    if data.get("vm_ip"):
        description += f"\n\n**VM IP:** `{data['vm_ip']}`"

    challenge = Challenges(
        name=f"{data['level_name']} [{team.name}]",
        description=description.strip(),
        value=data["level_points"],
        category=data["level_category"],
        type="standard",
        state="visible",
    )
    db.session.add(challenge)
    db.session.commit()

    flag_entry = Flags(
        challenge_id=challenge.id,
        type="static",
        content=data["flag"],
        data="",
    )
    db.session.add(flag_entry)
    db.session.commit()

    return jsonify({"ctfd_challenge_id": challenge.id}), 201


# ── Load ─────────────────────────────────────────────────────────────────────

def load(app):
    app.register_blueprint(proxmoxer_blueprint)

    register_plugin_assets_directory(
        app,
        base_path="/plugins/ctfd-proxmoxer-client/assets/"
    )

    register_admin_plugin_menu_bar(
        title="Proxmoxer Client",
        route="/admin/plugins/proxmoxer"
    )

    print("[Proxmoxer Plugin] Plugin berhasil dimuat!")
