//-----------------XỬ LÝ THAY ĐỔI AVATAR----------------------------------------
let selectedAvatarFile = null; // biến tạm lưu ảnh

function chooseImage() {
    const avatarInput = document.getElementById("avatar");
    const avatarPreview = document.getElementById("avatarPreview");
    const saveAvatarBtn = document.getElementById("saveAvatarBtn");

    if (avatarInput && avatarPreview) {
        handleAvatarSelection(avatarInput, avatarPreview);
    }

    if (saveAvatarBtn) {
        handleAvatarSave(saveAvatarBtn);
    }
}

// Hàm xử lý chọn ảnh avatar
function handleAvatarSelection(inputElement, previewElement) {
    inputElement.addEventListener("change", function (e) { // hàm lắng nghe sự kiện change
        const file = e.target.files[0];  // danh sách hình ảnh lấy index đầu tiên
        if (file) {
            selectedAvatarFile = file;
            const reader = new FileReader();    //tạo reader để đọc file
            reader.onload = function (e) {
                previewElement.src = e.target.result; // gán chuỗi file
            };
            reader.readAsDataURL(file); // đọc file chuyển thành chuỗi
        }
    });
}

// Hàm xử lý lưu ảnh avatar
function handleAvatarSave(buttonElement) {
    buttonElement.addEventListener("click", function () { // hàm lắng nghe sự kiện click
        if (!selectedAvatarFile) {
            alert("Bạn chưa chọn ảnh nào!");
            return;
        }

        const form = document.querySelector('form');
        const formData = new FormData();
        formData.append('avatar', selectedAvatarFile); // thêm file đang chọn vào FormData

        fetch(form.action, {
            method: 'POST',
            body: formData
        })
        .then(res => {
            if (res.redirected) {
                alert("Cập nhật ảnh đại diện thành công!");
                window.location.href = res.url;
            } else {
                alert("Cập nhật không thành công!");
            }
        })
        .catch(error => console.error("Lỗi:", error));
    });
}


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
            setTimeout(() => {
                location.reload();
            }, 1000);
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
        width: '100%'
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

    // Lưu danh sách học sinh đã chọn lưu dưới dạng JSON
    const selectedStudents = Array.from(document.querySelectorAll('input[name="student_ids"]:checked'))
                                .map(cb => cb.value);
    localStorage.setItem('draftStudentIds', JSON.stringify(selectedStudents));

    alert('Thông tin lớp học đã được lưu nháp!');
}

document.addEventListener('DOMContentLoaded', function () {
    const classname = document.getElementById('classname'); // lấy ô lớp
    const grade = document.getElementById('grade'); // lấy ô khối
    const teacher = document.getElementById('teacher'); // lấy ô GVCN

    if (classname && grade && teacher) {
        classname.value = localStorage.getItem('draftClassname') || "";
        grade.value = localStorage.getItem('draftgrade') || "";

    // lấy giáo viên đang được lưu nháp
        const savedTeacher = localStorage.getItem('draftTeacher');
        if (savedTeacher) { // nếu có
            // duyệt qua tất cả options trong dropdown để tìm option có value
            for (let i = 0; i < teacher.options.length; i++) {
                if (teacher.options[i].value === savedTeacher) {
                    teacher.selectedIndex = i; //đặt selectedIndex cho dropdown
                    break;
                }
            }
            if ($(teacher).hasClass("select2")) {
                $(teacher).trigger("change");
            }
        }
    }

    // Khôi phục danh sách học sinh đã chọn
    // danh sách học sinh được lưu dưới dạng JSON (chuyển thành mảng) ở localStorage
    const savedStudentIds = JSON.parse(localStorage.getItem('draftStudentIds') || "[]");
    const checkboxes = document.querySelectorAll('input[name="student_ids"]');
    //duyệt qua từng checkbox, checked nếu có giá trị trong checkboxes
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

    // Tạo đối tượng dữ liệu để gửi dưới dạng JSON
    var formData = {
        classname: classname,
        grade: grade,
        teacher_id: teacher_id,
        student_ids: student_ids
    };

    // Tiến hành gửi form nếu tất cả đều hợp lệ
    fetch('/api/save_class', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(res => {
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

//Khi onclick btn xóa
function removeStudentFromClass(studentId) {

    //Tìm hàng (tr) trong bảng available_student_table có thuộc tính available_student_id bằng studentId
    const row = document.querySelector(`#available_student_table tr[available_student_id='${studentId}']`);
    if (!row) return;

    //Lấy tất cả các ô trong hàng
    const cells = row.querySelectorAll("td");
    const fullname = cells[1].innerText;
    const dob = cells[2].innerText;
    const gender = cells[3].innerText;
    const address = cells[4].innerText;
    const phone = cells[5].innerText;
    const email = cells[6].innerText;

    //Tạo hàng mới cho bảng học sinh chưa có lớp unassigned_student_id
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
    container.style.display = "block";      // cho hiện nếu ẩn khi thực hiện thao tác xóa học sinh
    unassignedTableBody.appendChild(newRow);    // thêm hàng mới vào cuối bảng

    // Xoá khỏi danh sách lớp
    row.remove();

    // Cập nhật lại STT
    const availableTableBody = document.querySelector("#available_student_table");
    updateTableIndex(availableTableBody, 0);
    updateTableIndex(unassignedTableBody, 1);

}

function saveDraftEClass() {
    const classId = document.getElementById("class_select").value; //lấy giá trị ô classId
    const teacher = document.getElementById("teacher").value;   //lấy giá trị teacher
    localStorage.setItem("edit_draft_classId", classId);    //Lưu nháp classId
    localStorage.setItem("edit_draft_teacher", teacher); // Lưu nháp giáo viên chủ nhiệm

    // Lưu học sinh hiện có trong lớp
    // Chuyển NodeList (kết quả từ querySelectorAll) thành mảng JavaScript để có thể sử dụng các phương thức của mảng
    const currentStudents = Array.from(document.querySelectorAll('#available_student_table tr'))
        .map(row => row.getAttribute("available_student_id"))  //Lấy giá trị của thuộc tính available_student_id từ mỗi thẻ
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
    setTimeout(() => {
        location.reload();
    }, 3000);
})
    .catch(err => {
        document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Lỗi: ' + error.message + '</p>';
    });
}

//-----------------END XỬ LÝ FORM ĐIỀU CHỈNH LỚP HỌC---------------------------------------------------




//-----------------XỬ LÝ FORM NHẬP ĐIỂM---------------------------------------------------
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
    const classId = document.getElementById("class_select").value; //lấy giá trị class_id từ form
    if (!classId) return;

    fetch(`/api/class_info/${classId}`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("available_student_table"); //lấy bảng available_student_table
            tbody.innerHTML = "";       // xóa tất cả nội dung trước của bảng

            data.students.forEach((student, index) => { //với mỗi học sinh trong danh sách học sinh, xử lý:
                const row = document.createElement("tr");
                row.setAttribute("available_student_id", student.id);   // tạo 1 dòng mới của bảng và gán thuộc tính

                let score15pInputs = "";    //tạo ô nhập 15p
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

                let score45pInputs = "";    // tạo ô nhập 45p
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

                //Tạo dòng cho từng học sinh
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

            // Cập nhật colSpan của header
            const score15pHeader = document.getElementById("score15p_header");
            const score45pHeader = document.getElementById("score45p_header");
            if (score15pHeader) score15pHeader.colSpan = score15pCount;
            if (score45pHeader) score45pHeader.colSpan = score45pCount;
        })
        .catch(err => {
            console.error('Lỗi khi tải danh sách học sinh:', err);
        });
}

function addScoreColumn(type, maxCount, labelPrefix) {
 // nếu type score15p thì dùng score15pCount ngược lại dùng 45p
    let countVar = type === "score15p" ? score15pCount : score45pCount;

    // Kiểm tra giới hạn trước khi tăng
    if ((type === "score15p" && countVar >= maxCount) || (type === "score45p" && countVar >= maxCount)) {
        alert(`Chỉ được nhập tối đa ${maxCount} cột điểm ${labelPrefix}.`);
        return;
    }

    // Tăng count sau khi kiểm tra
    if (type === "score15p") score15pCount++;
    else score45pCount++;
    countVar = type === "score15p" ? score15pCount : score45pCount; //gán lại giá trị

    // Cập nhật lại colSpan
    const header = document.getElementById(`${type}_header`);
    if (header) header.colSpan = countVar;

    const tbody = document.getElementById("available_student_table");
    const rows = tbody.getElementsByTagName("tr"); //duyệt từng học sinh để thêm cột điểm mới

    for (let row of rows) {
        const studentId = row.getAttribute("available_student_id"); // lấy giá trị student_Ids để gán name
        if (!studentId) continue;

        const td = document.createElement("td"); //thêm cột
        td.innerHTML = `
            <label class="form-label me-1">Lần ${countVar}</label>
            <input type="number" class="form-control d-inline-block w-auto"
                   name="${type}_${countVar}_${studentId}" min="0" max="10" step="0.1"
                   oninput="validateScore(this)">
        `;

        let insertIndex = 2; //vị trí cần chèn ô mới
        if (type === "score15p") {
            insertIndex += countVar - 1;
        } else {
            insertIndex += score15pCount + (countVar - 1);
        }
        row.insertBefore(td, row.children[insertIndex]);
    }

    console.log(`${type} column added. Current count: ${countVar}`); // Debug
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

document.addEventListener("DOMContentLoaded", async function () {
    if (typeof Storage === "undefined") {
        alert('Trình duyệt không hỗ trợ localStorage.');
        return;
    }

    const draftJSON = localStorage.getItem('scoreDraft');
    if (!draftJSON) {
        console.log('No draft found in localStorage');
        return;
    }

    let draft;
    try {
        draft = JSON.parse(draftJSON);
        console.log('Draft loaded:', draft);
    } catch (error) {
        console.error('Error parsing draft from localStorage:', error);
        alert('Dữ liệu nháp không hợp lệ. Đã xóa nháp.');
        localStorage.removeItem('scoreDraft');
        return;
    }

    try {
        const lastSavedTimeDisplay = document.getElementById('lastSavedTimeDisplay');
        if (lastSavedTimeDisplay) {
            if (draft.lastSavedTime) {
                const lastSaved = new Date(draft.lastSavedTime);
                lastSavedTimeDisplay.textContent = `Lần lưu nháp gần nhất: ${lastSaved.toLocaleString('vi-VN')}`;
            } else {
                lastSavedTimeDisplay.textContent = 'Chưa có lần lưu nháp nào.';
            }
        }

        score15pCount = Math.min(draft.score15pCount || 1, 10);
        score45pCount = Math.min(draft.score45pCount || 1, 10);
        console.log('Restored counts:', { score15pCount, score45pCount });

//        if (!draft.grade || !draft.class_id || !draft.subject_id || !draft.semester_id) {
//            console.warn('Draft is missing required fields:', draft);
//            alert('Dữ liệu nháp không đầy đủ. Vui lòng chọn lại các trường.');
//            localStorage.removeItem('scoreDraft');
//            return;
//        }

        document.getElementById('grade').value = draft.grade;
        await new Promise((resolve, reject) => {
            fetch(`/api/get_classes_by_grade/${draft.grade}`)
                .then(res => {
                    if (!res.ok) throw new Error(`API get_classes_by_grade failed with status ${res.status}`);
                    return res.json();
                })
                .then(data => {
                    const classSelect = document.getElementById("class_select");
                    classSelect.innerHTML = '<option value="">-- Chọn lớp --</option>';
                    data.forEach(cls => {
                        const option = document.createElement('option');
                        option.value = cls.id;
                        option.textContent = cls.name;
                        classSelect.appendChild(option);
                    });
                    resolve();
                })
                .catch(err => {
                    console.error('Lỗi khi tải lớp:', err);
                    document.getElementById("class_select").innerHTML = '<option value="">Không thể tải danh sách lớp</option>';
                    reject(err);
                });
        });

        document.getElementById('class_select').value = draft.class_id;
        await new Promise((resolve, reject) => {
            fetch(`/api/get_subject_by_teachID_classID/${draft.class_id}`)
                .then(res => {
                    if (!res.ok) throw new Error(`API get_subject_by_teachID_classID failed with status ${res.status}`);
                    return res.json();
                })
                .then(data => {
                    const subjectSelect = document.getElementById("subject_select");
                    subjectSelect.innerHTML = '<option value="">-- Chọn môn học --</option>';
                    data.forEach(subject => {
                        const option = document.createElement('option');
                        option.value = subject.id;
                        option.textContent = subject.name;
                        subjectSelect.appendChild(option);
                    });
                    resolve();
                })
                .catch(err => {
                    console.error('Lỗi khi tải môn học:', err);
                    document.getElementById("subject_select").innerHTML = '<option value="">Không thể tải danh sách môn học</option>';
                    reject(err);
                });
        });

        document.getElementById('subject_select').value = draft.subject_id;
        document.getElementById('semester').value = draft.semester_id;

        await new Promise((resolve, reject) => {
            fetch(`/api/class_info/${draft.class_id}`)
                .then(res => {
                    if (!res.ok) throw new Error(`API class_info failed with status ${res.status}`);
                    return res.json();
                })
                .then(data => {
                    const tbody = document.getElementById("available_student_table");
                    tbody.innerHTML = "";
                    data.students.forEach((student, index) => {
                        const row = document.createElement("tr");
                        row.setAttribute("available_student_id", student.id);

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

                    // Cập nhật colSpan của header
                    const score15pHeader = document.getElementById("score15p_header");
                    const score45pHeader = document.getElementById("score45p_header");
                    if (score15pHeader) score15pHeader.colSpan = score15pCount;
                    if (score45pHeader) score45pHeader.colSpan = score45pCount;

                    resolve();
                })
                .catch(err => reject(err));
        });

        await waitForTableRender();

        if (draft.scores && Array.isArray(draft.scores)) {
            draft.scores.forEach((item) => {
                const studentRow = document.querySelector(`tr[available_student_id="${item.student_id}"]`);
                if (studentRow) {
                    const score15Inputs = [];
                    for (let i = 1; i <= score15pCount; i++) {
                        const input = studentRow.querySelector(`input[name="score15p_${i}_${item.student_id}"]`);
                        if (input) score15Inputs.push(input);
                        else console.warn(`Input score15p_${i}_${item.student_id} not found`);
                    }

                    const score45Inputs = [];
                    for (let i = 1; i <= score45pCount; i++) {
                        const input = studentRow.querySelector(`input[name="score45p_${i}_${item.student_id}"]`);
                        if (input) score45Inputs.push(input);
                        else console.warn(`Input score45p_${i}_${item.student_id} not found`);
                    }

                    const examScoreInput = studentRow.querySelector(`input[name="examScore_${item.student_id}"]`);

                    if (item.score15p && Array.isArray(item.score15p)) {
                        item.score15p.forEach((val, i) => {
                            if (score15Inputs[i]) {
                                score15Inputs[i].value = val ?? '';
                            } else {
                                console.warn(`score15p input index ${i} not found for student ${item.student_id}`);
                            }
                        });
                    }

                    if (item.score45p && Array.isArray(item.score45p)) {
                        item.score45p.forEach((val, i) => {
                            if (score45Inputs[i]) {
                                score45Inputs[i].value = val ?? '';
                            } else {
                                console.warn(`score45p input index ${i} not found for student ${item.student_id}`);
                            }
                        });
                    }

                    if (examScoreInput) {
                        examScoreInput.value = item.exam_score ?? '';
                    } else {
                        console.warn(`examScore input not found for student ${item.student_id}`);
                    }
                } else {
                    console.warn(`Student row with ID ${item.student_id} not found`);
                }
            });
        } else {
            console.warn('No scores found in draft');
        }

        console.log('Draft scores applied successfully');
    } catch (error) {
        console.error('Error loading draft:', error);
//        alert('Có lỗi khi tải nháp. Vui lòng thử lại.');
    }
});

function saveDraftUpdateScore() {
    try {
        const students = document.querySelectorAll('#studentTable_class tbody tr');
//        if (!students.length) {
//            console.warn('No students found in table');
//            alert('Không có học sinh nào để lưu nháp.');
//            return;
//        }

        const draftData = [];
        students.forEach((studentRow) => {
            const studentId = studentRow.getAttribute('available_student_id');
            if (!studentId) return;

            // Thu thập điểm 15 phút từ tất cả các cột
            const score15p = [];
            for (let i = 1; i <= score15pCount; i++) {
                const input = studentRow.querySelector(`input[name="score15p_${i}_${studentId}"]`);
                score15p.push(input && input.value ? parseFloat(input.value) : null);
            }

            // Thu thập điểm 45 phút từ tất cả các cột
            const score45p = [];
            for (let i = 1; i <= score45pCount; i++) {
                const input = studentRow.querySelector(`input[name="score45p_${i}_${studentId}"]`);
                score45p.push(input && input.value ? parseFloat(input.value) : null);
            }

            // Thu thập điểm thi
            const examScoreInput = studentRow.querySelector(`input[name="examScore_${studentId}"]`);
            const examScore = examScoreInput && examScoreInput.value ? parseFloat(examScoreInput.value) : null;

            draftData.push({
                student_id: studentId,
                score15p: score15p,
                score45p: score45p,
                exam_score: examScore
            });

            console.log(`Student ${studentId} - score15p:`, score15p, `score45p:`, score45p); // Debug
        });

        const draft = {
            semester_id: document.getElementById('semester').value || '',
            subject_id: document.getElementById('subject_select').value || '',
            class_id: document.getElementById('class_select').value || '',
            grade: document.getElementById('grade').value || '',
            score15pCount: score15pCount,
            score45pCount: score45pCount,
            scores: draftData,
            lastSavedTime: new Date().toISOString()
        };

//        if (!draft.semester_id || !draft.subject_id || !draft.class_id || !draft.grade) {
//            alert('Vui lòng chọn đầy đủ các trường (Khối, Lớp, Học kỳ, Môn học) trước khi lưu nháp.');
//            return;
//        }

        localStorage.setItem('scoreDraft', JSON.stringify(draft));
        console.log('Draft saved:', draft);

        const lastSavedTimeDisplay = document.getElementById('lastSavedTimeDisplay');
        if (lastSavedTimeDisplay) {
            lastSavedTimeDisplay.textContent = `Lần lưu nháp gần nhất: ${new Date().toLocaleString('vi-VN')}`;
        }

        alert('Thông tin đã được lưu nháp!');
    } catch (error) {
        console.error('Error saving draft:', error);
//        alert('Có lỗi khi lưu nháp. Vui lòng thử lại.');
    }
}

function waitForTableRender() {
    return new Promise((resolve) => {
        const checkTable = () => {
            const table = document.querySelector('#studentTable_class tbody');
            if (table && table.querySelectorAll('tr').length > 0) {
                console.log('Table rendered with students');
                resolve();
            } else {
                console.log('Waiting for table to render...');
                setTimeout(checkTable, 100);
            }
        };
        checkTable();
    });
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
            }, 5000);
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

//-----------------END XỬ LÝ FORM NHẬP ĐIỂM--------------------------------------------------





//-----------------XỬ LÝ FORM XUẤT ĐIỂM--------------------------------------------------
function onClassExportScoreChange() {
    const classId = document.getElementById("class_select").value;
    const school_year_id = document.getElementById("schoolyears").value;
    if (!classId||!school_year_id) return;

    const tbody = document.getElementById("available_student_table");
    tbody.innerHTML = "";

    fetch(`/api/get_score_by_class_id/${classId}/${school_year_id}`)
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = ""; // Xóa thông báo tải

            if (data.length === 0) {
                tbody.innerHTML = "<tr><td colspan='5'>Không có dữ liệu</td></tr>";
                return;
            }

            data.forEach((student, index) => {
                const row = document.createElement("tr");
                row.setAttribute("available_student_id", student.id);

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${student.fullname}</td>
                    <td>${student.avg_semester1 !== null ? student.avg_semester1 : "-"}</td>
                    <td>${student.avg_semester2 !== null ? student.avg_semester2 : "-"}</td>
                    <td>${student.avg_total !== null ? student.avg_total : "-"}</td>
                `;

                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Lỗi khi tải điểm học sinh:", error);
            tbody.innerHTML = "<tr><td colspan='5'>Lỗi khi tải dữ liệu</td></tr>";
        });
}

function exportScore() {
    const form = document.getElementById("form_export_score");
    const formData = new FormData(form);

    fetch("/api/export_score", {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Lỗi khi xuất bảng điểm');
        }
        return response.blob();  // Nhận file Excel từ server
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bang_diem.xlsx';  // Tên file tải về
        a.click();
        window.URL.revokeObjectURL(url);  // Giải phóng tài nguyên
    })
    .catch(error => {
        console.error("Lỗi khi xuất bảng điểm:", error);
        alert("Đã có lỗi xảy ra khi xuất bảng điểm. Vui lòng thử lại!");
    });
}

//-----------------END XỬ LÝ FORM XUẤT ĐIỂM--------------------------------------------------





////-----------------XỬ LÝ THỐNG KÊ--------------------------------------------------
function onYearChange() {
    const year = document.getElementById("year_school_id").value;
    const semesterSelect = document.getElementById("semester_id");
    if (!year || !semesterSelect) return;

    fetch(`/api/get_semesters_by_year/${year}`)
        .then(res => res.json())
        .then(data => {
            semesterSelect.innerHTML = '<option value="">-- Chọn học kỳ --</option>';
            data.forEach(sem => {
                const option = document.createElement('option');
                option.value = sem.id;
                option.textContent = sem.name;
                semesterSelect.appendChild(option);
            });
        })
        .catch(err => {
            console.error('Lỗi khi tải học kỳ:', err);
            semesterSelect.innerHTML = '<option value="">Không thể tải danh sách học kỳ</option>';
        });
}

// Thêm sự kiện cho nút "Xuất thống kê"
document.getElementById("exportStatsButton").addEventListener("click", function() {
    const subjectId = document.getElementById("subject_id").value;
    const yearSchoolId = document.getElementById("year_school_id").value;
    const semesterId = document.getElementById("semester_id").value;

    // Kiểm tra nếu người dùng chưa chọn đầy đủ thông tin
    if (!subjectId || !yearSchoolId || !semesterId) {
        alert("Vui lòng chọn đầy đủ thông tin.");
        return;
    }

    // Gửi yêu cầu AJAX tới server
    fetch('/admin/stats', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            subject_id: subjectId,
            year_school_id: yearSchoolId,
            semester_id: semesterId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.stats && data.stats.length > 0) {
            // Hiển thị bảng kết quả thống kê
            const statsTableBody = document.getElementById("statsTableBody");
            statsTableBody.innerHTML = ''; // Xóa dữ liệu cũ
            data.stats.forEach((stat, index) => {
                const row = `<tr>
                    <td>${index + 1}</td>
                    <td>${stat.class_name}</td>
                    <td>${stat.total_students}</td>
                    <td>${stat.passed_students}</td>
                    <td>${stat.pass_rate}</td>
                </tr>`;
                statsTableBody.innerHTML += row;
            });

            // Hiển thị biểu đồ
            const labels = data.stats.map(stat => stat.class_name);
            const passRates = data.stats.map(stat => stat.pass_rate);

            const chartData = {
                labels: labels,
                datasets: [{
                    label: 'Tỷ lệ đạt (%)',
                    data: passRates,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            };

            const chartConfig = {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.parsed.y + '%';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: { display: true, text: 'Tỷ lệ đạt (%)' }
                        },
                        x: {
                            title: { display: true, text: 'Lớp' }
                        }
                    }
                }
            };

            new Chart(document.getElementById('myChart'), chartConfig);

            // Hiển thị kết quả thống kê
            document.getElementById("statsResults").style.display = "block";
        } else {
            alert("Không có dữ liệu thống kê cho lựa chọn của bạn.");
        }
    })
    .catch(error => {
        console.error('Lỗi khi tải thống kê:', error);
        alert("Đã xảy ra lỗi, vui lòng thử lại sau.");
    });
});

//-----------------END XỬ LÝ THỐNG KÊ--------------------------------------------------