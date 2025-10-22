import connexion
from flask_cors import CORS


def create_app():
    # Connexion 3.x: Use FlaskApp with updated configuration
    app = connexion.FlaskApp(__name__, specification_dir='openapi/')

    # Connexion 3.x: add_api() works the same way
    app.add_api('my_api.yaml')

    # Connexion 3.x: Access Flask app via .app attribute (still works)
    CORS(app.app)

    # Connexion 3.x: Return the Connexion app (gunicorn will call it)
    return app
