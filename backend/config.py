import os

class Config:
    HOST = os.environ.get('HOST')
    PORT = os.environ.get('PORT')
    CORS_URL = os.environ.get('CORS_URL')
