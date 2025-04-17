//-----------------XỬ LÝ THAY ĐỔI AVATAR----------------------------------------
let selectedAvatarFile = null;//biến tạm lưu ảnh

document.getElementById("avatar").addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
        selectedAvatarFile = file; // lưu file vào biến tạm
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("avatarPreview").src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

// Khi nhấn nút Lưu thay đổi
document.getElementById("saveAvatarBtn").addEventListener("click", function() {
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

//-----------------END XỬ LÝ THAY ĐỔI AVATAR----------------------------------------



