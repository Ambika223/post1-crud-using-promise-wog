const cl = console.log;

const BASE_URL = "https://todocrud-42957-default-rtdb.firebaseio.com";
const POST_URL = `${BASE_URL}/posts.json`;

const postForm = document.getElementById("postForm");
const title = document.getElementById("title");
const author = document.getElementById("author");
const description = document.getElementById("description");
const isPublished = document.getElementById("isPublished");

const postContainer = document.getElementById("postContainer");
const addPostBtn = document.getElementById("addPostBtn");
const updatePostBtn = document.getElementById("updatePostBtn");
const spinner = document.getElementById("spinner");

const state = {
    posts: [],
    editId: null
}

function snackBar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 3000
    })
}

function showSpinner() {
    spinner.classList.remove("d-none");
}

function hideSpinner() {
    spinner.classList.add("d-none");
}

function objToArr(obj) {
    state.posts = [];
    for (const key in obj) {
        obj[key].id = key;
        state.posts.unshift(obj[key]);
    }
}

// READ
function templating(arr) {
    let result = "";
    arr.forEach(post => {
        result += `
            <div class="col-md-3 mb-4" id="${post.id}">
                <div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h4 class="m-0">${post.title}</h4>
                        <span class="badge ${post.isPublished ? "badge-success" : "badge-warning"}"> ${post.isPublished ? "Published" : "Not published"}</span>
                    </div>

                    <div class="card-body">
                        <p> <strong>Author:</strong> ${post.author} </p>
                        <p class="m-0">${post.description}</p>
                    </div>

                    <div class="card-footer d-flex justify-content-between">
                        <button type="button" onclick="onEdit(this)" class="btn btn-sm btn-primary edit-btn">  Edit </button>
                        <button type="button" onclick="onRemove(this)" class="btn btn-sm btn-danger delete-btn"> Remove </button>
                    </div>
                </div>
            </div>
        `;
    });
    postContainer.innerHTML = result;
}



function fetchPosts() {
    showSpinner();
    fetch(POST_URL, {
        method: "GET",
        body: null,
        headers: {
            "content-type": "application/json"
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Failed to fetch posts");
            }
            return res.json();
        })
        .then(data => {
            cl(data);
            objToArr(data);
            templating(state.posts);
        })
        .catch(err => {
            cl(err);
            snackBar('Failed to fetch post', 'error')
        })
        .finally(() => {
            hideSpinner();
        });
}
fetchPosts();

// CREATE 

function onPostSubmit(e) {
    e.preventDefault();
    let postObj = {
        title: title.value,
        author: author.value,
        description: description.value,
        isPublished: isPublished.checked
    };

    showSpinner();
    fetch(POST_URL, {
        method: "POST",
        body: JSON.stringify(postObj),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Failed to add post");
            }
            return res.json();
        })
        .then(data => {
            postObj.id = data.name;
            state.posts.unshift(postObj);
            let col = document.createElement('div');
            col.className = "col-md-3 mb-4";
            col.id = postObj.id;
            col.innerHTML = `<div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h4 class="m-0">${postObj.title}</h4>
                        <span class="badge ${postObj.isPublished ? "badge-success" : "badge-warning"}"> ${postObj.isPublished ? "Published" : "Not published"}</span>
                    </div>

                    <div class="card-body">
                        <p> <strong>Author:</strong> ${postObj.author} </p>
                        <p class="m-0">${postObj.description}</p>
                    </div>

                    <div class="card-footer d-flex justify-content-between">
                        <button type="button" onclick="onEdit(this)" class="btn btn-sm btn-primary edit-btn">  Edit </button>
                        <button type="button" onclick="onRemove(this)" class="btn btn-sm btn-danger delete-btn"> Remove </button>
                    </div>
                </div>
            `
            postContainer.prepend(col);
            postForm.reset();
            snackBar(`Post added successfully`, 'success');
        })
        .catch(err => {
            cl(err);
            snackBar('Something went wrong', 'error');
        })
        .finally(() => {
            hideSpinner();
        });
}

// EDIT 
function onEdit(ele) {
    let EDIT_ID = ele.closest('.col-md-3').id;
    state.editId = EDIT_ID;
    let EDIT_OBJ = state.posts.find(post => post.id === EDIT_ID);
    title.value = EDIT_OBJ.title;
    author.value = EDIT_OBJ.author;
    description.value = EDIT_OBJ.description;
    isPublished.checked = EDIT_OBJ.isPublished;
    addPostBtn.classList.add("d-none");
    updatePostBtn.classList.remove("d-none");
}

//UPDATE

function onUpdatePost() {
    let UPDATE_id = state.editId;
    let update_url = `${BASE_URL}/posts/${UPDATE_id}.json`;
    let updatedObj = {
        title: title.value,
        author: author.value,
        description: description.value,
        isPublished: isPublished.checked,
        id: UPDATE_id
    };
    showSpinner();

    fetch(update_url, {
        method: "PATCH",
        body: JSON.stringify(updatedObj),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Failed to update post");
            }
            return res.json();
        })
        .then(data => {
            cl(data);
            let getIndex = state.posts.findIndex(post => post.id === UPDATE_id);
            state.posts[getIndex] = updatedObj;
            let col = document.getElementById(UPDATE_id);
            col.innerHTML = `<div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h4 class="m-0">${updatedObj.title}</h4>
                        <span class="badge ${updatedObj.isPublished ? "badge-success" : "badge-warning"}"> ${updatedObj.isPublished ? "Published" : "not published"}</span>
                    </div>

                    <div class="card-body">
                        <p> <strong>Author:</strong> ${updatedObj.author} </p>
                        <p class="m-0">${updatedObj.description}</p>
                    </div>

                    <div class="card-footer d-flex justify-content-between">
                        <button type="button" onclick="onEdit(this)" class="btn btn-sm btn-primary edit-btn">  Edit </button>
                        <button type="button" onclick="onRemove(this)" class="btn btn-sm btn-danger delete-btn"> Remove </button>
                    </div>
                </div>
            `
            postForm.reset();
            state.editId = null;
            snackBar(`The Post with ${UPDATE_id} is updated successfully`, 'success');

            addPostBtn.classList.remove("d-none");
            updatePostBtn.classList.add("d-none");
        })
        .catch(err => {
            cl(err);
            snackBar('Failed to update post', 'error');
        })
        .finally(() => {
            hideSpinner();
        });
}

//DELETE
function onRemove(ele) {
    let remove_id = ele.closest('.col-md-3').id;
    let remove_url = `${BASE_URL}/posts/${remove_id}.json`;
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel"
    })
        .then(result => {
            if (result.isConfirmed) {
                showSpinner();
                fetch(remove_url, {
                    method: "DELETE"
                })
                    .then(res => {
                        if (!res.ok) {
                            throw new Error("Failed to delete post");
                        }
                        return res.json();
                    })
                    .then(() => {
                        let getIndex = state.posts.findIndex(post => post.id === remove_id);
                        state.posts.splice(getIndex, 1);
                        document.getElementById(remove_id).remove();
                        snackBar(`The Post with ${remove_id} is removed successfully`, 'success');
                    })

                    .catch(err => {
                        cl(err);
                        snackBar('Failed to remove product', 'error');
                    })
                    .finally(() => {
                        hideSpinner();
                    });
            }
        });
}


postForm.addEventListener("submit", onPostSubmit);
updatePostBtn.addEventListener("click", onUpdatePost);


