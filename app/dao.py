import hashlib
from models import User, Regulation, GradeEnum, Teacher, Student, Class, Teacher_Class, Student_Class, Semester, \
    School_Year, Subject, Subject_Teacher_Class
from app import app

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

def get_max_age():
    return int(Regulation.query.filter_by(name="Số tuổi tối đa").first().content)

def get_min_age():
    return int(Regulation.query.filter_by(name="Số tuổi tối thiểu").first().content)

def get_max_student():
    return int(Regulation.query.filter_by(name="Số học sinh tối đa").first().content)

def load_gradeEnum():
    return {
        grade.name: grade.value  # "KHOI_10": "Khối 10"
        for grade in GradeEnum
    }

def load_teachers_with_assign_status():
    teachers = Teacher.query.all()
    for t in teachers:
        t.assigned = len(t.classes) > 0
    return teachers

def load_students_with_assign_status():
    students = Student.query.all()
    for s in students:
        s.assigned = len(s.classes) > 0
    return students

def load_class(class_id = None, grade = None):
    q = Class.query.all()

    if class_id:
        q = Class.query.get(class_id)

    if grade:
        q = Class.query.filter_by(grade=grade).all()

    return q

def load_unassigned_students():
    # Trả về danh sách các học sinh chưa thuộc bất kỳ lớp nào
    return Student.query.filter(~Student.classes.any()).all()

def load_semester(year_id=None):
    q = Semester.query

    if year_id:
        q = Semester.query.filter_by(school_year_id=year_id)
        print(q.all())

    return q.all()

def load_school_year():
    return School_Year.query.all()

def load_subject():
    return Subject.query.all()

def get_teacher_by_id(user_id):
    return Teacher.query.filter_by(user_id=user_id).first()

def load_subject_by_teacher_by_class(teacher_id,class_id):
    return Subject_Teacher_Class.query \
        .filter_by(teacher_id=teacher_id, class_id=class_id) \
        .join(Subject) \
        .all()
