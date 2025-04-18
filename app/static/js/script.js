//-----------------XỬ LÝ THAY ĐỔI AVATAR----------------------------------------
let selectedAvatarFile = null; // biến tạm lưu ảnh

window.addEventListener('DOMContentLoaded', function () {
    const avatarInput = document.getElementById("avatar");
    const avatarPreview = document.getElementById("avatarPreview");
    const saveAvatarBtn = document.getElementById("saveAvatarBtn");

    // Xử lý chọn ảnh avatar
    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (file) {
                selectedAvatarFile = file;
                const reader = new FileReader();
                reader.onload = function(e) {
                    avatarPreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    } else {
//        console.warn("Không tìm thấy phần tử avatar hoặc avatarPreview trong DOM.");
    }

    // Xử lý nút lưu ảnh
    if (saveAvatarBtn) {
        saveAvatarBtn.addEventListener("click", function () {
            if (!selectedAvatarFile) {
                alert("Bạn chưa chọn ảnh nào!");
                return;
            }

            const form = document.querySelector('form');
            const formData = new FormData();
            formData.append('avatar', selectedAvatarFile);

            fetch(form.action, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.redirected) {
                    window.location.href = response.url;
                } else {
                    alert("Cập nhật không thành công!");
                }
            })
            .catch(error => console.error("Lỗi:", error));
        });
    } else {
//        console.warn("Không tìm thấy nút lưu ảnh (saveAvatarBtn).");
    }
});

//-----------------END XỬ LÝ THAY ĐỔI AVATAR----------------------------------------



//-----------------XỬ LÝ FORM CHUNG---------------------------------------------
function cancelAll(){
    if(confirm("Bạn có chắc chắn hủy phiên làm việc không!")==true){
         window.location = "http://127.0.0.1:5000/";
    }
}

function deleteAll(id_form){
    if(confirm("Bạn có chắc chắn xóa tất cả thông tin không!")==true){
          document.getElementById(id_form).reset();
    }
}

//-----------------END XỬ LÝ FORM CHUNG---------------------------------------------



//-----------------XỬ LÝ FORM TIẾP NHẬN HỌC SINH---------------------------------------------
function saveDraftStudent() {
    localStorage.setItem('draftFullname', document.getElementById("fullname").value);
    localStorage.setItem('draftDob', document.getElementById("dob").value);
    localStorage.setItem('draftGender', document.getElementById("gender").value);
    localStorage.setItem('draftAddress', document.getElementById("address").value);
    localStorage.setItem('draftPhone', document.getElementById("phone").value);
    localStorage.setItem('draftEmail', document.getElementById("email").value);

    alert('Thông tin đã được lưu nháp!');
}
// Chỉ chạy khi DOM đã sẵn sàng
window.addEventListener('DOMContentLoaded', function () {
    console.log("Đang khôi phục dữ liệu lưu nháp...");

    const fullname = document.getElementById('fullname');
    const dob = document.getElementById('dob');
    const gender = document.getElementById('gender');
    const address = document.getElementById('address');
    const phone = document.getElementById('phone');
    const email = document.getElementById('email');

    if (fullname) fullname.value = localStorage.getItem('draftFullname') || "";
    if (dob) dob.value = localStorage.getItem('draftDob') || "";
    if (gender) gender.value = localStorage.getItem('draftGender') || "Nam";
    if (address) address.value = localStorage.getItem('draftAddress') || "";
    if (phone) phone.value = localStorage.getItem('draftPhone') || "";
    if (email) email.value = localStorage.getItem('draftEmail') || "";
});

function validateAge(dob) {
    var age = new Date().getFullYear() - new Date(dob).getFullYear();
    return age >= MIN_AGE && age <= MAX_AGE;
}

function saveStudent() {
    var form = document.getElementById('form_register_student');
    var dob = document.getElementById('dob').value;
    var phone = document.getElementById('phone').value;
    var email = document.getElementById('email').value;

     // Kiểm tra tuổi
    if (!validateAge(dob)) {
        document.getElementById('responseMessage').innerHTML =
            `<p style="color: red;">Tuổi học sinh phải từ ${MIN_AGE} đến ${MAX_AGE} tuổi!</p>`;
        return;
    }
    // Kiểm tra số điện thoại
    var phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
        document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Số điện thoại phải là 10 chữ số!</p>';
        return;
    }

    // Kiểm tra email
    if (email && !email.endsWith('@gmail.com')) {
        document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Email phải có đuôi @gmail.com!</p>';
        return;
    }

    // Tạo đối tượng dữ liệu để gửi dưới dạng JSON
    var formData = {
        fullname: document.getElementById('fullname').value,
        dob: dob,
        gender: document.getElementById('gender').value,
        address: document.getElementById('address').value,
        phone: phone,
        email: email
    };

    // Tiến hành gửi form nếu tất cả đều hợp lệ
    fetch('/api/save_student', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.getElementById('responseMessage').innerHTML = '<p style="color: green;">'+data.message+'</p>';
            form.reset();  // Xóa form sau khi lưu
        } else {
            document.getElementById('responseMessage').innerHTML = '<p style="color: red;">' + data.message + '</p>';
        }
    }).catch(error => {
    // Xử lý lỗi
    document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Lỗi: ' + error.message + '</p>';
    });
}

//-----------------END XỬ LÝ FORM TIẾP NHẬN HỌC SINH---------------------------------------------


//-----------------XỬ LÝ FORM LẬP DANH SÁCH LỚP---------------------------------------------
// Xử lý thanh tìm kiếm giáo viên
$(document).ready(function() {
    $('#teacher').select2({
        placeholder: "Tìm kiếm giáo viên...",
        allowClear: true,
        width: 'resolve' // hoặc '100%' nếu bạn muốn luôn full width
    });
});

// Chọn tất cả học sinh
function toggleSelectAll(selectAllCheckbox) {
    // Lấy tất cả các checkbox học sinh
    const studentCheckboxes = document.querySelectorAll('input[name="student_ids"]');

    // Kiểm tra nếu checkbox "Chọn tất cả" đã được tick hay chưa
    const isChecked = selectAllCheckbox.checked;

    // Lặp qua tất cả các checkbox học sinh và thay đổi trạng thái
    studentCheckboxes.forEach(function(checkbox) {
        // Nếu học sinh đã được phân lớp (đã disabled), không thay đổi trạng thái
        if (checkbox.closest('td').querySelector('div') === null) {
            checkbox.checked = isChecked;
        }
    });
}

//Xử lý phân trang
$(document).ready(function() {
    $('.datatable').DataTable({
        "paging": true,  // Bật phân trang
        "pageLength": 10, // Số lượng bản ghi mỗi trang
        "searching": true, // Bật chức năng tìm kiếm
        "lengthChange": false, // Ẩn tùy chọn thay đổi số lượng bản ghi trên mỗi trang
        "info": true,  // Hiển thị thông tin phân trang
        "language": {
            "search": "Tìm kiếm học sinh:",
            "paginate": {
                "next": "Tiếp theo",
                "previous": "Trước"
            },
            "lengthMenu": "Hiển thị _MENU_ học sinh mỗi trang",
            "info": "Hiển thị từ _START_ đến _END_ trong tổng số _TOTAL_ học sinh"
        }
    });
})

//Lưu nháp thông tin lớp
function saveDraftClass() {
    // Lưu thông tin lớp học
    localStorage.setItem('draftClassname', document.getElementById("classname").value);
    localStorage.setItem('draftgrade', document.getElementById("grade").value);
    localStorage.setItem('draftTeacher', document.getElementById("teacher").value);

    // Lưu danh sách học sinh đã chọn
    const selectedStudents = Array.from(document.querySelectorAll('input[name="student_ids"]:checked'))
                                .map(cb => cb.value);
    localStorage.setItem('draftStudentIds', JSON.stringify(selectedStudents));

    alert('Thông tin lớp học đã được lưu nháp!');
}

document.addEventListener('DOMContentLoaded', function () {
    const classname = document.getElementById('classname');
    const grade = document.getElementById('grade');
    const teacher = document.getElementById('teacher');

    if (classname && grade && teacher) {
        classname.value = localStorage.getItem('draftClassname') || "";
        grade.value = localStorage.getItem('draftgrade') || "";

        const savedTeacher = localStorage.getItem('draftTeacher');
        if (savedTeacher) {
            for (let i = 0; i < teacher.options.length; i++) {
                if (teacher.options[i].value === savedTeacher) {
                    teacher.selectedIndex = i;
                    break;
                }
            }
            if ($(teacher).hasClass("select2")) {
                $(teacher).trigger("change");
            }
        }
    }

    // Khôi phục danh sách học sinh đã chọn
    const savedStudentIds = JSON.parse(localStorage.getItem('draftStudentIds') || "[]");
    const checkboxes = document.querySelectorAll('input[name="student_ids"]');
    checkboxes.forEach(cb => {
        if (savedStudentIds.includes(cb.value)) {
            cb.checked = true;
        }
    });
});

function saveClass() {
    var form = document.getElementById('form_add_class');
    var classname = document.getElementById('classname').value;
    var grade = document.getElementById('grade').value;
    var teacher_id = document.getElementById('teacher').value;
    var student_ids = Array.from(document.querySelectorAll('input[name="student_ids"]:checked'))
    .map(input => input.value);


    // Kiểm tra các trường trống
    if (classname === '' || grade === '' || teacher_id === '') {
       document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Tất cả các trường phải được điền đầy đủ!</p>';
       return;
    }

    // Kiểm tra nếu số lượng học sinh đã chọn vượt quá sĩ số lớp
    if (student_ids.length > MAX_STUDENT) {
    document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Số lượng học sinh không được vượt quá ' + MAX_STUDENT + ' học sinh!</p>';
        return;
    }

    // Tiến hành gửi form nếu tất cả đều hợp lệ
    var formData = {
        classname: classname,
        grade: grade,
        teacher_id: teacher_id,
        student_ids: student_ids
    };

    fetch('/api/save_class', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(res => {
//        // Kiểm tra xem phản hồi có phải là JSON không
//        console.log(res);
        return res.json();  // Chuyển đổi phản hồi thành JSON
    })
    .then(data => {
        if (data.success) {
            document.getElementById('responseMessage').innerHTML = '<p style="color: green;">' + data.message + '</p>';
            setTimeout(() => {
                location.reload();
            }, 3000);
        } else {
            document.getElementById('responseMessage').innerHTML = '<p style="color: red;">' + data.message + '</p>';
        }
    })
    .catch(error => {
        console.log(error); // Log lỗi vào console để kiểm tra
        document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Lỗi: ' + error.message + '</p>';
    });
}
//----------------- END XỬ LÝ FORM LẬP DANH SÁCH LỚP---------------------------------------------



//-----------------XỬ LÝ FORM ĐIỀU CHỈNH LỚP HỌC---------------------------------------------------
function toggleSelectAll(selectAllCheckbox, checkboxName) {
    const studentCheckboxes = document.querySelectorAll(`input[name="${checkboxName}"]`);
    const isChecked = selectAllCheckbox.checked;

    studentCheckboxes.forEach(function(checkbox) {
        if (!checkbox.disabled) {
            checkbox.checked = isChecked;
        }
    });
}

//Khi nhấn chọn lớp
function onClassChange() {
    const classId = document.getElementById("class_select").value;
    if (!classId) return;

    fetch(`/api/class_info/${classId}`)
        .then(res => res.json())
        .then(data => {
            // Cập nhật giáo viên chủ nhiệm
            document.getElementById("current_teacher_label").innerText = data.teacher_name;

            // Đổ danh sách học sinh của lớp
            const tbody = document.getElementById("available_student_table");
            tbody.innerHTML = "";

            data.students.forEach((student, index) => {
                const row = document.createElement("tr");
                row.setAttribute("available_student_id", student.id); // <- gán id để xử lý xóa

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${student.fullname}</td>
                    <td>${student.dob}</td>
                    <td>${student.gender}</td>
                    <td>${student.address}</td>
                    <td>${student.phone}</td>
                    <td>${student.email}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="removeStudentFromClass(${student.id})">
                            <i class="bi bi-x-circle"></i> Xóa
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        });
}

//Khi onclick btn Thêm học sinh
function toggleAddStudent() {
    const container = document.getElementById("unassigned_students_container");
    const button = document.querySelector("button.btn-info");

    if (container.style.display === "none") {
        container.style.display = "block";
        button.innerText = "Ẩn danh sách học sinh chưa có lớp";
    } else {
        container.style.display = "none";
        button.innerText = "Thêm học sinh vào lớp";
    }
}

//Khi onclick btn xóa
function removeStudentFromClass(studentId) {
    const row = document.querySelector(`#available_student_table tr[available_student_id='${studentId}']`);
    if (!row) return;

    const cells = row.querySelectorAll("td");
    const fullname = cells[1].innerText;
    const dob = cells[2].innerText;
    const gender = cells[3].innerText;
    const address = cells[4].innerText;
    const phone = cells[5].innerText;
    const email = cells[6].innerText;

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td><input type="checkbox" name="unassigned_student_id" value="${studentId}"></td>
        <td>${studentId}</td>
        <td>${fullname}</td>
        <td>${dob}</td>
        <td>${gender}</td>
        <td>${address}</td>
        <td>${phone}</td>
        <td>${email}</td>
    `;

    const container = document.getElementById("unassigned_students_container");
    const unassignedTableBody = container.querySelector("tbody");
    container.style.display = "block";
    unassignedTableBody.appendChild(newRow);

    // Xoá khỏi danh sách lớp
    row.remove();

    // Cập nhật lại STT
    const availableTableBody = document.querySelector("#available_student_table");
    updateTableIndex(availableTableBody, 0);
    updateTableIndex(unassignedTableBody, 1);

    // Lưu vào localStorage
    let removed = JSON.parse(localStorage.getItem("draft_removed_students") || "[]");
    if (!removed.includes(studentId)) {
        removed.push(studentId);
        localStorage.setItem("draft_removed_students", JSON.stringify(removed));
    }
}

function updateTableIndex(tableBody, sttColumnIndex) {
    const rows = tableBody.querySelectorAll("tr");
    rows.forEach((row, index) => {
        const cells = row.querySelectorAll("td");
        if (cells.length > sttColumnIndex) {
            cells[sttColumnIndex].innerText = index + 1;
        }
    });
}

function saveDraftEClass() {
    const classId = document.getElementById("class_select").value;
    const teacher = document.getElementById("teacher").value;
    localStorage.setItem("edit_draft_classId", classId);
    localStorage.setItem("edit_draft_teacher", teacher); // Lưu giáo viên chủ nhiệm

    // Lưu học sinh hiện có trong lớp
    const currentStudents = Array.from(document.querySelectorAll('#available_student_table tr'))
        .map(row => row.getAttribute("available_student_id"))
        .filter(id => id !== null);
    localStorage.setItem("edit_draft_current_students", JSON.stringify(currentStudents));

    // Lưu checkbox học sinh chưa có lớp được chọn
    const checkedUnassigned = Array.from(document.querySelectorAll('input[name="unassigned_student_id"]:checked'))
        .map(cb => cb.value);
    localStorage.setItem("edit_draft_checked_unassigned", JSON.stringify(checkedUnassigned));

    alert("Thông tin chỉnh sửa lớp đã được lưu nháp!");
}

function restoreEDraftClass() {
    const savedClassId = localStorage.getItem("edit_draft_classId");
    const savedTeacher = localStorage.getItem("edit_draft_teacher"); // Lấy giá trị teacher từ localStorage
    const removedStudents = JSON.parse(localStorage.getItem("edit_draft_removed_students") || "[]");
    const checkedUnassigned = JSON.parse(localStorage.getItem("edit_draft_checked_unassigned") || "[]");

    if (savedClassId) {
        document.getElementById("class_select").value = savedClassId;
        onClassChange(); // Gọi để tải lại danh sách học sinh
    }

    if (savedTeacher) {
        document.getElementById("teacher").value = savedTeacher; // Khôi phục giáo viên chủ nhiệm
    }

    // Sau khi onClassChange load xong bảng, thực hiện khôi phục
    setTimeout(() => {
        const availableTableBody = document.querySelector("#available_student_table");
        updateTableIndex(availableTableBody, 0);

        // Khôi phục trạng thái checkbox học sinh chưa có lớp
        const checkboxes = document.querySelectorAll('input[name="unassigned_student_id"]');
        checkboxes.forEach(cb => {
            if (checkedUnassigned.includes(cb.value)) {
                cb.checked = true;
            }
        });
    }, 500);
}

document.addEventListener("DOMContentLoaded", function () {
    restoreEDraftClass();
});

//-----------------END XỬ LÝ FORM ĐIỀU CHỈNH LỚP HỌC---------------------------------------------------