from flask import Flask
from dotenv import load_dotenv
import os

def create_app():
    app = Flask(__name__)

    # Load environment variables from .env file
    load_dotenv()

    # Load config from object
    app.config.from_object('config.Config')

    with app.app_context():
        from . import routes

    return app
