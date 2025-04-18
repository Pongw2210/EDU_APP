from flask_admin.contrib.sqla import ModelView
from app import app, db, dao
from flask_admin import Admin, BaseView, expose
from flask_login import current_user, logout_user
from wtforms.fields import SelectField
from flask import redirect, request, jsonify
from models import UserEnum, User, Regulation, Admin_Regulation,Student
from wtforms import ValidationError
from datetime import datetime
import re

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

class UserModelView(AuthenticatedModelView):
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

class RegulationModelView(AuthenticatedModelView):
    column_searchable_list = ['name','content']
    column_labels = {
        'id': 'Mã',
        'name': 'Tên quy định',
        'content': 'Nội dung',
    }
    column_sortable_list = ['id', 'name']
    column_list = ['id', 'name', 'content']
    def on_model_change(self, form, model, is_created):
        if is_created:
            if current_user.is_authenticated and current_user.admin:
                admin_id = current_user.admin.id
                admin_regulation = Admin_Regulation(admin_id=admin_id, regulation_id=model.id)
                db.session.add(admin_regulation)

            db.session.commit()

        return super(RegulationModelView, self).on_model_change(form, model, is_created)

class StudentModelView(AuthenticatedModelView):
    column_searchable_list = ['fullname']
    column_labels = {
        'id':'Mã',
        'fullname':'Họ và tên',
        'dob':'Ngày sinh',
        'gender':'Giới tính',
        'address':'Địa chỉ',
        'phone':'Số điện thoại',
    }
    column_sortable_list = ['id','fullname','dob']
    column_list = ['id','fullname','dob','gender','address','phone','email']
    # Tùy chỉnh form
    form_overrides = {
        'gender': SelectField
    }

    form_args = {
        'gender': {
            'choices': [('Nam', 'Nam'), ('Nữ', 'Nữ')],
            'label': 'Giới tính'
        }
    }
    def on_model_change(self, form, model, is_created):
        # Lấy giá trị tuổi từ quy định
        min_age = dao.get_min_age()
        max_age = dao.get_max_age()

        # Tính tuổi học sinh
        today = datetime.today()
        age = (today - model.dob).days

        if age < min_age or age > max_age:
            raise ValidationError(f"Tuổi học sinh phải từ {min_age} đến {max_age}.")

        if model.email and '@gmail.com' not in model.email:
            raise ValidationError("Email không hợp lệ. Phải chứa '@.gmail.com'.")

        if model.phone and not re.fullmatch(r'\d{10}', model.phone):
            raise ValidationError("Số điện thoại phải gồm đúng 10 chữ số.")

        return super().on_model_change(form, model, is_created)

admin.add_view(UserModelView(User, db.session, name="Quản lý người dùng"))
admin.add_view(StudentModelView(Student, db.session, name="Quản lý học sinh"))
admin.add_view(RegulationModelView(Regulation, db.session, name="Quy định"))
admin.add_view(LogoutAdmin(name="Đăng xuất"))