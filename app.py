import os
import csv
import io
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder="frontend", static_url_path="")
CORS(app)

# Stockage temporaire des données CSV en mémoire
csv_storage = {}


@app.route("/")
def index():
    return send_from_directory("frontend", "index.html")


@app.route("/api/upload", methods=["POST"])
def upload_csv():
    if "file" not in request.files:
        return jsonify({"error": "Aucun fichier envoyé"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Aucun fichier sélectionné"}), 400

    if not file.filename.endswith(".csv"):
        return jsonify({"error": "Format non supporté. Seuls les fichiers .csv sont acceptés"}), 400

    try:
        content = file.read().decode("utf-8")
    except UnicodeDecodeError:
        return jsonify({"error": "Encodage non supporté. Le fichier doit être en UTF-8"}), 400

    reader = csv.DictReader(io.StringIO(content))
    rows = list(reader)
    headers = reader.fieldnames or []

    file_id = file.filename
    csv_storage[file_id] = {"headers": headers, "rows": rows, "row_count": len(rows)}

    return jsonify({
        "message": f"Fichier '{file.filename}' importé avec succès",
        "file_id": file_id,
        "headers": headers,
        "row_count": len(rows),
        "preview": rows[:5],
    })


@app.route("/api/data/<file_id>", methods=["GET"])
def get_data(file_id):
    if file_id not in csv_storage:
        return jsonify({"error": "Fichier non trouvé"}), 404

    return jsonify(csv_storage[file_id])


if __name__ == "__main__":
    app.run(debug=True, port=5000)
