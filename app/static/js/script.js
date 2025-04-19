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

function toggleSelectAll(selectAllCheckbox, checkboxName) {
    const checkboxes = document.querySelectorAll(`input[name="${checkboxName}"]`);
    const isChecked = selectAllCheckbox.checked;

    checkboxes.forEach(function(checkbox) {
        // Không check nếu checkbox bị disable hoặc nằm trong div (đã phân lớp)
        const isWrappedInDiv = checkbox.closest('td')?.querySelector('div') !== null;
        if (!checkbox.disabled && !isWrappedInDiv) {
            checkbox.checked = isChecked;
        }
    });
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
//    console.log("Đang khôi phục dữ liệu lưu nháp...");

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

//Cập nhật lại index
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

function saveEClass() {
    const class_id = document.getElementById('class_select').value;
    const teacher_id = document.getElementById('teacher').value;

    //Lấy danh sách học sinh đang có trong lớp
    const assigned_rows = document.querySelectorAll('#available_student_table tr[available_student_id]');
    const assigned_student_ids = Array.from(assigned_rows).map(row => row.getAttribute('available_student_id'));

    //Lấy học sinh mới được chọn (checkbox) từ danh sách chưa có lớp
    const unassigned_student_ids = Array.from(document.querySelectorAll('input[name="unassigned_student_id"]:checked'))
        .map(input => input.value);

    //Gộp lại (tránh trùng lặp bằng Set)
    const all_student_ids = [...new Set([...assigned_student_ids, ...unassigned_student_ids])];

    if (class_id === '') {
       document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Thiếu thông tin lớp học!</p>';
       return;
    }

    //Gửi dữ liệu lên server
    fetch('/api/save_edit_class', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            class_id,
            teacher_id,
            student_ids: all_student_ids
        })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('responseMessage').innerHTML = '<p style="color: green;">' + data.message + '</p>';
    })
    .catch(err => {
        document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Lỗi: ' + error.message + '</p>';
    });
}

//-----------------END XỬ LÝ FORM ĐIỀU CHỈNH LỚP HỌC---------------------------------------------------
function onGradeChange() {
    const grade = document.getElementById("grade").value;
    const classSelect = document.getElementById("class_select");
    if (!grade || !classSelect) return;

    fetch(`/api/get_classes_by_grade/${grade}`)
        .then(res => res.json())
        .then(data => {
            classSelect.innerHTML = '<option value="">-- Chọn lớp --</option>';
            data.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.id;
                option.textContent = cls.name;
                classSelect.appendChild(option);
            });
        })
        .catch(err => {
            console.error('Lỗi khi tải lớp:', err);
            classSelect.innerHTML = '<option value="">Không thể tải danh sách lớp</option>';
        });
}

function onClassSubjectChange() {
    const classId = document.getElementById("class_select").value;
    const subjectSelect = document.getElementById("subject_select");

    if (!classId || !subjectSelect) return;

    fetch(`/api/get_subject_by_teachID_classID/${classId}`)
        .then(res => res.json())
        .then(data => {
            subjectSelect.innerHTML = '<option value="">-- Chọn môn học --</option>';
            data.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                subjectSelect.appendChild(option);
            });
        })
        .catch(err => {
            console.error('Lỗi khi tải môn học:', err);
            subjectSelect.innerHTML = '<option value="">Không thể tải danh sách môn học</option>';
        });
}

function validateScore(input) {
    const value = parseFloat(input.value);
    if (value < 0) input.value = 0;
    if (value > 10) input.value = 10;
}

let score15pCount = 1; // Số cột điểm 15 phút hiện tại
let score45pCount = 1; // Số cột điểm 45 phút hiện tại
function onClassScoreChange() {
    const classId = document.getElementById("class_select").value;
    if (!classId) return;

    fetch(`/api/class_info/${classId}`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("available_student_table");
            tbody.innerHTML = "";

            data.students.forEach((student, index) => {
                const row = document.createElement("tr");
                row.setAttribute("available_student_id", student.id);

                // Tạo các ô điểm 15 phút kèm label
                let score15pInputs = "";
                for (let i = 1; i <= score15pCount; i++) {
                    score15pInputs += `
                        <td>
                            <label class="form-label me-1">Lần ${i}</label>
                            <input type="number" class="form-control d-inline-block w-auto"
                                   name="score15p_${i}_${student.id}" min="0" max="10" step="0.1"
                                   oninput="validateScore(this)">
                        </td>
                    `;
                }
                let score15pTd = `<td>${score15pInputs}</td>`;
                // Tạo các ô điểm 15 phút kèm label
                let score45pInputs = "";
                for (let i = 1; i <= score45pCount; i++) {
                    score45pInputs += `
                        <td>
                            <label class="form-label me-1">Lần ${i}</label>
                            <input type="number" class="form-control d-inline-block w-auto"
                                   name="score45p_${i}_${student.id}" min="0" max="10" step="0.1"
                                   oninput="validateScore(this)">
                        </td>
                    `;
                }
                let score45pTd = `<td>${score45pInputs}</td>`;
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${student.fullname}</td>
                    ${score15pInputs}
                    ${score45pInputs}
                    <td>
                        <input type="number" class="form-control"
                               name="examScore_${student.id}" min="0" max="10" step="0.1"
                               oninput="validateScore(this)">
                    </td>
                `;
                tbody.appendChild(row);
            });
        });
}

function addScoreColumn(type, maxCount, labelPrefix) {
    const countVar = type === "score15p" ? ++score15pCount : ++score45pCount;
    if ((type === "score15p" && countVar > maxCount) || (type === "score45p" && countVar > maxCount)) {
        alert(`Chỉ được nhập tối đa ${maxCount} cột điểm ${labelPrefix}.`);
        if (type === "score15p") score15pCount--;
        else score45pCount--;
        return;
    }

    const header = document.getElementById(`${type}_header`);
    if (header) header.colSpan = countVar;

    const tbody = document.getElementById("available_student_table");
    const rows = tbody.getElementsByTagName("tr");

    for (let row of rows) {
        const studentId = row.getAttribute("available_student_id");
        const td = document.createElement("td");
        td.innerHTML = `
            <label class="form-label me-1">Lần ${countVar}</label>
            <input type="number" class="form-control d-inline-block w-auto"
                   name="${type}_${countVar}_${studentId}" min="0" max="10" step="0.1"
                   oninput="validateScore(this)">
        `;

        let insertIndex = 2;
        if (type === "score15p") {
            insertIndex += countVar - 1;
        } else {
            insertIndex += score15pCount + (countVar - 1);
        }
        row.insertBefore(td, row.children[insertIndex]);
    }
}

function removeScoreColumn(type, minCount = 1) {
    let countVar = type === "score15p" ? score15pCount : score45pCount;
    if (countVar <= minCount) return;

    if (type === "score15p") score15pCount--;
    else score45pCount--;

    const header = document.getElementById(`${type}_header`);
    if (header) header.colSpan = (type === "score15p" ? score15pCount : score45pCount);

    const tbody = document.getElementById("available_student_table");
    const rows = tbody.getElementsByTagName("tr");

    for (let row of rows) {
        const score15pIndex = 2 + score15pCount;
        const score45pIndex = 2 + score15pCount + score45pCount;

        const deleteIndex = (type === "score15p") ? score15pIndex : score45pIndex;
        row.deleteCell(deleteIndex);
    }
}

function saveUpdateScore() {
    // Chọn tất cả các dòng tr trong phần thân của bảng
    const students = document.querySelectorAll('#studentTable_class tbody tr');
    const data = [];

    students.forEach((studentRow) => {
        const studentId = studentRow.getAttribute('available_student_id');
        const score15Inputs = studentRow.querySelectorAll('input[name^="score15p_"]');
        const score45Inputs = studentRow.querySelectorAll('input[name^="score45p_"]');
        const examScoreInput = studentRow.querySelector('input[name^="examScore"]');

        console.log(`Student ${studentId} - 15p count: `, score15Inputs.length);
        console.log(`Student ${studentId} - 45p count: `, score45Inputs.length);

        // Chuyển input thành số hoặc null nếu rỗng
        const score15p = Array.from(score15Inputs).map(input => parseFloat(input.value) || null);
        const score45p = Array.from(score45Inputs).map(input => parseFloat(input.value) || null);
        const examScore = examScoreInput ? parseFloat(examScoreInput.value) || null : null;

        data.push({
            student_id: studentId,
            score15p: score15p,
            score45p: score45p,
            exam_score: examScore
        });
    });

    // Gửi dữ liệu lên server
    fetch('/api/save_update_score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            semester_id: document.getElementById('semester').value,
            subject_id: document.getElementById('subject_select').value,
            class_id: document.getElementById('class_select').value,
            scores: data
        })
    })
    .then(res => res.json())
    .then(data => {
        let message = '';

        if (data.success) {
            message += `<p style="color: green;">${data.message}</p>`;

            if (data.skipped && data.skipped.length > 0) {
                message += `<p style="color: orange;">${data.skipped.length} học sinh đã đủ điểm và không được cập nhật:</p>`;
                message += `<ul style="color: orange;">`;
                data.skipped.forEach(studentId => {
                    message += `<li>Học sinh ID: ${studentId}</li>`;
                });
                message += `</ul>`;
            }

            document.getElementById('responseMessage').innerHTML = message;

            setTimeout(() => {
                location.reload();
            }, 30000);
        } else {
            document.getElementById('responseMessage').innerHTML =
                `<p style="color: red;">${data.message}</p>`;
        }
    })
    .catch(error => {
        document.getElementById('responseMessage').innerHTML =
            `<p style="color: red;">Lỗi: ${error.message}</p>`;
    });
}


