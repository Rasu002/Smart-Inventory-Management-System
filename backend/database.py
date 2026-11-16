import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

def get_connection():
    return mysql.connector.connect(
        host = os.getenv("host"),
        database = os.getenv("database"),
        user = os.getenv("user"),
        password = os.getenv("password"),
    )



