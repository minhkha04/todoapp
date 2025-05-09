let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwiaWF0IjoxNzQ2NzY4Njg0LCJleHAiOjE3NDY4NTUwODR9.OlOsIhJ9dmo35K0qTfwRxVxDJo77dhSYkOvPi0b-UzE'

let http = axios.create({
    baseURL: "https://todo-hcst.onrender.com/",
    timeout: 30000,
    headers: {
        Authorization: `Bearer ${token}`
    }
});

function renderTrangThai(arr, current_status) {
    let content = '';
    for (const trang_thai of arr) {
        let { ma_trang_thai, ten_trang_thai, is_remove } = trang_thai;
        if (current_status != null && current_status === ten_trang_thai) {
            content += `
        <option value="${ma_trang_thai}" selected>${ten_trang_thai}</option>`
        } else {
            content += `
        <option value="${ma_trang_thai}">${ten_trang_thai}</option>`
        }
    }
    return content;
}

function renderCongViec(arr) {
    let content = "";
    for (let congviec of arr) {
        let { ma_cong_viec, ten_cong_viec, ngay_tao, mo_ta, trang_thai } = congviec;
        let { ten_trang_thai } = trang_thai;
        content += `
            <tr class="">
                <td>${ten_cong_viec}</td>
                <td><span>${new Intl.DateTimeFormat('vi-VN').format(new Date(ngay_tao))}</span></td>
                <td>${mo_ta}</td>
                <td>${trang_thai_content(ten_trang_thai)}</td>
                <td>
                    <button class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#updateTask" onclick="openFormUpdateTask(${ma_cong_viec})">Update</button>
                    <button class="btn btn-danger" onclick="deleteTask(${ma_cong_viec})">Delete</button>
                </td>
            </tr> 
        `
    }
    document.getElementById('cong_viec_body').innerHTML = content;
}

function sumitValueAddNewTask(event) {
    event.preventDefault();
    let task = getValueFormTask("addNewTaskFrom");
    http.post("cong-viec", task)
        .then((res) => {
            console.log(res);
            showToast(res.data.message, 'success');
            getCongViec();
        })
        .catch((err) => {
            console.log(err);
            showToast(err.response.data.message, 'danger');
        })

}

function showToast(message, type = 'success') {
    const toastEl = document.getElementById('toastBox');
    const toastBody = document.getElementById('toastMessage');
    toastEl.className = `toast align-items-center text-bg-${type} border-0`;
    toastBody.innerText = message;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

let trang_thai_content = (trang_thai) => {
    let result = '';
    switch (trang_thai) {
        case 'To Do':
            result = '<span class="badge text-bg-danger">To Do</span>';
            break;
        case 'Progress':
            result = '<span class="badge text-bg-warning">Progress</span>';
            break;
        case 'Done':
            result = '<span class="badge text-bg-success">Done</span>';
            break;
    }
    return result;
}

function getValueFormTask(id) {
    let arrField = document.querySelectorAll(`#${id} input, #${id} select`);
    let task = {};
    for (const field of arrField) {
        let { id, value } = field;
        if (id === "ma_trang_thai" || id === "ma_cong_viec") {
            task[id] = Number(value);
        } else {
            task[id] = value;
        }
    }
    return task;
}

async function getCongViec() {
    try {
        let result = await http.get("cong-viec");
        renderCongViec(result.data.data);
    } catch (error) {
        console.log(error.message);
    }
}

async function getStatus(filed, current_status) {
    try {
        let result = await http.get("trang-thai");
        if (filed) {
            filed.innerHTML = renderTrangThai(result.data.data, current_status);
        } else {
            document.getElementById('ma_trang_thai').innerHTML = renderTrangThai(result.data.data);
        }

    } catch (error) {
        console.error(error.message);
    }
}

function deleteTask(taskId) {
    http.delete(`cong-viec/${taskId}`)
        .then((res) => {
            console.log(res);
            showToast(res.data.message, "success");
            getCongViec();
        })
        .catch((err) => {
            console.log(err);
            showToast(err.response.data.message, 'danger');
        })
}

async function openFormUpdateTask(taskId) {
    try {
        let result = await http.get(`cong-viec/${taskId}`);
        let task = result.data.data;
        let arrField = document.querySelectorAll("#updateTaskFrom input, #updateTaskFrom select");
        for (const field of arrField) {
            let { id } = field;
            if (id === 'ma_trang_thai') {
                let { ten_trang_thai } = task.trang_thai;
                getStatus(field, ten_trang_thai);
            } else {
                field.value = task[id];
            }
        }
    } catch (error) {
        console.log(error);
    }
}

function sumitValueUpdateTask(event) {
    event.preventDefault();
    let task = getValueFormTask("updateTaskFrom");
    http.put("cong-viec", task)
        .then((res) => {
            console.log(res);
            showToast(res.data.message, 'success');
            getCongViec();
        })
        .catch((err) => {
            console.log(err);
            showToast(err.response.data.message, 'danger');
        })
}

getCongViec();
document.getElementById('addNewTaskFrom').onsubmit = sumitValueAddNewTask;
document.getElementById('updateTaskFrom').onsubmit = sumitValueUpdateTask;

