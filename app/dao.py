import hashlib
from models import User

def get_user_by_id(user_id):
    return User.query.get(user_id)

def auth_user(username, password, role=None):
    hashed_password = hashlib.md5(password.encode('utf-8')).hexdigest()

    query = User.query.filter(
        User.username == username,
        User.password == hashed_password
    )
    if role:
        query = query.filter(User.role == role)

    return query.first()