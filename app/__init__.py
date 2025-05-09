from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
import cloudinary
from flask_socketio import SocketIO
from flask_mail import Mail, Message

app = Flask(__name__)

app.secret_key = "%$@%^@%#^VGHGD"
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:123456@localhost/edudb?charset=utf8mb4"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = True
socketio=SocketIO(app)

db = SQLAlchemy(app)
login = LoginManager(app)

cloudinary.config(
    cloud_name = 'dgqx9xde1',
    api_key = '455275651816759',
    api_secret = '4ouN8Z8Hjj1ahlD7lH8sU21MWwA'
)

app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Ví dụ dùng Gmail
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'pongw.2210@gmail.com'
app.config['MAIL_PASSWORD'] = 'naok eohy xcrk qlup'

mail = Mail(app)

max_score_count_45 = 3
max_score_count_15 = 5





