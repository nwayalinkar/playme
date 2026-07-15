import os

# Base directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
DATA_FILE = os.path.join(DATA_DIR, 'scores.json')

# Server connection settings
PORT = 5000
HOST = '127.0.0.1'
