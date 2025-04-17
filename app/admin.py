from flask_admin.contrib.sqla import ModelView
from app import app, db, dao
from flask_admin import Admin, BaseView, expose
from flask_login import current_user, logout_user
from wtforms.fields import SelectField
from flask import redirect, request, jsonify
from models import UserEnum, User


admin=Admin(app=app,name="Student Management",template_mode='bootstrap4')

class AuthenticatedModelView(ModelView):
    column_display_pk = True
    can_export = True
    can_view_details = True
    can_edit = True
    def is_accessible(self):
        return current_user.is_authenticated and current_user.role == UserEnum.ADMIN

class LogoutAdmin(BaseView):
    @expose('/')
    def index(self):
        logout_user()
        return redirect('/login')

    def is_accessible(self):
        return current_user.is_authenticated

class UserView(AuthenticatedModelView):
    column_searchable_list = ['username']
    column_labels = {
        'id': 'Mã',
        'username': 'Tên đăng nhập',
        'password': 'Mật khẩu',
        'avatar': 'Ảnh đại diện',
        'role': 'Vai trò',
        'joined_date':'Ngày tham gia'
    }
    column_sortable_list = ['id', 'username', 'role','joined_date']
    column_list = ['id', 'username', 'password', 'avatar', 'role','joined_date']


admin.add_view(UserView(User, db.session, name="Quản lý người dùng"))
admin.add_view(LogoutAdmin(name="Đăng xuất"))