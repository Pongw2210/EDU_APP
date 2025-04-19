from flask_admin.contrib.sqla import ModelView
from app import app, db, dao, utils
from flask_admin import Admin, BaseView, expose
from flask_login import current_user, logout_user
from wtforms.fields import SelectField
from flask import redirect, request, jsonify
from models import UserEnum, User, Regulation, Admin_Regulation, Student, Subject, Semester, School_Year, Teacher, \
    Class, ActiveEnum, Subject_Teacher_Class
from wtforms import ValidationError
from datetime import datetime
import re

admin=Admin(app=app,name="Student Management",template_mode='bootstrap4')

@app.route('/api/get_semesters_by_year/<int:year_id>')
def get_semesters_by_year(year_id):
    semesters = dao.load_semester(year_id)
    result = [{
        'id': s.id,
        'name': s.name
    } for s in semesters]

    return jsonify(result)

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
    form_columns = ['username', 'password', 'avatar', 'role','joined_date']



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
    form_columns = ['fullname', 'dob', 'gender', 'address', 'phone', 'email']

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

class SubjectModelView(AuthenticatedModelView):
    column_searchable_list = ['name']
    column_labels = {
        'id':'Mã',
        'name':'Tên môn học',
    }
    column_list = ['id', 'name']
    form_columns = ['name']

class ClassModelView(AuthenticatedModelView):
    column_searchable_list = ['name','number_of_students','grade']
    column_labels = {
        'id':'Mã',
        'name':'Tên lớp',
        'number_of_students' : 'Sĩ số',
        'grade' : 'Khối'

    }
    column_list = ['id', 'name','number_of_students']
    form_columns = ['name','number_of_students','grade']

class RegulationModelView(AuthenticatedModelView):
    column_searchable_list = ['name','content']
    column_labels = {
        'id': 'Mã',
        'name': 'Tên quy định',
        'content': 'Nội dung',
    }
    column_sortable_list = ['id', 'name']
    column_list = ['id', 'name', 'content']
    form_columns = ['name', 'content']
    def on_model_change(self, form, model, is_created):
        if is_created:
            if current_user.is_authenticated and current_user.admin:
                admin_id = current_user.admin.id
                admin_regulation = Admin_Regulation(admin_id=admin_id, regulation_id=model.id)
                db.session.add(admin_regulation)

            db.session.commit()

        return super(RegulationModelView, self).on_model_change(form, model, is_created)

class SubjectTeacherClassModelView(AuthenticatedModelView):
    # Các cột có thể tìm kiếm
    column_searchable_list = ['teacher.fullname', 'subject.name', 'class_.name']

    # Nhãn cho các cột
    column_labels = {
        'teacher.fullname': 'Giáo viên',
        'subject.name': 'Môn học',
        'class_.name': 'Lớp học',
        'active': 'Trạng thái',
        'start_date': 'Ngày bắt đầu',
        'end_date': 'Ngày kết thúc',
    }

    # Các cột hiển thị trong bảng quản lý
    column_list = ['teacher.fullname', 'subject.name', 'class_.name', 'active', 'start_date', 'end_date']

    # Các cột trong form nhập liệu
    form_columns = ['teacher', 'subject', 'class_', 'active', 'start_date', 'end_date']

    # Các phương thức xử lý dữ liệu trong form (nếu cần)
    def on_model_change(self, form, model, is_created):
        # Ràng buộc ngày kết thúc phải lớn hơn ngày bắt đầu
        if model.end_date and model.start_date and model.end_date <= model.start_date:
            raise ValidationError("Ngày kết thúc phải lớn hơn ngày bắt đầu.")

        # Đảm bảo không có phân công trùng lặp
        if db.session.query(Subject_Teacher_Class).filter_by(
                teacher_id=model.teacher_id,
                subject_id=model.subject_id,
                class_id=model.class_id
        ).first():
            raise ValidationError("Phân công giáo viên cho môn học này đã tồn tại.")

        return super().on_model_change(form, model, is_created)

class StatsView(BaseView):
    @expose('/', methods=['GET', 'POST'])
    def index(self):
        semester_name = subject_name = school_year_name = None  # Khởi tạo mặc định tránh lỗi

        if request.method == 'POST':
            semester_id = int(request.form.get("semester_id"))
            subject_id = int(request.form.get("subject_id"))
            year_school_id = int(request.form.get("year_school_id"))

            # Lấy tên từ id
            semester = Semester.query.get(semester_id)
            subject = Subject.query.get(subject_id)
            school_year = School_Year.query.get(year_school_id)

            semester_name = semester.name if semester else None
            subject_name = subject.name if subject else None
            school_year_name = school_year.name if school_year else None
        else:
            semester_id = subject_id = None

        # Lấy danh sách môn học và năm học
        subjects = dao.load_subject()
        school_years = dao.load_school_year()

        if semester_id and subject_id:
            stats = utils.subject_summary_report(semester_id, subject_id)
            stats_error_message = None if stats else "Không có dữ liệu thống kê cho môn học và học kỳ đã chọn."
        else:
            stats = []
            stats_error_message = "Vui lòng chọn cả môn học và học kỳ."

        return self.render('admin/stats.html',
                           stats=stats,
                           subjects=subjects,
                           school_years=school_years,
                           stats_error_message=stats_error_message,
                           semester_name=semester_name,
                           subject_name=subject_name,
                           school_year_name=school_year_name)

    def is_accessible(self):
        return current_user.is_authenticated and current_user.role == UserEnum.ADMIN


admin.add_view(UserModelView(User, db.session, name="Quản lý người dùng"))
admin.add_view(StudentModelView(Student, db.session, name="Quản lý học sinh"))
admin.add_view(SubjectModelView(Subject,db.session,name="Quản lý môn học"))
admin.add_view(ClassModelView(Class,db.session,name="Quản lý lớp học"))
admin.add_view(RegulationModelView(Regulation, db.session, name="Quy định"))
admin.add_view(SubjectTeacherClassModelView(Subject_Teacher_Class, db.session, name="Phân công"))
admin.add_view(StatsView(name="Thống kê"))
admin.add_view(LogoutAdmin(name="Đăng xuất"))